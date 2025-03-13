
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import LoginTutorial from "@/components/LoginTutorial";
import { HelpCircle, ChevronRight } from "lucide-react";

const HowItWorksButton = () => {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  
  return (
    <div className="w-full mt-4">
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Como funciona nossa aplicação</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Como funciona o conversor XML para Excel</DialogTitle>
            <DialogDescription>
              Um passo a passo completo do processo de conversão
            </DialogDescription>
          </DialogHeader>
          <LoginTutorial onClose={() => setTutorialOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HowItWorksButton;
