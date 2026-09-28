export interface WebsiteData {
  id?: number;
  companyName: string;
  tagline?: string;
  slug: string;
  customDomain?: string;
  userId: number;
  dealerCategory?: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  heroBanner?: string;
  aboutBanner?: string;
  financeBanner?: string;
  heroVideo?: string;
  facebookLink: string;
  instagramLink: string;
  youtubeLink: string;
  financeTitle?: string;
  financeDescription?: string;
  carStyles?: string;
  services?: string;
  poweredBy?: string;
  openingHours: string[];
  metaDescription?: string;
  showVehicleDetailPage?: string;
  status?: string;
}

export interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year?: number;
  price: number;
  salePrice?: number | null;
  wasPrice?: number | null;
  isSale?: boolean;
  weeklyEstimate: number;
  kilometers?: number;
  engineSize?: string;
  transmission?: string;
  fuelType?: string;
  bodyStyle?: string;
  color?: string;
  location: string;
  isListedToday?: boolean;
  saleMethod?: string | null;
  runAuction?: boolean | null;
  weeklyAuction?: boolean | null;
  enquiriesOverPrice?: number | null;
  formattedSaleMethod?: string;
  images: string[];
  description: string;
  features: string[];
}

export interface ListingContact {
  id?: number | null;
  name?: string;
  phone?: string;
  email?: string;
}

export interface ListingLocation {
  address?: string;
  city?: string;
  state?: string;
}

export interface UserBusinessFinance {
  annualInterestRate?: number;
  loanEstablishmentFee?: number;
  securityFee?: number;
  monthlyMaintenanceFee?: number;
}

export interface UserBusinessDetail {
  title?: string;
  finance?: UserBusinessFinance;
}

export interface ListingUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  userBusinessDetails?: UserBusinessDetail[];
}

export interface ListingAttribute {
  id: number;
  name: string;
}

export interface ListingAttributeOption {
  id: number;
  value: string;
  listingAttribute?: ListingAttribute;
}

export interface ListingMedia {
  fieldName: string;
  fileName: string;
  filePath: string;
}

export interface DetailedListing {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  contact?: string;
  basePrice: number;
  listPrice: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  saleMethod?: string;
  salePrice?: number | null;
  enquiriesOverPrice?: number | null;
  weeklyAuction?: boolean;
  runAuction?: boolean;
  isDamaged?: boolean;
  contacts?: ListingContact[];
  location?: ListingLocation;
  user?: ListingUser;
  listingAttributeOptions?: ListingAttributeOption[];
  listingMedia?: ListingMedia[];
}
