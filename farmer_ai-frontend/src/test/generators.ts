import * as fc from 'fast-check';
import {
  Negotiation,
  Offer,
  OfferTerms,
  QualityRequirement,
  Attachment,
  BaselineTerms,
  Product,
  Vendor,
  OfferFormData,
  NEGOTIATION_STATUS,
  OFFER_STATUS,
  OFFER_TYPE,
  QUALITY_REQUIREMENT_TYPE,
  DEFAULT_NEGOTIATION_CONFIG
} from '../types/negotiation';

// Basic generators
export const arbitraryId = (): fc.Arbitrary<string> => 
  fc.string({ minLength: 8, maxLength: 32 }).filter(s => s.length > 0);

export const arbitraryEmail = (): fc.Arbitrary<string> => 
  fc.emailAddress();

export const arbitraryUrl = (): fc.Arbitrary<string> => 
  fc.webUrl();

export const arbitraryPositiveNumber = (): fc.Arbitrary<number> => 
  fc.float({ min: 0.01, max: 1000000 });

export const arbitraryPositiveInteger = (): fc.Arbitrary<number> => 
  fc.integer({ min: 1, max: 10000 });

export const arbitraryFutureDate = (): fc.Arbitrary<Date> => 
  fc.date({ min: new Date(Date.now() + 24 * 60 * 60 * 1000) }); // At least 1 day in future

export const arbitraryPastDate = (): fc.Arbitrary<Date> => 
  fc.date({ max: new Date() });

// Quality requirement generator
export const arbitraryQualityRequirement = (): fc.Arbitrary<QualityRequirement> => 
  fc.record({
    type: fc.constantFrom(...Object.values(QUALITY_REQUIREMENT_TYPE)),
    value: fc.string({ minLength: 1, maxLength: 100 }),
    notes: fc.option(fc.string({ maxLength: 500 }))
  });

// Offer terms generator
export const arbitraryOfferTerms = (): fc.Arbitrary<OfferTerms> => 
  fc.record({
    price: arbitraryPositiveNumber(),
    quantity: arbitraryPositiveInteger(),
    deliveryDate: arbitraryFutureDate(),
    qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 5 }),
    packaging: fc.string({ minLength: 1, maxLength: 200 }),
    customizations: fc.dictionary(fc.string(), fc.anything())
  });

// Attachment generator
export const arbitraryAttachment = (): fc.Arbitrary<Attachment> => 
  fc.record({
    id: arbitraryId(),
    offerId: arbitraryId(),
    filename: fc.string({ minLength: 1, maxLength: 100 }),
    originalName: fc.string({ minLength: 1, maxLength: 100 }),
    mimeType: fc.constantFrom(...DEFAULT_NEGOTIATION_CONFIG.allowedFileTypes),
    size: fc.integer({ min: 1, max: DEFAULT_NEGOTIATION_CONFIG.maxFileSize }),
    url: arbitraryUrl(),
    uploadedBy: arbitraryId(),
    uploadedAt: arbitraryPastDate()
  });

// Offer generator
export const arbitraryOffer = (): fc.Arbitrary<Offer> => 
  fc.record({
    id: arbitraryId(),
    negotiationId: arbitraryId(),
    round: fc.integer({ min: 1, max: DEFAULT_NEGOTIATION_CONFIG.maxRounds }),
    type: fc.constantFrom(...Object.values(OFFER_TYPE)),
    status: fc.constantFrom(...Object.values(OFFER_STATUS)),
    terms: arbitraryOfferTerms(),
    message: fc.option(fc.string({ maxLength: 1000 })),
    attachments: fc.array(arbitraryId(), { maxLength: 5 }),
    createdBy: arbitraryId(),
    createdAt: arbitraryPastDate(),
    expiresAt: arbitraryFutureDate(),
    respondedAt: fc.option(arbitraryPastDate()),
    rejectionReason: fc.option(fc.string({ minLength: 10, maxLength: 500 }))
  });

// Baseline terms generator
export const arbitraryBaselineTerms = (): fc.Arbitrary<BaselineTerms> => 
  fc.record({
    originalPrice: arbitraryPositiveNumber(),
    moq: arbitraryPositiveInteger(),
    deliveryEstimate: fc.string({ minLength: 1, maxLength: 100 }),
    qualityStandards: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
    paymentTerms: fc.string({ minLength: 1, maxLength: 200 }),
    incoterms: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
  });

// Product generator
export const arbitraryProduct = (): fc.Arbitrary<Product> => 
  fc.record({
    id: arbitraryId(),
    name: fc.string({ minLength: 1, maxLength: 200 }),
    sku: fc.string({ minLength: 1, maxLength: 50 }),
    vendorId: arbitraryId(),
    price: arbitraryPositiveNumber(),
    moq: arbitraryPositiveInteger(),
    description: fc.string({ maxLength: 1000 }),
    images: fc.array(arbitraryUrl(), { maxLength: 10 }),
    qualityStandards: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 5 }),
    paymentTerms: fc.string({ minLength: 1, maxLength: 200 }),
    incoterms: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    deliveryEstimate: fc.string({ minLength: 1, maxLength: 100 })
  });

