import { DateTime } from "luxon";
import { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIChat } from "~/services";

export class Utils {

    private openaiClient: OpenAIChat;

    constructor() {
        this.openaiClient = new OpenAIChat();
    }

    // Método para convertir una fecha ISO a texto con formato personalizado
    isoToText(iso: string): string {
        try {
            const dateTime = DateTime.fromISO(iso, { zone: 'utc-3' }).setZone('America/Sao_Paulo');
            const formatedDate = dateTime.toLocaleString({
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                hour12: false,
                timeZoneName: 'short'
            });
            return formatedDate;
        } catch (error) {
            console.log("Erro ao converter a data:", error);
            return "Formato de data inválido"; // Mensagem de erro mais clara
        }
    }

    // Método para convertir texto en formato ISO usando OpenAI
    async textToIso(text: string): Promise<string | boolean> {
        try {
            //const currentDate = new Date().toISOString();
            const currentDateISO = DateTime.now().toISO();
            const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

            const prompt = `
                A data atual é: ${currentDateISO}. Vou fornecer um texto e você deve extrair a data e hora presentes nele e retornar no formato ISO (YYYY-MM-DDTHH:mm:ss.sss).
                Considere as seguintes regras:

                1. **Formato Padrão**: Utilize a zona horária "${DEFAULT_TIMEZONE}" para todas as conversões.
                2. **Hora Padrão**: Caso o horário não seja mencionado no texto, assuma 10:00 como padrão.
                3. **Casos Relativos**:
                    - Se o texto contiver palavras como "hoje", "amanhã" ou "ontem", ajuste a data atual de acordo.
                    - Para expressões como "próxima semana" ou "mês que vem", calcule a data correspondente.
                4. **Casos Específicos**:
                    - Reconheça dias da semana como "segunda-feira" e calcule a data correspondente considerando a semana atual ou próxima, dependendo do contexto.
                    - Considere meses como "janeiro" e anos futuros, se não especificados.
                5. **Textos com Ambiguidade**:
                    - Se o texto não contiver uma data válida, retorne exclusivamente o valor **false** (sem aspas).
                6. **Formato de Resposta**:
                    - Apenas responda com a data e hora no formato ISO, ou **false** caso não seja possível interpretar a entrada.

                ### Exemplos:
                - Texto: "na quinta-feira, 30 de maio às 14:00" -> Resposta: 2024-05-30T14:00:00.000
                - Texto: "Esta sexta-feira, 31" -> Resposta: 2024-05-31T10:00:00.000
                - Texto: "Amanhã às 10h" -> Adicione um dia à data atual e retorne.
                - Texto: "próximo sábado" -> Calcule a data do próximo sábado.
                - Texto inválido ou incompleto -> Resposta: false.

                Forneça sempre a resposta no formato ISO ou **false**.
            `;

            const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: text }];
            const response = await this.openaiClient.chat({ prompt, messages });

            // Devolver la respuesta en formato ISO o 'false' si no se obtiene una fecha válida
            return response.trim();
        } catch (error) {
            console.log("Erro ao processar o texto:", error);
            return false;
        }
    }
}
