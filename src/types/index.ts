import { DateTime } from "luxon";
import { ChatCompletionMessageParam } from "openai/resources";

// OpenAI Service
export type Chat = {
    prompt: string;
    messages: ChatCompletionMessageParam[];
}

export type ChatConfig = {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
};

// Calendar Service
export type CalendarOptions = {
    timeZone?: string;
    rangeLimit?: TimeRangeLimit;
    standardDuration?: number;
    dateLimit?: number;
};

export type TimeRangeLimit = {
    days: number[];
    startHour: number;
    endHour: number;
};

export type CreateEvent = {
    eventName: string;
    description: string;
    date: DateTime;
    duration?: number; // Hacemos que sea opcional
};

export type ListAvailableSlot = {
    startDate: DateTime;  // Asegúrate de que estos sean tipos posibles
    endDate?: DateTime;   // Si endDate es opcional, también debe manejarse
};

export type AvailableSlots = {
    start: DateTime; 
    end: DateTime
}