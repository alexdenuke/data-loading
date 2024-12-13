const XLSX = require("xlsx");

function xlsxToJson(filePath) {
  // Загрузка книги из файла
  const workbook = XLSX.readFile(filePath);

  // Получаем имя первого листа
  const sheetName = workbook.SheetNames[0];

  // Получаем данные первого листа
  const worksheet = workbook.Sheets[sheetName];

  // Преобразуем данные листа в JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  return jsonData;
}

// Замените 'path_to_your_file.xlsx' на путь к вашему XLSX файлу
const jsonData = xlsxToJson("./xlsx/parts_categories.xlsx");
console.log(jsonData);

// Опционально: сохранение JSON в файл
const fs = require("fs");
fs.writeFileSync(
  "json/parts_categories.json",
  JSON.stringify(jsonData, null, 2),
  "utf8"
);
