import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSubscriptionCart } from "@/hooks/useSubscriptionCart";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionCartBadge = () => {
  const { user } = useAuth();
  const { items, isLoading } = useSubscriptionCart();
  
  const itemCount = items?.length || 0;

  // Don't show if not logged in or no items
  if (!user || isLoading || itemCount === 0) {
    return null;
  }

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link to="/abonnement">
        <RefreshCw className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-medium">
          {itemCount}
        </span>
      </Link>
    </Button>
  );
};

export default SubscriptionCartBadge;
