
import { shouldIncludeItemInOutput } from "./xmlConverter";
import { generateTableHeader, getDefaultTableHeader } from "./xmlTableComponents";
import { processItemElements } from "./xmlItemProcessor";

/**
 * Converte conteúdo XML para formato CSV para Excel
 */
export const convertXMLToCSV = (xmlContent: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    let csvContent = generateTableHeader();

    const itemElements = xmlDoc.querySelectorAll("ITEM");

    if (itemElements.length > 0) {
      csvContent = processItemElements(itemElements, csvContent);
      return csvContent;
    }

    return csvContent + "</table>";
  } catch (error) {
    console.error("Error converting XML to CSV:", error);
    return getDefaultTableHeader();
  }
};
