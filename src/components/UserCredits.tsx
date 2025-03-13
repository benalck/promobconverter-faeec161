
import { useAuth } from "@/contexts/AuthContext";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function UserCredits() {
  const { user } = useAuth();
  const [showNewCreditsMessage, setShowNewCreditsMessage] = useState(false);
  
  useEffect(() => {
    // If user has exactly 3 credits (the initial amount), show a welcome message
    if (user && user.credits === 3) {
      setShowNewCreditsMessage(true);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowNewCreditsMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.credits]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="hidden md:flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{user.credits}</span>
        <span className="text-xs text-primary/80">créditos</span>
      </div>
      {showNewCreditsMessage && (
        <div className="absolute -bottom-12 right-0 bg-primary/10 text-primary text-xs rounded-md px-3 py-2 whitespace-nowrap">
          Você recebeu 3 créditos gratuitos para começar!
        </div>
      )}
    </div>
  );
}
