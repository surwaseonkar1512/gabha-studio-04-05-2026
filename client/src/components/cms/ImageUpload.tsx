import React, { useState, useRef } from 'react';
import { UploadCloud, X, RefreshCw } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  aspectRatio?: string;
  folderName?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  placeholder = "Upload image (JPG, PNG, WEBP. Max 5MB)",
  aspectRatio = "aspect-video",
  folderName = "cms"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const { data } = await api.post('/cms/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
        {label}
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 ${aspectRatio} ${
          dragActive
            ? 'border-amber-500 bg-amber-500/5'
            : value 
              ? 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30'
              : 'border-gray-300 dark:border-zinc-700 hover:border-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2 text-amber-500">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="text-xs font-medium">Uploading to Cloudinary...</span>
          </div>
        ) : value ? (
          <div className="absolute inset-0 w-full h-full group overflow-hidden rounded-xl">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                title="Change image"
              >
                <UploadCloud className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm transition-colors"
                title="Delete image"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 text-zinc-400 dark:text-zinc-500">
            <UploadCloud className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />
            <div className="text-xs">
              <span className="font-semibold text-amber-500">Click to upload</span> or drag and drop
            </div>
            <p className="text-[10px] text-zinc-400">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
