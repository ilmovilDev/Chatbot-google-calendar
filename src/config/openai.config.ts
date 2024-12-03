// openai.config.ts
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIClient {
    private static instance: OpenAI;

    private constructor() {}

    public static getInstance(): OpenAI {
        if (!this.instance) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error("OpenAI API key is required.");
            }
            this.instance = new OpenAI({ apiKey });
        }
        return this.instance;
    }
}

// Mode de uso
// const openAIClient = OpenAIClient.getInstance();
