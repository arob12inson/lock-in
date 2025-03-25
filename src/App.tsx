import "./App.css"
function App() {

  return (
    <div className="pomodoro_container">
      <div className="pomodoro">
        <div className="timer_options">
          <button className="timer_option">Focus Time</button>
          <button className="timer_option">Short Break</button>
          <button className="timer_option">Long Break</button>
        </div>
        <p className="timer">50:00</p>
        <button className="play_button">Start</button>
      </div>
    </div>
  )
}

export default App
