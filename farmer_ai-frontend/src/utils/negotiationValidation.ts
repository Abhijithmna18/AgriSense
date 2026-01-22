import { 
  DEFAULT_NEGOTIATION_CONFIG, 
  ValidationError, 
  ValidationResult, 
  OfferFormData,
  createValidationError,
  OfferStatus,
  OFFER_STATUS,
  OfferType,
  OFFER_TYPE
} from '../types/negotiation';

export class NegotiationValidator {
  private config: typeof DEFAULT_NEGOTIATION_CONFIG;

  constructor(config: typeof DEFAULT_NEGOTIATION_CONFIG = DEFAULT_NEGOTIATION_CONFIG) {
    this.config = config;
  }

  validateCreateOffer(form: OfferFormData, originalPrice?: number): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate price
    if (!form.price || form.price <= 0) {
      errors.push(createValidationError('price', 'Price must be greater than 0'));
    } else if (originalPrice && this.isPriceReductionExcessive(form.price, originalPrice)) {
      const maxReduction = this.config.maxPriceReductionPercent;
      errors.push(createValidationError(
        'price', 
        `Price reduction cannot exceed ${maxReduction}% of original price`
      ));
    }

    // Validate quantity
    if (!form.quantity || form.quantity <= 0) {
      errors.push(createValidationError('quantity', 'Quantity must be greater than 0'));
    }

    // Validate delivery date
    if (!form.deliveryDate) {
      errors.push(createValidationError('deliveryDate', 'Delivery date is required'));
    } else {
      const deliveryDate = new Date(form.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deliveryDate <= today) {
        errors.push(createValidationError('deliveryDate', 'Delivery date must be in the future'));
      }
    }

    // Validate quality requirements
    if (!form.qualityRequirements || form.qualityRequirements.length === 0) {
      errors.push(createValidationError('qualityRequirements', 'At least one quality requirement is required'));
    } else {
      form.qualityRequirements.forEach((req, index) => {
        if (!req.type || !req.value) {
          errors.push(createValidationError(
            `qualityRequirements[${index}]`, 
            'Quality requirement type and value are required'
          ));
        }
      });
    }

    // Validate packaging
    if (!form.packaging || form.packaging.trim().length === 0) {
      errors.push(createValidationError('packaging', 'Packaging specification is required'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFile(file: File): ValidationResult {
    const errors: ValidationError[] = [];

    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      errors.push(createValidationError(
        'file', 
        `File type ${file.type} is not allowed. Allowed types: ${this.config.allowedFileTypes.join(', ')}`
      ));
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      errors.push(createValidationError(
        'file', 
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateRejectionReason(reason: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!reason || reason.trim().length === 0) {
      errors.push(createValidationError('reason', 'Rejection reason is required'));
    } else if (reason.trim().length < 10) {
      errors.push(createValidationError('reason', 'Rejection reason must be at least 10 characters'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  canCreateNewOffer(currentRound: number): boolean {
    return currentRound < this.config.maxRounds;
  }

  isOfferExpired(expiresAt: Date | string): boolean {
    const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return new Date() > expiry;
  }

  isPriceReductionExcessive(newPrice: number, originalPrice: number): boolean {
    const reductionPercent = ((originalPrice - newPrice) / originalPrice) * 100;
    return reductionPercent > this.config.maxPriceReductionPercent;
  }

  calculatePriceReduction(newPrice: number, originalPrice: number): number {
    return ((originalPrice - newPrice) / originalPrice) * 100;
  }

  getMinimumAllowedPrice(originalPrice: number): number {
    const maxReduction = this.config.maxPriceReductionPercent / 100;
    return originalPrice * (1 - maxReduction);
  }

  getMaximumAllowedPrice(originalPrice: number): number {
    // Allow price increases up to 20% above original
    return originalPrice * 1.2;
  }

  formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(error => error.message).join(', ');
  }
}

// Export singleton instance
export const negotiationValidator = new NegotiationValidator();

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDaysUntilExpiry = (expiresAt: Date | string): number => {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getOfferStatusColor = (status: OfferStatus): string => {
  switch (status) {
    case OFFER_STATUS.PENDING:
      return 'text-yellow-600 bg-yellow-100';
    case OFFER_STATUS.ACCEPTED:
      return 'text-green-600 bg-green-100';
    case OFFER_STATUS.REJECTED:
      return 'text-red-600 bg-red-100';
    case OFFER_STATUS.EXPIRED:
      return 'text-gray-600 bg-gray-100';
    case OFFER_STATUS.COUNTERED:
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getOfferTypeLabel = (type: OfferType): string => {
  switch (type) {
    case OFFER_TYPE.BUYER_OFFER:
      return 'Buyer Offer';
    case OFFER_TYPE.VENDOR_COUNTEROFFER:
      return 'Vendor Counteroffer';
    default:
      return 'Unknown';
  }
};