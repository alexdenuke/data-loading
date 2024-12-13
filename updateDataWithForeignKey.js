// const db = require('./db');
// const xlsx = require('xlsx');
// db.on('query', (query) => {
//   console.log('SQL:', query.sql);
//   console.log('Bindings:', query.bindings);
// });
// // Функция для чтения данных из Excel файла
// function readExcelFile(filePath) {
//   const workbook = xlsx.readFile(filePath);
//   const sheetName = workbook.SheetNames[0];
//   const worksheet = workbook.Sheets[sheetName];
//   const jsonData = xlsx.utils.sheet_to_json(worksheet);
//   return jsonData;
// }

// // Функция для получения всех записей из таблицы для маппинга
// async function getMapping(tableName) {
//   const records = await db(tableName).select('id', 'name');
//   return records.reduce((acc, record) => {
//     acc[record.name] = record.id;
//     return acc;
//   }, {});
// }

// // Функция для обновления данных с учетом маппинга и преобразований
// async function updateDataInTable(tableName, data, columnMapping, mappings, uniqueKey) {
//   if (data.length === 0) {
//     console.log('No data to update');
//     return;
//   }

//   for (const item of data) {
//     const rowData = {};
//     for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
//       if (mappings[dbColumn] && mappings[dbColumn][item[excelColumn]]) {
//         rowData[dbColumn] = mappings[dbColumn][item[excelColumn]];
//       } else {
//         rowData[dbColumn] = item[excelColumn];
//       }
//     }

//     const uniqueValue = item[uniqueKey];
//     const existingRecord = await db(tableName).where(uniqueKey, uniqueValue).first();

//     if (existingRecord) {
//       if (Object.keys(rowData).length > 0) {
//         console.log(`Updating record with ${uniqueKey} = ${uniqueValue}:`, rowData);
//         await db(tableName).where(uniqueKey, uniqueValue).update(rowData);
//         console.log(`Record with ${uniqueKey} = ${uniqueValue} updated.`);
//       } else {
//         console.log(`No data to update for ${uniqueKey} = ${uniqueValue}. Skipping update.`);
//       }
//     } else {
//       console.log(`No record found with ${uniqueKey} = ${uniqueValue}. Skipping update.`);
//     }
//   }

//   console.log(`Data updated successfully in ${tableName}`);
// }

// // Функция для загрузки данных из Excel и обновления в таблице базы данных
// async function loadDataFromExcel(data, tableName, columnMapping, mappingTables, uniqueKey) {
//   const mappings = {};
//   for (const [column, mappingTable] of Object.entries(mappingTables)) {
//     mappings[column] = await getMapping(mappingTable);
//   }
//   await updateDataInTable(tableName, data, columnMapping, mappings, uniqueKey);
// }

// // Чтение данных из Excel файла
// const parts = readExcelFile('./xlsx/last2.xlsx');

// // Имя таблицы в базе данных
// const tableName = 'parts'; // Укажите таблицу, в которую нужно обновить данные

// // Определите маппинг колонок между Excel и базой данных
// const columnMapping = {
//   'name_en': 'name_en', // Колонка в Excel для названия категории и соответствующая колонка в базе данных
//   // 'part_number': 'part_number',
//   // 'part_name': 'part_name',
//   // 'part_price': 'part_price'
// };

// // Таблицы для маппинга названий на id
// const mappingTables = {
//   // 'part_category_id': 'parts_categories', // Таблица категорий для маппинга
// };

// // Уникальный ключ для обновления данных
// const uniqueKey = 'part_number'; // Укажите уникальное поле для обновления

// // Основная функция для выполнения операций
// (async () => {
//   try {
//     // Загрузка данных из Excel и обновление в таблице
//     await loadDataFromExcel(parts, tableName, columnMapping, mappingTables, uniqueKey);

//     console.log('Operations completed successfully');
//   } catch (error) {
//     console.error('Error during operations:', error);
//   } finally {
//     db.destroy();
//   }
// })();

