import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onChange, accept = "image/*" }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    }
  };

  const clearFile = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      
      {!preview ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex text-sm text-slate-600 justify-center">
              <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span>
            </div>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="relative mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2 flex items-center">
           <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
             <img src={preview} alt="Preview" className="h-full w-full object-cover" />
           </div>
           <div className="ml-4 flex-1">
             <p className="text-sm font-medium text-slate-900 truncate">Selected Image</p>
             <button 
               type="button" 
               onClick={clearFile}
               className="text-xs font-medium text-red-600 hover:text-red-500"
             >
               Remove
             </button>
           </div>
        </div>
      )}
      
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept={accept} 
        onChange={handleFileChange}
      />
    </div>
  );
};