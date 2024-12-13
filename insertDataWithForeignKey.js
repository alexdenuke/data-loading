//* Вставить данные просто и вставить данные с преобразоыванием к id внешнему ключу 

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

// Функция для получения всех записей из таблицы для маппинга
async function getMapping(tableName) {
  const records = await db(tableName).select('id', 'name');
  return records.reduce((acc, record) => {
    acc[record.name] = record.id;
    return acc;
  }, {});
}

// Функция для вставки данных с учетом маппинга и вставки названий
async function insertDataIntoTable(tableName, data, columnMapping, mappings) {
  if (data.length === 0) {
    console.log('No data to insert');
    return;
  }

  for (const item of data) {
    const rowData = {};
    for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
      if (mappings[dbColumn] && mappings[dbColumn][item[excelColumn]]) {
        rowData[dbColumn] = mappings[dbColumn][item[excelColumn]];
      } else {
        rowData[dbColumn] = item[excelColumn];
      }
    }
    await db(tableName).insert(rowData);
  }

  console.log(`Data inserted successfully into ${tableName}`);
}

// Функция для загрузки данных из Excel и вставки в таблицу базы данных
async function loadDataFromExcel(data, tableName, columnMapping, mappingTables) {
  const mappings = {};
  for (const [column, mappingTable] of Object.entries(mappingTables)) {
    mappings[column] = await getMapping(mappingTable);
  }
  await insertDataIntoTable(tableName, data, columnMapping, mappings);
}

// Чтение данных из Excel файла
const parts = readExcelFile('./xlsx/last2.xlsx');

// Имя таблицы в базе данных
const tableName = 'parts'; // Укажите таблицу, в которую нужно вставить данные

// Определите маппинг колонок между Excel и базой данных
const columnMapping = {
  'part_number': 'part_number', // Колонка в Excel для названия категории и соответствующая колонка в базе данных
};

// Таблицы для маппинга названий на id
const mappingTables = {
  // 'part_category_id': 'parts_categories', // Таблица категорий для маппинга
};

// Загрузка данных из Excel и вставка в таблицу
loadDataFromExcel(parts, tableName, columnMapping, mappingTables)
  .catch((error) => {
    console.error('Error inserting data:', error);
  })
  .finally(() => {
    db.destroy();
  });
