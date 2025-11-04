import React, { useState, useCallback } from "react";
import { UploadCloud, File, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  isDisabled?: boolean;
  maxSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = ".xml", 
  isDisabled = false,
  maxSize = 100, // 100 MB como limite padrão, aumentado significativamente
  className 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Reset error state
    setError(null);
    
    // Validar tamanho (converter MB para bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`O arquivo excede o tamanho máximo de ${maxSize}MB`);
      return false;
    }
    
    // Validar tipo
    if (accept) {
      const fileType = file.name.split('.').pop()?.toLowerCase() || '';
      const acceptedTypes = accept.split(',').map(type => 
        type.trim().replace('.', '').toLowerCase()
      );
      
      if (!acceptedTypes.includes(fileType)) {
        setError(`Tipo de arquivo inválido. Aceito apenas: ${accept}`);
        return false;
      }
    }
    
    return true;
  }, [accept, maxSize]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [isDisabled, onFileSelect, validateFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDisabled) {
      setIsDragging(true);
    }
  }, [isDisabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (isDisabled) return;
    
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      onFileSelect(droppedFile);
    }
  }, [isDisabled, onFileSelect, validateFile]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    // Informar o componente pai que não há arquivo
    onFileSelect(null as unknown as File);
  }, [onFileSelect]);

  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 cursor-pointer",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
            isDisabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "hover:bg-blue-50/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isDisabled && document.getElementById("file-upload")?.click()}
        >
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <div className="mt-3 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className={cn(
                "relative cursor-pointer font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500",
                isDisabled && "cursor-not-allowed text-gray-500 hover:text-gray-500"
              )}
            >
              <span>Clique para fazer upload</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept={accept}
                disabled={isDisabled}
              />
            </label>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {accept} (Max. {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border rounded-lg p-3 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <File className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 truncate">{file.name}</p>
              <p className="text-xs text-blue-600">
                {fileSize}
              </p>
            </div>
          </div>
          {!isDisabled && (
            <button
              type="button"
              className="flex-shrink-0 ml-2 bg-blue-100 p-1 rounded-full hover:bg-blue-200 transition-colors"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4 text-blue-700" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
