import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIClient } from "~/config/openai.config";
import { Chat, ChatConfig } from "~/types";

export class OpenAIChat {
    
    private defaultChatConfig: ChatConfig = {
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    };

    constructor(
        private client = OpenAIClient.getInstance()
    ) {}

    async chat({prompt, messages}: Chat): Promise<string> {
        // const systemPrompt = this.getSystemPrompt(name);
        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: prompt },
                    ...messages,
                ],
                ...this.defaultChatConfig,
            });

            return completion.choices[0]?.message?.content ?? 'No response generated.';
        } catch (error) {
            console.error('Error in chat:', error);
            throw new Error('Failed to generate response from OpenAI.');
        }
    }

    private getSystemPrompt(name: string): string {
        return "Eres un chatbot para atender a los clientes de la inmobiliaria 'Imobiliária Casa & Vida S.A.";
    }
    
}
