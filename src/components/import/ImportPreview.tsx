import { IconAlertCircle, IconInfoCircle, IconLoader } from '@tabler/icons-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type ParseError, type ParsedTransaction } from '@/services/csv-parser.service';

interface ImportPreviewProps {
  transactions: ParsedTransaction[];
  duplicates: ParsedTransaction[];
  errors: ParseError[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ImportPreview({ transactions, duplicates, errors, onConfirm, onCancel, loading = false }: ImportPreviewProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'duplicates' | 'errors'>('new');

  const stats = {
    new: transactions.length,
    duplicates: duplicates.length,
    errors: errors.length,
    total: transactions.length + duplicates.length + errors.length,
  };

  return (
    <div className='space-y-6'>
      {/* Statistiques */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-green-600'>Nouvelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-orange-600'>Doublons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.duplicates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-red-600'>Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='new'>Nouvelles ({stats.new})</TabsTrigger>
          <TabsTrigger value='duplicates'>Doublons ({stats.duplicates})</TabsTrigger>
          <TabsTrigger value='errors'>Erreurs ({stats.errors})</TabsTrigger>
        </TabsList>

        <TabsContent value='new' className='space-y-4'>
          <TransactionPreviewTable transactions={transactions} />
        </TabsContent>

        <TabsContent value='duplicates' className='space-y-4'>
          <Alert>
            <IconInfoCircle className='h-4 w-4' />
            <AlertDescription>Ces transactions existent déjà et ne seront pas importées.</AlertDescription>
          </Alert>
          <TransactionPreviewTable transactions={duplicates} />
        </TabsContent>

        <TabsContent value='errors' className='space-y-4'>
          {errors.length > 0 && (
            <Alert variant='destructive'>
              <IconAlertCircle className='h-4 w-4' />
              <AlertDescription>Ces lignes contiennent des erreurs et ne seront pas importées.</AlertDescription>
            </Alert>
          )}
          <ErrorTable errors={errors} />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button variant='outline' onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={onConfirm} disabled={loading || stats.new === 0}>
          {loading ? (
            <>
              <IconLoader className='mr-2 h-4 w-4 animate-spin' />
              Import en cours...
            </>
          ) : (
            `Importer ${stats.new} transaction${stats.new > 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </div>
  );
}

function TransactionPreviewTable({ transactions }: { transactions: ParsedTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>Aucune transaction à afficher</p>
      </div>
    );
  }

  // Afficher uniquement les 10 premières pour la performance
  const displayTransactions = transactions.slice(0, 10);
  const hasMore = transactions.length > 10;

  return (
    <div className='space-y-2'>
      <div className='border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className='text-right'>Montant</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className='whitespace-nowrap'>{transaction.date.toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <div className='max-w-md truncate'>{transaction.description}</div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className={cn('font-medium', transaction.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toFixed(2)} €
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                    {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <p className='text-sm text-muted-foreground text-center'>... et {transactions.length - 10} transaction(s) supplémentaire(s)</p>
      )}
    </div>
  );
}

function ErrorTable({ errors }: { errors: ParseError[] }) {
  if (errors.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>Aucune erreur détectée</p>
      </div>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ligne</TableHead>
            <TableHead>Erreur</TableHead>
            <TableHead>Données</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errors.map((error, index) => (
            <TableRow key={index}>
              <TableCell className='font-mono text-sm'>{error.row}</TableCell>
              <TableCell className='text-red-600'>{error.error}</TableCell>
              <TableCell className='text-xs text-muted-foreground max-w-md truncate'>{JSON.stringify(error.data)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
