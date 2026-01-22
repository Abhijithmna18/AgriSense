import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Negotiation,
  Offer,
  Attachment,
  NegotiationResponse,
  CreateNegotiationRequest,
  CreateOfferRequest,
  AcceptOfferResponse,
  RejectOfferRequest,
  ConvertToOrderResponse,
  OfferFormData,
  RejectOfferFormData
} from '../types/negotiation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Create axios instance with authentication
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class NegotiationApiService {
  // Negotiation CRUD operations
  async createNegotiation(productId: string, vendorId: string): Promise<Negotiation> {
    const request: CreateNegotiationRequest = { productId, vendorId };
    const response: AxiosResponse<{ negotiation: Negotiation }> = await api.post('/negotiations', request);
    return response.data.negotiation;
  }

  async getNegotiation(negotiationId: string): Promise<NegotiationResponse> {
    const response: AxiosResponse<NegotiationResponse> = await api.get(`/negotiations/${negotiationId}`);
    return response.data;
  }

  async getNegotiationsByBuyer(buyerId: string): Promise<Negotiation[]> {
    const response: AxiosResponse<{ negotiations: Negotiation[] }> = await api.get(`/negotiations/buyer/${buyerId}`);
    return response.data.negotiations;
  }

  async getNegotiationsByVendor(vendorId: string): Promise<Negotiation[]> {
    const response: AxiosResponse<{ negotiations: Negotiation[] }> = await api.get(`/negotiations/vendor/${vendorId}`);
    return response.data.negotiations;
  }

  // Offer management
  async createOffer(negotiationId: string, offer: OfferFormData): Promise<Offer> {
    const request: CreateOfferRequest = {
      terms: {
        price: offer.price,
        quantity: offer.quantity,
        deliveryDate: new Date(offer.deliveryDate),
        qualityRequirements: offer.qualityRequirements,
        packaging: offer.packaging,
        customizations: offer.customizations
      },
      message: offer.message || undefined
    };
    
    const response: AxiosResponse<{ offer: Offer }> = await api.post(`/negotiations/${negotiationId}/offers`, request);
    return response.data.offer;
  }

  async acceptOffer(offerId: string): Promise<AcceptOfferResponse> {
    const response: AxiosResponse<AcceptOfferResponse> = await api.put(`/offers/${offerId}/accept`);
    return response.data;
  }

  async rejectOffer(offerId: string, form: RejectOfferFormData): Promise<void> {
    const request: RejectOfferRequest = {
      reason: form.reason,
      message: form.message || undefined
    };
    await api.put(`/offers/${offerId}/reject`, request);
  }

  async counterOffer(offerId: string, offer: OfferFormData): Promise<Offer> {
    const request: CreateOfferRequest = {
      terms: {
        price: offer.price,
        quantity: offer.quantity,
        deliveryDate: new Date(offer.deliveryDate),
        qualityRequirements: offer.qualityRequirements,
        packaging: offer.packaging,
        customizations: offer.customizations
      },
      message: offer.message || undefined
    };
    
    const response: AxiosResponse<{ offer: Offer }> = await api.post(`/offers/${offerId}/counter`, request);
    return response.data.offer;
  }

  // File attachments
  async uploadAttachment(offerId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<{ attachment: Attachment }> = await api.post(`/offers/${offerId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.attachment;
  }

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get(`/attachments/${attachmentId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  }

  // Conversion to order
  async convertToOrder(negotiationId: string): Promise<ConvertToOrderResponse> {
    const response: AxiosResponse<ConvertToOrderResponse> = await api.post(`/negotiations/${negotiationId}/convert`);
    return response.data;
  }

  // PDF generation
  async generateAgreementPDF(negotiationId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await api.get(`/negotiations/${negotiationId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Admin functions
  async getAllNegotiations(page: number = 1, limit: number = 20): Promise<{ negotiations: Negotiation[]; total: number; page: number; limit: number }> {
    const response: AxiosResponse<{ negotiations: Negotiation[]; total: number; page: number; limit: number }> = 
      await api.get(`/admin/negotiations?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getNegotiationAuditTrail(negotiationId: string): Promise<any[]> {
    const response: AxiosResponse<{ auditTrail: any[] }> = await api.get(`/negotiations/${negotiationId}/audit`);
    return response.data.auditTrail;
  }
}

// Export singleton instance
export const negotiationApi = new NegotiationApiService();

export default negotiationApi;