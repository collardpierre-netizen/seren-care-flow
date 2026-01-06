import React, { useState } from 'react';
import UnifiedQuestionnaire from '@/components/questionnaire/UnifiedQuestionnaire';

interface ProductSelectorProps {
  onFiltersApply: (filters: {
    gender?: string;
    usageTime?: string;
    mobility?: string;
    incontinenceLevel?: string;
  }) => void;
  onClose: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onFiltersApply, onClose }) => {
  return (
    <UnifiedQuestionnaire
      variant="modal"
      onClose={onClose}
      onFiltersApply={onFiltersApply}
    />
  );
};

export default ProductSelector;
