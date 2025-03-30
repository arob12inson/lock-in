import { useEffect, useState,  } from "react"
import "./App.css"

enum Session {
  LockIn = 1,
  DeepWork,
  ShortBreak,
  LongBreak,
}

const DeepWorkTime = 50*60;
const ShortBreakTime = 10*60;
const LongBreakTime = 15*60;
const LockInTime = 5*60;

function App() {

  const [seconds, setSeconds] = useState(LockInTime);
  const [active, setActive] = useState(false);
  const [session, setSession] = useState(Session.LockIn);
 
  useEffect(() => {
    if (active) {
      if (seconds === 0) {
        setActive(false);
      } else {
        const timer = setInterval(() => {
            setSeconds(seconds - 1); 
        }, 1000);
        return () => {
          clearInterval(timer);
        }
      }
    }
  }, [seconds, active])
  
  const getTime = (sec: number) => {
    const seconds = sec % 60;
    const minutes = Math.floor(sec / 60);

    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  const changeSession = (sesh: Session) => {
    setSession(sesh);
    setActive(false);

    switch (sesh) {
      case Session.DeepWork:
        setSeconds(DeepWorkTime);
        break;
      case Session.ShortBreak:
        setSeconds(ShortBreakTime);
        break;
      case Session.LongBreak:
        setSeconds(LongBreakTime);
        break;
    }
  }

  return (
    <div className="pomodoro_container">
      <div className="pomodoro">
        {/* Idea: When it's lock in time, just say "LOCK IN" */}
        {session !== Session.LockIn ? 
          <div className="timer_options">
              <button className={`timer_option ${session === Session.DeepWork ? "active" : ""}`} onClick={() => changeSession(Session.DeepWork)}>Focus Time</button>
              <button className={`timer_option ${session === Session.ShortBreak ? "active" : ""}`} onClick={() => changeSession(Session.ShortBreak)}>Short Break</button>
              <button className={`timer_option ${session === Session.LongBreak ? "active" : ""}`} onClick={() => changeSession(Session.LongBreak)}>Long Break</button>
          </div>
        :
          <div className="timer_options">
            <p className="lock-in-banner">Lock in.</p>
          </div>
        }
        <p className="timer">{getTime(seconds)}</p>
        <button className="play_button" onClick={() => setActive(!active)}>{!active ? "Start" : "Pause"}</button>
      </div>
    </div>
  )
}

export default App
