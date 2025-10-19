import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://api.spectile.co.ke/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          AsyncStorage.removeItem('@auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  async getOrders(params: { status?: string; page?: number; size?: number }) {
    return this.api.get('/orders', { params });
  }

  async getOrderById(id: number) {
    return this.api.get(`/orders/${id}`);
  }

  async searchOrders(query: string, page = 0) {
    return this.api.get('/orders/search', { params: { query, page } });
  }

  async createOrder(orderData: any) {
    return this.api.post('/orders', orderData);
  }

  async updateOrderStatus(id: number, status: string) {
    return this.api.patch(`/orders/${id}/status`, null, { params: { status } });
  }

  async cancelOrder(id: number) {
    return this.api.delete(`/orders/${id}`);
  }

  async getOrderStats(status: string) {
    return this.api.get('/orders/stats/count', { params: { status } });
  }

  async getDeliveries(params: { status?: string; page?: number; size?: number }) {
    return this.api.get('/deliveries', { params });
  }

  async getDeliveryById(id: number) {
    return this.api.get(`/deliveries/${id}`);
  }

  async getDeliveryByOrderId(orderId: number) {
    return this.api.get(`/deliveries/order/${orderId}`);
  }

  async getPendingDeliveries() {
    return this.api.get('/deliveries/pending');
  }

  async createDelivery(orderId: number, deliveryAgentId?: number) {
    return this.api.post('/deliveries', null, { 
      params: { orderId, deliveryAgentId } 
    });
  }

  async updateDeliveryStatus(id: number, status: string) {
    return this.api.patch(`/deliveries/${id}/status`, null, { params: { status } });
  }

  async acknowledgeDelivery(id: number) {
    return this.api.post(`/deliveries/${id}/acknowledge`);
  }

  async getDeliveryStats(status: string) {
    return this.api.get('/deliveries/stats/count', { params: { status } });
  }

  async getReturns(params: { status?: string; page?: number; size?: number }) {
    return this.api.get('/returns', { params });
  }

  async getReturnById(id: number) {
    return this.api.get(`/returns/${id}`);
  }

  async getReturnsByOrderId(orderId: number) {
    return this.api.get(`/returns/order/${orderId}`);
  }

  async createReturn(returnData: any) {
    return this.api.post('/returns', returnData);
  }

  async approveReturn(id: number) {
    return this.api.post(`/returns/${id}/approve`);
  }

  async rejectReturn(id: number) {
    return this.api.post(`/returns/${id}/reject`);
  }

  async processReturn(id: number) {
    return this.api.post(`/returns/${id}/process`);
  }

  async getProducts(params: { active?: boolean; page?: number; size?: number }) {
    return this.api.get('/products', { params });
  }

  async getProductById(id: number) {
    return this.api.get(`/products/${id}`);
  }

  async searchProducts(query: string, categoryId?: number) {
    return this.api.get('/products/search', { 
      params: { query, categoryId } 
    });
  }

  async getProductsByCategory(categoryId: number, page = 0) {
    return this.api.get(`/products/category/${categoryId}`, { 
      params: { page } 
    });
  }

  async getFeaturedProducts() {
    return this.api.get('/products/featured');
  }
}

export default new ApiService();