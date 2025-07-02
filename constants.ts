import { FiltersState } from './types.ts';

export const WOMPI_PAYMENT_LINK_BASE = "https://checkout.wompi.co/l/VPOS_sUdpQY";
export const WHATSAPP_NUMBER_LINK_BASE = 'https://wa.link/4fo4p4'; // Replace with actual business WhatsApp link
export const MAX_PRICE = 5000000;

export const INITIAL_FILTERS: FiltersState = {
  searchTerm: '',
  category: '',
  priceRange: { min: 0, max: MAX_PRICE },
  stockOnly: false,
};

export const WHATSAPP_CONTACT_PHONE_DISPLAY = "+57 XXX XXX XXXX"; // Replace with display phone
export const SUPPORT_EMAIL = "soporte@lilutecno.com";

export const CATEGORY_EMOJIS: { [key: string]: string } = {
  TELEVISOR: "📺",
  ENTRETENIMIENTO: "🎬",
  "AUDIO Y SONIDO": "🎧",
  DEFAULT: "🛍️"
};