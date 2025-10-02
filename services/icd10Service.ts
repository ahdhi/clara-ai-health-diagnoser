/**
 * ICD-10 Code Database Service
 * Uses comprehensive ICD-10-CM database from official sources
 * Over 71,000 medical codes with descriptions and categories
 */

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

// Database cache
let database: ICD10Database | null = null;
let loadingPromise: Promise<ICD10Database> | null = null;

// Fallback minimal database for when the main database fails to load
const fallbackDatabase: ICD10Database = {
  metadata: {
    version: "2024.1-fallback",
    totalCodes: 15,
    totalCategories: 3,
    generatedAt: new Date().toISOString()
  },
  categories: [
    { code: "A00-B99", title: "Certain infectious and parasitic diseases", range: "A00-B99" },
    { code: "C00-D49", title: "Neoplasms", range: "C00-D49" },
    { code: "L00-L99", title: "Diseases of the skin and subcutaneous tissue", range: "L00-L99" }
  ],
  codes: [
    { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified", category: "Certain infectious and parasitic diseases", categoryCode: "A00-B99" },
    { code: "B34.9", description: "Viral infection, unspecified", category: "Certain infectious and parasitic diseases", categoryCode: "A00-B99" },
    { code: "C80.1", description: "Malignant neoplasm, unspecified", category: "Neoplasms", categoryCode: "C00-D49" },
    { code: "D49.9", description: "Neoplasm of unspecified behavior of unspecified site", category: "Neoplasms", categoryCode: "C00-D49" },
    { code: "L23.9", description: "Allergic contact dermatitis, unspecified cause", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    { code: "L30.9", description: "Dermatitis, unspecified", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    { code: "L50.9", description: "Urticaria, unspecified", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    { code: "M25.50", description: "Pain in unspecified joint", category: "Diseases of the musculoskeletal system", categoryCode: "M00-M99" },
    { code: "R50.9", description: "Fever, unspecified", category: "Symptoms, signs and abnormal clinical findings", categoryCode: "R00-R99" },
    { code: "R06.02", description: "Shortness of breath", category: "Symptoms, signs and abnormal clinical findings", categoryCode: "R00-R99" },
    { code: "R51.9", description: "Headache, unspecified", category: "Symptoms, signs and abnormal clinical findings", categoryCode: "R00-R99" },
    { code: "K59.00", description: "Constipation, unspecified", category: "Diseases of the digestive system", categoryCode: "K00-K95" },
    { code: "N39.0", description: "Urinary tract infection, site not specified", category: "Diseases of the genitourinary system", categoryCode: "N00-N99" },
    { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Diseases of the respiratory system", categoryCode: "J00-J99" },
    { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Factors influencing health status", categoryCode: "Z00-Z99" }
  ]
};

/**
 * Load the ICD-10 database asynchronously
 */
async function loadDatabase(): Promise<ICD10Database> {
  if (database) {
    return database;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      // Try to load the database dynamically
      const response = await fetch('/data/icd10-database-compact.json');
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.status}`);
      }
      
      const data = await response.json() as ICD10Database;
      
      // Validate the data structure
      if (!data.codes || !Array.isArray(data.codes) || data.codes.length === 0) {
        throw new Error('Invalid database structure');
      }
      
      database = data;
      console.log(`ICD-10 database loaded: ${data.metadata.totalCodes} codes`);
      return data;
    } catch (error) {
      console.warn('Failed to load main ICD-10 database, using fallback:', error);
      database = fallbackDatabase;
      return fallbackDatabase;
    }
  })();

  return loadingPromise;
}

//Service class for ICD-10 code operations
export class ICD10Service {
  
  /**
   * Get ICD-10 code by code string
   */
  static async getByCode(code: string): Promise<ICD10Code | undefined> {
    const db = await loadDatabase();
    return db.codes.find(item => item.code === code);
  }

  /**
   * Search ICD-10 codes by description
   */
  static async searchByDescription(searchTerm: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    const term = searchTerm.toLowerCase();
    return db.codes.filter(item => 
      item.description.toLowerCase().includes(term) ||
      item.shortDescription?.toLowerCase().includes(term)
    ).slice(0, 50); // Limit results for performance
  }

  /**
   * Get ICD-10 codes by category
   */
  static async getByCategory(category: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    return db.codes.filter(item => 
      item.category === category || item.categoryCode === category
    ).slice(0, 100); // Limit results for performance
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<ICD10Category[]> {
    const db = await loadDatabase();
    return db.categories;
  }

  /**
   * Get related codes for a given code (finds codes in same category)
   */
  static async getRelatedCodes(code: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    const item = await this.getByCode(code);
    if (!item) return [];
    
    return db.codes
      .filter(relatedItem => 
        relatedItem.categoryCode === item.categoryCode && 
        relatedItem.code !== code
      )
      .slice(0, 10); // Limit results
  }

  /**
   * Suggest ICD-10 codes based on diagnosis text
   */
  static async suggestCodes(diagnosisText: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    const text = diagnosisText.toLowerCase();
    const suggestions: ICD10Code[] = [];
    
    // Direct keyword matching
    for (const item of db.codes) {
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
        for (const item of db.codes) {
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
  static async getCategoryForCode(code: string): Promise<ICD10Category | undefined> {
    const db = await loadDatabase();
    const item = await this.getByCode(code);
    if (!item) return undefined;
    
    return db.categories.find(cat => cat.code === item.categoryCode);
  }

  /**
   * Get database metadata
   */
  static async getMetadata(): Promise<ICD10Database['metadata']> {
    const db = await loadDatabase();
    return db.metadata;
  }

  /**
   * Search codes with advanced filtering
   */
  static async advancedSearch(options: {
    term?: string;
    category?: string;
    codeRange?: string;
    limit?: number;
  }): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    let results = db.codes;

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

  /**
   * Check if database is loaded and get status
   */
  static getDatabaseStatus(): { loaded: boolean; fallback: boolean; totalCodes: number } {
    if (!database) {
      return { loaded: false, fallback: false, totalCodes: 0 };
    }
    return {
      loaded: true,
      fallback: database === fallbackDatabase,
      totalCodes: database.metadata.totalCodes
    };
  }
}

export default ICD10Service;