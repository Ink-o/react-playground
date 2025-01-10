import { useContext, useEffect, useState } from "react"
import { PlaygroundContext } from "../../../PlaygroundContext"
import { ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME, APP_COMPONENT_FILE_NAME } from '../../../files'
import { FileNameItem } from "./FileNameItem"
import styles from './index.module.scss'

export default function FileNameList() {
  const {
    files,
    removeFile,
    addFile,
    updateFileName,
    selectedFileName,
    setSelectedFileName
  } = useContext(PlaygroundContext)

  const [tabs, setTabs] = useState([''])
  // 不可编辑组件
  const readonlyFileNames = [ENTRY_FILE_NAME, IMPORT_MAP_FILE_NAME, APP_COMPONENT_FILE_NAME];

  useEffect(() => {
    setTabs(Object.keys(files))
  }, [files])

  const handleEditComplete = (name: string, prevName: string) => {
    updateFileName(prevName, name);
    setSelectedFileName(name);
  }

  const [creating, setCreating] = useState(false);
  const addTab = () => {
    const newFileName = 'Comp' + Math.random().toString().slice(2, 6) + '.tsx';
    addFile(newFileName);
    setSelectedFileName(newFileName);
    setCreating(true)
  }

  const handleRemove = (name: string) => {
    removeFile(name)
    setSelectedFileName(ENTRY_FILE_NAME)
  }


  return <div className={styles.tabs}>
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
    <div className={styles.add} onClick={addTab}>
      +
    </div>
  </div>
}
