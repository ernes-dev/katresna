export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export interface ProductVariant {
  name: string
  price: number
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
  is_custom_box?: boolean
  stock?: number | null
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[] | null
}

export interface StoreSettings {
  id: number
  store_name: string
  whatsapp_number: string
  address: string
  pickup_enabled: boolean
  is_open: boolean
  instagram_url: string | null
  maps_url: string | null
  store_hours: string | null
  open_time: string | null
  close_time: string | null
  sat_open_time: string | null
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
  variant?: ProductVariant
  quantity: number
  customSelections?: Product[]
  cartItemId?: string
  customPrice?: number
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
