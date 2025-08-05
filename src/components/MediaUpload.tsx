import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Plus, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MediaUploadProps {
  onMediaChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  clearFiles?: boolean;
}

export interface MediaFile {
  file: File;
  url: string;
  type: 'image' | 'video';
  id: string;
}

export const MediaUpload = ({ 
  onMediaChange, 
  maxFiles = 4,
  clearFiles = false
}: MediaUploadProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clear files when clearFiles prop changes to true
  React.useEffect(() => {
    if (clearFiles && mediaFiles.length > 0) {
      mediaFiles.forEach(file => URL.revokeObjectURL(file.url));
      setMediaFiles([]);
      onMediaChange([]);
    }
  }, [clearFiles, mediaFiles, onMediaChange]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return { valid: false, error: 'Please select an image or video file.' };
    }

    // Check file size (10MB max for images, 50MB for videos)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const limit = file.type.startsWith('video/') ? '50MB' : '10MB';
      return { valid: false, error: `File size must be less than ${limit}.` };
    }

    return { valid: true };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Check if adding these files would exceed the limit
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} files per post.`,
        variant: 'destructive',
      });
      return;
    }

    const newMediaFiles: MediaFile[] = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive',
        });
        continue;
      }

      const mediaFile: MediaFile = {
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        id: Math.random().toString(36).substr(2, 9)
      };
      
      newMediaFiles.push(mediaFile);
    }

    const updatedFiles = [...mediaFiles, ...newMediaFiles];
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = mediaFiles.filter(f => {
      if (f.id === id) {
        URL.revokeObjectURL(f.url);
        return false;
      }
      return true;
    });
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      {/* File Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaFiles.map((mediaFile) => (
            <div key={mediaFile.id} className="relative group">
              {mediaFile.type === 'image' ? (
                <img
                  src={mediaFile.url}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="relative">
                  <video
                    src={mediaFile.url}
                    className="w-full h-24 object-cover rounded-lg"
                    controls
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <Play className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(mediaFile.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Media Button */}
      {mediaFiles.length < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-24 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-muted-foreground/80 hover:bg-muted/20 transition-colors"
        >
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

// Helper function for uploading files with progress
export const uploadMediaFiles = async (
  files: MediaFile[], 
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ urls: string[]; types: string[] }> => {
  const uploadedUrls: string[] = [];
  const uploadedTypes: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const mediaFile = files[i];
    const fileExt = mediaFile.file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Calculate progress for this file
    const baseProgress = (i / files.length) * 100;
    const fileProgressStep = 100 / files.length;

    try {
      // Upload to storage with progress tracking
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, mediaFile.file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
      uploadedTypes.push(mediaFile.type);

      // Update progress
      if (onProgress) {
        onProgress(Math.round(baseProgress + fileProgressStep));
      }
    } catch (error) {
      console.error('Upload error for file:', fileName, error);
      throw error;
    }
  }

  return { urls: uploadedUrls, types: uploadedTypes };
};