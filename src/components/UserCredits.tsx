
import { useAuth } from "@/contexts/AuthContext";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function UserCredits() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{user.credits}</span>
        <span className="text-xs text-primary/80">créditos</span>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/plans">
          Adquirir créditos
        </Link>
      </Button>
    </div>
  );
}
