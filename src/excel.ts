import * as XLSX from 'xlsx';

export class ExcelHandler {
  public readExcel(filePath: string): any[][] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming you are working with the first sheet
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: null,
      blankrows: false,
    });
    return rows;
  }

  public writeExcel(filePath: string, data: any[][]): void {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet 1'); // You can customize the sheet name

    XLSX.writeFile(newWorkbook, filePath);
  }
}
