const db = require('./db')

async function checkDatabaseConnection() {
  try {
    const result = await db.raw('SELECT NOW()'); // Выполняем запрос к базе данных
    console.log('Connection successful, current time from DB:', result.rows[0].now);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    await db.destroy(); // Закрытие подключения к базе данных
  }
}

checkDatabaseConnection();