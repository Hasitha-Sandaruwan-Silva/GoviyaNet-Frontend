import type {
  OrderStatus,
  ProduceCategory,
  UserRole,
  VehicleType,
} from '@/lib/constants'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  phone: string
  role: UserRole | string
  enabled: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  phone: string
  role: 'FARMER' | 'BUYER' | 'RIDER'
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface Farmer {
  id: number
  userId: number
  farmName: string
  location: string
  nic: string
  verified?: boolean
}

export interface FarmerRegisterRequest {
  userId: number
  farmName: string
  location: string
  nic: string
}

export interface Produce {
  id: number
  farmerId: number
  name: string
  category: ProduceCategory | string
  pricePerKg: number
  stockKg: number
  unit: string
  available?: boolean
}

export interface ProduceCreateRequest {
  farmerId: number
  name: string
  category: string
  pricePerKg: number
  stockKg: number
  unit: string
}

export interface CartItem {
  id: number
  buyerId: number
  produceId: number
  farmerId: number
  quantity: number
  pricePerKg: number
  addedAt?: string
  produce?: Produce
}

export interface CartCreateRequest {
  buyerId: number
  produceId: number
  farmerId: number
  quantity: number
  pricePerKg: number
}

export interface Order {
  id: number
  buyerId: number
  produceId: number
  farmerId: number
  quantity: number
  totalPrice?: number
  pricePerKg?: number
  deliveryAddress: string
  status: OrderStatus | string
  orderedAt?: string
  produce?: Produce
}

export interface OrderCreateRequest {
  buyerId: number
  produceId: number
  farmerId: number
  quantity: number
  pricePerKg: number
  deliveryAddress: string
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus
}

export interface Rider {
  id: number
  userId: number
  fullName: string
  phone: string
  vehicleType: VehicleType | string
  licenseNo: string
  currentLocation: string
  available?: boolean
  rating?: number
  totalDeliveries?: number
}

export interface RiderRegisterRequest {
  userId: number
  fullName: string
  phone: string
  vehicleType: VehicleType
  licenseNo: string
  currentLocation: string
}

export interface Delivery {
  id: number
  orderId: number
  pickupAddress: string
  deliveryAddress: string
  deliveryFee: number
  notes?: string
  status?: string
  riderId?: number
  assignedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
}

export interface DeliveryCreateRequest {
  orderId: number
  buyerId: number  
  pickupAddress: string
  deliveryAddress: string
  deliveryFee?: number
  notes?: string
}

export interface DeliveryStatusUpdateRequest {
  status: string
}

// Matches backend MarketPriceDTO exactly
export interface PriceRecord {
  id?: number
  produceName: string
  category: string
  region: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  unit: string
  recordedDate: string
  source?: string
}

export interface PriceTrend {
  date: string
  price: number
}

// Matches backend NotificationDTO exactly
export interface Notification {
  id: number
  userId: number
  userRole?: string
  type?: string
  title: string
  message: string
  referenceId?: number
  referenceType?: string
  isRead: boolean
  sentAt: string
  readAt?: string
}

export interface ApiError {
  message: string
  status?: number
}