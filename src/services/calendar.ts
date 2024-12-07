import { Auth, calendar_v3, google } from "googleapis";
import { DateTime, Interval } from "luxon";
import { CalendarClient } from "~/config/calendar.config";
import { AvailableSlots, CreateEvent, ListAvailableSlot, TimeRangeLimit } from "~/types";
import { DEFAULT_DATE_LIMIT, DEFAULT_RANGE_LIMIT, DEFAULT_STANDARD_DURATION, DEFAULT_TIMEZONE } from "~/utils";

export class Calendar {
    private readonly auth: Auth.GoogleAuth;
    private readonly calendar: calendar_v3.Calendar;
    private readonly calendarID: string;
    private readonly timeZone: string;
    private readonly rangeLimit: TimeRangeLimit;
    private readonly standardDuration: number;
    private readonly dateLimit: number;

    constructor() {
        this.auth = CalendarClient.getInstance();
        this.calendar = google.calendar({ version: "v3", auth: this.auth });
        this.calendarID = "41351641ea9752e214551643b7addeb4c80855c49187ffd4a4041c191d25f829@group.calendar.google.com";
        this.timeZone = DEFAULT_TIMEZONE;
        this.rangeLimit = DEFAULT_RANGE_LIMIT;
        this.standardDuration = DEFAULT_STANDARD_DURATION;
        this.dateLimit = DEFAULT_DATE_LIMIT;
    }

    async createEvent({ eventName, description, date, duration = this.standardDuration }: CreateEvent): Promise<string> {
        try {
            if (!eventName || !description || !date) {
                throw new Error("Os campos 'eventName', 'description' e 'date' são obrigatórios.");
            }

            const { startDateTime, endDateTime } = this.validateAndBuildEventDates(date, duration);
            const event = this.buildEvent(eventName, description, startDateTime, endDateTime);

            const response = await this.calendar.events.insert({
                calendarId: this.calendarID,
                requestBody: event,
            });

            return response.data.id || "Evento criado, mas não recebeu um ID.";
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            throw new Error("Não foi possível criar o evento. Verifique os detalhes e permissões.");
        }
    }

    async isDateAvailable(date: DateTime): Promise<boolean> {
        try {
            const validatedDate = this.validateDate(date);
            const availableSlots = await this.listAvailableSlots({ startDate: DateTime.now() });

            return availableSlots.some(slot =>
                Interval.fromDateTimes(slot.start, slot.end).contains(validatedDate)
            );
        } catch (error) {
            console.error("Erro ao verificar disponibilidade da data:", error);
            return false;
        }
    }

    async getNextAvailableSlots(date: DateTime): Promise<AvailableSlots | null> {
        try {
            const validatedDate = this.validateDate(date);
            const availableSlots = await this.listAvailableSlots({ startDate: validatedDate });

            const sortedSlots = availableSlots
                .filter(slot => slot.start > validatedDate)
                .sort((a, b) => a.start.toMillis() - b.start.toMillis());

            return sortedSlots.length > 0 ? sortedSlots[0] : null;
        } catch (error) {
            console.error("Erro ao buscar próximos horários disponíveis:", error);
            throw new Error("Não foi possível recuperar horários disponíveis. Tente novamente mais tarde.");
        }
    }

    private async listAvailableSlots({ startDate, endDate }: ListAvailableSlot): Promise<AvailableSlots[]> {
        try {
            const validStartDate = startDate || DateTime.now();
            const validEndDate = endDate || validStartDate.plus({ days: this.dateLimit });

            const events = await this.fetchEvents(validStartDate, validEndDate);
            return this.generateAvailableSlots(validStartDate, validEndDate, events);
        } catch (error) {
            console.error("Erro ao listar horários disponíveis:", error);
            throw new Error("Não foi possível listar horários disponíveis.");
        }
    }

    private async fetchEvents(startDate: DateTime, endDate: DateTime): Promise<calendar_v3.Schema$Event[]> {
        try {
            const response = await this.calendar.events.list({
                calendarId: this.calendarID,
                timeMin: startDate.toISO(),
                timeMax: endDate.toISO(),
                timeZone: this.timeZone,
                singleEvents: true,
                orderBy: "startTime",
            });

            return response.data.items || [];
        } catch (error) {
            console.error("Erro ao buscar eventos do calendário:", error);
            throw new Error("Não foi possível buscar eventos do calendário.");
        }
    }

    private generateAvailableSlots(
        startDate: DateTime,
        endDate: DateTime,
        events: calendar_v3.Schema$Event[]
    ): AvailableSlots[] {
        const slots: AvailableSlots[] = [];
        let currentDate = startDate.startOf("day");

        while (currentDate < endDate) {
            if (this.rangeLimit.days.includes(currentDate.weekday)) {
                for (let hour = this.rangeLimit.startHour; hour < this.rangeLimit.endHour; hour++) {
                    const slotStart = currentDate.set({ hour, minute: 0, second: 0, millisecond: 0 });
                    const slotEnd = slotStart.plus({ hours: this.standardDuration });

                    if (!this.isSlotBusy(slotStart, slotEnd, events)) {
                        slots.push({ start: slotStart, end: slotEnd });
                    }
                }
            }
            currentDate = currentDate.plus({ days: 1 });
        }
        return slots;
    }

    private isSlotBusy(
        slotStart: DateTime,
        slotEnd: DateTime,
        events: calendar_v3.Schema$Event[]
    ): boolean {
        return events.some(event => {
            const eventStart = DateTime.fromISO(event.start?.dateTime || event.start?.date, { zone: this.timeZone });
            const eventEnd = DateTime.fromISO(event.end?.dateTime || event.end?.date, { zone: this.timeZone });
            return slotStart < eventEnd && slotEnd > eventStart;
        });
    }

    private validateAndBuildEventDates(date: DateTime, duration: number) {
        const startDateTime = date.setZone(this.timeZone);
        if (!startDateTime.isValid) {
            throw new Error("Data inválida fornecida.");
        }

        const endDateTime = startDateTime.plus({ hours: duration });
        return { startDateTime, endDateTime };
    }

    private validateDate(date: DateTime): DateTime {
        const dateTime = date.setZone(this.timeZone);
        if (!dateTime.isValid) {
            throw new Error("Data inválida fornecida.");
        }
        return dateTime;
    }

    private buildEvent(
        eventName: string,
        description: string,
        startDateTime: DateTime,
        endDateTime: DateTime
    ): calendar_v3.Schema$Event {
        return {
            summary: eventName,
            description,
            start: { dateTime: startDateTime.toISO(), timeZone: this.timeZone },
            end: { dateTime: endDateTime.toISO(), timeZone: this.timeZone },
            colorId: "2",
        };
    }
}
