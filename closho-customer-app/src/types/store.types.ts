export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  isOpen: boolean;
  deliveryTimeMin: number;
}
