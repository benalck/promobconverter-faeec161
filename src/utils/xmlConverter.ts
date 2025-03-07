
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
 * Check if an item should be included in the output
 */
export const shouldIncludeItemInOutput = (item: Element): boolean => {
  const family = item.getAttribute("FAMILY") || "";
  
  if (
    family.toLowerCase().includes("acessório") ||
    family.toLowerCase().includes("acessorios") ||
    family.toLowerCase().includes("ferragem") ||
    family.toLowerCase().includes("processo") ||
    family.toLowerCase().includes("puxador")
  ) {
    return false;
  }
  
  return true;
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
        table, td, th {
          border: 1px solid #000000;
          border-collapse: collapse;
          padding: 5px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        td {
          text-align: center;
        }
        .piece-desc {
          background-color: #FFFFFF;
          text-align: left;
        }
        .module-cell {
          font-weight: bold;
          text-align: center;
        }
        .material {
          background-color: #FFFFFF;
        }
        .comp {
          background-color: #F7CAAC;
        }
        .larg {
          background-color: #BDD6EE;
        }
        .borda-inf, .borda-sup {
          background-color: #F7CAAC;
        }
        .borda-dir, .borda-esq {
          background-color: #BDD6EE;
        }
        .edge-color {
          background-color: #F7CAAC;
        }
      </style>
    </head>
    <body>
      <table border="1">`;
};

/**
 * Generate HTML suffix for Excel file
 */
export const generateHtmlSuffix = (): string => {
  return `</table></body></html>`;
};
