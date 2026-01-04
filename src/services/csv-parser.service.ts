import Papa from 'papaparse';

import { type Transaction } from '@/types/budget.types';

// Types pour le parsing CSV
interface RawCSVRow {
  Date: string;
  Libellé: string;
  'Débit euros': string;
  'Crédit euros': string;
}

export interface ParsedTransaction {
  date: Date;
  description: string; // Libellé nettoyé
  amount: number;
  type: 'income' | 'expense';
  originalDescription: string; // Libellé brut du CSV
  deduplicationKey: string; // Clé pour éviter les doublons
}

export interface ParseError {
  row: number;
  error: string;
  data: RawCSVRow;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: ParseError[];
  metadata: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

/**
 * Service de parsing de fichiers CSV Crédit Agricole
 */
export const csvParserService = {
  /**
   * Valide que le fichier est bien au format Crédit Agricole
   */
  async validateFileFormat(file: File): Promise<{ valid: boolean; error?: string }> {
    // 1. Vérifier extension .csv
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { valid: false, error: 'Le fichier doit être au format CSV (.csv)' };
    }

    // 2. Lire les premières lignes pour vérifier la structure
    try {
      const preview = await this.readFirstLines(file, 15);

      // 3. Vérifier que la ligne d'en-tête contient les colonnes attendues
      const hasHeader = preview.some((line) => line.includes('Date;Libellé;Débit euros;Crédit euros'));

      if (!hasHeader) {
        return {
          valid: false,
          error: 'Format non reconnu. Attendu : fichier CSV Crédit Agricole avec colonnes Date, Libellé, Débit euros, Crédit euros',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la lecture du fichier',
      };
    }
  },

  /**
   * Parse le fichier CSV complet
   */
  async parseCSV(file: File): Promise<ParseResult> {
    try {
      // 1. Lire le fichier avec encodage ISO-8859-1 (pour caractères accentués)
      const text = await this.readFileWithEncoding(file, 'ISO-8859-1');

      // 2. Parser avec papaparse
      const parseResult = Papa.parse<RawCSVRow>(text, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        console.warn('Erreurs de parsing papaparse:', parseResult.errors);
      }

      // 3. Ignorer les lignes d'en-tête (avant la ligne "Date;Libellé...")
      const dataRows = this.skipHeaderRows(parseResult.data);

      // 4. Transformer chaque ligne
      const transactions: ParsedTransaction[] = [];
      const errors: ParseError[] = [];

      for (const [index, row] of dataRows.entries()) {
        try {
          const parsed = this.parseRow(row);
          if (parsed) {
            transactions.push(parsed);
          }
        } catch (error) {
          errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            data: row,
          });
        }
      }

      return {
        success: errors.length === 0,
        transactions,
        errors,
        metadata: {
          totalRows: dataRows.length,
          validRows: transactions.length,
          invalidRows: errors.length,
        },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du parsing du fichier CSV');
    }
  },

