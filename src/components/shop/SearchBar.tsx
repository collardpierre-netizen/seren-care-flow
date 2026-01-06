import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultCount?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher un produit...",
  isLoading = false,
  resultCount
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div 
        className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'ring-2 ring-primary ring-offset-2' : ''
        } rounded-xl bg-card border border-border`}
      >
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-12 pr-12 py-3 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-4"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </motion.div>
          )}
          {!isLoading && value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {value && resultCount !== undefined && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-muted-foreground mt-2"
          >
            {resultCount} résultat{resultCount > 1 ? 's' : ''} pour "{value}"
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
