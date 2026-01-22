// Core negotiation system types and interfaces (JavaScript version)

// Default configuration - should be loaded from API/config
export const DEFAULT_NEGOTIATION_CONFIG = {
  maxRounds: 10,
  offerExpirationDays: 7,
  maxPriceReductionPercent: 50,
  minPriceReductionPercent: 0,
  allowedFileTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// Negotiation status constants
export const NEGOTIATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

// Offer status constants
export const OFFER_STATUS = {
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Offer type constants
export const OFFER_TYPE = {
  BUYER_OFFER: 'buyer_offer',
  VENDOR_COUNTEROFFER: 'vendor_counteroffer'
};

// Quality requirement types
export const QUALITY_REQUIREMENT_TYPE = {
  CERTIFICATION: 'certification',
  SPECIFICATION: 'specification',
  STANDARD: 'standard'
};

// Factory functions for creating objects with proper structure

export const createNegotiation = ({
  id,
  productId,
  buyerId,
  vendorId,
  status = NEGOTIATION_STATUS.ACTIVE,
  currentRound = 0,
  maxRounds = DEFAULT_NEGOTIATION_CONFIG.maxRounds,
  createdAt = new Date(),
  updatedAt = new Date(),
  completedAt = null,
  finalTerms = null
}) => ({
  id,
  productId,
  buyerId,
  vendorId,
  status,
  currentRound,
  maxRounds,
  createdAt,
  updatedAt,
  completedAt,
  finalTerms
});

export const createOffer = ({
  id,
  negotiationId,
  round,
  type,
  status = OFFER_STATUS.PENDING,
  terms,
  message = null,
  attachments = [],
  createdBy,
  createdAt = new Date(),
  expiresAt,
  respondedAt = null,
  rejectionReason = null
}) => ({
  id,
  negotiationId,
  round,
  type,
  status,
  terms,
  message,
  attachments,
  createdBy,
  createdAt,
  expiresAt,
  respondedAt,
  rejectionReason
});

export const createOfferTerms = ({
  price,
  quantity,
  deliveryDate,
  qualityRequirements = [],
  packaging,
  customizations = {}
}) => ({
  price,
  quantity,
  deliveryDate,
  qualityRequirements,
  packaging,
  customizations
});

export const createQualityRequirement = ({
  type,
  value,
  notes = null
}) => ({
  type,
  value,
  notes
});

export const createAttachment = ({
  id,
  offerId,
  filename,
  originalName,
  mimeType,
  size,
  url,
  uploadedBy,
  uploadedAt = new Date()
}) => ({
  id,
  offerId,
  filename,
  originalName,
  mimeType,
  size,
  url,
  uploadedBy,
  uploadedAt
});

export const createBaselineTerms = ({
  originalPrice,
  moq,
  deliveryEstimate,
  qualityStandards = [],
  paymentTerms,
  incoterms = null
}) => ({
  originalPrice,
  moq,
  deliveryEstimate,
  qualityStandards,
  paymentTerms,
  incoterms
});

export const createProduct = ({
  id,
  name,
  sku,
  vendorId,
  price,
  moq,
  description,
  images = [],
  qualityStandards = [],
  paymentTerms,
  incoterms = null,
  deliveryEstimate
}) => ({
  id,
  name,
  sku,
  vendorId,
  price,
  moq,
  description,
  images,
  qualityStandards,
  paymentTerms,
  incoterms,
  deliveryEstimate
});

export const createVendor = ({
  id,
  name,
  businessName,
  email,
  phone = null,
  location,
  rating,
  totalReviews
}) => ({
  id,
  name,
  businessName,
  email,
  phone,
  location,
  rating,
  totalReviews
});

// Initial state factory
export const createInitialNegotiationState = () => ({
  negotiation: null,
  offers: [],
  product: null,
  vendor: null,
  baselineTerms: null,
  loading: true,
  error: null,
  activeOffer: null
});

// Validation error factory
export const createValidationError = (field, message) => ({
  field,
  message
});

// Form factories
export const createOfferForm = ({
  price = 0,
  quantity = 1,
  deliveryDate = '',
  qualityRequirements = [],
  packaging = '',
  message = '',
  customizations = {}
}) => ({
  price,
  quantity,
  deliveryDate,
  qualityRequirements,
  packaging,
  message,
  customizations
});

export const createRejectOfferForm = ({
  reason = '',
  message = ''
}) => ({
  reason,
  message
});