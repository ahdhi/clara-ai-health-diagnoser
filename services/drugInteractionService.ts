/**
 * Drug Interaction Database Service
 * Comprehensive database of drug-drug interactions with severity classification
 * and mechanism information for clinical decision support
 */

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: DrugCategory;
  activeIngredients: string[];
  mechanism: string;
  commonUses: string[];
  fdaApproved: boolean;
}

export interface DrugInteraction {
  id: string;
  drug1Id: string;
  drug2Id: string;
  drug1Name: string;
  drug2Name: string;
  severity: InteractionSeverity;
  mechanism: string;
  description: string;
  clinicalEffect: string;
  managementRecommendation: string;
  evidenceLevel: EvidenceLevel;
  sources: string[];
  lastUpdated: string;
}

export type InteractionSeverity = 
  | 'Major'       // Potentially life-threatening
  | 'Moderate'    // Significant clinical impact
  | 'Minor'       // Limited clinical significance
  | 'Unknown';    // Insufficient data

export type EvidenceLevel = 
  | 'Established' // Well-documented in literature
  | 'Probable'    // Good evidence but not conclusive
  | 'Suspected'   // Limited evidence
  | 'Unknown';    // No reliable evidence

export type DrugCategory = 
  | 'Cardiovascular'
  | 'Neurological'
  | 'Endocrine'
  | 'Gastrointestinal'
  | 'Respiratory'
  | 'Infectious Disease'
  | 'Pain Management'
  | 'Mental Health'
  | 'Oncology'
  | 'Immunology'
  | 'Other';

// Curated database of common drugs
export const DRUG_DATABASE: Drug[] = [
  // Cardiovascular Drugs
  {
    id: 'warfarin',
    name: 'Warfarin',
    genericName: 'warfarin sodium',
    brandNames: ['Coumadin', 'Jantoven'],
    category: 'Cardiovascular',
    activeIngredients: ['warfarin sodium'],
    mechanism: 'Vitamin K antagonist anticoagulant',
    commonUses: ['Anticoagulation for atrial fibrillation', 'DVT/PE prevention and treatment'],
    fdaApproved: true
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    genericName: 'acetylsalicylic acid',
    brandNames: ['Bayer', 'Bufferin', 'Ecotrin'],
    category: 'Cardiovascular',
    activeIngredients: ['acetylsalicylic acid'],
    mechanism: 'COX-1 and COX-2 inhibitor, antiplatelet',
    commonUses: ['Cardioprotection', 'Pain relief', 'Anti-inflammatory'],
    fdaApproved: true
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    genericName: 'lisinopril',
    brandNames: ['Prinivil', 'Zestril'],
    category: 'Cardiovascular',
    activeIngredients: ['lisinopril'],
    mechanism: 'ACE inhibitor',
    commonUses: ['Hypertension', 'Heart failure', 'Post-MI cardioprotection'],
    fdaApproved: true
  },
  {
    id: 'metoprolol',
    name: 'Metoprolol',
    genericName: 'metoprolol tartrate',
    brandNames: ['Lopressor', 'Toprol-XL'],
    category: 'Cardiovascular',
    activeIngredients: ['metoprolol tartrate', 'metoprolol succinate'],
    mechanism: 'Selective beta-1 adrenergic blocker',
    commonUses: ['Hypertension', 'Angina', 'Heart failure'],
    fdaApproved: true
  },

  // Neurological/Mental Health
  {
    id: 'sertraline',
    name: 'Sertraline',
    genericName: 'sertraline hydrochloride',
    brandNames: ['Zoloft'],
    category: 'Mental Health',
    activeIngredients: ['sertraline hydrochloride'],
    mechanism: 'Selective serotonin reuptake inhibitor (SSRI)',
    commonUses: ['Depression', 'Anxiety disorders', 'PTSD', 'OCD'],
    fdaApproved: true
  },
  {
    id: 'fluoxetine',
    name: 'Fluoxetine',
    genericName: 'fluoxetine hydrochloride',
    brandNames: ['Prozac', 'Sarafem'],
    category: 'Mental Health',
    activeIngredients: ['fluoxetine hydrochloride'],
    mechanism: 'Selective serotonin reuptake inhibitor (SSRI)',
    commonUses: ['Depression', 'Bulimia nervosa', 'OCD', 'Panic disorder'],
    fdaApproved: true
  },
  {
    id: 'alprazolam',
    name: 'Alprazolam',
    genericName: 'alprazolam',
    brandNames: ['Xanax', 'Niravam'],
    category: 'Mental Health',
    activeIngredients: ['alprazolam'],
    mechanism: 'Benzodiazepine, GABA-A receptor agonist',
    commonUses: ['Anxiety disorders', 'Panic disorder'],
    fdaApproved: true
  },

  // Endocrine
  {
    id: 'metformin',
    name: 'Metformin',
    genericName: 'metformin hydrochloride',
    brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
    category: 'Endocrine',
    activeIngredients: ['metformin hydrochloride'],
    mechanism: 'Biguanide, decreases hepatic glucose production',
    commonUses: ['Type 2 diabetes', 'PCOS', 'Metabolic syndrome'],
    fdaApproved: true
  },
  {
    id: 'insulin',
    name: 'Insulin',
    genericName: 'insulin',
    brandNames: ['Humalog', 'Novolog', 'Lantus', 'Levemir'],
    category: 'Endocrine',
    activeIngredients: ['insulin lispro', 'insulin aspart', 'insulin glargine'],
    mechanism: 'Hormone replacement, glucose homeostasis',
    commonUses: ['Type 1 diabetes', 'Type 2 diabetes'],
    fdaApproved: true
  },

  // Pain Management
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    genericName: 'ibuprofen',
    brandNames: ['Advil', 'Motrin', 'Nuprin'],
    category: 'Pain Management',
    activeIngredients: ['ibuprofen'],
    mechanism: 'Non-selective COX inhibitor (NSAID)',
    commonUses: ['Pain relief', 'Inflammation', 'Fever reduction'],
    fdaApproved: true
  },
  {
    id: 'acetaminophen',
    name: 'Acetaminophen',
    genericName: 'acetaminophen',
    brandNames: ['Tylenol', 'Panadol'],
    category: 'Pain Management',
    activeIngredients: ['acetaminophen'],
    mechanism: 'Central COX inhibition, unclear mechanism',
    commonUses: ['Pain relief', 'Fever reduction'],
    fdaApproved: true
  },

  // Infectious Disease
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    genericName: 'amoxicillin',
    brandNames: ['Amoxil', 'Trimox'],
    category: 'Infectious Disease',
    activeIngredients: ['amoxicillin'],
    mechanism: 'Beta-lactam antibiotic, cell wall synthesis inhibitor',
    commonUses: ['Bacterial infections', 'Strep throat', 'UTIs'],
    fdaApproved: true
  },
  {
    id: 'azithromycin',
    name: 'Azithromycin',
    genericName: 'azithromycin',
    brandNames: ['Zithromax', 'Z-Pak'],
    category: 'Infectious Disease',
    activeIngredients: ['azithromycin'],
    mechanism: 'Macrolide antibiotic, protein synthesis inhibitor',
    commonUses: ['Respiratory infections', 'Skin infections', 'STDs'],
    fdaApproved: true
  }
];

