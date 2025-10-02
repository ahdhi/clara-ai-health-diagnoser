/**
 * Script to convert ICD-10 CSV data to optimized JSON format
 * Run with: node scripts/convert-icd10-csv.js
 */

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvPath = path.join(__dirname, '../data/icd10-codes.csv');
const jsonPath = path.join(__dirname, '../data/icd10-database.json');

const codes = [];
const categories = new Map();

console.log('Converting ICD-10 CSV to JSON...');

fs.createReadStream(csvPath)
  .pipe(csv({
    headers: ['categoryCode', 'diagnosisCode', 'fullCode', 'abbreviatedDescription', 'fullDescription', 'categoryTitle']
  }))
  .on('data', (row) => {
    // Create the ICD-10 code object
    const icdCode = {
      code: row.fullCode,
      description: row.fullDescription,
      shortDescription: row.abbreviatedDescription,
      category: row.categoryTitle,
      categoryCode: row.categoryCode,
      synonyms: [row.abbreviatedDescription, row.fullDescription].filter(Boolean)
    };

    codes.push(icdCode);

    // Track unique categories
    if (!categories.has(row.categoryCode)) {
      categories.set(row.categoryCode, {
        code: row.categoryCode,
        title: row.categoryTitle,
        range: getICDRange(row.categoryCode)
      });
    }
  })
  .on('end', () => {
    console.log(`Processed ${codes.length} ICD-10 codes`);
    console.log(`Found ${categories.size} categories`);

    // Create the final database object
    const database = {
      metadata: {
        version: '2018-ICD-10-CM',
        totalCodes: codes.length,
        totalCategories: categories.size,
        generatedAt: new Date().toISOString()
      },
      categories: Array.from(categories.values()),
      codes: codes
    };

    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(database, null, 2));
    console.log(`ICD-10 database written to: ${jsonPath}`);
    console.log(`File size: ${(fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2)} MB`);

    // Create a compressed version without synonyms for faster loading
    const compactDatabase = {
      ...database,
      codes: codes.map(code => ({
        code: code.code,
        description: code.description,
        category: code.category,
        categoryCode: code.categoryCode
      }))
    };

    const compactJsonPath = path.join(__dirname, '../data/icd10-database-compact.json');
    fs.writeFileSync(compactJsonPath, JSON.stringify(compactDatabase));
    console.log(`Compact database written to: ${compactJsonPath}`);
    console.log(`Compact file size: ${(fs.statSync(compactJsonPath).size / 1024 / 1024).toFixed(2)} MB`);
  })
  .on('error', (error) => {
    console.error('Error processing CSV:', error);
  });

/**
 * Get ICD range based on category code
 */
function getICDRange(categoryCode) {
  // Map category codes to standard ICD-10 ranges
  const rangeMap = {
    'A': 'A00-B99',
    'B': 'A00-B99',
    'C': 'C00-D49',
    'D0': 'C00-D49',
    'D1': 'C00-D49',
    'D2': 'C00-D49',
    'D3': 'C00-D49',
    'D4': 'C00-D49',
    'D5': 'D50-D89',
    'D6': 'D50-D89',
    'D7': 'D50-D89',
    'D8': 'D50-D89',
    'E': 'E00-E89',
    'F': 'F01-F99',
    'G': 'G00-G99',
    'H0': 'H00-H59',
    'H1': 'H00-H59',
    'H2': 'H00-H59',
    'H3': 'H00-H59',
    'H4': 'H00-H59',
    'H5': 'H00-H59',
    'H6': 'H60-H95',
    'H7': 'H60-H95',
    'H8': 'H60-H95',
    'H9': 'H60-H95',
    'I': 'I00-I99',
    'J': 'J00-J99',
    'K': 'K00-K95',
    'L': 'L00-L99',
    'M': 'M00-M99',
    'N': 'N00-N99',
    'O': 'O00-O9A',
    'P': 'P00-P96',
    'Q': 'Q00-Q99',
    'R': 'R00-R99',
    'S': 'S00-T88',
    'T': 'S00-T88',
    'V': 'V00-Y99',
    'W': 'V00-Y99',
    'X': 'V00-Y99',
    'Y': 'V00-Y99',
    'Z': 'Z00-Z99'
  };

  const firstChar = categoryCode.charAt(0);
  const firstTwoChars = categoryCode.substring(0, 2);
  
  return rangeMap[firstTwoChars] || rangeMap[firstChar] || 'Unknown';
}