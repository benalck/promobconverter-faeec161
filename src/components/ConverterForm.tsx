
import React from "react";
import FileUpload from "./FileUpload";
import { useAuth } from "@/contexts/AuthContext";
import BannedMessage from "./BannedMessage";
import ConverterCard from "./converter/ConverterCard";
import FileNameInput from "./converter/FileNameInput";
import ConversionButton from "./converter/ConversionButton";
import { useFileConversion } from "@/hooks/useFileConversion";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const { 
    xmlFile, 
    outputFileName, 
    isConverting, 
    setOutputFileName, 
    handleFileSelect, 
    handleConvert 
  } = useFileConversion();
  
  const { user } = useAuth();

  if (user?.isBanned) {
    return <BannedMessage />;
  }

  return (
    <ConverterCard className={className}>
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFileTypes=".xml"
          fileType="XML"
          className="animate-scale-in"
        />

        <FileNameInput 
          outputFileName={outputFileName}
          setOutputFileName={setOutputFileName}
        />

        <ConversionButton
          isConverting={isConverting}
          onConvert={handleConvert}
          xmlFile={xmlFile}
        />
      </div>
    </ConverterCard>
  );
};

export default ConverterForm;
