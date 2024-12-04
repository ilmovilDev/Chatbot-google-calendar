import { addKeyword, EVENTS } from "@builderbot/bot";
import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIChat } from "~/services/openai";

// Instancia global del cliente OpenAIChat
const client = new OpenAIChat();

export const welcomeFlow = addKeyword([EVENTS.WELCOME])
    .addAction(async (ctx, { state, flowDynamic }) => {
        try {
            
            const currentHistory = getHistoryFromState(state);
            const userName = ctx?.pushName || "Guest";

            currentHistory.push({
                role: "user",
                content: ctx.body,
            });

            const response = await client.chat({
                name: userName,
                history: currentHistory,
            });

            await sendResponseInChunks(response, flowDynamic);

            currentHistory.push({
                role: "assistant",
                content: response,
            });

            await state.update({ history: currentHistory });

        } catch (error) {
            console.error("Error in welcomeFlow:", error);
            await flowDynamic("An error occurred. Please try again later.");
        }
    });

function getHistoryFromState(state: any): ChatCompletionMessageParam[] {
    return (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[];
}

async function sendResponseInChunks(
    response: string,
    flowDynamic: (message: string) => Promise<void>
): Promise<void> {
    const chunks = response.split(/(?<!\d)\.\s+/g); // Dividir en partes, evitando números decimales.
    for (const chunk of chunks) {
        await flowDynamic(chunk);
    }
}
