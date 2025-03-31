import { useEffect, useState, useRef } from "react"
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

const timerAudio = new Audio('/audio/timer-finish.mp3'); // path to your sound file

const createBrownNoise = (audioContext: AudioContext) => {
  const bufferSize = 4 * audioContext.sampleRate; // 4 seconds buffer for smoother looping
  const noiseBuffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate); // Stereo for better sound
  
  // Process for each channel (left and right)
  for (let channel = 0; channel < 2; channel++) {
    const output = noiseBuffer.getChannelData(channel);
    
    let lastOut = 0;
    // Brown noise has a 6dB/octave rolloff
    const brown_factor = 0.02; // Filter coefficient
    
    for (let i = 0; i < bufferSize; i++) {
      // White noise (random between -1 and 1)
      const white = Math.random() * 2 - 1;
      
      // Apply filter to create brown noise (first-order lowpass)
      // This is a proper single-pole lowpass filter
      output[i] = (lastOut + (brown_factor * white)) / (1.0 + brown_factor);
      lastOut = output[i];
      
      // Normalize to prevent clipping
      // Brown noise tends to wander, so we keep it in check
      output[i] *= 0.6; // Scaling factor
    }
  }

  // Create audio source
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  // Create a filter to shape the sound more like true brown noise
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500; // Cut off higher frequencies
  filter.Q.value = 0.7; // Quality factor

  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.3; // More comfortable default volume

  // Connect nodes: source -> filter -> gain -> output
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return { 
    source: noiseSource, 
    gain: gainNode, 
    filter: filter 
  };
};

function App() {

  const audioContextRef = useRef<AudioContext | null>(null);
  const brownNoiseNodesRef = useRef<{ source: AudioBufferSourceNode, gain: GainNode, filter: BiquadFilterNode } | null>(null);

  const [brownNoiseActive, setBrownNoiseActive] = useState(false);
  const [seconds, setSeconds] = useState(LockInTime);
  const [active, setActive] = useState(false);
  const [session, setSession] = useState(Session.LockIn);
  const [sessionCount, setSessionCount] = useState(0);
 
  useEffect(() => {
    if (active) {
      if (seconds === 0) {
        setActive(false);
        setSessionCount(sessionCount+1)
        if ((sessionCount + 1) % 2 == 1) {
          changeSession(Session.DeepWork)
        } else if ((sessionCount + 1) % 8 == 0) {
          changeSession(Session.LongBreak)
        } else if ((sessionCount + 1) % 2 == 0) {
          changeSession(Session.ShortBreak)
        }
        timerAudio.play()
      } else {
        const timer = setInterval(() => {
            setSeconds(seconds - 1); 
        }, 1000);
        return () => {
          clearInterval(timer);
        }
      }
    }
  }, [seconds, active, sessionCount])
  
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

  const toggleBrownNoise = () => {
    if (!audioContextRef.current) {
      // Create on first use, or resume if suspended (browser policy)
      audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    }

    if (!brownNoiseActive) {
      const noiseNodes = createBrownNoise(audioContextRef.current);
      noiseNodes.source.start();
      brownNoiseNodesRef.current = noiseNodes;
      setBrownNoiseActive(true);
    } else {
      if (brownNoiseNodesRef.current) {
        brownNoiseNodesRef.current.source.stop();
        brownNoiseNodesRef.current.source.disconnect();
        brownNoiseNodesRef.current.gain.disconnect();
        brownNoiseNodesRef.current.filter.disconnect();
        brownNoiseNodesRef.current = null;
      }
      setBrownNoiseActive(false);
    }
  };

  return (
    <div className="pomodoro_container">
      <div className="pomodoro">
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
      <button className="brown_noise_button" onClick={toggleBrownNoise}>
        {brownNoiseActive ? 
        <img src="/pause.svg" alt="pause" /> : 
        <img id="play" src="/play.svg" alt="play" />
        }
      </button>
    </div>
  )
}

export default App
