import { google, Auth } from "googleapis";

export class CalendarClient {
    private static instance: Auth.GoogleAuth | null = null; 
    private static readonly keyFilePath = "/google_key.json"; 
    private static readonly scopes = ["https://www.googleapis.com/auth/calendar"];

    // Constructor privado para evitar instancias externas
    private constructor() {}

    /**
     * Obtiene una instancia única de GoogleAuth.
     * @returns Instancia de GoogleAuth configurada.
     */
    public static getInstance(): Auth.GoogleAuth {
        if (!this.instance) {
            this.instance = new google.auth.GoogleAuth({
                keyFile: this.keyFilePath,
                scopes: this.scopes,
            });
        }
        return this.instance;
    }
}
