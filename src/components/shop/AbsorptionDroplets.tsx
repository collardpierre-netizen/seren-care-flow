import React from 'react';
import { Droplet } from 'lucide-react';

interface AbsorptionDropletsProps {
  level: 'light' | 'moderate' | 'heavy' | 'very_heavy' | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const levelConfig = {
  light: { drops: 1, label: 'Légère' },
  moderate: { drops: 2, label: 'Modérée' },
  heavy: { drops: 3, label: 'Forte' },
  very_heavy: { drops: 4, label: 'Très forte' },
};

const AbsorptionDroplets: React.FC<AbsorptionDropletsProps> = ({ 
  level, 
  showLabel = false,
  size = 'sm' 
}) => {
  if (!level) return null;

  const config = levelConfig[level];
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const maxDrops = 4;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxDrops }).map((_, index) => (
          <Droplet
            key={index}
            className={`${iconSize} ${
              index < config.drops 
                ? 'fill-primary text-primary' 
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
};

export default AbsorptionDroplets;
