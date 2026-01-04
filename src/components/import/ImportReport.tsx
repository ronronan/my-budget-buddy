import { IconAlertCircle, IconCheck, IconInfoCircle } from '@tabler/icons-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { type ImportResult } from '@/services/import.service';

interface ImportReportProps {
  result: ImportResult;
  duplicatesCount: number;
  onClose: () => void;
}

export function ImportReport({ result, duplicatesCount, onClose }: ImportReportProps) {
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
          <IconCheck className='h-6 w-6 text-green-600' />
        </div>
        <h3 className='mt-4 text-lg font-semibold'>Import terminé</h3>
        <p className='mt-2 text-sm text-muted-foreground'>Vos transactions ont été importées avec succès</p>
      </div>

      <div className='space-y-3'>
        <div className='flex justify-between items-center p-3 bg-muted rounded-lg'>
          <span className='text-sm font-medium'>Transactions importées</span>
          <span className='text-lg font-bold text-green-600'>{result.imported}</span>
        </div>

        {duplicatesCount > 0 && (
          <div className='flex justify-between items-center p-3 bg-muted rounded-lg'>
            <span className='text-sm font-medium'>Doublons ignorés</span>
            <span className='text-lg font-bold text-orange-600'>{duplicatesCount}</span>
          </div>
        )}

        {result.errors.length > 0 && (
          <div className='flex justify-between items-center p-3 bg-muted rounded-lg'>
            <span className='text-sm font-medium'>Erreurs</span>
            <span className='text-lg font-bold text-red-600'>{result.errors.length}</span>
          </div>
        )}
      </div>

      {result.errors.length > 0 && (
        <Alert variant='destructive'>
          <IconAlertCircle className='h-4 w-4' />
          <AlertTitle>Erreurs détectées</AlertTitle>
          <AlertDescription>{result.errors.length} transaction(s) n'ont pas pu être importées.</AlertDescription>
        </Alert>
      )}

      <Alert>
        <IconInfoCircle className='h-4 w-4' />
        <AlertDescription>
          Les transactions ont été classées dans la catégorie &quot;À classer &gt; Non catégorisé&quot;. Vous pouvez maintenant les
          recatégoriser.
        </AlertDescription>
      </Alert>

      <div className='flex justify-end'>
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}