// Drug interaction database
export const DRUG_INTERACTIONS: DrugInteraction[] = [
  // Warfarin interactions (high severity)
  {
    id: 'warfarin-aspirin',
    drug1Id: 'warfarin',
    drug2Id: 'aspirin',
    drug1Name: 'Warfarin',
    drug2Name: 'Aspirin',
    severity: 'Major',
    mechanism: 'Additive anticoagulant and antiplatelet effects',
    description: 'Concurrent use significantly increases bleeding risk',
    clinicalEffect: 'Increased risk of serious bleeding, including GI and intracranial hemorrhage',
    managementRecommendation: 'Avoid combination if possible. If necessary, use lowest effective aspirin dose with frequent INR monitoring and bleeding assessment.',
    evidenceLevel: 'Established',
    sources: ['FDA Drug Label', 'Clinical Pharmacology Review'],
    lastUpdated: '2024-10-01'
  },
  {
    id: 'warfarin-ibuprofen',
    drug1Id: 'warfarin',
    drug2Id: 'ibuprofen',
    drug1Name: 'Warfarin',
    drug2Name: 'Ibuprofen',
    severity: 'Major',
    mechanism: 'NSAIDs inhibit platelet function and may increase warfarin levels',
    description: 'Increased bleeding risk and potential displacement from protein binding',
    clinicalEffect: 'Significantly increased risk of bleeding complications',
    managementRecommendation: 'Avoid NSAIDs in patients on warfarin. Consider acetaminophen for pain relief. If NSAID necessary, use short-term with careful monitoring.',
    evidenceLevel: 'Established',
    sources: ['Cochrane Review', 'Clinical Guidelines'],
    lastUpdated: '2024-10-01'
  },

  // SSRI interactions
  {
    id: 'sertraline-aspirin',
    drug1Id: 'sertraline',
    drug2Id: 'aspirin',
    drug1Name: 'Sertraline',
    drug2Name: 'Aspirin',
    severity: 'Moderate',
    mechanism: 'SSRIs affect platelet serotonin, aspirin inhibits platelet aggregation',
    description: 'Combined antiplatelet effects increase bleeding risk',
    clinicalEffect: 'Increased risk of bleeding, particularly GI bleeding',
    managementRecommendation: 'Monitor for signs of bleeding. Consider gastroprotection if long-term use necessary.',
    evidenceLevel: 'Probable',
    sources: ['Pharmacovigilance Studies', 'Meta-analysis'],
    lastUpdated: '2024-10-01'
  },
  {
    id: 'fluoxetine-alprazolam',
    drug1Id: 'fluoxetine',
    drug2Id: 'alprazolam',
    drug1Name: 'Fluoxetine',
    drug2Name: 'Alprazolam',
    severity: 'Moderate',
    mechanism: 'Fluoxetine inhibits CYP3A4 metabolism of alprazolam',
    description: 'Increased alprazolam levels and prolonged effects',
    clinicalEffect: 'Enhanced sedation, increased risk of respiratory depression',
    managementRecommendation: 'Consider dose reduction of alprazolam. Monitor for excessive sedation. Consider alternative benzodiazepine less affected by CYP3A4.',
    evidenceLevel: 'Established',
    sources: ['Pharmacokinetic Studies', 'FDA Guidance'],
    lastUpdated: '2024-10-01'
  },

  // ACE inhibitor interactions
  {
    id: 'lisinopril-ibuprofen',
    drug1Id: 'lisinopril',
    drug2Id: 'ibuprofen',
    drug1Name: 'Lisinopril',
    drug2Name: 'Ibuprofen',
    severity: 'Moderate',
    mechanism: 'NSAIDs reduce prostaglandin synthesis, counteracting ACE inhibitor effects',
    description: 'Reduced antihypertensive effect and potential kidney function impairment',
    clinicalEffect: 'Decreased blood pressure control, increased risk of acute kidney injury',
    managementRecommendation: 'Monitor blood pressure and kidney function. Use lowest effective NSAID dose for shortest duration. Consider alternative pain management.',
    evidenceLevel: 'Established',
    sources: ['Hypertension Guidelines', 'Nephrology Reviews'],
    lastUpdated: '2024-10-01'
  },

  // Diabetes medication interactions
  {
    id: 'metformin-alcohol',
    drug1Id: 'metformin',
    drug2Id: 'alcohol',
    drug1Name: 'Metformin',
    drug2Name: 'Alcohol',
    severity: 'Major',
    mechanism: 'Both can cause lactic acidosis, alcohol affects glucose metabolism',
    description: 'Increased risk of lactic acidosis and unpredictable glucose effects',
    clinicalEffect: 'Life-threatening lactic acidosis, hypoglycemia or hyperglycemia',
    managementRecommendation: 'Limit alcohol consumption. Avoid excessive or binge drinking. Monitor for signs of lactic acidosis.',
    evidenceLevel: 'Established',
    sources: ['FDA Black Box Warning', 'Endocrinology Guidelines'],
    lastUpdated: '2024-10-01'
  },

  // Beta-blocker interactions
  {
    id: 'metoprolol-insulin',
    drug1Id: 'metoprolol',
    drug2Id: 'insulin',
    drug1Name: 'Metoprolol',
    drug2Name: 'Insulin',
    severity: 'Moderate',
    mechanism: 'Beta-blockers can mask hypoglycemic symptoms and affect glucose recovery',
    description: 'Masked hypoglycemia symptoms and prolonged hypoglycemic episodes',
    clinicalEffect: 'Delayed recognition of hypoglycemia, impaired glucose recovery',
    managementRecommendation: 'Increased glucose monitoring, patient education on altered hypoglycemia symptoms. Consider cardioselective beta-blockers.',
    evidenceLevel: 'Established',
    sources: ['Diabetes Care Guidelines', 'Cardiology Reviews'],
    lastUpdated: '2024-10-01'
  },

  // Antibiotic interactions
  {
    id: 'azithromycin-warfarin',
    drug1Id: 'azithromycin',
    drug2Id: 'warfarin',
    drug1Name: 'Azithromycin',
    drug2Name: 'Warfarin',
    severity: 'Moderate',
    mechanism: 'Possible inhibition of warfarin metabolism and alteration of gut flora',
    description: 'Potential increase in warfarin effect and bleeding risk',
    clinicalEffect: 'Increased INR and bleeding risk',
    managementRecommendation: 'Monitor INR more frequently during and after antibiotic course. Watch for signs of bleeding.',
    evidenceLevel: 'Probable',
    sources: ['Case Reports', 'Anticoagulation Guidelines'],
    lastUpdated: '2024-10-01'
  }
];

