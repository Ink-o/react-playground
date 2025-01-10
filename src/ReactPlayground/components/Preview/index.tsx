import { useContext, useEffect, useRef, useState } from "react"
import { PlaygroundContext } from "../../PlaygroundContext"
import iframeRaw from './iframe.html?raw'
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";
import CompilerWorker from './compiler.worker?worker'
import { debounce } from 'lodash-es'
import classnames from 'classnames'
import MonacoEditor, { OnMount, EditorProps } from '@monaco-editor/react'

interface MessageData {
  data: {
    type: string
    message: string
  }
}

export default function Preview() {
  const { files } = useContext(PlaygroundContext)
  console.log('files: ', files);
  const [selectedTab, setSelectedTab] = useState('preview')

  // 更换 iframe 中的代码，并且生成 blob url
  // 编译出来的代码直接放到 iframe 中的 script module 中即可
  const getIframeUrl = () => {
    const res = iframeRaw.replace(
      '<script type="importmap"></script>',
      `<script type="importmap">${files[IMPORT_MAP_FILE_NAME].value
      }</script>`
    ).replace(
      '<script type="module" id="appSrc"></script>',
      `<script type="module" id="appSrc">${compiledCode}</script>`,
    )
    return URL.createObjectURL(new Blob([res], { type: 'text/html' }))
  }

  const [compiledCode, setCompiledCode] = useState('')
  const [iframeUrl, setIframeUrl] = useState(getIframeUrl());

  const compilerWorkerRef = useRef<Worker>();

  // 使用 worker 优化编译速度
  useEffect(() => {
    if (!compilerWorkerRef.current) {
      compilerWorkerRef.current = new CompilerWorker();
      compilerWorkerRef.current.addEventListener('message', ({ data }) => {
        if (data.type === 'COMPILED_CODE') {
          setCompiledCode(data.data);
        } else {
          //console.log('error', data);
        }
      })
    }
  }, []);

  useEffect(debounce(() => {
    compilerWorkerRef.current?.postMessage(files)
  }, 500), [files]);

  useEffect(() => {
    setIframeUrl(getIframeUrl())
  }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);

  const [error, setError] = useState('')

  const handleMessage = (msg: MessageData) => {
    const { type, message } = msg.data
    if (type === 'ERROR') {
      setError(message)
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const previewList = [
    {
      label: 'preview',
    },
    {
      label: 'JS',
    }
  ]

  return <div style={{ height: '100%' }}>
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
        'border-none'
      )}
      src={iframeUrl}
    />
    <MonacoEditor
      className={
        selectedTab === 'JS' ? 'block' : 'hidden'
      }
      value={compiledCode}
      language='javascript'
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
    <Message type='error' content={error} />
  </div>
}
