import * as XLSX from 'xlsx';
import xlFile from '../clubGPT/students.xlsx';

export async function readStudentDatafromxl(usn) {
  try {
    const response = await fetch(xlFile);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerRow = rows[0];

    const usnIndex = headerRow.indexOf('USN');
    const nameIndex = headerRow.indexOf('Name');
    const emailIndex = headerRow.indexOf('Email');
    const phoneIndex = headerRow.indexOf('Phone');
    const clubIndex = headerRow.indexOf('Club');
    const yearIndex = headerRow.indexOf('Year');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const usnFromSheet = (row[usnIndex] || '').toLowerCase();
      if (usnFromSheet === usn.toLowerCase()) {
        const name = row[nameIndex];
        const email = row[emailIndex];
        const phone = row[phoneIndex];
        const club = row[clubIndex];
        const year = row[yearIndex];

        const message = `Name: ${name}<br>USN: ${usn.toUpperCase()}<br>Email: <a class='font-semibold' href="mailto:${email}">${email}</a><br>Phone: <a class='font-semibold' href="tel:${phone}">${phone}</a><br>Club: ${club}<br>Year: ${year}`;
        return {
          text: message,
          typing: `Searching for USN ${usn.toUpperCase()} ...`
        };
      }
    }

    return { text: 'Student not found!' };
  } catch (error) {
    console.error('Error loading the Data:', error);
    return { text: 'Error loading the Data.' };
  }
}