  /**
   * Parse une ligne individuelle du CSV
   */
  parseRow(row: RawCSVRow): ParsedTransaction | null {
    // 1. Vérifier que les champs requis sont présents
    if (!row.Date || (!row['Débit euros'] && !row['Crédit euros'])) {
      return null; // Ligne vide ou incomplète, ignorer silencieusement
    }

    // 2. Parser la date (DD/MM/YYYY)
    const dateParts = row.Date.trim().split('/');
    if (dateParts.length !== 3) {
      throw new Error(`Date invalide: ${row.Date}`);
    }

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      throw new Error(`Date invalide: ${row.Date}`);
    }

    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
      throw new Error(`Date invalide: ${row.Date}`);
    }

    // 3. Nettoyer et normaliser le libellé
    const description = this.cleanDescription(row.Libellé || '');
    if (!description) {
      throw new Error('Libellé vide');
    }

    // 4. Parser le montant (virgule → point, supprimer espaces)
    const debitStr = row['Débit euros']?.trim() || '';
    const creditStr = row['Crédit euros']?.trim() || '';

    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    if (debitStr) {
      // Débit = dépense
      amount = this.parseAmount(debitStr);
      type = 'expense';
    } else if (creditStr) {
      // Crédit = revenu
      amount = this.parseAmount(creditStr);
      type = 'income';
    } else {
      // Ni débit ni crédit, ligne vide
      return null;
    }

    // 5. Générer clé de déduplication
    const deduplicationKey = this.generateDeduplicationKey(date, amount, description);

    return {
      date,
      description,
      amount,
      type,
      originalDescription: row.Libellé,
      deduplicationKey,
    };
  },

  /**
   * Nettoie le libellé (espaces multiples → 1 seul, trim, max 200 chars)
   */
  cleanDescription(raw: string): string {
    return raw
      .replace(/\s+/g, ' ') // Remplacer espaces multiples par 1 seul
      .trim()
      .substring(0, 200); // Limiter à 200 caractères (max Zod)
  },

  /**
   * Parse un montant du CSV ("125,06" → 125.06)
   */
  parseAmount(str: string): number {
    // Supprimer espaces insécables et espaces normaux
    const cleaned = str.replace(/[\s\u00A0]/g, '');

    // Remplacer virgule par point
    const normalized = cleaned.replace(',', '.');

    const amount = parseFloat(normalized);

    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Montant invalide: ${str}`);
    }

    // Arrondir à 2 décimales
    return Math.round(amount * 100) / 100;
  },

  /**
   * Génère une clé de déduplication : "YYYY-MM-DD|montant|description50chars"
   */
  generateDeduplicationKey(date: Date, amount: number, description: string): string {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const descriptionKey = description.substring(0, 50).toLowerCase().trim();

    return `${dateStr}|${amount.toFixed(2)}|${descriptionKey}`;
  },

  /**
   * Détecte les doublons en comparant avec les transactions existantes
   */
  detectDuplicates(
    parsed: ParsedTransaction[],
    existing: Transaction[],
  ): {
    new: ParsedTransaction[];
    duplicates: ParsedTransaction[];
  } {
    // Créer un Set des clés existantes
    const existingKeys = new Set<string>();

    for (const transaction of existing) {
      if (transaction.importMetadata?.deduplicationKey) {
        existingKeys.add(transaction.importMetadata.deduplicationKey);
      }
    }

    const newTransactions: ParsedTransaction[] = [];
    const duplicates: ParsedTransaction[] = [];

    for (const transaction of parsed) {
      if (existingKeys.has(transaction.deduplicationKey)) {
        duplicates.push(transaction);
      } else {
        newTransactions.push(transaction);
        existingKeys.add(transaction.deduplicationKey);
      }
    }

    return { new: newTransactions, duplicates };
  },

  /**
   * Lit les N premières lignes d'un fichier
   */
  async readFirstLines(file: File, count: number): Promise<string[]> {
    const text = await this.readFileWithEncoding(file, 'ISO-8859-1');
    const lines = text.split('\n');
    return lines.slice(0, count);
  },

  /**
   * Lit un fichier avec un encodage spécifique
   */
  async readFileWithEncoding(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Échec de lecture du fichier'));
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));

      // Lire avec encodage spécifique
      reader.readAsText(file, encoding);
    });
  },

  /**
   * Ignore les lignes d'en-tête du CSV (avant les données de transactions)
   */
  skipHeaderRows(data: RawCSVRow[]): RawCSVRow[] {
    // Les données commencent après la ligne d'en-tête "Date;Libellé;Débit euros;Crédit euros"
    // papaparse a déjà utilisé cette ligne comme header, donc on peut retourner toutes les données
    // Mais on doit ignorer les lignes qui n'ont pas les bonnes colonnes (lignes d'en-tête du fichier)

    return data.filter((row) => {
      // Garder seulement les lignes qui ont au moins une date
      return row.Date && row.Date.trim() !== '';
    });
  },
};
