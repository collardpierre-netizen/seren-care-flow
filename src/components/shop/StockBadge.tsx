import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Package, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

export type StockStatus = 'in_stock' | 'limited' | 'out_of_stock' | 'coming_soon';

interface StockBadgeProps {
  status: StockStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<StockStatus, {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}> = {
  in_stock: {
    label: "En stock",
    icon: <Package className="h-3 w-3" />,
    variant: "secondary",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  limited: {
    label: "Stock limité",
    icon: <AlertCircle className="h-3 w-3" />,
    variant: "outline",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  out_of_stock: {
    label: "Rupture de stock",
    icon: <PackageX className="h-3 w-3" />,
    variant: "destructive",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
  coming_soon: {
    label: "Prochainement",
    icon: <Clock className="h-3 w-3" />,
    variant: "outline",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
};

export function StockBadge({ status, className, showLabel = true }: StockBadgeProps) {
  const config = statusConfig[status] || statusConfig.in_stock;

  return (
    <Badge 
      variant={config.variant}
      className={cn("gap-1 font-medium", config.className, className)}
    >
      {config.icon}
      {showLabel && config.label}
    </Badge>
  );
}

export function getStockStatusLabel(status: StockStatus): string {
  return statusConfig[status]?.label || "En stock";
}
