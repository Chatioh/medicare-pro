require('dotenv').config();
const app = require('./src/app');
const { sequelize, syncDatabase } = require('./src/models');

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

const startServer = async () => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');

      await syncDatabase();
      console.log('Database models synced');

      app.listen(PORT, () => {
        console.log(`MediCare Pro server running on port ${PORT}`);
      });

      return;

    } catch (error) {
      retries++;
      console.error(`DB connection failed (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);

      if (retries >= MAX_RETRIES) {
        console.error('Max retries reached. Exiting.');
        process.exit(1);
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

startServer();