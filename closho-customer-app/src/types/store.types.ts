export interface Store {
  id: string;
  name: string;
  address: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // in km
  deliveryRadiusKm?: number;
  isOpen: boolean;
  deliveryTimeMin?: number;
}
