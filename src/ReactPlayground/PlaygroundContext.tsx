import type { PropsWithChildren } from 'react'
import { createContext, useEffect, useState } from 'react'
import { initFiles } from './files'
import { compress, fileName2Language, uncompress } from './utils'

export interface File {
  name: string
  value: string
  language: string
}

export interface Files {
  [key: string]: File
}

export interface PlaygroundContext {
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

export const PlaygroundContext = createContext<PlaygroundContext>({
  selectedFileName: 'App.tsx',
} as PlaygroundContext)

function getFilesFromUrl() {
  let files: Files | undefined
  try {
    const hash = uncompress(window.location.hash.slice(1))
    files = JSON.parse(hash)
  }
  catch (error) {
    console.error(error)
  }
  return files
}

export function PlaygroundProvider(props: PropsWithChildren) {
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
    const hash = compress(JSON.stringify(files))
    window.location.hash = encodeURIComponent(hash)
  }, [files])

  return (
    <PlaygroundContext.Provider
      value={{
        files,
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
