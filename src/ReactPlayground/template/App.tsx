import Button from 'hy_mf_pc/CxButton'
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <h1>Hello World</h1>
      <Button>11221</Button>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is
          {count}
        </button>
      </div>
    </>
  )
}

export default App
