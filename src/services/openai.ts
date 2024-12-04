import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIClient } from "~/config/openai.config";

type ChatHistory = ChatCompletionMessageParam[];

type ChatConfig = {
    temperature: number;
    maxTokens: number; // Cambio de estilo a camelCase
    topP: number; // Cambio de estilo a camelCase
    frequencyPenalty: number; // Cambio de estilo a camelCase
    presencePenalty: number; // Cambio de estilo a camelCase
};

export class OpenAIChat {
    
    private defaultChatConfig: ChatConfig = {
        temperature: 1,
        maxTokens: 800,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
    };

    constructor(
        private client = OpenAIClient.getInstance()
    ) {}

    /**
     * Ejecuta el modelo de chat con el historial dado.
     * @param history Historial de mensajes
     * @returns Respuesta del modelo o un mensaje de error.
     */
    async run(history: ChatHistory): Promise<string> {
        const systemPrompt = this.getSystemPrompt();

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

    /**
     * Genera el prompt del sistema utilizado para guiar las interacciones del chatbot.
     * @returns Prompt del sistema.
     */
    private getSystemPrompt(): string {
        return "Eres un chatbot para atender a los clientes de la inmobiliaria 'Imobiliária Casa & Vida S.A.";
    }
}
