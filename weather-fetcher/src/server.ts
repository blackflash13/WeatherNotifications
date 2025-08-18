import app from './index';
import { cacheService } from './routes/weather';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('Starting Weather Fetcher service...');

    await cacheService.connect();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Weather Fetcher service is running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await cacheService.disconnect();
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await cacheService.disconnect();
        console.log('Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start Weather Fetcher service:', error);
    process.exit(1);
  }
};

startServer();

export default app; 