const db = require('./db');
const xlsx = require('xlsx');
db.on('query', (query) => {
  console.log('SQL:', query.sql);
  console.log('Bindings:', query.bindings);
});


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

// Функция для обновления данных с учетом маппинга и преобразований
async function updateDataInTable(tableName, data, columnMapping, mappings, uniqueKey) {
  if (data.length === 0) {
    console.log('No data to update');
    return;
  }

  for (const item of data) {
    // Проверка на пустые значения
    if (!item[uniqueKey]) {
      console.log('Skipping row with empty unique key:', item);
      continue;
    }

    const rowData = {};
    for (const [excelColumn, dbColumn] of Object.entries(columnMapping)) {
      if (mappings[dbColumn] && mappings[dbColumn][item[excelColumn]]) {
        rowData[dbColumn] = mappings[dbColumn][item[excelColumn]];
      } else {
        rowData[dbColumn] = item[excelColumn];
      }
    }

    // Удаление undefined значений из rowData
    Object.keys(rowData).forEach(key => {
      if (rowData[key] === undefined) {
        delete rowData[key];
      }
    });

    const uniqueValue = item[uniqueKey];
    const existingRecord = await db(tableName).where(uniqueKey, uniqueValue).first();

    if (existingRecord) {
      if (Object.keys(rowData).length > 0) {
        console.log(`Updating record with ${uniqueKey} = ${uniqueValue}:`, rowData);
        await db(tableName).where(uniqueKey, uniqueValue).update(rowData);
        console.log(`Record with ${uniqueKey} = ${uniqueValue} updated.`);
      } else {
        console.log(`No data to update for ${uniqueKey} = ${uniqueValue}. Skipping update.`);
      }
    } else {
      console.log(`No record found with ${uniqueKey} = ${uniqueValue}. Skipping update.`);
    }
  }

  console.log(`Data updated successfully in ${tableName}`);
}

// Функция для загрузки данных из Excel и обновления в таблице базы данных
async function loadDataFromExcel(data, tableName, columnMapping, mappingTables, uniqueKey) {
  const mappings = {};
  for (const [column, mappingTable] of Object.entries(mappingTables)) {
    mappings[column] = await getMapping(mappingTable);
  }
  await updateDataInTable(tableName, data, columnMapping, mappings, uniqueKey);
}

// Чтение данных из Excel файла
const parts = readExcelFile('./xlsx/last2.xlsx');

// Имя таблицы в базе данных
const tableName = 'parts'; // Укажите таблицу, в которую нужно обновить данные

// Определите маппинг колонок между Excel и базой данных
const columnMapping = {
  'name_en': 'name_en', // Колонка в Excel для названия категории и соответствующая колонка в базе данных
};

// Таблицы для маппинга названий на id
const mappingTables = {
  // 'part_category_id': 'parts_categories', // Таблица категорий для маппинга
};

// Уникальный ключ для обновления данных
const uniqueKey = 'part_number'; // Укажите уникальное поле для обновления

// Основная функция для выполнения операций
(async () => {
  try {
    // Проверка текущего значения автоинкремента
    const sequenceQuery = `SELECT nextval(pg_get_serial_sequence('${tableName}', 'id')) AS next_id`;
    const initialSequenceResult = await db.raw(sequenceQuery);
    console.log('Initial auto-increment value:', initialSequenceResult.rows[0].next_id);

    // Загрузка данных из Excel и обновление в таблице
    await loadDataFromExcel(parts, tableName, columnMapping, mappingTables, uniqueKey);

    // Проверка значения автоинкремента после обновления
    const finalSequenceResult = await db.raw(sequenceQuery);
    console.log('Final auto-increment value:', finalSequenceResult.rows[0].next_id);

    console.log('Operations completed successfully');
  } catch (error) {
    console.error('Error during operations:', error);
  } finally {
    db.destroy();
  }
})();












