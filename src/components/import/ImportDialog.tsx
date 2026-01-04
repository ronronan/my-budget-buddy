import { IconAlertCircle, IconLoader } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FileUpload } from '@/components/import/FileUpload';
import { ImportPreview } from '@/components/import/ImportPreview';
import { ImportReport } from '@/components/import/ImportReport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useBudget } from '@/hooks/useBudget';
import { type ParseResult, csvParserService } from '@/services/csv-parser.service';
import { type ImportResult, importService } from '@/services/import.service';

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

interface ImportState {
  step: ImportStep;
  file: File | null;
  parseResult: ParseResult | null;
  duplicatesCount: number;
  importResult: ImportResult | null;
  error: string | null;
}

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { user } = useAuth();
  const { transactions, fetchTransactions } = useBudget();

  const [state, setState] = useState<ImportState>({
    step: 'upload',
    file: null,
    parseResult: null,
    duplicatesCount: 0,
    importResult: null,
    error: null,
  });

  // Étape 1: Fichier sélectionné → Parser
  const handleFileSelected = async (file: File) => {
    setState((prev) => ({ ...prev, file, error: null }));

    try {
      // Valider format
      toast.info('Validation du format...');
      const validation = await csvParserService.validateFileFormat(file);
      if (!validation.valid) {
        setState((prev) => ({ ...prev, error: validation.error! }));
        toast.error(validation.error);
        return;
      }

      // Parser
      toast.info('Analyse du fichier en cours...');
      const parseResult = await csvParserService.parseCSV(file);

      if (!parseResult.success && parseResult.errors.length > 0) {
        toast.warning(`${parseResult.errors.length} erreur(s) détectée(s)`);
      }

      // Détecter doublons
      const { new: newTransactions, duplicates } = csvParserService.detectDuplicates(parseResult.transactions, transactions);

      setState((prev) => ({
        ...prev,
        parseResult: {
          ...parseResult,
          transactions: newTransactions,
        },
        duplicatesCount: duplicates.length,
        step: 'preview',
      }));

      toast.success(`${newTransactions.length} nouvelle(s) transaction(s) trouvée(s)`);
    } catch (error) {
      console.error('Parse error:', error);
      setState((prev) => ({
        ...prev,
        error: "Erreur lors de l'analyse du fichier",
      }));
      toast.error("Échec de l'analyse du fichier");
    }
  };

  // Étape 2: Confirmation → Importer
  const handleConfirm = async () => {
    if (!state.parseResult || !user) return;

    setState((prev) => ({ ...prev, step: 'importing' }));

    try {
      // Assurer que la catégorie "Non catégorisé" existe
      toast.info("Préparation de l'import...");
      const unclassifiedCategoryId = await importService.ensureUnclassifiedCategory(user.uid);

      // Importer
      toast.info('Import en cours...');
      const importResult = await importService.importTransactions(state.parseResult.transactions, {
        unclassifiedCategoryId,
        userId: user.uid,
      });

      setState((prev) => ({
        ...prev,
        importResult,
        step: 'complete',
      }));

      // Recharger les transactions
      await fetchTransactions();

      toast.success(`${importResult.imported} transaction(s) importée(s)`);
    } catch (error) {
      console.error('Import error:', error);
      setState((prev) => ({
        ...prev,
        error: "Erreur lors de l'import",
        step: 'preview', // Retour à l'étape précédente
      }));
      toast.error("Échec de l'import");
    }
  };

  // Reset au close
  const handleClose = () => {
    setState({
      step: 'upload',
      file: null,
      parseResult: null,
      duplicatesCount: 0,
      importResult: null,
      error: null,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side='right' className='sm:max-w-3xl overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Importer des transactions</SheetTitle>
          <SheetDescription>Importez vos transactions depuis un fichier CSV Crédit Agricole</SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          {state.error && (
            <Alert variant='destructive' className='mb-6'>
              <IconAlertCircle className='h-4 w-4' />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.step === 'upload' && <FileUpload onFileSelected={handleFileSelected} />}

          {state.step === 'preview' && state.parseResult && (
            <ImportPreview
              transactions={state.parseResult.transactions}
              duplicates={[]} // Déjà filtrés
              errors={state.parseResult.errors}
              onConfirm={handleConfirm}
              onCancel={handleClose}
            />
          )}

          {state.step === 'importing' && (
            <div className='flex flex-col items-center justify-center py-12'>
              <IconLoader className='h-12 w-12 animate-spin text-primary mb-4' />
              <p className='text-lg font-medium'>Import en cours...</p>
              <p className='text-sm text-muted-foreground'>Veuillez patienter</p>
            </div>
          )}

          {state.step === 'complete' && state.importResult && (
            <ImportReport result={state.importResult} duplicatesCount={state.duplicatesCount} onClose={handleClose} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
