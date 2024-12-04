import { Auth, calendar_v3, google } from "googleapis";
import { CalendarClient } from "~/config/calendar.config";

type CalendarOptions = {
    timeZone?: string;
    rangeLimit?: TimeRangeLimit;
    standardDuration?: number;
    dateLimit?: number;
}

type TimeRangeLimit = {
    days: number[]; 
    startHour: number; 
    endHour: number; 
}

type CreateEvent = {
    eventName: string;
    description: string;
    date: Date;
    duration: number
}

const rangeLimit: TimeRangeLimit = {
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 17,
}

export class Calendar {

    private readonly auth: Auth.GoogleAuth; 
    private readonly calendar: calendar_v3.Calendar;
    private readonly calendarID: string; 
    private readonly timeZone: string; 
    private readonly rangeLimit: TimeRangeLimit;
    private readonly standardDuration: number;
    private readonly dateLimit: number;

    constructor(options: CalendarOptions = {}) {
        this.auth = CalendarClient.getInstance();
        this.calendar = google.calendar({ version: "v3" });
        this.calendarID = "41351641ea9752e214551643b7addeb4c80855c49187ffd4a4041c191d25f829@group.calendar.google.com";
        this.timeZone = options.timeZone ?? "UTC−3";
        this.rangeLimit = options.rangeLimit ?? rangeLimit;
        this.standardDuration = options.standardDuration ?? 1; // En horas
        this.dateLimit = options.dateLimit ?? 15; // En días
    }

    async createEvent({
        eventName, 
        description, 
        date, 
        duration = this.standardDuration
    }: CreateEvent): Promise<string> {
        try {
            google.options({ auth: this.auth });

            const { startDateTime, endDateTime } = this.calculateEventTimes(date, duration)

            const event: calendar_v3.Schema$Event = {
                summary: eventName,
                description,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: this.timeZone,
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: this.timeZone,
                },
                colorId: '2'
            }
            const response = await this.calendar.events.insert({
                calendarId: this.calendarID,
                requestBody: event,
            });

            return response.data.id ?? "Evento creado, pero no se recibió un ID.";

        } catch (error) {
            console.error("Error al crear el evento:", error);
            throw new Error("No se pudo crear el evento. Verifique los detalles y permisos.");
        }
    }

    private calculateEventTimes(date: Date, duration: number): { startDateTime: Date; endDateTime: Date } {
        const startDateTime = new Date(date);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + duration);
        return { startDateTime, endDateTime };
    }

}
// async listAvailableSlots(): Promise<string[]> {
//     // Implementación aquí
//     return [];
// }

// async getNextAvailableSlots(): Promise<string | null> {
//     // Implementación aquí
//     return null;
// }

// async isDateAvailable(): Promise<boolean> {
//     // Implementación aquí
//     return false;
// }