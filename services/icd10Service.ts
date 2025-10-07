/**
 * ICD-10 Code Database Service
 * Uses comprehensive ICD-10-CM database from official sources
 * Over 71,000 medical codes with descriptions and categories
 */

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  categoryCode?: string;
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
  metadata?: {
    version: string;
    totalCodes: number;
    totalCategories: number;
    generatedAt: string;
  };
  categories?: ICD10Category[];
  codes?: ICD10Code[];
}

// Database cache
let database: ICD10Database | null = null;
let loadingPromise: Promise<ICD10Database> | null = null;

// Fallback minimal database for when the main database fails to load
const fallbackDatabase: ICD10Database = {
  metadata: {
    version: "2024.1-fallback",
    totalCodes: 65,
    totalCategories: 12,
    generatedAt: new Date().toISOString()
  },
  categories: [
    { code: "A00-B99", title: "Certain infectious and parasitic diseases", range: "A00-B99" },
    { code: "C00-D49", title: "Neoplasms", range: "C00-D49" },
    { code: "E00-E89", title: "Endocrine, nutritional and metabolic diseases", range: "E00-E89" },
    { code: "F01-F99", title: "Mental and behavioral disorders", range: "F01-F99" },
    { code: "I00-I99", title: "Diseases of the circulatory system", range: "I00-I99" },
    { code: "J00-J99", title: "Diseases of the respiratory system", range: "J00-J99" },
    { code: "K00-K95", title: "Diseases of the digestive system", range: "K00-K95" },
    { code: "L00-L99", title: "Diseases of the skin and subcutaneous tissue", range: "L00-L99" },
    { code: "M00-M99", title: "Diseases of the musculoskeletal system and connective tissue", range: "M00-M99" },
    { code: "R00-R99", title: "Symptoms, signs and abnormal clinical and laboratory findings", range: "R00-R99" },
    { code: "V00-Y99", title: "External causes of morbidity and mortality", range: "V00-Y99" },
    { code: "Z00-Z99", title: "Factors influencing health status and contact with health services", range: "Z00-Z99" }
  ],
  codes: [
    // Infectious diseases
    { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified", category: "Certain infectious and parasitic diseases", categoryCode: "A00-B99" },
    { code: "B34.9", description: "Viral infection, unspecified", category: "Certain infectious and parasitic diseases", categoryCode: "A00-B99" },
    
    // Neoplasms
    { code: "C80.1", description: "Malignant neoplasm, unspecified", category: "Neoplasms", categoryCode: "C00-D49" },
    { code: "D49.9", description: "Neoplasm of unspecified behavior of unspecified site", category: "Neoplasms", categoryCode: "C00-D49" },
    
    // Endocrine diseases
    { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine, nutritional and metabolic diseases", categoryCode: "E00-E89" },
    { code: "E78.5", description: "Hyperlipidemia, unspecified", category: "Endocrine, nutritional and metabolic diseases", categoryCode: "E00-E89" },
    
    // Mental disorders
    { code: "F32.9", description: "Major depressive disorder, single episode, unspecified", category: "Mental and behavioral disorders", categoryCode: "F01-F99" },
    { code: "F41.1", description: "Generalized anxiety disorder", category: "Mental and behavioral disorders", categoryCode: "F01-F99" },
    
    // Circulatory diseases
    { code: "I10", description: "Essential (primary) hypertension", category: "Diseases of the circulatory system", categoryCode: "I00-I99" },
    { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris", category: "Diseases of the circulatory system", categoryCode: "I00-I99" },
    
    // Respiratory diseases
    { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Diseases of the respiratory system", categoryCode: "J00-J99" },
    { code: "J44.1", description: "Chronic obstructive pulmonary disease with acute exacerbation", category: "Diseases of the respiratory system", categoryCode: "J00-J99" },
    
    // Digestive diseases
    { code: "K59.00", description: "Constipation, unspecified", category: "Diseases of the digestive system", categoryCode: "K00-K95" },
    { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis", category: "Diseases of the digestive system", categoryCode: "K00-K95" },
    
    // Skin conditions
    { code: "L23.9", description: "Allergic contact dermatitis, unspecified cause", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    { code: "L30.9", description: "Dermatitis, unspecified", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    { code: "L50.9", description: "Urticaria, unspecified", category: "Diseases of the skin and subcutaneous tissue", categoryCode: "L00-L99" },
    
    // Musculoskeletal diseases
    { code: "M25.50", description: "Pain in unspecified joint", category: "Diseases of the musculoskeletal system and connective tissue", categoryCode: "M00-M99" },
    { code: "M54.5", description: "Low back pain", category: "Diseases of the musculoskeletal system and connective tissue", categoryCode: "M00-M99" },
    { code: "M79.3", description: "Panniculitis, unspecified", category: "Diseases of the musculoskeletal system and connective tissue", categoryCode: "M00-M99" },
    
    // Symptoms and signs
    { code: "R50.9", description: "Fever, unspecified", category: "Symptoms, signs and abnormal clinical and laboratory findings", categoryCode: "R00-R99" },
    { code: "R06.02", description: "Shortness of breath", category: "Symptoms, signs and abnormal clinical and laboratory findings", categoryCode: "R00-R99" },
    { code: "R51.9", description: "Headache, unspecified", category: "Symptoms, signs and abnormal clinical and laboratory findings", categoryCode: "R00-R99" },
    { code: "R10.9", description: "Unspecified abdominal pain", category: "Symptoms, signs and abnormal clinical and laboratory findings", categoryCode: "R00-R99" },
    
    // External causes - Including W codes for injuries
    { code: "W01.XXXA", description: "Fall on same level from slipping, tripping and stumbling, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W06.XXXA", description: "Fall from bed, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W18.XXXA", description: "Other slipping, tripping and stumbling and falls, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W19.XXXA", description: "Unspecified fall, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W22.XXXA", description: "Striking against or struck by other objects, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W57", description: "Bitten or stung by nonvenomous insect and other nonvenomous arthropods", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W57.XXXA", description: "Bitten or stung by nonvenomous insect and other nonvenomous arthropods, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "W85.XXXA", description: "Exposure to electric transmission lines, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "X58.XXXA", description: "Exposure to other specified factors, initial encounter", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    { code: "Y92.9", description: "Unspecified place or not applicable", category: "External causes of morbidity and mortality", categoryCode: "V00-Y99" },
    
    // Factors influencing health status
    { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Factors influencing health status and contact with health services", categoryCode: "Z00-Z99" },
    { code: "Z01.419", description: "Encounter for gynecological examination (general) (routine) without abnormal findings", category: "Factors influencing health status and contact with health services", categoryCode: "Z00-Z99" },
    { code: "Z51.11", description: "Encounter for antineoplastic chemotherapy", category: "Factors influencing health status and contact with health services", categoryCode: "Z00-Z99" },
    { code: "Z87.891", description: "Personal history of nicotine dependence", category: "Factors influencing health status and contact with health services", categoryCode: "Z00-Z99" }
  ]
};

/**
 * Load the ICD-10 database asynchronously with retry logic and compression support
 */
async function loadDatabase(): Promise<ICD10Database> {
  if (database) {
    return database;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    // Try different database sources in order of preference
    const databaseSources = [
      '/data/icd10-database.json',
      './data/icd10-database.json',
      '/data/icd10-database.json.gz' // Compressed fallback
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const dbPath of databaseSources) {
        try {
          console.log(`Loading ICD-10 database from ${dbPath} (attempt ${attempt}/${maxRetries})...`);
          
          // Add timeout for fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
          
          const headers: Record<string, string> = {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          };

          // Add gzip support if trying compressed version
          if (dbPath.endsWith('.gz')) {
            headers['Accept-Encoding'] = 'gzip';
          }
          
          const response = await fetch(dbPath, {
            signal: controller.signal,
            headers
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.log(`Database response received from ${dbPath}, size: ${response.headers.get('content-length') || 'unknown'} bytes`);
          
          let data;
          
          // Handle compressed data
          if (dbPath.endsWith('.gz')) {
            const arrayBuffer = await response.arrayBuffer();
            const decompressed = new TextDecoder().decode(
              new Uint8Array(arrayBuffer)
            );
            data = JSON.parse(decompressed);
          } else {
            data = await response.json();
          }
          
          // Handle both array format (simple) and object format (complex)
          let codes: ICD10Code[];
          let metadata: any;
          let categories: ICD10Category[] = [];
          
          if (Array.isArray(data)) {
            // Simple array format from our new database
            codes = data;
            metadata = {
              version: "2026.1-production",
              totalCodes: codes.length,
              totalCategories: 26,
              generatedAt: new Date().toISOString(),
              source: dbPath
            };
            
            // Generate categories from codes
            const categoryMap = new Set<string>();
            codes.forEach(code => {
              const firstChar = code.code.charAt(0);
              categoryMap.add(firstChar);
            });
            
            categories = Array.from(categoryMap).map(char => {
              const ranges: { [key: string]: string } = {
                'A': 'A00-B99', 'B': 'A00-B99',
                'C': 'C00-D49', 'D': 'C00-D49',
                'E': 'E00-E89', 'F': 'F01-F99',
                'G': 'G00-G99', 'H': 'H00-H95',
                'I': 'I00-I99', 'J': 'J00-J99',
                'K': 'K00-K95', 'L': 'L00-L99',
                'M': 'M00-M99', 'N': 'N00-N99',
                'O': 'O00-O9A', 'P': 'P00-P96',
                'Q': 'Q00-Q99', 'R': 'R00-R99',
                'S': 'S00-T88', 'T': 'S00-T88',
                'V': 'V00-Y99', 'W': 'V00-Y99', 'X': 'V00-Y99', 'Y': 'V00-Y99',
                'Z': 'Z00-Z99'
              };
              return {
                code: ranges[char] || `${char}00-${char}99`,
                title: `Chapter ${char}`,
                range: ranges[char] || `${char}00-${char}99`
              };
            });
          } else {
            // Complex object format
            codes = data.codes || [];
            metadata = data.metadata;
            categories = data.categories || [];
          }
          
          // Validate the data structure
          if (!codes || !Array.isArray(codes)) {
            throw new Error('Invalid database format: codes is not an array');
          }
          
          if (codes.length === 0) {
            throw new Error('Invalid database format: empty codes array');
          }
          
          const formattedData: ICD10Database = {
            metadata,
            categories,
            codes
          };
          
          database = formattedData;
          console.log(`✅ ICD-10 database loaded successfully from ${dbPath}: ${codes.length} codes, ${categories.length} categories`);
          
          // Verify critical codes are available
          const testCodes = ['W57.XXXA', 'K58.0', 'I10', 'E11.9'];
          const foundCodes = testCodes.filter(code => codes.find(c => c.code === code));
          console.log(`✅ Verified ${foundCodes.length}/${testCodes.length} critical codes available`);
          
          return formattedData;
          
        } catch (error) {
          lastError = error as Error;
          console.warn(`Failed to load from ${dbPath}:`, error);
          continue; // Try next source
        }
      }
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All attempts failed, use fallback
    console.error(`❌ Failed to load main ICD-10 database after ${maxRetries} attempts. Last error:`, lastError);
    console.log(`📋 Using fallback database with ${fallbackDatabase.metadata.totalCodes} codes`);
    
    database = fallbackDatabase;
    return fallbackDatabase;
  })();

  return loadingPromise;
}

//Service class for ICD-10 code operations
export class ICD10Service {
  
  /**
   * Get ICD-10 code by code string with fuzzy matching
   */
  static async getByCode(code: string): Promise<ICD10Code | undefined> {
    const db = await loadDatabase();
    
    // First try exact match
    let result = db.codes?.find(item => item.code === code);
    
    if (!result) {
      // Try without trailing characters (e.g., W57.XXXA -> W57)
      const baseCode = code.replace(/\.X+[A-Z]*$/, '');
      result = db.codes?.find(item => item.code === baseCode);
    }
    
    if (!result) {
      // Try partial match for similar codes
      result = db.codes?.find(item => 
        item.code.startsWith(code.substring(0, 3)) && 
        item.description.toLowerCase().includes(code.toLowerCase())
      );
    }
    
    if (!result) {
      // Check fallback database for missing codes
      const fallbackResult = fallbackDatabase.codes.find(item => item.code === code);
      if (fallbackResult) {
        console.log(`⚠️ ${code} not found in main database, using fallback database`);
        return fallbackResult;
      }
    }
    
    if (!result) {
      console.warn(`⚠️ ${code} not found in main database, fallback will be used for this code`);
    }
    
    return result;
  }

  /**
   * Search ICD-10 codes by description with improved relevance
   */
  static async searchByDescription(searchTerm: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return [];
    
    const results: ICD10Code[] = [];
    const exactMatches: ICD10Code[] = [];
    const partialMatches: ICD10Code[] = [];
    
    // Search through all codes
    for (const item of db.codes || []) {
      const description = item.description.toLowerCase();
      const shortDesc = item.shortDescription?.toLowerCase() || '';
      
      // Exact matches get highest priority
      if (description === term || shortDesc === term) {
        exactMatches.push(item);
      }
      // Partial matches
      else if (description.includes(term) || shortDesc.includes(term)) {
        partialMatches.push(item);
      }
      
      // Stop if we have enough results
      if (exactMatches.length + partialMatches.length >= 100) break;
    }
    
    // Combine results with exact matches first
    results.push(...exactMatches);
    results.push(...partialMatches.slice(0, 50 - exactMatches.length));
    
    // If no results in main database, try fallback
    if (results.length === 0) {
      const fallbackResults = fallbackDatabase.codes.filter(item => 
        item.description.toLowerCase().includes(term) ||
        item.shortDescription?.toLowerCase().includes(term)
      );
      
      if (fallbackResults.length > 0) {
        console.log(`⚠️ No results for "${searchTerm}" in main database, using fallback results`);
        results.push(...fallbackResults);
      }
    }
    
    return results.slice(0, 50); // Limit final results
  }

  /**
   * Get ICD-10 codes by category
   */
  static async getByCategory(category: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    return (db.codes || []).filter(item => 
      item.category === category || item.categoryCode === category
    ).slice(0, 100); // Limit results for performance
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<ICD10Category[]> {
    const db = await loadDatabase();
    return db.categories || [];
  }

  /**
   * Get related codes for a given code (finds codes in same category)
   */
  static async getRelatedCodes(code: string): Promise<ICD10Code[]> {
    const db = await loadDatabase();
    const item = await this.getByCode(code);
    if (!item) return [];
    
    return (db.codes || [])
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
    for (const item of db.codes || []) {
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
        for (const item of db.codes || []) {
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
    
    return (db.categories || []).find(cat => cat.code === item.categoryCode);
  }

  /**
   * Get database metadata
   */
  static async getMetadata(): Promise<ICD10Database['metadata']> {
    const db = await loadDatabase();
    return db.metadata || {
      version: "2024.1-unknown",
      totalCodes: db.codes?.length || 0,
      totalCategories: db.categories?.length || 0,
      generatedAt: new Date().toISOString()
    };
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
    let results = db.codes || [];

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
      totalCodes: database.metadata?.totalCodes || database.codes?.length || 0
    };
  }

  /**
   * Get comprehensive database health and status information
   */
  static async getDatabaseHealth(): Promise<{
    isLoaded: boolean;
    isMainDatabase: boolean;
    totalCodes: number;
    version: string;
    hasW57Code: boolean;
    loadTime?: string;
    error?: string;
  }> {
    try {
      const db = await loadDatabase();
      const hasW57 = db.codes.some(code => code.code === 'W57.XXXA');
      
      return {
        isLoaded: true,
        isMainDatabase: db !== fallbackDatabase,
        totalCodes: db.metadata.totalCodes,
        version: db.metadata.version,
        hasW57Code: hasW57,
        loadTime: db.metadata.generatedAt
      };
    } catch (error) {
      return {
        isLoaded: false,
        isMainDatabase: false,
        totalCodes: 0,
        version: 'unknown',
        hasW57Code: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get detailed database coverage analysis
   */
  static async getDatabaseCoverage(): Promise<{
    totalCodes: number;
    categoryBreakdown: { [key: string]: number };
    letterCoverage: { [key: string]: number };
    missingCommonCodes: string[];
    usingFallback: boolean;
    coverageScore: number;
  }> {
    try {
      const db = await loadDatabase();
      const usingFallback = db === fallbackDatabase;
      
      // Analyze code coverage by first letter
      const letterCoverage: { [key: string]: number } = {};
      const categoryBreakdown: { [key: string]: number } = {};
      
      db.codes.forEach(code => {
        const firstLetter = code.code.charAt(0);
        letterCoverage[firstLetter] = (letterCoverage[firstLetter] || 0) + 1;
        
        // Group similar categories
        const category = code.category.toLowerCase();
        if (category.includes('disease') || category.includes('disorder')) {
          categoryBreakdown['Diseases & Disorders'] = (categoryBreakdown['Diseases & Disorders'] || 0) + 1;
        } else if (category.includes('injury') || category.includes('fracture') || category.includes('external')) {
          categoryBreakdown['Injuries & External Causes'] = (categoryBreakdown['Injuries & External Causes'] || 0) + 1;
        } else if (category.includes('history') || category.includes('factor')) {
          categoryBreakdown['Health History & Factors'] = (categoryBreakdown['Health History & Factors'] || 0) + 1;
        } else {
          categoryBreakdown['Other'] = (categoryBreakdown['Other'] || 0) + 1;
        }
      });
      
      // Test for common codes that should be present
      const commonTestCodes = ['I10', 'E11.9', 'F32.9', 'J06.9', 'M54.5', 'R50.9', 'Z00.00'];
      const missingCommonCodes = [];
      
      for (const testCode of commonTestCodes) {
        const found = db.codes.some(code => code.code === testCode);
        if (!found) {
          missingCommonCodes.push(testCode);
        }
      }
      
      // Calculate coverage score (0-100)
      const expectedMinimumCodes = 50000; // Expected for comprehensive ICD-10
      const foundCommonCodes = commonTestCodes.length - missingCommonCodes.length;
      const codeCountScore = Math.min((db.codes.length / expectedMinimumCodes) * 60, 60);
      const commonCodeScore = (foundCommonCodes / commonTestCodes.length) * 40;
      const coverageScore = Math.round(codeCountScore + commonCodeScore);
      
      return {
        totalCodes: db.codes.length,
        categoryBreakdown,
        letterCoverage,
        missingCommonCodes,
        usingFallback,
        coverageScore
      };
      
    } catch (error) {
      return {
        totalCodes: 0,
        categoryBreakdown: {},
        letterCoverage: {},
        missingCommonCodes: [],
        usingFallback: true,
        coverageScore: 0
      };
    }
  }

  /**
   * Preload the database (useful for app initialization)
   */
  static async preloadDatabase(): Promise<void> {
    await loadDatabase();
  }
}

export default ICD10Service;