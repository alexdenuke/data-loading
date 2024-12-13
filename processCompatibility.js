const db = require('./db'); // Подключение к базе данных через Knex
const xlsx = require('xlsx'); // Подключение библиотеки для работы с Excel файлами

// Функция для чтения данных из Excel файла
function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath); // Чтение Excel файла
  const sheetName = workbook.SheetNames[0]; // Получение имени первого листа
  const worksheet = workbook.Sheets[sheetName]; // Получение содержимого первого листа
  const jsonData = xlsx.utils.sheet_to_json(worksheet); // Преобразование содержимого в формат JSON
  return jsonData;
}

// Функция для получения ID моделей по их названиям
async function getModelIdsByNames(modelNames) {
  const models = await db('models').whereIn('name', modelNames).select('id', 'name');
  const modelIds = models.reduce((acc, model) => {
    acc[model.name] = model.id;
    return acc;
  }, {});
  return modelIds;
}

// Функция для проверки и вставки данных в таблицу parts
async function ensurePartExists(partId) {
  const existingPart = await db('parts').where('id', partId).first();
  if (!existingPart) {
    await db('parts').insert({ id: partId, sku: `SKU-${partId}` }); // Здесь можно задать минимально необходимые данные для parts
    console.log(`Inserted part with id: ${partId}`);
  }
}

// Функция для вставки данных в таблицу parts_compatibility
async function insertPartsCompatibility(data) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const partId = i + 1; // Используем индекс строки + 1 как part_id
    const compatibleModels = item.compatible_models;

    if (!compatibleModels) {
      console.warn(`Skipping row due to missing compatible_models: ${JSON.stringify(item)}`);
      continue;
    }

    const modelNames = compatibleModels.split(',').map(name => name.trim());
    console.log(`Processing part_id: ${partId}, compatible_models: ${modelNames.join(', ')}`);

    // Проверка и вставка данных в таблицу parts
    await ensurePartExists(partId);

    // Получение ID моделей по их названиям
    const modelIds = await getModelIdsByNames(modelNames);
    console.log(`Found model IDs: ${JSON.stringify(modelIds)}`);

    // Вставка данных в таблицу parts_compatibility
    for (const modelName of modelNames) {
      if (modelIds[modelName]) {
        await db('parts_compatibility').insert({
          part_id: partId,
          model_id: modelIds[modelName]
        });
        console.log(`Inserted compatibility for part_id: ${partId} and model_id: ${modelIds[modelName]}`);
      } else {
        console.warn(`Model name not found in database: ${modelName}`);
      }
    }
  }
}

// Чтение данных из Excel файла
const data = readExcelFile('./xlsx/last2.xlsx');

// Обработка и вставка данных
insertPartsCompatibility(data)
  .catch((error) => {
    console.error('Error processing and inserting data:', error);
  })
  .finally(() => {
    db.destroy(); // Закрытие соединения с базой данных
  });
