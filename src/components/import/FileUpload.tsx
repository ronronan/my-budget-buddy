import { IconAlertCircle, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number; // en bytes
  disabled?: boolean;
}

export function FileUpload({ onFileSelected, accept = '.csv', maxSize = 5 * 1024 * 1024, disabled = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validation extension
    if (accept && !file.name.toLowerCase().endsWith(accept)) {
      setError(`Le fichier doit être au format ${accept}`);
      return;
    }

    // Validation taille
    if (maxSize && file.size > maxSize) {
      setError(`Le fichier ne doit pas dépasser ${(maxSize / 1024 / 1024).toFixed(0)} Mo`);
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='space-y-4'>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragActive && 'border-primary bg-primary/5',
          !dragActive && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <IconUpload className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
        <p className='text-sm text-muted-foreground mb-2'>Glissez-déposez votre fichier CSV ici</p>
        <p className='text-xs text-muted-foreground mb-4'>ou cliquez pour sélectionner</p>
        <Button type='button' variant='outline' disabled={disabled}>
          Sélectionner un fichier
        </Button>
      </div>

      <input ref={fileInputRef} type='file' accept={accept} onChange={handleChange} className='hidden' disabled={disabled} />

      {selectedFile && (
        <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
          <div className='flex items-center gap-2'>
            <IconFile className='h-5 w-5 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>{selectedFile.name}</p>
              <p className='text-xs text-muted-foreground'>{(selectedFile.size / 1024).toFixed(2)} Ko</p>
            </div>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
          >
            <IconX className='h-4 w-4' />
          </Button>
        </div>
      )}

      {error && (
        <Alert variant='destructive'>
          <IconAlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
