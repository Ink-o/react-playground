import { Allotment } from 'allotment'
import { useContext } from 'react'
import CodeEditor from './components/CodeEditor'
import Header from './components/Header'
import Preview from './components/Preview'
import { PlaygroundContext } from './PlaygroundContext'
import 'allotment/dist/style.css'
import './index.scss'

export default function ReactPlayground() {
  const {
    theme,
  } = useContext(PlaygroundContext)

  return (
    <div className={theme} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
