import "./App.css"
function App() {

  return (
    <div className="pomodoro_container">
      <div className="pomodoro">
        <div className="timer_options">
          <button className="timer_option">Focus</button>
          <button className="timer_option">Short Break</button>
          <button className="timer_option">Long Break</button>
        </div>
        <p className="timer">12:00</p>
        <button className="play_button">Play</button>
      </div>
    </div>
  )
}

export default App
