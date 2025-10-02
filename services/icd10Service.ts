/**
 * ICD-10 Code Database Service
 * Uses comprehensive ICD-10-CM database from official sources
 * Over 71,000 medical codes with descriptions and categories
 */

import icd10Database from '../data/icd10-database-compact.json';

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  categoryCode: string;
  shortDescription?: string;
  synonyms?: string[];
  relatedCodes?: string[];
}

export interface ICD10Category {
  code: string;
  title: string;
  range: string;
}

export interface ICD10Database {
  metadata: {
    version: string;
    totalCodes: number;
    totalCategories: number;
    generatedAt: string;
  };
  categories: ICD10Category[];
  codes: ICD10Code[];
}

// Cast the imported JSON data to our interface
const database = icd10Database as ICD10Database;

// Service class for ICD-10 code operations
export class ICD10Service {
  
  /**
   * Get ICD-10 code by code string
   */
  static getByCode(code: string): ICD10Code | undefined {
    return database.codes.find(item => item.code === code);
  }

  /**
   * Search ICD-10 codes by description
   */
  static searchByDescription(searchTerm: string): ICD10Code[] {
    const term = searchTerm.toLowerCase();
    return database.codes.filter(item => 
      item.description.toLowerCase().includes(term) ||
      item.shortDescription?.toLowerCase().includes(term)
    ).slice(0, 50); // Limit results for performance
  }

  /**
   * Get ICD-10 codes by category
   */
  static getByCategory(category: string): ICD10Code[] {
    return database.codes.filter(item => 
      item.category === category || item.categoryCode === category
    ).slice(0, 100); // Limit results for performance
  }

  /**
   * Get all categories
   */
  static getCategories(): ICD10Category[] {
    return database.categories;
  }

  /**
   * Get related codes for a given code (finds codes in same category)
   */
  static getRelatedCodes(code: string): ICD10Code[] {
    const item = this.getByCode(code);
    if (!item) return [];
    
    return database.codes
      .filter(relatedItem => 
        relatedItem.categoryCode === item.categoryCode && 
        relatedItem.code !== code
      )
      .slice(0, 10); // Limit results
  }

  /**
   * Suggest ICD-10 codes based on diagnosis text
   */
  static suggestCodes(diagnosisText: string): ICD10Code[] {
    const text = diagnosisText.toLowerCase();
    const suggestions: ICD10Code[] = [];
    
    // Direct keyword matching
    for (const item of database.codes) {
      if (item.description.toLowerCase().includes(text) ||
          item.shortDescription?.toLowerCase().includes(text)) {
        suggestions.push(item);
        if (suggestions.length >= 5) break; // Limit for performance
      }
    }
    
    // If no direct matches, try partial matching
    if (suggestions.length === 0) {
      const words = text.split(' ').filter(word => word.length > 3);
      for (const word of words) {
        for (const item of database.codes) {
          if (item.description.toLowerCase().includes(word) ||
              item.shortDescription?.toLowerCase().includes(word)) {
            if (!suggestions.find(s => s.code === item.code)) {
              suggestions.push(item);
              if (suggestions.length >= 5) break;
            }
          }
        }
        if (suggestions.length >= 5) break;
      }
    }
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Get category for a specific code
   */
  static getCategoryForCode(code: string): ICD10Category | undefined {
    const item = this.getByCode(code);
    if (!item) return undefined;
    
    return database.categories.find(cat => cat.code === item.categoryCode);
  }

  /**
   * Get database metadata
   */
  static getMetadata() {
    return database.metadata;
  }

  /**
   * Search codes with advanced filtering
   */
  static advancedSearch(options: {
    term?: string;
    category?: string;
    codeRange?: string;
    limit?: number;
  }): ICD10Code[] {
    let results = database.codes;

    if (options.term) {
      const term = options.term.toLowerCase();
      results = results.filter(item => 
        item.description.toLowerCase().includes(term) ||
        item.shortDescription?.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term)
      );
    }

    if (options.category) {
      results = results.filter(item => 
        item.category === options.category || 
        item.categoryCode === options.category
      );
    }

    if (options.codeRange) {
      // Simple range filtering (e.g., "A00-B99")
      const [start, end] = options.codeRange.split('-');
      if (start && end) {
        results = results.filter(item => 
          item.code >= start && item.code <= end
        );
      }
    }

    const limit = options.limit || 50;
    return results.slice(0, limit);
  }
}

export default ICD10Service;