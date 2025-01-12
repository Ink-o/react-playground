import { Allotment } from 'allotment'
import { useContext } from 'react'
import CodeEditor from './components/CodeEditor'
import Header from './components/Header'
import Preview from './components/Preview'
import { PlaygroundContext } from './PlaygroundContext'
import 'allotment/dist/style.css'

export default function ReactPlayground() {
  const {
    theme,
  } = useContext(PlaygroundContext)

  return (
    <div className={`${theme} h-screen flex flex-col dark:text-[#fff] dark:bg-[#1a1a1a] text-[#444] bg-[#fff]`}>
      <Header />
      <div style={{ flex: 1 }}>
        <Allotment defaultSizes={[100, 100]}>
          <Allotment.Pane minSize={500}>
            <CodeEditor />
          </Allotment.Pane>
          <Allotment.Pane minSize={0}>
            <Preview />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  )
}
