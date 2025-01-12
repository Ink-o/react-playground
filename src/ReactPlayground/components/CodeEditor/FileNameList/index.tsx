import { useContext, useEffect, useState } from 'react'
import { FILE_NAME_MAP } from '../../../files'
import { PlaygroundContext } from '../../../PlaygroundContext'
import { FileNameItem } from './FileNameItem'

export default function FileNameList() {
  const {
    files,
    removeFile,
    addFile,
    updateFileName,
    selectedFileName,
    setSelectedFileName,
  } = useContext(PlaygroundContext)

  const [tabs, setTabs] = useState([''])
  // 不可编辑组件
  const readonlyFileNames = [
    FILE_NAME_MAP.ENTRY_FILE_NAME,
    FILE_NAME_MAP.IMPORT_MAP_FILE_NAME,
    FILE_NAME_MAP.APP_COMPONENT_FILE_NAME,
    FILE_NAME_MAP.EXTERNAL_NAME,
  ]

  useEffect(() => {
    setTabs(Object.keys(files))
  }, [files])

  const handleEditComplete = (name: string, prevName: string) => {
    updateFileName(prevName, name)
    setSelectedFileName(name)
  }

  const [creating, setCreating] = useState(false)
  const addTab = () => {
    const newFileName = `Comp${Math.random().toString().slice(2, 6)}.tsx`
    addFile(newFileName)
    setSelectedFileName(newFileName)
    setCreating(true)
  }

  const handleRemove = (name: string) => {
    removeFile(name)
    setSelectedFileName(FILE_NAME_MAP.ENTRY_FILE_NAME)
  }

  return (
    <div className="flex items-center h-[38px] overflow-x-auto overflow-y-hidden border-b-[1px] border-solid border-[#ddd] text-[--text] bg-[--bg] box-border scrollbar-custom">
      {
        tabs.map((item, index) => (
          <FileNameItem
            key={item + index}
            value={item}
            readonly={readonlyFileNames.includes(item)}
            creating={creating && index === tabs.length - 1}
            actived={selectedFileName === item}
            onClick={() => setSelectedFileName(item)}
            onEditComplete={(name: string) => handleEditComplete(name, item)}
            onRemove={() => handleRemove(item)}
          >
          </FileNameItem>
        ))
      }
      <div className="cursor-pointer" onClick={addTab}>
        +
      </div>
    </div>
  )
}
