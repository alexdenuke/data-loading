// //* Из экселя с запчастями нужно указать столбик в котором записаны артикулы. Самый пправый артикул главный. Заполняет главными артикулами БД parts

// const db = require('./db'); // Подключение к базе данных через Knex
// const xlsx = require('xlsx'); // Подключение библиотеки для работы с Excel файлами

// // Функция для чтения данных из Excel файла
// function readExcelFile(filePath, skuColumnIndex) {
//   const workbook = xlsx.readFile(filePath); // Чтение Excel файла
//   const sheetName = workbook.SheetNames[0]; // Получение имени первого листа
//   const worksheet = workbook.Sheets[sheetName]; // Получение содержимого первого листа
//   const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

//   return jsonData.slice(1).map(row => row[skuColumnIndex]).filter(sku => sku !== undefined);
// }

// // Функция для обработки данных и вставки в таблицу parts
// async function processAndInsertData(skuData) {
//   for (const cell of skuData) {
//     if (typeof cell !== 'string') continue;

//     const skuValues = cell.split(',').map(sku => sku.trim());
//     const mainSku = skuValues.pop(); // Главный SKU - последний элемент

//     try {
//       // Вставка данных в таблицу parts
//       await db('parts').insert({ sku: mainSku });

//       console.log(`Data inserted successfully with main SKU: ${mainSku}`);
//     } catch (error) {
//       console.error(`Error inserting main SKU ${mainSku}:`, error);
//       throw error;
//     }
//   }
// }

// // Путь к Excel файлу и номер колонки с SKU
// const filePath = './xlsx/last2.xlsx';
// const skuColumnIndex = 1; // Измените индекс колонки на нужный (начиная с 0)

// const skuData = readExcelFile(filePath, skuColumnIndex);

// // Обработка и вставка данных
// processAndInsertData(skuData)
//   .catch((error) => {
//     console.error('Error processing and inserting data:', error);
//   })
//   .finally(() => {
//     db.destroy(); // Закрытие соединения с базой данных
//   });













  //* Это если надо обновить 

  const db = require('./db'); // Подключение к базе данных через Knex
  const xlsx = require('xlsx'); // Подключение библиотеки для работы с Excel файлами
  
  // Функция для чтения данных из Excel файла
  function readExcelFile(filePath, uniqueColumnIndex, skuColumnIndex) {
    const workbook = xlsx.readFile(filePath); // Чтение Excel файла
    const sheetName = workbook.SheetNames[0]; // Получение имени первого листа
    const worksheet = workbook.Sheets[sheetName]; // Получение содержимого первого листа
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
    return jsonData.slice(1).map(row => ({
      uniqueKey: row[uniqueColumnIndex],
      sku: row[skuColumnIndex]
    })).filter(item => item.uniqueKey !== undefined && item.sku !== undefined);
  }
  
  // Функция для обработки данных и обновления в таблице parts
  async function processAndUpdateData(data) {
    for (const item of data) {
      const { uniqueKey, sku } = item;
  
      try {
        // Обновление существующей записи, заполняя колонку sku
        const updatedRows = await db('parts').where('existing_column', uniqueKey).update({ sku: sku });
        if (updatedRows > 0) {
          console.log(`Data updated successfully for ${uniqueKey} with SKU: ${sku}`);
        } else {
          console.log(`No matching record found for ${uniqueKey}`);
        }
      } catch (error) {
        console.error(`Error updating SKU ${sku} for ${uniqueKey}:`, error);
        throw error;
      }
    }
  }
  
  // Путь к Excel файлу и номера колонок
  const filePath = './xlsx/last2.xlsx';
  const uniqueColumnIndex = 0; // Индекс колонки уникального ключа (начиная с 0)
  const skuColumnIndex = 1; // Индекс колонки с SKU (начиная с 0)
  
  const data = readExcelFile(filePath, uniqueColumnIndex, skuColumnIndex);
  
  // Обработка и обновление данных
  processAndUpdateData(data)
    .catch((error) => {
      console.error('Error processing and updating data:', error);
    })
    .finally(() => {
      db.destroy(); // Закрытие соединения с базой данных
    });
  