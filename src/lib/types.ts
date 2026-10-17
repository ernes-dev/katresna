export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  is_available: boolean
  weight_gram: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface StoreSettings {
  id: number
  store_name: string
  whatsapp_number: string
  address: string
  pickup_enabled: boolean
  is_open: boolean
  instagram_url: string | null
  origin_district_id: string | null
  origin_city_id: string | null
  origin_province_id: string | null
}

export interface Banner {
  id: string
  image_url: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ShippingRate {
  courier: string
  service: string
  price: number
  etd: string
  is_cheapest: boolean
}

export interface CheckoutForm {
  full_name: string
  whatsapp: string
  address: string
  district_id: string
  city_id: string
  province_id: string
  shipping_method: 'delivery' | 'pickup'
  courier?: string
  courier_service?: string
  shipping_cost?: number
  notes?: string
}
