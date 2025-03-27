import { useEffect, useState,  } from "react"
import "./App.css"
function App() {

  const [seconds, setSeconds] = useState(50*60);
  const [active, setActive] = useState(false);
 
  useEffect(() => {
    if (active) {
      const timer = setInterval(() => {
          // Update the current time every 10ms.
          setSeconds(seconds - 1); 
      }, 1000);

      return () => {
        clearInterval(timer);
      }
    }

  }, [seconds, active])
  
  const getTime = (sec: number) => {
    const seconds = sec % 60;
    const minutes = Math.floor(sec / 60);

    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  return (
    <div className="pomodoro_container">
      <div className="pomodoro">
        <div className="timer_options">
          <button className="timer_option">Focus Time</button>
          <button className="timer_option">Short Break</button>
          <button className="timer_option">Long Break</button>
        </div>
        <p className="timer">{getTime(seconds)}</p>
        <button className="play_button" onClick={() => setActive(!active)}>Start</button>
      </div>
    </div>
  )
}

export default App
