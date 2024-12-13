const xlsx = require('xlsx');

// Функция для чтения данных из Excel файла
function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Предположим, что работаем с первым листом
  const worksheet = workbook.Sheets[sheetName];
  return { workbook, worksheet, sheetName };
}

// Функция для добавления пронумерованных значений в указанную колонку
function addNumberedColumn(worksheet, columnIndex) {
  const columnLetter = xlsx.utils.encode_col(columnIndex);
  
  // Получаем диапазон листа
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  
  // Обновляем значения в указанной колонке начиная со второй строки
  for (let row = 1; row <= range.e.r; row++) {
    const cellAddress = `${columnLetter}${row + 1}`;
    worksheet[cellAddress] = { v: row, t: 'n' };
  }

  return worksheet;
}

// Функция для сохранения обновленного Excel файла
function saveExcelFile(workbook, worksheet, sheetName, outputFilePath) {
  workbook.Sheets[sheetName] = worksheet;
  xlsx.writeFile(workbook, outputFilePath);
}

// Путь к существующему Excel файлу
const inputFilePath = './xlsx/last2.xlsx';

// Путь к файлу, в который нужно сохранить обновленные данные
const outputFilePath = './xlsx/updated_last2.xlsx';

// Чтение данных из Excel файла
const { workbook, worksheet, sheetName } = readExcelFile(inputFilePath);

// Индекс колонки для обновления (начиная с 0)
const columnIndex = 0; // Например, третья колонка (C)

// Добавление пронумерованных значений в указанную колонку
const updatedWorksheet = addNumberedColumn(worksheet, columnIndex);

// Сохранение обновленного Excel файла
saveExcelFile(workbook, updatedWorksheet, sheetName, outputFilePath);

console.log(`Data updated successfully and saved to ${outputFilePath}`);
