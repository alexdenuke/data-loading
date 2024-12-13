const db = require('./db'); // Подключение к базе данных через Knex

// Функция для очистки таблицы и сброса автоинкремента
async function truncateTable(tableName) {
  try {
    await db.raw(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
    console.log(`Table ${tableName} truncated successfully.`);
  } catch (error) {
    console.error(`Error truncating table ${tableName}:`, error);
  } finally {
    db.destroy();
  }
}

// Имя таблицы, которую нужно очистить
const tableName = 'parts'; // Укажите таблицу, которую нужно очистить
// const tableName = 'parts'; 

// Вызов функции для очистки таблицы
truncateTable(tableName);