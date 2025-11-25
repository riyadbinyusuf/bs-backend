import { env } from './env';

  import { logger } from './logger';

  import cron from "node-cron";

  

  // Keep server alive cron job (14 minutes interval)

  // Only runs in production

  if (env.NODE_ENV === "production") {

    cron.schedule("*/14 * * * *", () => {

      logger.info("Server keep-alive ping");

    });

  

    logger.info("Cron job scheduled for server keep-alive");

  }

  