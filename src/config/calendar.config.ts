import { google, Auth } from "googleapis";
import dotenv from 'dotenv';
dotenv.config();

const googleCredentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
};

export class CalendarClient {
    private static instance: Auth.GoogleAuth | null = null; 
    private static readonly credentials = googleCredentials; 
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
                credentials: this.credentials,
                scopes: this.scopes,
            });
        }
        return this.instance;
    }
}
