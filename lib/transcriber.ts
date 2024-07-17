"use server";
import "server-only";
import { toFile, Groq } from "groq-sdk";


export const transcribeAudio = async (
  formData: FormData,
  apiKey: string,
  timestamp?: number,
  noSpeechProb?: number
) => {
  const groq = new Groq({
    apiKey: apiKey
  });
  const audioBlob = formData.get("audio") as Blob;
  const config = {
    whisperModelProvider: "groq",
    whisperModel: "whisper-large-v3",
  };
  try {
    let transcription: any;
    const file = await toFile(audioBlob, `audio-${(timestamp || Date.now())}.wav`);
    const startTime = performance.now();
    transcription = await groq.audio.transcriptions.create({
      file: file,
      model: config.whisperModel,
      response_format: 'verbose_json',
      prompt: process.env.WHISPER_PROMPT || "Groq, GROQ, Jonathan Ross, LPU, Whisper, OpenAI, Inference",
      language: "en"
    });
    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000;
    const audioDuration = transcription.duration;

    const rtf = audioDuration / processingTime;

    let filTranscription: string = transcription.segments.map((s: { no_speech_prob: number, text: string }) => s.no_speech_prob < (noSpeechProb || 0.1) ? s.text : "").join(" ");
    return {
      transcript: filTranscription,
      rtf: rtf
    };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    
    return {
      transcript: "Error transcribing audio. Please try again later.",
      rtf: null
    };
  }
};