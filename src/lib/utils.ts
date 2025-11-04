import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a phone number to the pattern (99) 99999-9999
 */
export function formatPhoneNumber(value: string): string {
  let numbers = value.replace(/\D/g, '');
  
  numbers = numbers.slice(0, 11);
  
  let formatted = numbers;
  if (numbers.length > 0) formatted = '(' + formatted;
  if (numbers.length > 2) formatted = formatted.slice(0, 3) + ') ' + formatted.slice(3);
  if (numbers.length > 7) formatted = formatted.slice(0, 10) + '-' + formatted.slice(10);
  
  return formatted;
}
