export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  costPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  unitOfMeasureId: number;
  unitOfMeasureName: string;
  primaryImageUrl: string;
  productImagesCount: number;
  inStock: boolean;
  taxId?: number;
  taxName?: string;
  taxPercentage?: number;
  commissionPercentage?: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  clientId?: number;
  clientName?: string;
  clientPhone?: string;
  items: OrderItem[];
  paymentMethod: string;
  paymentTiming: string;
  notes?: string;
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productSku: string;
  primaryImageUrl: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  clientId?: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  items: OrderItemResponse[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentTiming: string;
  paidAmount: number;
  notes?: string;
  salesAgentId: number;
  salesAgentName: string;
  delivery?: Delivery;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: number;
  deliveryNumber: string;
  orderId: number;
  orderNumber: string;
  deliveryAgentId?: number;
  deliveryAgentName?: string;
  status: string;
  scheduledDate: string;
  deliveredDate?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryNotes?: string;
  recipientName: string;
  recipientPhone: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  orderItemId: number;
  quantityReturned: number;
  condition: string;
}

export interface CreateReturnRequest {
  orderId: number;
  deliveryId?: number;
  reason: string;
  reasonDescription?: string;
  items: ReturnItem[];
}

export interface ReturnItemResponse {
  id: number;
  returnId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantityReturned: number;
  refundAmount: number;
  condition: string;
}

export interface Return {
  id: number;
  returnNumber: string;
  orderId: number;
  orderNumber: string;
  deliveryId?: number;
  deliveryNumber?: string;
  returnItems: ReturnItemResponse[];
  status: string;
  reason: string;
  reasonDescription?: string;
  totalRefundAmount: number;
  refundStatus: string;
  refundDate?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  processedById?: number;
  processedByName?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  syncId: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  email?: string;
  territoryName: string;
  countyName: string;
  subCountyName?: string;
  businessTypeName: string;
  bantScore: number;
  qualificationStatus: boolean;
  stage: string;
  latitude: number;
  longitude: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}