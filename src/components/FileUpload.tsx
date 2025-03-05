
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes: string;
  fileType: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFileTypes,
  fileType,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/xml" || file.name.endsWith(".xml")) {
        handleFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFileSelect(file);
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 rounded-lg transition-all duration-300 overflow-hidden group",
          "border-2 border-dashed border-gray-300 hover:border-primary",
          dragActive ? "border-primary bg-primary/5" : "bg-gray-50/50",
          fileName ? "border-primary/50" : "",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleChange}
        />
        
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-5 text-center">
          <div className={cn(
            "w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-500",
            "bg-gray-100 group-hover:bg-primary/10",
            dragActive ? "scale-110 bg-primary/10" : ""
          )}>
            <FileDown 
              className={cn(
                "h-8 w-8 transition-all duration-300",
                dragActive || fileName ? "text-primary" : "text-gray-400 group-hover:text-primary"
              )} 
            />
          </div>
          
          {fileName ? (
            <div className="animate-slide-up">
              <p className="font-medium text-primary truncate max-w-xs">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1">Clique para trocar o arquivo</p>
            </div>
          ) : (
            <div className="space-y-2 transition-opacity duration-300">
              <p className="font-medium">
                {dragActive ? `Solte o arquivo ${fileType}` : `Arraste seu arquivo ${fileType}`}
              </p>
              <p className="text-sm text-gray-500">ou clique para selecionar</p>
            </div>
          )}
        </div>

        {/* Animation overlay */}
        <div className={cn(
          "absolute inset-0 border-2 border-primary/0 rounded-lg transition-all duration-500",
          dragActive ? "border-primary scale-102 opacity-100" : "opacity-0"
        )}></div>
      </div>
    </div>
  );
};

export default FileUpload;
