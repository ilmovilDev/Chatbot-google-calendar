import { TimeRangeLimit } from "~/types";

// Definición de la zona horaria por defecto para las operaciones
export const DEFAULT_TIMEZONE: string = "America/Sao_Paulo";

/**
 * Rango de tiempo por defecto para la disponibilidad.
 * Define los días de la semana y el horario disponible durante el día.
 * 
 * - `days`: Array con los días de la semana en los que la disponibilidad está activa.
 *   - 1 = Lunes, 2 = Martes, ..., 5 = Viernes.
 * - `startHour`: Hora de inicio del rango de disponibilidad. En este caso, 9:00 AM.
 * - `endHour`: Hora de finalización del rango de disponibilidad. En este caso, 5:00 PM.
 * 
 * @type {TimeRangeLimit}
 */
export const DEFAULT_RANGE_LIMIT: TimeRangeLimit = {
    days: [1, 2, 3, 4, 5], // Días de la semana (1 = Lunes, 5 = Viernes)
    startHour: 9, // Hora de inicio del día 09:00 AM
    endHour: 17, // Hora final del día 17:00 PM
};

/**
 * Duración estándar de cada reunión en horas.
 * Este valor se usa como duración predeterminada en las operaciones.
 * 
 * @type {number}
 */
export const DEFAULT_STANDARD_DURATION: number = 1; // Duración estándar de cada reunión en horas

/**
 * Límite de días para la disponibilidad.
 * Define el número máximo de días de antelación en los que las reuniones pueden ser programadas.
 * 
 * @type {number}
 */
export const DEFAULT_DATE_LIMIT: number = 30; // Límite de días para la disponibilidad
