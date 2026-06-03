require('dotenv').config();
const app = require('./src/app');
const { sequelize, syncDatabase } = require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync all models / create tables
    await syncDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`MediCare Pro server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
