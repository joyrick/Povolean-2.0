import React, { ChangeEvent, useEffect, useState } from 'react';
import { Upload, X, FileText, FileImage, Paperclip } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileUploadProps {
  id: string;
  label: string;
  subLabel?: string;
  accept?: string;
  multiple?: boolean;
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  required?: boolean;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  subLabel,
  accept = "application/pdf,image/*,text/plain",
  multiple = false,
  files,
  onFilesChange,
  required = false,
  disabled = false
}) => {
  
  // To handle external updates to 'files' prop
  const [localFiles, setLocalFiles] = useState<FileWithPreview[]>(files);

  useEffect(() => {
    setLocalFiles(files);
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (multiple) {
        onFilesChange([...files, ...newFiles]);
      } else {
        onFilesChange(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className={`w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-baseline mb-2">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-800 cursor-pointer">
            {label} {required && <span className="text-blue-600">*</span>}
        </label>
      </div>
      
      <div className="group">
        {(multiple || localFiles.length === 0) && (
            <label 
                htmlFor={id} 
                className={`
                    relative flex flex-col justify-center w-full min-h-[50px]
                    border border-slate-300 rounded-lg cursor-pointer bg-slate-50 
                    hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all duration-200
                    ${localFiles.length > 0 ? 'rounded-b-none border-b-0' : ''}
                `}
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="bg-white p-1.5 rounded-md border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                        <Paperclip size={16} />
                    </div>
                    <div className="flex flex-col">
                         <span className="text-sm text-slate-500 group-hover:text-slate-800 transition-colors">
                            {localFiles.length === 0 ? "Vyberte súbor z počítača..." : "Pridať ďalšie súbory..."}
                         </span>
                         {localFiles.length === 0 && subLabel && (
                             <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mt-0.5">{subLabel}</span>
                         )}
                    </div>
                </div>
                <input 
                    id={id} 
                    type="file" 
                    className="hidden" 
                    accept={accept} 
                    multiple={multiple} 
                    onChange={handleFileChange}
                    disabled={disabled} 
                />
            </label>
        )}

        {localFiles.length > 0 && (
          <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden ${multiple ? 'rounded-t-none border-t-slate-100' : ''}`}>
            {localFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="text-slate-400">
                     {file.type.includes('image') ? <FileImage size={16} /> : <FileText size={16} />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                </div>
                {!disabled && (
                    <button 
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                    >
                    <X size={14} />
                    </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};