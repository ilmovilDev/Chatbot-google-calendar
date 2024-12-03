import { initializeBot } from "./initializeBot";

// Configuration
const PORT = process.env.PORT ?? 3001;

// Main Application
const main = async () => {
    const { provider, handleCtx, httpServer } = await initializeBot();
    // registerRoutes(provider, handleCtx);
    httpServer(+PORT);
};

main().catch((err) => console.error('Error starting bot:', err));