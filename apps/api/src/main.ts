/**
 * Application Entry Point
 *
 * Starts the HTTP server with the Clean Architecture application.
 */
import { createApp } from './main/app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Architecture: Clean Architecture with DDD`);
});
