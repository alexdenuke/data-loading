const db = require('./db');
const xlsx = require('xlsx');

// Функция для чтения данных из Excel файла
function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  return jsonData;
}

// Чтение данных из файлов Excel
const parts = readExcelFile('./xlsx/last2.xlsx');
const models_categories = readExcelFile('./xlsx/models_categories.xlsx');
const parts_categories = readExcelFile('./xlsx/parts_categories.xlsx');
const models_brands = readExcelFile('./xlsx/models_brands.xlsx');
const parts_brands = readExcelFile('./xlsx/parts_brands.xlsx');

console.log(parts_brands);

// Функция для проверки существования записи в таблице
async function recordExists(tableName, columnMapping, item) {
  const query = db(tableName);

  for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
    query.where(dbColumn, item[excelColumn]);
  }

  const result = await query.first();
  return !!result;
}

// Универсальная функция для вставки данных в таблицу базы данных
async function insertDataIntoTable(tableName, data, columnMapping) {
  if (data.length === 0) {
    console.log('No data to insert');
    return;
  }

  for (const item of data) {
    const exists = await recordExists(tableName, columnMapping, item);
    if (exists) {
      console.log(`Duplicate record found for:`, item);
      continue;
    }

    const rowData = {};
    for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
      rowData[dbColumn] = item[excelColumn];
    }
    await db(tableName).insert(rowData);
  }

  console.log(`Data inserted successfully into ${tableName}`);
}

// Функция для загрузки данных из Excel и вставки в таблицу базы данных
async function loadDataFromExcel(data, tableName, columnMapping) {
  await insertDataIntoTable(tableName, data, columnMapping);
}

// Имя таблицы в базе данных
const tableName = 'parts_brands'; // Укажите таблицу, в которую нужно вставить данные

// Определите маппинг колонок между Excel и базой данных
const columnMapping = {
  'name': 'name' // Колонка в Excel называется 'name' и в таблице БД тоже 'name'
};

// Загрузка данных из Excel и вставка в таблицу
loadDataFromExcel(parts_brands, tableName, columnMapping)
  .catch((error) => {
    console.error('Error inserting data:', error);
  })
  .finally(() => {
    db.destroy();
  });
