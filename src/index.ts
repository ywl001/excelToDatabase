import { ExcelHandler } from "./excel"
import PostgresDB from "./postgresql_db";
import fs from 'fs';
import path from 'path'


const field = {
  '公民身份号码(右)': 'pid',
  '户号(右)': 'home_number',
  '父亲_公民身份号码(右)': 'father_id',
  '母亲_公民身份号码(右)': 'mother_id',
  '电话号码(右)': 'tel',
  '服务处所(右)': 'work_place',
  '住址(右)': 'address',
  '<img src="vcube/css/icons/book_open.png" width="14" style="margin-right:3px;" />性别(右)': 'sex',
  '<img src="vcube/css/icons/book_open.png" width="14" style="margin-right:3px;" />民族(右)': 'nation',
  '姓名(右)': 'name',
  '<img src="vcube/css/icons/book_open.png" width="14" style="margin-right:3px;" />数据归属单位代码(右)': 'station',
  '<img src="vcube/css/icons/book_open.png" width="14" style="margin-right:3px;" />家庭关系(右)': 'relation',
  '导入时间(右)': 'createAt'
}

const folderPath = 'h:/mjpeople';

let fileIndex = 0;

let excelFiles;

// Read all files in the folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }

  // Filter Excel files (assuming files have a .xlsx extension)
  excelFiles = files.filter(file => file.endsWith('.xlsx'));

  run(excelFiles);

});

function run(excelFiles) {
  insertExcelFile(excelFiles[fileIndex]).then(() => {
    fileIndex++;
    if (fileIndex < excelFiles.length) {
      run(excelFiles)
    }
  })
}

function insertExcelFile(excelFile) {
  const excel = new ExcelHandler();
  const postgresDB = new PostgresDB();
  const filePath = path.join(folderPath, excelFile);
  const data = excel.readExcel(filePath).map(row => convertKeys(field, row));
  return postgresDB.insertArray('person_excel', data).then(res => {
    console.log(res)
  }).catch(err => {
    console.error('Error inserting data:', err);
  });
}


function convertKeys(mapping: Record<string, string>, obj: Record<string, any>): Record<string, any> {
  const convertedObj: Record<string, any> = {};

  for (const [oldKey, value] of Object.entries(obj)) {
    const newKey = mapping[oldKey] || oldKey; // Use the mapped key if available, otherwise keep the original key

    // Only include the key-value pair in the converted object if there is a mapping
    if (mapping.hasOwnProperty(oldKey)) {
      convertedObj[newKey] = typeof value === 'string' ? value.trim() : value;
    }
  }

  return convertedObj;
}

function removeDuplicates(data) {
  const uniqueDataMap = new Map();

  for (const item of data) {
    const key = item.pid + item.home_number;

    if (!uniqueDataMap.has(key)) {
      // 如果唯一键不存在，直接添加到 Map
      uniqueDataMap.set(key, item);
    } else {
      // 如果唯一键已经存在，进行合并处理
      const existingItem = uniqueDataMap.get(key);

      // 合并 father_id 和 mother_id
      if (item.father_id && !existingItem.father_id) {
        existingItem.father_id = item.father_id;
      }
      if (item.mother_id && !existingItem.mother_id) {
        existingItem.mother_id = item.mother_id;
      }

      // 其他属性根据需求进行合并处理

      // 更新 Map 中的值
      uniqueDataMap.set(key, existingItem);
    }
  }

  const uniqueData = Array.from(uniqueDataMap.values());

  return uniqueData;
}


