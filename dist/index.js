"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const excel_1 = require("./excel");
const postgresql_db_1 = __importDefault(require("./postgresql_db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
};
const folderPath = 'h:/mjpeople';
// Read all files in the folder
fs_1.default.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }
    // Filter Excel files (assuming files have a .xlsx extension)
    const excelFiles = files.filter(file => file.endsWith('.xlsx'));
    // Process each Excel file
    console.log(excelFiles);
    const excel = new excel_1.ExcelHandler();
    const postgresDB = new postgresql_db_1.default();
    excelFiles.forEach(excelFile => {
        const filePath = path_1.default.join(folderPath, excelFile);
        const data = excel.readExcel(filePath).map(row => convertKeys(field, row));
        postgresDB.insertArray('person', data).then(res => {
            console.log(res);
        }).catch(err => {
            console.error('Error inserting data:', err);
        });
    });
});
function convertKeys(mapping, obj) {
    const convertedObj = {};
    for (const [oldKey, value] of Object.entries(obj)) {
        const newKey = mapping[oldKey] || oldKey; // Use the mapped key if available, otherwise keep the original key
        // Only include the key-value pair in the converted object if there is a mapping
        if (mapping.hasOwnProperty(oldKey)) {
            convertedObj[newKey] = typeof value === 'string' ? value.trim() : value;
        }
    }
    return convertedObj;
}
