import { addKeyword, createBot, createFlow, createProvider, EVENTS } from "@builderbot/bot";
import { MemoryDB as Database } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { DateTime } from "luxon"
import { Calendar } from "./services";
import { DEFAULT_TIMEZONE, Utils } from "./utils";

const calendar = new Calendar();
const utils = new Utils();

const testFlow = addKeyword([EVENTS.WELCOME])
    .addAction(async (ctx, { flowDynamic, endFlow }) => {
        const solicitedDate = await utils.textToIso(ctx.body);
        console.log("Fecha solicitada: ", solicitedDate);

        // Verificar si solicitedDate es un string válido antes de procesarlo
        if (typeof solicitedDate !== "string" || solicitedDate.includes("false")) {
            return endFlow("Não foi possível identificar a data. Por favor, verifique o formato e tente novamente.");
        }

        // Convertir solicitedDate a una instancia de Date
        let startDate = DateTime.fromISO(solicitedDate, { zone: DEFAULT_TIMEZONE });
        console.log("Start Date (São Paulo): ", startDate);

        const dateAvailable = await calendar.isDateAvailable(startDate);
        console.log("Is Date Available: ", dateAvailable);

        // Continuar con el flujo si la fecha está disponible
        if (!dateAvailable) {
            const nextDateAvailable = await calendar.getNextAvailableSlots(startDate);
            console.log("Recommended date: ", nextDateAvailable.start);
            startDate = nextDateAvailable.start
        }

        const eventToInsert = {
            eventName: "Test event",
            description: "Test description",
            date: startDate
        }

        const eventID = await calendar.createEvent(eventToInsert)
        console.log(eventID);
        
        return await flowDynamic("Evento creado.")
    });


// Bot Initialization
export const initializeBot = async () => {
    const flow = createFlow([
        testFlow
    ]);
    const provider = createProvider(Provider);
    const database = new Database();

    const { handleCtx, httpServer } = await createBot({
        flow,
        provider,
        database,
    });

    return { provider, handleCtx, httpServer };
    
};