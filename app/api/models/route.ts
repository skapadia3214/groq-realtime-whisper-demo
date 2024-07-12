import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(): Promise<NextResponse<{models: Groq.Models.Model[]}>> {
    const models = await client.models.list()
    return NextResponse.json({models: models.data})
}