import { RrwebPlayer } from 'rehearseur'
import 'rehearseur/style.css'

function App() {
  return (
    <div className="App" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <RrwebPlayer
          recordingUrl="recording_jupyterlite.json"
          annotationsUrl="recording_jupyterlite.annotations.md" />
    </div>
  )
}

export default App