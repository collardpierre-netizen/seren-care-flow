import { Link } from 'react-router-dom';
import { Search, Compass, HeartHandshake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopEntryPathsProps {
  onKnownReference: () => void;
  onBuyingForRelative: () => void;
}

const baseCard =
  'group flex h-full flex-col items-start gap-2 rounded-2xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

const ShopEntryPaths = ({ onKnownReference, onBuyingForRelative }: ShopEntryPathsProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    <button type="button" onClick={onKnownReference} className={cn(baseCard, 'min-h-[7rem]')}>
      <Search className="h-6 w-6 text-primary" aria-hidden="true" />
      <span className="font-semibold text-foreground group-hover:text-primary">Je connais ma référence</span>
      <span className="text-sm text-muted-foreground">
        Tapez le nom, la marque ou le code du produit.
      </span>
      <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
        Rechercher <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>

    <Link to="/aide-au-choix" className={cn(baseCard, 'min-h-[7rem]')}>
      <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
      <span className="font-semibold text-foreground group-hover:text-primary">Je cherche une protection adaptée</span>
      <span className="text-sm text-muted-foreground">
        Quelques questions simples pour vous orienter.
      </span>
      <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
        Être guidé <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>

    <button type="button" onClick={onBuyingForRelative} className={cn(baseCard, 'min-h-[7rem]')}>
      <HeartHandshake className="h-6 w-6 text-primary" aria-hidden="true" />
      <span className="font-semibold text-foreground group-hover:text-primary">J'achète pour un proche</span>
      <span className="text-sm text-muted-foreground">
        Choisissez selon sa mobilité et le moment de la journée.
      </span>
      <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
        Commencer <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  </div>
);

export default ShopEntryPaths;
