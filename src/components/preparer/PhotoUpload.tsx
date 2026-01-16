import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploadProps {
  orderId: string;
  orderItemId?: string;
  token?: string;
  preparerName?: string;
  onUploadComplete?: (url: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  orderId,
  orderItemId,
  token,
  preparerName,
  onUploadComplete,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 10 Mo');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0] || cameraInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Aucune image sélectionnée');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      if (orderItemId) formData.append('orderItemId', orderItemId);
      if (caption) formData.append('caption', caption);
      if (preparerName) formData.append('uploadedBy', preparerName);
      if (token) formData.append('token', token);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-preparation-photo`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      toast.success('Photo ajoutée avec succès');
      setPreview(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      onUploadComplete?.(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
      />

      {!preview ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 h-12"
          >
            <Camera className="h-5 w-5 mr-2" />
            Prendre une photo
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-12"
          >
            <Upload className="h-5 w-5 mr-2" />
            Galerie
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Légende (optionnel)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Colis prêt à l'envoi"
            />
          </div>

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Ajouter la photo
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