// Service class for drug interaction operations
export class DrugInteractionService {
  
  /**
   * Get drug by ID or name
   */
  static getDrug(identifier: string): Drug | undefined {
    const id = identifier.toLowerCase();
    return DRUG_DATABASE.find(drug => 
      drug.id === id ||
      drug.name.toLowerCase() === id ||
      drug.genericName.toLowerCase() === id ||
      drug.brandNames.some(brand => brand.toLowerCase() === id)
    );
  }

  /**
   * Search drugs by name or partial match
   */
  static searchDrugs(searchTerm: string): Drug[] {
    const term = searchTerm.toLowerCase();
    return DRUG_DATABASE.filter(drug =>
      drug.name.toLowerCase().includes(term) ||
      drug.genericName.toLowerCase().includes(term) ||
      drug.brandNames.some(brand => brand.toLowerCase().includes(term)) ||
      drug.activeIngredients.some(ingredient => ingredient.toLowerCase().includes(term))
    );
  }

  /**
   * Check for interactions between two drugs
   */
  static checkInteraction(drug1: string, drug2: string): DrugInteraction | null {
    const d1 = this.getDrug(drug1);
    const d2 = this.getDrug(drug2);
    
    if (!d1 || !d2) return null;

    return DRUG_INTERACTIONS.find(interaction =>
      (interaction.drug1Id === d1.id && interaction.drug2Id === d2.id) ||
      (interaction.drug1Id === d2.id && interaction.drug2Id === d1.id)
    ) || null;
  }