// Vendor generator
export const arbitraryVendor = (): fc.Arbitrary<Vendor> => 
  fc.record({
    id: arbitraryId(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    businessName: fc.string({ minLength: 1, maxLength: 200 }),
    email: arbitraryEmail(),
    phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
    location: fc.string({ minLength: 1, maxLength: 200 }),
    rating: fc.float({ min: 0, max: 5 }),
    totalReviews: fc.integer({ min: 0, max: 10000 })
  });

// Negotiation generator
export const arbitraryNegotiation = (): fc.Arbitrary<Negotiation> => 
  fc.record({
    id: arbitraryId(),
    productId: arbitraryId(),
    buyerId: arbitraryId(),
    vendorId: arbitraryId(),
    status: fc.constantFrom(...Object.values(NEGOTIATION_STATUS)),
    currentRound: fc.integer({ min: 0, max: DEFAULT_NEGOTIATION_CONFIG.maxRounds }),
    maxRounds: fc.integer({ min: 1, max: 20 }),
    createdAt: arbitraryPastDate(),
    updatedAt: arbitraryPastDate(),
    completedAt: fc.option(arbitraryPastDate()),
    finalTerms: fc.option(fc.record({
      acceptedOfferId: arbitraryId(),
      finalPrice: arbitraryPositiveNumber(),
      finalQuantity: arbitraryPositiveInteger(),
      finalDeliveryDate: arbitraryFutureDate(),
      finalQualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 5 }),
      finalPackaging: fc.string({ minLength: 1, maxLength: 200 }),
      agreementDate: arbitraryPastDate()
    }))
  });

// Form data generators
export const arbitraryOfferFormData = (): fc.Arbitrary<OfferFormData> => 
  fc.record({
    price: arbitraryPositiveNumber(),
    quantity: arbitraryPositiveInteger(),
    deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]), // Format as YYYY-MM-DD
    qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 5 }),
    packaging: fc.string({ minLength: 1, maxLength: 200 }),
    message: fc.string({ maxLength: 1000 }),
    customizations: fc.dictionary(fc.string(), fc.anything())
  });

// Valid offer form data (passes validation)
export const arbitraryValidOfferFormData = (): fc.Arbitrary<OfferFormData> => 
  fc.record({
    price: fc.float({ min: 1, max: 100000 }),
    quantity: fc.integer({ min: 1, max: 1000 }),
    deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]),
    qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 3 }),
    packaging: fc.string({ minLength: 5, maxLength: 100 }),
    message: fc.string({ maxLength: 500 }),
    customizations: fc.record({})
  });

// Invalid offer form data (fails validation)
export const arbitraryInvalidOfferFormData = (): fc.Arbitrary<OfferFormData> => 
  fc.oneof(
    // Invalid price
    fc.record({
      price: fc.oneof(fc.constant(0), fc.constant(-1), fc.float({ max: 0 })),
      quantity: arbitraryPositiveInteger(),
      deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]),
      qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 3 }),
      packaging: fc.string({ minLength: 1, maxLength: 100 }),
      message: fc.string({ maxLength: 500 }),
      customizations: fc.record({})
    }),
    // Invalid quantity
    fc.record({
      price: arbitraryPositiveNumber(),
      quantity: fc.oneof(fc.constant(0), fc.constant(-1)),
      deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]),
      qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 3 }),
      packaging: fc.string({ minLength: 1, maxLength: 100 }),
      message: fc.string({ maxLength: 500 }),
      customizations: fc.record({})
    }),
    // Empty packaging
    fc.record({
      price: arbitraryPositiveNumber(),
      quantity: arbitraryPositiveInteger(),
      deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]),
      qualityRequirements: fc.array(arbitraryQualityRequirement(), { minLength: 1, maxLength: 3 }),
      packaging: fc.constant(''),
      message: fc.string({ maxLength: 500 }),
      customizations: fc.record({})
    }),
    // No quality requirements
    fc.record({
      price: arbitraryPositiveNumber(),
      quantity: arbitraryPositiveInteger(),
      deliveryDate: arbitraryFutureDate().map(d => d.toISOString().split('T')[0]),
      qualityRequirements: fc.constant([]),
      packaging: fc.string({ minLength: 1, maxLength: 100 }),
      message: fc.string({ maxLength: 500 }),
      customizations: fc.record({})
    })
  );

// File generator for testing file validation
export const arbitraryValidFile = (): fc.Arbitrary<File> => 
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    type: fc.constantFrom(...DEFAULT_NEGOTIATION_CONFIG.allowedFileTypes),
    size: fc.integer({ min: 1, max: DEFAULT_NEGOTIATION_CONFIG.maxFileSize })
  }).map(({ name, type, size }) => {
    const content = new Uint8Array(size);
    return new File([content], name, { type });
  });

export const arbitraryInvalidFile = (): fc.Arbitrary<File> => 
  fc.oneof(
    // Invalid file type
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }),
      type: fc.constantFrom('application/exe', 'text/javascript', 'image/svg+xml'),
      size: fc.integer({ min: 1, max: 1000000 })
    }).map(({ name, type, size }) => {
      const content = new Uint8Array(size);
      return new File([content], name, { type });
    }),
    // File too large
    fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }),
      type: fc.constantFrom(...DEFAULT_NEGOTIATION_CONFIG.allowedFileTypes),
      size: fc.integer({ min: DEFAULT_NEGOTIATION_CONFIG.maxFileSize + 1, max: DEFAULT_NEGOTIATION_CONFIG.maxFileSize * 2 })
    }).map(({ name, type, size }) => {
      const content = new Uint8Array(size);
      return new File([content], name, { type });
    })
  );