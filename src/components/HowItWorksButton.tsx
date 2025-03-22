
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginTutorial from "./LoginTutorial";
import { useIsMobile } from "@/hooks/use-mobile";

const HowItWorksButton = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full sm:w-auto max-w-sm mx-auto flex items-center justify-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all ${
            isMobile ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"
          }`}
        >
          <HelpCircle className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>{isMobile ? "Como Funciona" : "Como Funciona o Conversor"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-medium text-gray-900">
            Como Converter XML Promob para Excel
          </DialogTitle>
        </DialogHeader>
        <LoginTutorial onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksButton;
