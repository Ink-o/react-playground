import React, { useContext } from "react";
import Editor from "./Editor";
import FileNameList from "./FileNameList";
import { PlaygroundContext } from "../../PlaygroundContext";
import { debounce } from 'lodash-es'

export default function CodeEditor() {
  const {
    theme,
    files,
    setFiles,
    selectedFileName,
  } = useContext(PlaygroundContext)

  const file = files[selectedFileName];


  function onEditorChange(value?: string) {
    console.log('文件更改...');
    files[file.name].value = value!
    setFiles({ ...files })
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <FileNameList />
      <Editor file={file} onChange={debounce(onEditorChange, 500)} options={{
        theme: `vs-${theme}`
      }} />
    </div>
  )
}