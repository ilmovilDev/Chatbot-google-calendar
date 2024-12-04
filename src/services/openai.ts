import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIClient } from "~/config/openai.config";

type Chat = {
    name: string;
    history: ChatCompletionMessageParam[];
}

type ChatConfig = {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
};

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

    async chat({name, history}: Chat): Promise<string> {
        const systemPrompt = this.getSystemPrompt(name);

        try {
            const completion = await this.client.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
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
