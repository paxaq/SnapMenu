import LZString from 'lz-string';
import { MenuData } from '../types';

/**
 * Encodes the menu data into a URL-safe compressed string.
 * This acts as our "Serverless Database" allowing the QR code to carry the data.
 */
export const encodeMenuToHash = (data: MenuData): string => {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
  } catch (error) {
    console.error("Failed to encode menu data", error);
    return "";
  }
};

/**
 * Decodes the menu data from a compressed string.
 */
export const decodeMenuFromHash = (hash: string): MenuData | null => {
  try {
    if (!hash) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as MenuData;
  } catch (error) {
    console.error("Failed to decode menu data", error);
    return null;
  }
};

/**
 * Generates the full shareable URL
 */
export const generateShareUrl = (data: MenuData): string => {
  const hash = encodeMenuToHash(data);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?m=${hash}`;
};