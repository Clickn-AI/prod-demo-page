// import logo from "./logo.svg";
import logo from "./assets/images/hams_ai_logo.png";
// import "./LiveKitComponent.css";

// Import necessary hooks and components
// ("use client");
import React, { useState, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  // ConnectionState,
  ParticipantTile,
  ParticipantLoop,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import "../assets/styles/banner.scss";
// import { useTranslation } from "react-i18next";
import WavyImage from "./WavyImage.js";
// Define the LiveKitComponent
const LiveKitComponent = () => {
  const serverUrl = "wss://hamsai-tkl51jnb.livekit.cloud";
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContextStarted, setAudioContextStarted] = useState(false);
  const [token, setToken] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // Function to handle connecting to LiveKitRoom using .then() and .catch()
  const handleConnect = () => {
    fetch(
      "https://api-stg.hams.ai/agents/c09d5b85-f80e-4133-9629-27da16ee5416/token"
    )
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data;
        setToken(accessToken);
        console.log(accessToken);
        setIsMuted(false);
        setIsStreaming(true); // Start streaming after token is set
      })
      .catch((error) => {
        console.error("Failed to fetch token:", error);
      });
  };

  const handleToggleMicrophone = () => {
    if (!isStreaming) {
      handleConnect(); // Fetch token and connect to LiveKit
    }

    // Ensure AudioContext is started in Safari
    if (!audioContextStarted && !isStreaming) {
      startAudioContext();
    }
    setIsMuted((prev) => !prev);
    setIsStreaming((prev) => !prev);
    setIsSpeaking((prev) => !prev);
  };

  // Start the AudioContext on user interaction to avoid autoplay issues in Safari
  const startAudioContext = () => {
    if (window.AudioContext || window.webkitAudioContext) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      setAudioContextStarted(true);
      audioContext.resume(); // Ensures the context is properly resumed
    }
  };

  return (
    <div className="app-container ar">
      <WavyImage></WavyImage>
      <img className="logo" src={logo} alt="Hams.AI Logo" />
      <div className="title-container">
        <h1 className="sub-header" id="sub-head">
          قم بأتمتة المكالمات الهاتفية الواردة والصادرة باستخدام الذكاء
          الاصطناعي بدون تدخل بشري
        </h1>
        <p className="sub-title">
          مما يقلل تكاليف التشغيل للشركات و يوفر لعملائك خدمة سريعة وسلسة ويقلل
          من أوقات الانتظار بشكل كبير
        </p>
      </div>
      <LiveKitRoom
        audio={true} // only audio streaming
        video={false}
        token={token}
        connect={isStreaming} // connect when microphone is clicked
        serverUrl={serverUrl}
        data-lk-theme="default"
        // style={}
      >
        <div className="hero-section">
          <MicrophoneButton
            isStreaming={isStreaming}
            onToggleMicrophone={handleToggleMicrophone}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            isAgentSpeaking={isAgentSpeaking}
          />
        </div>

        <RoomAudioRenderer />

        {isStreaming && (
          <AudioProcessor
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
          />
        )}
        <div>
          {isStreaming ? (
            <ParticipantsDisplay
              setIsAgentSpeaking={setIsAgentSpeaking}
              isAgentSpeaking={isAgentSpeaking}
            />
          ) : (
            ""
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
};

function ParticipantsDisplay({ setIsAgentSpeaking, isAgentSpeaking }) {
  const participants = useParticipants();
  const agentInfo = participants.filter(
    (participant) =>
      participant.identity !== "human_user" && participant.identity !== ""
  );
  useEffect(() => {
    if (agentInfo.length === 1) {
      setIsAgentSpeaking(agentInfo[0].isSpeaking);
    }
  }, [isAgentSpeaking, setIsAgentSpeaking, agentInfo]);
  return (
    <ParticipantLoop participants={participants}>
      {(participant) => (
        <ParticipantTile
          participant={participant}
          key={participant.identity}
        ></ParticipantTile>
      )}
    </ParticipantLoop>
  );
}

function MicrophoneButton({
  isAgentSpeaking,
  isStreaming,
  onToggleMicrophone,
  isSpeaking,
}) {
  // const { t } = useTranslation();
  return (
    <div className="container-mic-demo">
      <div
        className="mic-button-container up-down-animation "
        onClick={onToggleMicrophone}
      >
        <div
          className={`mic-button streaming ${isStreaming ? "streaming" : ""}`}
        >
          {/* <i className="fas fa-microphone"></i> */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9998 25.3333V28M15.9998 25.3333C11.0955 25.3333 8.19552 22.3268 6.68555 20M15.9998 25.3333C20.9041 25.3333 23.804 22.3268 25.314 20M21.3331 9.33333V14.6667C21.3331 17.6122 18.9453 20 15.9998 20C13.0543 20 10.6664 17.6122 10.6664 14.6667V9.33333C10.6664 6.38781 13.0543 4 15.9998 4C18.9453 4 21.3331 6.38781 21.3331 9.33333Z"
              stroke="#FFF"
              strokeWidth="2"
              strokeLinecap="square"
            ></path>
          </svg>
          <div
            className={` mic-container ${
              isSpeaking & isStreaming ? "" : "invissible"
            } `}
          >
            <span className="mic"></span>
            <span className="mic" style={{ "--i": 0.2 }}></span>
            <span className="mic" style={{ "--i": 1 }}></span>
            <span className="mic" style={{ "--i": 2 }}></span>
          </div>

          <div
            className={` mic-container ${
              isAgentSpeaking & isStreaming ? "" : "invissible"
            } `}
          >
            <span className="mic-agent"></span>
            <span className="mic-agent" style={{ "--i": 0.2 }}></span>
            <span className="mic-agent" style={{ "--i": 1 }}></span>
            <span className="mic-agent" style={{ "--i": 2 }}></span>
          </div>

          {/* <span className="mic-2"></span>
          <span className="mic-3"></span>
          <span className="mic-4"></span> */}
        </div>

        <div className={`${isStreaming ? "" : "mic-shadow"} `}></div>
        {/* <div className={` ${isSpeaking & isStreaming ? "mic" : ""} `}></div> */}
      </div>

      <div className="toggle-text">
        <h3 className="sub-header-demo">
          {isStreaming ? "... تحدث الأن" : "اضغط المايك للتحدث"}
        </h3>
      </div>

      <div>
        {/* <Visualizer isActive={isSpeaking} isStreamNow={isStreaming}/> */}
      </div>
    </div>
  );
}

// function Visualizer({ isActive , isStreamNow}) {
//   return (
//     <div className={`visualizer ${(isActive & isStreamNow) ? 'active' : ''}`}>
//       {[...Array(10)].map((_, index) => (
//         <div key={index} className="bar"></div>
//       ))}
//     </div>
//   );
// }

function AudioProcessor({ setIsSpeaking }) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    async function startAudioProcessing() {
      // Request access to microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);

      microphone.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Calculate volume based on frequency data
        const volume =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        // Set speaking threshold (you can adjust this value based on the environment)
        if (volume >= 5) {
          setIsSpeaking(true);
        } else {
          setIsSpeaking(false);
        }
      };
    }

    startAudioProcessing();

    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setIsSpeaking]);

  return null;
}

export default LiveKitComponent;
