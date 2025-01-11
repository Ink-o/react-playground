import ReactPlayground from './ReactPlayground'
import { PlaygroundProvider } from './ReactPlayground/PlaygroundContext'
import './App.css'

function App() {
  return (
    <PlaygroundProvider>
      <ReactPlayground />
    </PlaygroundProvider>
  )
}

export default App
