import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import { PlaygroundContext } from "./PlaygroundContext";
import './index.scss';
import { useContext } from "react";

export default function ReactPlayground() {
  const {
    theme,
  } = useContext(PlaygroundContext)

  return <div className={theme} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
}
