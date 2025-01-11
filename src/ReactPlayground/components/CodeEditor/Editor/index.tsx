import type { EditorProps, OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import MonacoEditor from '@monaco-editor/react'
import { createATA } from './ata'

export interface EditorFile {
  name: string
  value: string
  language: string
}

interface Props {
  file: EditorFile
  onChange?: EditorProps['onChange']
  options?: editor.IStandaloneEditorConstructionOptions
}

export default function Editor(props: Props) {
  const {
    file,
    onChange,
    options,
  } = props

  const handleEditorMount: OnMount = (editor, monaco) => {
    // 格式化代码
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
      editor.getAction('editor.action.formatDocument')?.run()
      // let actions = editor.getSupportedActions().map((a) => a.id);
      // console.log(actions);
    })

    // 设置 tsconfig.json支持 jsx
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.Preserve,
      esModuleInterop: true,
    })

    // 使用 ata 支持类型提示
    const ata = createATA((code, path) => {
      // 接收到类型包后，添加到 monaco 编辑器中
      // path 作为类型标识符使用
      monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
    })

    // 代码变动自动下载 types 类型包
    editor.onDidChangeModelContent(() => {
      ata(editor.getValue())
    })

    ata(editor.getValue())
  }

  return (
    <MonacoEditor
      height="100%"
      path={file.name}
      language={file.language}
      onMount={handleEditorMount}
      onChange={onChange}
      value={file.value}
      options={
        {
          fontSize: 14,
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false,
          },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          ...options,
        }
      }
    />
  )
}
