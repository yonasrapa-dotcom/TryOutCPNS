const fs = require('fs');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function parseXlsx(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: '' });
}

async function parseFile(filePath) {
  if (filePath.endsWith('.csv')) {
    return parseCsv(filePath);
  }
  return parseXlsx(filePath);
}

function validateQuestionRows(rows) {
  const headerKeys = ['tryout', 'category', 'question', 'A', 'B', 'C', 'D', 'E', 'answer', 'explanation'];
  const errors = [];

  rows.forEach((row, index) => {
    const missing = headerKeys.filter((key) => row[key] === undefined || row[key] === null || String(row[key]).trim() === '');
    if (missing.length) {
      errors.push({ row: index + 1, missing });
    }
    if (!['A', 'B', 'C', 'D', 'E'].includes(String(row.answer).trim().toUpperCase())) {
      errors.push({ row: index + 1, message: 'Answer harus A/B/C/D/E' });
    }
  });

  return errors;
}

module.exports = { parseFile, validateQuestionRows };
