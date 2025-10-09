/**
 * Cutting Optimization Algorithm
 * 2D Bin Packing with Guillotine Algorithm
 */

export interface CuttingItem {
  id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  grainDirection?: 'horizontal' | 'vertical' | 'none';
}

export interface PlacedItem extends CuttingItem {
  x: number;
  y: number;
  rotated: boolean;
  sheetNumber: number;
}

export interface Sheet {
  sheetNumber: number;
  width: number;
  height: number;
  items: PlacedItem[];
  freeRectangles: Rectangle[];
  utilizationPercent: number;
  usedArea: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OptimizationConfig {
  sheetWidth: number;
  sheetHeight: number;
  cutMargin: number;
  respectGrainDirection: boolean;
}

export interface OptimizationResult {
  sheets: Sheet[];
  totalSheets: number;
  totalUtilization: number;
  totalArea: number;
  usedArea: number;
  wasteArea: number;
}

/**
 * Main optimization function using Guillotine Algorithm
 */
export function optimizeCutting(
  items: CuttingItem[],
  config: OptimizationConfig
): OptimizationResult {
  const expandedItems = expandItemsByQuantity(items);
  const sortedItems = sortItemsByArea(expandedItems);
  
  const sheets: Sheet[] = [];
  let currentSheet = createNewSheet(sheets.length + 1, config);
  sheets.push(currentSheet);

  for (const item of sortedItems) {
    let placed = false;

    // Try to place in existing sheets
    for (const sheet of sheets) {
      if (tryPlaceItem(sheet, item, config)) {
        placed = true;
        break;
      }
    }

    // If not placed, create a new sheet
    if (!placed) {
      currentSheet = createNewSheet(sheets.length + 1, config);
      sheets.push(currentSheet);
      
      if (!tryPlaceItem(currentSheet, item, config)) {
        console.error('Failed to place item:', item);
      }
    }
  }

  // Calculate utilization for each sheet
  sheets.forEach(sheet => {
    const sheetArea = sheet.width * sheet.height;
    sheet.usedArea = sheet.items.reduce((sum, item) => {
      return sum + (item.width * item.height);
    }, 0);
    sheet.utilizationPercent = (sheet.usedArea / sheetArea) * 100;
  });

  const totalArea = sheets.length * config.sheetWidth * config.sheetHeight;
  const usedArea = sheets.reduce((sum, sheet) => sum + sheet.usedArea, 0);

  return {
    sheets,
    totalSheets: sheets.length,
    totalUtilization: (usedArea / totalArea) * 100,
    totalArea,
    usedArea,
    wasteArea: totalArea - usedArea,
  };
}

/**
 * Expand items by quantity (e.g., 1 item with qty 5 becomes 5 items)
 */
function expandItemsByQuantity(items: CuttingItem[]): CuttingItem[] {
  const expanded: CuttingItem[] = [];
  
  items.forEach((item, index) => {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({
        ...item,
        id: `${item.id}-${i}`,
        quantity: 1,
      });
    }
  });
  
  return expanded;
}

/**
 * Sort items by area (largest first) for better packing
 */
function sortItemsByArea(items: CuttingItem[]): CuttingItem[] {
  return [...items].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA;
  });
}

/**
 * Create a new empty sheet
 */
function createNewSheet(
  sheetNumber: number,
  config: OptimizationConfig
): Sheet {
  return {
    sheetNumber,
    width: config.sheetWidth,
    height: config.sheetHeight,
    items: [],
    freeRectangles: [
      {
        x: 0,
        y: 0,
        width: config.sheetWidth,
        height: config.sheetHeight,
      },
    ],
    utilizationPercent: 0,
    usedArea: 0,
  };
}

/**
 * Try to place an item in a sheet using Guillotine algorithm
 */
function tryPlaceItem(
  sheet: Sheet,
  item: CuttingItem,
  config: OptimizationConfig
): boolean {
  const margin = config.cutMargin;
  
  // Try each free rectangle
  for (let i = 0; i < sheet.freeRectangles.length; i++) {
    const rect = sheet.freeRectangles[i];
    
    // Try without rotation
    if (canFit(item.width, item.height, rect, margin)) {
      placeItemInRectangle(sheet, item, rect, i, false, margin);
      return true;
    }
    
    // Try with rotation (if grain direction allows)
    if (!config.respectGrainDirection || item.grainDirection === 'none') {
      if (canFit(item.height, item.width, rect, margin)) {
        placeItemInRectangle(sheet, item, rect, i, true, margin);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if item fits in rectangle with margin
 */
function canFit(
  itemWidth: number,
  itemHeight: number,
  rect: Rectangle,
  margin: number
): boolean {
  return (
    itemWidth + margin <= rect.width &&
    itemHeight + margin <= rect.height
  );
}

/**
 * Place item in rectangle and split remaining space
 */
function placeItemInRectangle(
  sheet: Sheet,
  item: CuttingItem,
  rect: Rectangle,
  rectIndex: number,
  rotated: boolean,
  margin: number
): void {
  const width = rotated ? item.height : item.width;
  const height = rotated ? item.width : item.height;
  
  // Add placed item
  sheet.items.push({
    ...item,
    x: rect.x,
    y: rect.y,
    rotated,
    sheetNumber: sheet.sheetNumber,
  });
  
  // Remove used rectangle
  sheet.freeRectangles.splice(rectIndex, 1);
  
  // Split remaining space (Guillotine split)
  const rightWidth = rect.width - width - margin;
  const bottomHeight = rect.height - height - margin;
  
  // Add right rectangle if there's space
  if (rightWidth >= 100) { // Min 100mm width
    sheet.freeRectangles.push({
      x: rect.x + width + margin,
      y: rect.y,
      width: rightWidth,
      height: rect.height,
    });
  }
  
  // Add bottom rectangle if there's space
  if (bottomHeight >= 100) { // Min 100mm height
    sheet.freeRectangles.push({
      x: rect.x,
      y: rect.y + height + margin,
      width: width + margin,
      height: bottomHeight,
    });
  }
  
  // Sort free rectangles by area (largest first)
  sheet.freeRectangles.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA;
  });
}

/**
 * Validate items before optimization
 */
export function validateItems(
  items: CuttingItem[],
  config: OptimizationConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  items.forEach((item, index) => {
    if (item.width <= 0 || item.height <= 0) {
      errors.push(`Item ${index + 1} (${item.name}): Invalid dimensions`);
    }
    
    if (item.width > config.sheetWidth || item.height > config.sheetHeight) {
      errors.push(
        `Item ${index + 1} (${item.name}): Too large for sheet (${item.width}x${item.height}mm)`
      );
    }
    
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1} (${item.name}): Invalid quantity`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
