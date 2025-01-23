import type { ExternalMap } from '../../files'
import MonacoEditor from '@monaco-editor/react'
import classnames from 'classnames'
import { debounce } from 'lodash-es'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { FILE_NAME_MAP } from '../../files'
import { PlaygroundContext } from '../../PlaygroundContext'
import { Message } from '../Message'
import CompilerWorker from './compiler.worker?worker'
import iframeRaw from './iframe.html?raw'

interface MessageData {
  data: {
    type: string
    message: string
  }
}

export default function Preview() {
  const { files, selectedFileName } = useContext(PlaygroundContext)
  const [selectedTab, setSelectedTab] = useState('preview')
  const [compileResMap, setCompileResMap] = useState<Map<string, string>>(new Map())
  const [compiledCode, setCompiledCode] = useState('')
  const compilerWorkerRef = useRef<Worker>()
  const [iframeSrcDoc, setIframeSrcDoc] = useState('')
  const [error, setError] = useState('')

  const externalSource = useMemo(() => {
    let linkExternal = ''
    let scriptExternal = ''

    const externalObj = JSON.parse(files[FILE_NAME_MAP.EXTERNAL_NAME].value) as ExternalMap
    Object.entries(externalObj).forEach(([_, v]) => {
      if (v.scriptUrl) {
        scriptExternal += `
          <script src="${v.scriptUrl}"></script>
        `
      }
      if (v.styleUrl) {
        linkExternal += `
          <link rel="stylesheet" href="${v.styleUrl}">
        `
      }
    })

    return {
      linkExternal,
      scriptExternal,
    }
  }, [files[FILE_NAME_MAP.EXTERNAL_NAME]])

  // 更换 iframe 中的代码，并且生成 blob url
  // 编译出来的代码直接放到 iframe 中的 script module 中即可
  const getIframeSrcDoc = () => {
    const res = iframeRaw.replace(
      '{importmap}',
      `<script type="importmap">${files[FILE_NAME_MAP.IMPORT_MAP_FILE_NAME].value
      }</script>`,
    )
      .replace(
        '{scriptModule}',
        `<script type="module" id="appSrc">${compiledCode}</script>`,
      )
      .replace('{linkExternal}', externalSource.linkExternal)
      .replace('{scriptExternal}', externalSource.scriptExternal)

    return res
  }

  // 监听 iframe 错误信息
  const handleMessage = (msg: MessageData) => {
    const { type, message } = msg.data
    if (type === 'ERROR') {
      setError(message)
    }
  }

  // 使用 worker 优化编译速度
  useEffect(() => {
    setIframeSrcDoc(getIframeSrcDoc())
    window.addEventListener('message', handleMessage)
    if (!compilerWorkerRef.current) {
      compilerWorkerRef.current = new CompilerWorker()
      compilerWorkerRef.current.addEventListener('message', ({ data }) => {
        if (data.type === 'COMPILED_CODE') {
          setCompiledCode(data.data.compileResMap.get(FILE_NAME_MAP.ENTRY_FILE_NAME))
          setCompileResMap(data.data.compileResMap)
        }
        else {
          // console.log('error', data);
        }
      })
    }
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(debounce(() => {
    // 文件内容更新后错误清除
    setError('')
    compilerWorkerRef.current?.postMessage(files)
  }, 500), [files])

  useEffect(() => {
    setIframeSrcDoc(getIframeSrcDoc())
  }, [files[FILE_NAME_MAP.IMPORT_MAP_FILE_NAME].value, compiledCode])

  const previewList = [
    {
      label: 'preview',
    },
    {
      label: 'JS',
    },
  ]

  return (
    <div style={{ height: '100%' }}>
      <div className="flex h-[38px] items-center">
        {previewList.map((item, index) => (
          <div
            className={classnames('p-[5px]', 'text-[13px]', 'cursor-pointer border-b-[4px]  border-transparent', selectedTab === item.label ? 'border-themeColor' : null)}
            key={index}
            onClick={() => { setSelectedTab(item.label) }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <iframe
        className={classnames(
          selectedTab === 'preview' ? 'block' : 'hidden',
          'w-full',
          'h-full',
          'p-0',
          'border-none',
        )}
        srcDoc={iframeSrcDoc}
      />
      <MonacoEditor
        className={
          selectedTab === 'JS' ? 'block' : 'hidden'
        }
        value={compileResMap.get(selectedFileName) || ''}
        language="javascript"
        options={{
          readOnly: true,
          minimap: {
            enabled: false,
          },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
      <Message type="error" content={error} />
    </div>
  )
}
