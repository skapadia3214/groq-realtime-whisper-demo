import { useEffect, useState, useRef } from "react";

export const useRecordVoice = () => {
  // State to hold the media recorder instance
  const [mediaRecorder, setMediaRecorder] = useState<null | MediaRecorder>(null);

  // State to track whether recording is currently in progress
  const [recording, setRecording] = useState(false);

  // Ref to store audio chunks during recording
  const chunks = useRef([]);

  // Function to start the recording
  const startRecording = () => {
    console.log("Recording started");
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  // Function to stop the recording
  const stopRecording = () => {
    console.log("Recording stopped");
    if (mediaRecorder) {
      mediaRecorder.stop(); 
      setRecording(false);
    }
  };

  // Function to initialize the media recorder with the provided stream
  const initialMediaRecorder = (stream: any) => {
    const mediaRecorder = new MediaRecorder(stream);

    // Event handler when recording starts
    mediaRecorder.onstart = () => {
      chunks.current = []; // Resetting chunks array
    };

    // Event handler when data becomes available during recording
    mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      console.log("Type: ", typeof ev);
      chunks.current.push(ev.data); // Storing data chunks
    };

    // Event handler when recording stops
    mediaRecorder.onstop = () => {
      // Creating a blob from accumulated audio chunks with WAV format
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      console.log(audioBlob, 'audioBlob')
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []); 

  return { recording, startRecording, stopRecording };
};