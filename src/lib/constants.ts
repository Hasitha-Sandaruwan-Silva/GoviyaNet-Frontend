export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'GoviyaNet'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const USER_ROLES = ['FARMER', 'BUYER', 'RIDER', 'ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const DELIVERY_STATUSES = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
] as const
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]

export const VEHICLE_TYPES = [
  'MOTORBIKE',
  'THREE_WHEEL',
  'VAN',
  'TRUCK',
] as const
export type VehicleType = (typeof VEHICLE_TYPES)[number]

export const PRODUCE_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Herbs',
  'Legumes',
  'Dairy',
  'Other',
] as const
export type ProduceCategory = (typeof PRODUCE_CATEGORIES)[number]

export const SRI_LANKAN_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
] as const

export const NIC_REGEX = /^(\d{9}[vVxX]|\d{12})$/

export const PHONE_REGEX = /^(?:\+94|0)?[0-9]{9,10}$/

export const UNSPLASH_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
  farmer: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566699814-9f0babd0ae38?w=600&q=80',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5b1fe6c5f0e?w=600&q=80',
  herbs: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600&q=80',
  produce: 'https://images.unsplash.com/photo-1598170845058-32b9d6b5f6b0?w=600&q=80',
} as const

export const CATEGORY_IMAGES: Record<string, string> = {
  Vegetables: UNSPLASH_IMAGES.vegetables,
  Fruits: UNSPLASH_IMAGES.fruits,
  Grains: UNSPLASH_IMAGES.grains,
  Herbs: UNSPLASH_IMAGES.herbs,
  Legumes: UNSPLASH_IMAGES.produce,
  Dairy: UNSPLASH_IMAGES.produce,
  Other: UNSPLASH_IMAGES.produce,
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  FARMER: '/farmer',
  BUYER: '/buyer',
  RIDER: '/rider',
  ADMIN: '/admin',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DISPATCHED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export const DELIVERY_STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  ASSIGNED:   'bg-blue-100 text-blue-700',
  PICKED_UP:  'bg-purple-100 text-purple-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  FAILED:     'bg-red-100 text-red-700',
}
