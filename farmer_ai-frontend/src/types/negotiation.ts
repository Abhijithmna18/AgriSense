// Core negotiation system types and interfaces (TypeScript version)

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
} as const;

// Negotiation status constants
export const NEGOTIATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

// Offer status constants
export const OFFER_STATUS = {
  PENDING: 'pending',
  COUNTERED: 'countered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const;

// Offer type constants
export const OFFER_TYPE = {
  BUYER_OFFER: 'buyer_offer',
  VENDOR_COUNTEROFFER: 'vendor_counteroffer'
} as const;

// Quality requirement types
export const QUALITY_REQUIREMENT_TYPE = {
  CERTIFICATION: 'certification',
  SPECIFICATION: 'specification',
  STANDARD: 'standard'
} as const;

// Type definitions
export type NegotiationStatus = typeof NEGOTIATION_STATUS[keyof typeof NEGOTIATION_STATUS];
export type OfferStatus = typeof OFFER_STATUS[keyof typeof OFFER_STATUS];
export type OfferType = typeof OFFER_TYPE[keyof typeof OFFER_TYPE];
export type QualityRequirementType = typeof QUALITY_REQUIREMENT_TYPE[keyof typeof QUALITY_REQUIREMENT_TYPE];

// Core interfaces
export interface QualityRequirement {
  type: QualityRequirementType;
  value: string;
  notes?: string;
}

export interface OfferTerms {
  price: number;
  quantity: number;
  deliveryDate: Date;
  qualityRequirements: QualityRequirement[];
  packaging: string;
  customizations?: Record<string, any>;
}

export interface Attachment {
  id: string;
  offerId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Offer {
  id: string;
  negotiationId: string;
  round: number;
  type: OfferType;
  status: OfferStatus;
  terms: OfferTerms;
  message?: string;
  attachments: string[];
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
}

export interface FinalTerms {
  acceptedOfferId: string;
  finalPrice: number;
  finalQuantity: number;
  finalDeliveryDate: Date;
  finalQualityRequirements: QualityRequirement[];
  finalPackaging: string;
  agreementDate: Date;
}

export interface Negotiation {
  id: string;
  productId: string;
  buyerId: string;
  vendorId: string;
  status: NegotiationStatus;
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  finalTerms?: FinalTerms;
}

export interface BaselineTerms {
  originalPrice: number;
  moq: number;
  deliveryEstimate: string;
  qualityStandards: string[];
  paymentTerms: string;
  incoterms?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  vendorId: string;
  price: number;
  moq: number;
  description: string;
  images: string[];
  qualityStandards: string[];
  paymentTerms: string;
  incoterms?: string;
  deliveryEstimate: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  location: string;
  rating: number;
  totalReviews: number;
}

// Component prop interfaces
export interface NegotiationPageProps {
  negotiationId: string;
  productId: string;
  vendorId: string;
}

export interface NegotiationState {
  negotiation: Negotiation | null;
  offers: Offer[];
  product: Product | null;
  vendor: Vendor | null;
  baselineTerms: BaselineTerms | null;
  loading: boolean;
  error: string | null;
  activeOffer: Offer | null;
}

export interface ProductPanelProps {
  product: Product;
  vendor: Vendor;
  baselineTerms: BaselineTerms;
}

export interface OfferCardProps {
  offer: Offer;
  isLatest: boolean;
  canRespond: boolean;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string, reason: string) => void;
  onCounter: (offerId: string) => void;
}

export interface OfferFormProps {
  onSubmit: (offer: OfferFormData) => void;
  onCancel: () => void;
  initialValues?: Partial<OfferFormData>;
  baselineTerms?: BaselineTerms;
  loading?: boolean;
}

export interface AttachmentManagerProps {
  offerId: string;
  attachments: Attachment[];
  onUpload: (file: File) => Promise<Attachment>;
  onDelete: (attachmentId: string) => void;
  readonly?: boolean;
}

export interface ActionButtonsProps {
  offer: Offer;
  canAccept: boolean;
  canReject: boolean;
  canCounter: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
  loading?: boolean;
}

// Form data interfaces
export interface OfferFormData {
  price: number;
  quantity: number;
  deliveryDate: string;
  qualityRequirements: QualityRequirement[];
  packaging: string;
  message: string;
  customizations: Record<string, any>;
}

export interface RejectOfferFormData {
  reason: string;
  message: string;
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API response interfaces
export interface NegotiationResponse {
  negotiation: Negotiation;
  offers: Offer[];
  product: Product;
  vendor: Vendor;
  baselineTerms: BaselineTerms;
}

export interface CreateNegotiationRequest {
  productId: string;
  vendorId: string;
}

export interface CreateOfferRequest {
  terms: OfferTerms;
  message?: string;
}

export interface AcceptOfferResponse {
  success: boolean;
  negotiation: Negotiation;
  order?: {
    id: string;
    checkoutUrl: string;
  };
}

export interface RejectOfferRequest {
  reason: string;
  message?: string;
}

export interface ConvertToOrderResponse {
  success: boolean;
  orderId: string;
  checkoutUrl: string;
  orderSummary: {
    negotiationId: string;
    finalTerms: FinalTerms;
    totalAmount: number;
    attachments: Attachment[];
  };
}

// Factory functions for creating objects with proper structure
export const createNegotiation = (data: Partial<Negotiation> & Pick<Negotiation, 'id' | 'productId' | 'buyerId' | 'vendorId'>): Negotiation => ({
  status: NEGOTIATION_STATUS.ACTIVE,
  currentRound: 0,
  maxRounds: DEFAULT_NEGOTIATION_CONFIG.maxRounds,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data
});

export const createOffer = (data: Partial<Offer> & Pick<Offer, 'id' | 'negotiationId' | 'round' | 'type' | 'terms' | 'createdBy' | 'expiresAt'>): Offer => ({
  status: OFFER_STATUS.PENDING,
  attachments: [],
  createdAt: new Date(),
  ...data
});

export const createOfferTerms = (data: OfferTerms): OfferTerms => ({
  customizations: {},
  ...data
});

export const createQualityRequirement = (data: Omit<QualityRequirement, 'notes'> & Partial<Pick<QualityRequirement, 'notes'>>): QualityRequirement => ({
  notes: undefined,
  ...data
});

export const createAttachment = (data: Partial<Attachment> & Pick<Attachment, 'id' | 'offerId' | 'filename' | 'originalName' | 'mimeType' | 'size' | 'url' | 'uploadedBy'>): Attachment => ({
  uploadedAt: new Date(),
  ...data
});

export const createBaselineTerms = (data: Omit<BaselineTerms, 'incoterms'> & Partial<Pick<BaselineTerms, 'incoterms'>>): BaselineTerms => ({
  incoterms: undefined,
  ...data
});

export const createProduct = (data: Omit<Product, 'incoterms'> & Partial<Pick<Product, 'incoterms'>>): Product => ({
  incoterms: undefined,
  ...data
});

export const createVendor = (data: Omit<Vendor, 'phone'> & Partial<Pick<Vendor, 'phone'>>): Vendor => ({
  phone: undefined,
  ...data
});

// Initial state factory
export const createInitialNegotiationState = (): NegotiationState => ({
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
export const createValidationError = (field: string, message: string): ValidationError => ({
  field,
  message
});

// Form factories
export const createOfferForm = (data?: Partial<OfferFormData>): OfferFormData => ({
  price: 0,
  quantity: 1,
  deliveryDate: '',
  qualityRequirements: [],
  packaging: '',
  message: '',
  customizations: {},
  ...data
});

export const createRejectOfferForm = (data?: Partial<RejectOfferFormData>): RejectOfferFormData => ({
  reason: '',
  message: '',
  ...data
});