/**
 * Utilities for converting XML files to Excel compatible HTML
 */

/**
 * Escape HTML special characters in a string
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Generate HTML prefix for Excel file
 */
export const generateHtmlPrefix = (): string => {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:excel" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Planilha</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 30px;
        }
        td, th {
          border: 1px solid #000000;
          padding: 4px;
          font-size: 11px;
          font-family: Arial, sans-serif;
        }
        th {
          background-color: #FFFFFF;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
        }
        td {
          text-align: center;
          vertical-align: middle;
        }
        .piece-desc {
          text-align: left;
          background-color: #FFFFFF;
        }
        .module-cell {
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
        }
        .module-cell[rowspan] {
          background-color: #FFFFFF;
        }
        .comp, .borda-inf, .borda-sup, .edge-color {
          background-color: #F7CAAC;
        }
        .larg, .borda-dir, .borda-esq {
          background-color: #BDD6EE;
        }
        .material {
          background-color: #FFFFFF;
        }
        h2 {
          page-break-before: always;
          margin-top: 20px;
          margin-bottom: 10px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <table>`;
};

/**
 * Generate HTML suffix for Excel file
 */
export const generateHtmlSuffix = (): string => {
  return `</table></body></html>`;
};
