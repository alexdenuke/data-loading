const db = require('./db'); // Подключение к базе данных через Knex
const xlsx = require('xlsx'); // Подключение библиотеки для работы с Excel файлами

// Функция для чтения данных из Excel файла
function readExcelFile(filePath, skuColumnIndex) {
  const workbook = xlsx.readFile(filePath); // Чтение Excel файла
  const sheetName = workbook.SheetNames[0]; // Получение имени первого листа
  const worksheet = workbook.Sheets[sheetName]; // Получение содержимого первого листа
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Убираем первую строку, так как она содержит заголовки колонок
  return jsonData.slice(1).map(row => row[skuColumnIndex]).filter(sku => sku !== undefined);
}

// Функция для обработки данных и вставки в таблицу extra_skus
async function processAndInsertData(skuData) {
  for (let partId = 1; partId <= skuData.length; partId++) {
    const cell = skuData[partId - 1];
    if (typeof cell !== 'string') continue;

    const skuValues = cell.split(',').map(sku => sku.trim());
    const mainSku = skuValues.pop(); // Главный SKU - последний элемент

    for (const extraSku of skuValues) {
      try {
        // Вставка данных в таблицу extra_skus
        await db('extra_skus').insert({ part_id: partId, sku: extraSku });
        console.log(`Data inserted successfully for part_id ${partId} with extra SKU: ${extraSku}`);
      } catch (error) {
        console.error(`Error inserting extra SKU ${extraSku} for part_id ${partId}:`, error);
        throw error;
      }
    }
  }
}

// Путь к Excel файлу и номер колонки с SKU
const filePath = './xlsx/last2.xlsx';
const skuColumnIndex = 1; // Измените индекс колонки на нужный (начиная с 0)

const skuData = readExcelFile(filePath, skuColumnIndex);

// Обработка и вставка данных
processAndInsertData(skuData)
  .catch((error) => {
    console.error('Error processing and inserting data:', error);
  })
  .finally(() => {
    db.destroy(); // Закрытие соединения с базой данных
  });
