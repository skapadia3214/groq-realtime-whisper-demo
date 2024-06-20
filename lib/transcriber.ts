"use server";
import "server-only";
import { toFile } from "openai";
import Groq from "groq-sdk";
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const groq = new Groq();

export const transcribeAudio = async (
  formData: FormData,
  timestamp?: number,
  noSpeechProb?: number
) => {
  const audioBlob = formData.get("audio") as Blob;
  const config = {
    whisperModelProvider: "groq",
    whisperModel: "whisper-large-v3",
  };
  try {

    let transcription: any;
    transcription = await groq.audio.transcriptions.create({
      file: await toFile(audioBlob, `audio-${(timestamp || Date.now())}.wav`),
      model: config.whisperModel,
      response_format: 'verbose_json',
      prompt: "Groq, Jonathan Ross, LPU, Whisper, OpenAI. Return empty if nothing is spoken."
    });
    let filTranscription: string = transcription.segments.map((s: { no_speech_prob: number, text: string }) => s.no_speech_prob < (noSpeechProb || 0.1) ? s.text : "").join(" ");

    return filTranscription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    
    return "Error transcribing audio. Please try again later.";
  }
};