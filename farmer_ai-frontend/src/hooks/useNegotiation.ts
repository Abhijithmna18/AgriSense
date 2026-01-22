import { useState, useEffect, useCallback } from 'react';
import { 
  NegotiationState,
  Offer,
  OfferFormData,
  RejectOfferFormData,
  Attachment,
  ConvertToOrderResponse,
  createInitialNegotiationState 
} from '../types/negotiation';
import { negotiationApi } from '../services/negotiationApi';
import { negotiationValidator } from '../utils/negotiationValidation';

export const useNegotiation = (negotiationId: string) => {
  const [state, setState] = useState<NegotiationState>(createInitialNegotiationState());

  // Load negotiation data
  const loadNegotiation = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await negotiationApi.getNegotiation(negotiationId);
      
      setState(prev => ({
        ...prev,
        negotiation: response.negotiation,
        offers: response.offers,
        product: response.product,
        vendor: response.vendor,
        baselineTerms: response.baselineTerms,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load negotiation',
        loading: false
      }));
    }
  }, [negotiationId]);

  // Create new offer
  const createOffer = useCallback(async (offerForm: OfferFormData): Promise<Offer> => {
    if (!state.negotiation) {
      throw new Error('No negotiation loaded');
    }

    try {
      // Validate offer
      const validation = negotiationValidator.validateCreateOffer(
        offerForm,
        state.baselineTerms?.originalPrice
      );
      
      if (!validation.isValid) {
        throw new Error(negotiationValidator.formatValidationErrors(validation.errors));
      }

      setState(prev => ({ ...prev, loading: true }));
      
      const offer = await negotiationApi.createOffer(state.negotiation.id, offerForm);
      
      // Reload negotiation to get updated state
      await loadNegotiation();
      
      return offer;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create offer',
        loading: false
      }));
      throw error;
    }
  }, [state.negotiation, state.baselineTerms, loadNegotiation]);

  // Accept offer
  const acceptOffer = useCallback(async (offerId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await negotiationApi.acceptOffer(offerId);
      
      // Reload negotiation to get updated state
      await loadNegotiation();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to accept offer',
        loading: false
      }));
      throw error;
    }
  }, [loadNegotiation]);

  // Reject offer
  const rejectOffer = useCallback(async (offerId: string, form: RejectOfferFormData): Promise<void> => {
    try {
      // Validate rejection reason
      const validation = negotiationValidator.validateRejectionReason(form.reason);
      
      if (!validation.isValid) {
        throw new Error(negotiationValidator.formatValidationErrors(validation.errors));
      }

      setState(prev => ({ ...prev, loading: true }));
      
      await negotiationApi.rejectOffer(offerId, form);
      
      // Reload negotiation to get updated state
      await loadNegotiation();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reject offer',
        loading: false
      }));
      throw error;
    }
  }, [loadNegotiation]);

  // Counter offer
  const counterOffer = useCallback(async (offerId: string, offerForm: OfferFormData): Promise<void> => {
    try {
      // Validate offer
      const validation = negotiationValidator.validateCreateOffer(
        offerForm,
        state.baselineTerms?.originalPrice
      );
      
      if (!validation.isValid) {
        throw new Error(negotiationValidator.formatValidationErrors(validation.errors));
      }

      setState(prev => ({ ...prev, loading: true }));
      
      await negotiationApi.counterOffer(offerId, offerForm);
      
      // Reload negotiation to get updated state
      await loadNegotiation();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create counter offer',
        loading: false
      }));
      throw error;
    }
  }, [state.baselineTerms, loadNegotiation]);

  // Upload attachment
  const uploadAttachment = useCallback(async (offerId: string, file: File): Promise<Attachment> => {
    try {
      // Validate file
      const validation = negotiationValidator.validateFile(file);
      
      if (!validation.isValid) {
        throw new Error(negotiationValidator.formatValidationErrors(validation.errors));
      }

      const attachment = await negotiationApi.uploadAttachment(offerId, file);
      
      // Reload negotiation to get updated attachments
      await loadNegotiation();
      
      return attachment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload attachment'
      }));
      throw error;
    }
  }, [loadNegotiation]);

  // Convert to order
  const convertToOrder = useCallback(async (): Promise<ConvertToOrderResponse> => {
    if (!state.negotiation) {
      throw new Error('No negotiation loaded');
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await negotiationApi.convertToOrder(state.negotiation.id);
      
      // Redirect to checkout
      window.location.href = response.checkoutUrl;
      
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to convert to order',
        loading: false
      }));
      throw error;
    }
  }, [state.negotiation]);

  // Generate PDF
  const generatePDF = useCallback(async (): Promise<void> => {
    if (!state.negotiation) {
      throw new Error('No negotiation loaded');
    }

    try {
      const blob = await negotiationApi.generateAgreementPDF(state.negotiation.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `negotiation-${state.negotiation.id}-agreement.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate PDF'
      }));
      throw error;
    }
  }, [state.negotiation]);

  // Set active offer for editing/viewing
  const setActiveOffer = useCallback((offer: Offer | null): void => {
    setState(prev => ({ ...prev, activeOffer: offer }));
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load negotiation on mount
  useEffect(() => {
    if (negotiationId) {
      loadNegotiation();
    }
  }, [negotiationId, loadNegotiation]);

  // Helper functions
  const getLatestOffer = useCallback((): Offer | null => {
    if (state.offers.length === 0) return null;
    return state.offers.reduce((latest, current) => 
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );
  }, [state.offers]);

  const canCreateNewOffer = useCallback((): boolean => {
    if (!state.negotiation) return false;
    return negotiationValidator.canCreateNewOffer(state.negotiation.currentRound);
  }, [state.negotiation]);

  const isNegotiationActive = useCallback((): boolean => {
    return state.negotiation?.status === 'active';
  }, [state.negotiation]);

  return {
    // State
    ...state,
    
    // Actions
    createOffer,
    acceptOffer,
    rejectOffer,
    counterOffer,
    uploadAttachment,
    convertToOrder,
    generatePDF,
    setActiveOffer,
    clearError,
    loadNegotiation,
    
    // Helpers
    getLatestOffer,
    canCreateNewOffer,
    isNegotiationActive
  };
};