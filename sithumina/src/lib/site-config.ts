export interface PhoneContact {
  type: "call" | "whatsapp";
  display: string;
  number: string;
  link: string;
}

export interface SocialLink {
  name: string;
  key: "facebook" | "whatsapp" | "youtube" | "tiktok" | "linkedin";
  label: string;
  url: string;
}

export interface SiteConfig {
  companyName: string;
  tagline: string;
  shortDescription: string;
  email: string;
  address: string;
  officeMapUrl: string;
  directionsUrl: string;
  officeEmbedMapUrl: string;
  operatingHours: string;
  phoneNumbers: PhoneContact[];
  socialLinks: SocialLink[];
  footerSocialLinks: SocialLink[];
  appLinks: {
    googlePlayUrl: string;
    appStoreUrl: string;
    isPublished: boolean;
  };
  legalLinks: {
    privacyPolicy: string;
    termsOfService: string;
  };
  routes: {
    home: string;
    about: string;
    findEmptyLorry: string;
    bookVehicle: string;
    registerVehicle: string;
    faq: string;
    contact: string;
    reviews: string;
    login: string;
    privacy: string;
    terms: string;
  };
}

export const siteConfig: SiteConfig = {
  companyName: "Sithumina Transport",
  tagline: "Track every Sithumina lorry live on the map of Sri Lanka.",
  shortDescription: "Live lorry tracking and reliable goods transport across Sri Lanka.",
  email: "info@sithuminatransport.lk",
  address: "No. 142/A, Kandy Road, Peliyagoda, Western Province, Sri Lanka",
  officeMapUrl: "https://maps.google.com/?q=6.9744,79.8895+(Sithumina+Transport+Peliyagoda+Logistics+Hub)",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.9744,79.8895",
  officeEmbedMapUrl: "https://maps.google.com/maps?q=6.9744,79.8895&t=&z=15&ie=UTF8&iwloc=&output=embed",
  operatingHours: "Mon–Sat, 8:00 am – 6:00 pm (24/7 Hotline)",
  phoneNumbers: [
    {
      type: "call",
      display: "0771234567",
      number: "0771234567",
      link: "tel:0771234567",
    },
    {
      type: "call",
      display: "0717654321",
      number: "0717654321",
      link: "tel:0717654321",
    },
    {
      type: "whatsapp",
      display: "0765550123",
      number: "0765550123",
      link: "https://wa.me/94765550123",
    },
  ],
  socialLinks: [
    {
      name: "Facebook",
      key: "facebook",
      label: "Facebook",
      url: "https://facebook.com/sithuminatransport",
    },
    {
      name: "WhatsApp",
      key: "whatsapp",
      label: "WhatsApp",
      url: "https://wa.me/94765550123",
    },
    {
      name: "YouTube",
      key: "youtube",
      label: "YouTube",
      url: "https://youtube.com/@sithuminatransport",
    },
    {
      name: "TikTok",
      key: "tiktok",
      label: "TikTok",
      url: "https://tiktok.com/@sithuminatransport",
    },
  ],
  footerSocialLinks: [
    {
      name: "Facebook",
      key: "facebook",
      label: "Facebook",
      url: "https://facebook.com/sithuminatransport",
    },
    {
      name: "WhatsApp",
      key: "whatsapp",
      label: "WhatsApp",
      url: "https://wa.me/94765550123",
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/company/sithuminatransport",
    },
    {
      name: "YouTube",
      key: "youtube",
      label: "YouTube",
      url: "https://youtube.com/@sithuminatransport",
    },
  ],
  appLinks: {
    googlePlayUrl: "#",
    appStoreUrl: "#",
    isPublished: false, // React Native driver app is coming soon
  },
  legalLinks: {
    privacyPolicy: "/privacy",
    termsOfService: "/terms",
  },
  routes: {
    home: "/",
    about: "/about",
    findEmptyLorry: "/find-empty-lorry",
    bookVehicle: "/book-vehicle",
    registerVehicle: "/register-vehicle",
    faq: "/faq",
    contact: "/contact",
    reviews: "/reviews",
    login: "/login",
    privacy: "/privacy",
    terms: "/terms",
  },
};
