import type { PropsWithChildren } from 'react'
import { createContext, useEffect, useMemo, useState } from 'react'
import { initFiles } from './files'
import { compress, fileName2Language, JSONParse, uncompress } from './utils'

export interface File {
  name: string
  value: string
  language: string
  jsObject?: object
}

export interface Files {
  [key: string]: File
}

export interface IPlaygroundContext {
  files: Files
  selectedFileName: string
  setSelectedFileName: (fileName: string) => void
  setFiles: (files: Files) => void
  addFile: (fileName: string) => void
  removeFile: (fileName: string) => void
  updateFileName: (oldFieldName: string, newFieldName: string) => void
  theme: Theme
  setTheme: (Theme: Theme) => void
}

export type Theme = 'light' | 'dark'

export const PlaygroundContext = createContext<IPlaygroundContext>({
  selectedFileName: 'App.tsx',
} as IPlaygroundContext)

function getFilesFromUrl() {
  let files: Files | undefined
  try {
    const hash = uncompress(decodeURIComponent(window.location.hash.slice(1)))
    files = JSON.parse(hash)
    console.log('files: ', files)
  }
  catch (error) {
    console.error(error)
  }
  return files
}

export function PlaygroundProvider(props: PropsWithChildren<never>) {
  const { children } = props
  const [files, setFiles] = useState<Files>(getFilesFromUrl() || initFiles)
  const [selectedFileName, setSelectedFileName] = useState('App.tsx')
  const [theme, setTheme] = useState<Theme>('light')

  const addFile = (name: string) => {
    files[name] = {
      name,
      language: fileName2Language(name),
      value: '',
    }
    setFiles({ ...files })
  }

  const removeFile = (name: string) => {
    delete files[name]
    setFiles({ ...files })
  }

  const updateFileName = (oldFieldName: string, newFieldName: string) => {
    if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null)
      return
    const { [oldFieldName]: value, ...rest } = files
    const newFile = {
      [newFieldName]: {
        ...value,
        language: fileName2Language(newFieldName),
        name: newFieldName,
      },
    }
    setFiles({
      ...rest,
      ...newFile,
    })
  }

  // 文件内容同步 url
  useEffect(() => {
    console.log('文件更新')
    const hash = compress(JSON.stringify(files))
    console.log('hash: ', hash)
    console.log('hash: ', uncompress(hash))
    window.location.hash = encodeURIComponent(hash)
  }, [files])

  const actualFiles = useMemo(() => {
    console.log('重新赋值了')
    const newFiles: Files = {}
    return Object.entries(files).reduce((pre, [k, v]) => {
      pre[k] = {
        ...v,
        jsObject: v.language === 'json' ? JSONParse(v.value) : v.value,
      }
      return pre
    }, newFiles)
  }, [files])

  return (
    <PlaygroundContext.Provider
      value={{
        files: actualFiles,
        selectedFileName,
        setSelectedFileName,
        setFiles,
        addFile,
        removeFile,
        updateFileName,
        theme,
        setTheme,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  )
}
