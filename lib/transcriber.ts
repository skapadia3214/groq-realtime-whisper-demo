"use server";
import "server-only";
import { toFile, Groq } from "groq-sdk";


export const transcribeAudio = async (
  formData: FormData,
  apiKey: string,
  timestamp?: number,
  noSpeechProb?: number,
) => {
  const groq = new Groq({
    apiKey: apiKey
  });
  const audioBlob = formData.get("audio") as Blob;

  try {
    let transcription: any;
    const file = await toFile(audioBlob, `audio-${(timestamp || Date.now())}.${audioBlob.type.split("/")[1] || "webm"}`);
    const startTime = performance.now();
    transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
      response_format: 'verbose_json',
      prompt: process.env.WHISPER_PROMPT || undefined,
      language: "en"
    });
    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000;
    const audioDuration = transcription.duration;

    const rtf = audioDuration / processingTime;

    const filTranscription: string = transcription.segments.map((s: { no_speech_prob: number, text: string }) => s.no_speech_prob < (noSpeechProb || 0.1) ? s.text : "").join(" ");
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