  /**
   * Check for interactions among multiple drugs
   */
  static checkMultipleInteractions(drugNames: string[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < drugNames.length; i++) {
      for (let j = i + 1; j < drugNames.length; j++) {
        const interaction = this.checkInteraction(drugNames[i], drugNames[j]);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  }

  /**
   * Get all interactions for a specific drug
   */
  static getDrugInteractions(drugName: string): DrugInteraction[] {
    const drug = this.getDrug(drugName);
    if (!drug) return [];

    return DRUG_INTERACTIONS.filter(interaction =>
      interaction.drug1Id === drug.id || interaction.drug2Id === drug.id
    );
  }

  /**
   * Get drugs by category
   */
  static getDrugsByCategory(category: DrugCategory): Drug[] {
    return DRUG_DATABASE.filter(drug => drug.category === category);
  }

  /**
   * Get interaction severity color for UI
   */
  static getSeverityColor(severity: InteractionSeverity): string {
    switch (severity) {
      case 'Major': return 'red';
      case 'Moderate': return 'orange';
      case 'Minor': return 'yellow';
      default: return 'gray';
    }
  }

  /**
   * Get interaction severity description
   */
  static getSeverityDescription(severity: InteractionSeverity): string {
    switch (severity) {
      case 'Major': return 'Potentially life-threatening or causing permanent damage';
      case 'Moderate': return 'May cause significant clinical consequences';
      case 'Minor': return 'Limited clinical significance';
      default: return 'Clinical significance unknown';
    }
  }

  /**
   * Get all available drug categories
   */
  static getCategories(): DrugCategory[] {
    return ['Cardiovascular', 'Neurological', 'Endocrine', 'Gastrointestinal', 
            'Respiratory', 'Infectious Disease', 'Pain Management', 'Mental Health', 
            'Oncology', 'Immunology', 'Other'];
  }

  /**
   * Validate drug interaction database integrity
   */
  static validateDatabase(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for orphaned interactions
    DRUG_INTERACTIONS.forEach(interaction => {
      if (!this.getDrug(interaction.drug1Id)) {
        errors.push(`Interaction ${interaction.id}: drug1Id '${interaction.drug1Id}' not found`);
      }
      if (!this.getDrug(interaction.drug2Id)) {
        errors.push(`Interaction ${interaction.id}: drug2Id '${interaction.drug2Id}' not found`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default DrugInteractionService;