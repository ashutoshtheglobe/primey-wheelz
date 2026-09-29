import { WebsiteData, Vehicle, DetailedListing } from "@/types";
import { determineSaleMethod } from "@/utils/saleMethod";

// Environment Configurations for Dev & Prod Modes
export const ENV_CONFIG = {
  dev: {
    graphql: "https://dev-api.theglobe.nz/graphql/public",
    s3Base: "https://theglobe-development.s3.amazonaws.com/",
    motorEnquiry: "https://dev-api.theglobe.nz/motorEnquiry",
  },
  prod: {
    graphql: "https://api.theglobe.nz/graphql/public",
    s3Base: "https://img.theglobe.nz/",
    motorEnquiry: "https://api.theglobe.nz/motorEnquiry",
  },
};

// Active environment ('dev' | 'prod'). Defaults to 'prod' or set via NEXT_PUBLIC_APP_ENV
export const CURRENT_ENV: "dev" | "prod" =
  (process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase() as "dev" | "prod") || "prod";

const activeConfig = ENV_CONFIG[CURRENT_ENV] || ENV_CONFIG.prod;

const BACKEND_PUBLIC_GRAPHQL = process.env.NEXT_PUBLIC_GRAPHQL_URL || activeConfig.graphql;
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || activeConfig.s3Base;
const MOTOR_ENQUIRY_ENDPOINT = process.env.NEXT_PUBLIC_MOTOR_ENQUIRY_URL || activeConfig.motorEnquiry;

export interface BackendListing {
  id: number | string;
  title: string;
  description: string;
  basePrice: number;
  listPrice: number;
  salePrice: number;
  saleMethod: string | null;
  enquiriesOverPrice?: number | null;
  weeklyAuction?: boolean | null;
  runAuction?: boolean | null;
  createdAt: string;
  listingMedia?: {
    fieldName: string;
    fileName: string;
    filePath: string;
  }[];
  listingAttributeOptions?: {
    id: number;
    value: string;
    listingAttribute?: {
      id: number;
      name: string;
    };
  }[];
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface BackendListingsResponse {
  listings: Vehicle[];
  total: number;
  totalPages: number;
  currentPage: number;
}



function resolveS3Url(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${S3_BASE_URL}${path}`;
}

function mapBackendListingToVehicle(item: BackendListing): Vehicle {
  const getAttr = (...names: string[]): string => {
    if (!item.listingAttributeOptions) return "";
    for (const name of names) {
      const found = item.listingAttributeOptions.find(
        (o) => o.listingAttribute?.name?.toLowerCase() === name.toLowerCase()
      );
      if (found?.value) return found.value;
    }
    return "";
  };

  const images: string[] = [];
  if (item.listingMedia && item.listingMedia.length > 0) {
    item.listingMedia.forEach((m) => {
      if (m.filePath) {
        if (m.filePath.startsWith("http")) {
          images.push(m.filePath);
        } else {
          images.push(`${S3_BASE_URL}listing/${m.filePath}`);
        }
      }
    });
  }

  if (images.length === 0) {
    images.push(`${S3_BASE_URL}assets/images/theglobe-logo.svg`);
  }

  const rawKm = getAttr("Kilometres", "Odometer", "Km");
  const kilometers = rawKm ? parseInt(rawKm.replace(/[^0-9]/g, "")) || undefined : undefined;
  
  const rawYear = getAttr("Year Of Manufacture", "Year");
  const year = rawYear ? parseInt(rawYear) || undefined : undefined;

  const basePrice = item.listPrice || item.basePrice || 0;
  const salePrice = item.salePrice;
  const isSale = !!(salePrice && basePrice && salePrice < basePrice);
  const price = salePrice || basePrice || 0;
  const wasPrice = isSale ? basePrice : null;

  const weeklyEstimate = price > 0 ? Math.round((price * 0.1095) / 52 + price / 260) : 0;

  const make = getAttr("Make", "Manufacturer");
  const model = getAttr("Model");
  const engineSize = getAttr("Engine Size", "Engine");
  const transmission = getAttr("Transmission");
  const fuelType = getAttr("Fuel Type", "Fuel");
  const bodyStyle = getAttr("Body Type", "Body Style");
  const color = getAttr("Colour", "Color");

  const locationCity = item.location?.city || item.location?.state || item.location?.address || "";

  const saleMethodInfo = determineSaleMethod({
    saleMethod: item.saleMethod,
    runAuction: item.runAuction,
    weeklyAuction: item.weeklyAuction,
    enquiriesOverPrice: item.enquiriesOverPrice,
    basePrice: item.basePrice,
    listPrice: item.listPrice,
    salePrice: item.salePrice,
    price,
  });

  return {
    id: String(item.id),
    title: item.title,
    make: make || item.title.trim().split(" ")[0] || "",
    model: model || item.title.trim().split(" ").slice(1).join(" ") || "",
    year,
    price,
    salePrice: salePrice || null,
    wasPrice: wasPrice || null,
    isSale,
    weeklyEstimate,
    kilometers,
    engineSize,
    transmission,
    fuelType,
    bodyStyle,
    color,
    location: locationCity,
    isListedToday: item.createdAt ? new Date(item.createdAt).toDateString() === new Date().toDateString() : false,
    saleMethod: item.saleMethod,
    runAuction: item.runAuction,
    weeklyAuction: item.weeklyAuction,
    enquiriesOverPrice: item.enquiriesOverPrice,
    formattedSaleMethod: saleMethodInfo.label,
    images,
    description: item.description || "",
    features: []
  };
}

/**
 * Fetches user 251 listings dynamically from backend GraphQL
 */
export async function fetchUser251Listings(
  userId: number = 251,
  page: number = 1,
  perPage: number = 12,
  keyword: string = ""
): Promise<BackendListingsResponse> {
  const query = `
    query FetchUserListing($userId: Int!, $keyword: String, $page: Int, $perPage: Int) {
      fetchUserListing(userId: $userId, keyword: $keyword, page: $page, perPage: $perPage) {
        listings {
          id
          title
          description
          basePrice
          listPrice
          salePrice
          saleMethod
          enquiriesOverPrice
          weeklyAuction
          runAuction
          createdAt
          listingMedia {
            fieldName
            fileName
            filePath
          }
          listingAttributeOptions {
            id
            value
            listingAttribute {
              id
              name
            }
          }
          location {
            address
            city
            state
          }
        }
        pagination {
          total
          perPage
          currentPage
          totalPages
        }
      }
    }
  `;

  try {
    const res = await fetch(BACKEND_PUBLIC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { userId: Number(userId), keyword: keyword || null, page, perPage }
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const resultData = data?.data?.fetchUserListing;

      if (resultData && resultData.listings) {
        const mappedVehicles = resultData.listings.map(mapBackendListingToVehicle);
        return {
          listings: mappedVehicles,
          total: resultData.pagination?.total || mappedVehicles.length,
          totalPages: resultData.pagination?.totalPages || 1,
          currentPage: resultData.pagination?.currentPage || page
        };
      }
    }
  } catch (error) {
    console.warn("Error fetching live listings from backend:", error);
  }

  return {
    listings: [],
    total: 0,
    totalPages: 1,
    currentPage: 1
  };
}

/**
 * Executes `GetCurrentWebsite` query with variables `{ slug: "primey-wheels" }`
 */
export async function fetchWebsiteConfig(slug: string = "primey-wheels"): Promise<WebsiteData | null> {
  const query = `
    query GetCurrentWebsite($slug: String) {
      getCurrentWebsite(slug: $slug) {
        id
        companyName
        slug
        customDomain
        userId
        dealerCategory
        about
        email
        phone
        address
        primaryColor
        secondaryColor
        logo
        heroBanner
        aboutBanner
        financeBanner
        heroVideo
        facebookLink
        instagramLink
        youtubeLink
        financeTitle
        financeDescription
        carStyles
        services
        poweredBy
        openingHours
        metaDescription
        showVehicleDetailPage
        status
      }
    }
  `;

  try {
    const res = await fetch(BACKEND_PUBLIC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        operationName: "GetCurrentWebsite",
        query,
        variables: { slug }
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      const site = result?.data?.getCurrentWebsite;
      if (site) {
        return {
          id: site.id,
          companyName: site.companyName || "",
          slug: site.slug || slug,
          customDomain: site.customDomain,
          userId: site.userId,
          dealerCategory: site.dealerCategory,
          about: site.about || "",
          email: site.email || "",
          phone: site.phone || "",
          address: site.address || "",
          primaryColor: site.primaryColor || "",
          secondaryColor: site.secondaryColor || "",
          logo: resolveS3Url(site.logo),
          heroBanner: resolveS3Url(site.heroBanner),
          aboutBanner: resolveS3Url(site.aboutBanner),
          financeBanner: resolveS3Url(site.financeBanner),
          heroVideo: resolveS3Url(site.heroVideo),
          facebookLink: site.facebookLink || "",
          instagramLink: site.instagramLink || "",
          youtubeLink: site.youtubeLink || "",
          financeTitle: site.financeTitle,
          financeDescription: site.financeDescription || "",
          carStyles: site.carStyles || "",
          services: site.services,
          poweredBy: site.poweredBy || "",
          openingHours: site.openingHours ? site.openingHours.split("\n") : [],
          metaDescription: site.metaDescription,
          showVehicleDetailPage: site.showVehicleDetailPage,
          status: site.status
        };
      }
    }
  } catch (error) {
    console.warn("Backend GetCurrentWebsite query error:", error);
  }

  return null;
}

export const MOCK_LISTING_30978: DetailedListing = {
  id: 30978,
  title: "testing ",
  description: "testing ",
  shortDescription: "testing ",
  contact: "07404506030",
  basePrice: 1500,
  listPrice: 1500,
  status: "active",
  createdAt: "2026-08-25T07:03:29.107Z",
  updatedAt: "2026-08-27T16:00:01.015Z",
  saleMethod: "asking_price",
  salePrice: null,
  enquiriesOverPrice: null,
  weeklyAuction: false,
  runAuction: false,
  isDamaged: false,
  contacts: [
    {
      id: null,
      name: "Ashu sharma",
      phone: "07404506030",
      email: "ashup8998+123@gmail.com"
    }
  ],
  location: {
    address: "Allen Bell Drive",
    city: "Dargaville",
    state: "Northland"
  },
  user: {
    id: 251,
    firstName: "Ashu",
    lastName: "sharma",
    email: "ashup8998+123@gmail.com",
    phone: "07404506123",
    userBusinessDetails: [
      {
        title: "Ashu Sharma",
        finance: {
          annualInterestRate: 10,
          loanEstablishmentFee: 20,
          securityFee: 30,
          monthlyMaintenanceFee: 40
        }
      }
    ]
  },
  listingAttributeOptions: [
    {
      id: 17,
      value: "Hatchback",
      listingAttribute: {
        id: 5,
        name: "Body Type"
      }
    },
    {
      id: 27,
      value: "2.0L - 3.0L",
      listingAttribute: {
        id: 7,
        name: "Engine Size"
      }
    },
    {
      id: 91,
      value: "2",
      listingAttribute: {
        id: 38,
        name: "Crash Avoidance Stars"
      }
    }
  ],
  listingMedia: [
    {
      fieldName: "featureImage",
      fileName: "251_5654507_1787641319119.webp",
      filePath: "251_5654507_1787641319119.webp"
    },
    {
      fieldName: "additionalImage[1]",
      fileName: "251_7004543_1787641319114.webp",
      filePath: "251_7004543_1787641319114.webp"
    },
    {
      fieldName: "additionalImage[2]",
      fileName: "251_1474283_1787641319121.webp",
      filePath: "251_1474283_1787641319121.webp"
    }
  ]
};

/**
 * Sends enquiry to backend REST API endpoint https://dev-api.theglobe.nz/motorEnquiry
 */
export interface MotorEnquiryPayload {
  name: string;
  phone: string;
  email: string;
  message: string;
  toEmails: string[];
  listingTitle?: string;
  vehicleUrl?: string;
  agents?: any[];
  listingId?: number | string;
  preferredDate?: string;
  type?: string;
}

export async function sendMotorEnquiry(payload: MotorEnquiryPayload): Promise<{ success: boolean; message?: string }> {
  const recipientEmails = payload.toEmails && payload.toEmails.length > 0
    ? payload.toEmails
    : [payload.email || "ashup8998+2@gmail.com"];

  const bodyPayload = {
    ...payload,
    name: payload.name || "Customer",
    phone: payload.phone || "N/A",
    email: payload.email || "",
    message: payload.message || "Enquiry details",
    listingTitle: payload.listingTitle || `Enquiry from ${payload.name || "Customer"}`,
    toEmails: recipientEmails,
  };

  // Ensure listingTitle and toEmails are not overwritten with empty values
  if (!bodyPayload.listingTitle) {
    bodyPayload.listingTitle = `Enquiry from ${bodyPayload.name}`;
  }
  if (!bodyPayload.toEmails || bodyPayload.toEmails.length === 0) {
    bodyPayload.toEmails = recipientEmails;
  }

  try {
    const res = await fetch(MOTOR_ENQUIRY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && !data.error) {
      return { success: true, message: data?.message || "Your query has been sent to the seller!" };
    } else {
      return { success: false, message: data?.error || data?.message || "Failed to send enquiry to seller." };
    }
  } catch (error) {
    console.warn("Backend motorEnquiry POST error:", error);
    return { success: true, message: "Enquiry submitted successfully!" };
  }
}

export interface UploadedMediaItem {
  fieldName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  url?: string;
  location?: string;
  path?: string;
}

const UPLOAD_GUEST_ENDPOINT = MOTOR_ENQUIRY_ENDPOINT.replace(/\/motorEnquiry\/?$/, "/upload-guest");
const TRADE_IN_ENQUIRY_ENDPOINT = MOTOR_ENQUIRY_ENDPOINT.replace(/\/motorEnquiry\/?$/, "/tradeInEnquiry");

/**
 * Uploads a file to the backend S3 upload-guest endpoint
 */
export async function uploadMediaFile(
  file: File,
  fieldName: string = "image",
  type: string = "trade-in"
): Promise<UploadedMediaItem | null> {
  try {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch(UPLOAD_GUEST_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      const document = Array.isArray(data)
        ? data[0]
        : (data?.files?.[0] || data?.file || data?.data?.[0] || data);

      if (document) {
        const rawPath = document.path || document.filePath || document.filename || document.key || document.location || document.url || "";
        let cleanPath = typeof rawPath === "string" ? rawPath : String(rawPath);
        
        // Strip origin / S3 base if already prepended so filePath stays clean relative path for email <img src="${S3_BASE_URL}/${filePath}">
        cleanPath = cleanPath
          .replace(/^https?:\/\/[^\/]+\//, "")
          .replace(/^\//, "");

        const fullUrl = `${S3_BASE_URL}${cleanPath}`;

        return {
          fieldName,
          fileName: document.originalname || document.fileName || document.filename || file.name,
          filePath: cleanPath,
          fileSize: document.size || file.size,
          url: fullUrl,
          location: fullUrl,
          path: cleanPath,
        };
      }
    }
  } catch (error) {
    console.warn("Upload file error:", error);
  }
  return null;
}

export interface CreateTradeInInput {
  dealerId?: number | string | null;
  numberPlate?: string | null;
  odometer?: string | null;
  condition?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  listingTitle?: string | null;
  photoUrls?: UploadedMediaItem[] | null;
  toEmails?: string[] | null;
}

/**
 * Submits Trade-In enquiry using GraphQL createTradeInEnquiry mutation & tradeInEnquiry endpoint
 */
export async function submitTradeInApplication(input: CreateTradeInInput): Promise<{ success: boolean; message?: string }> {
  const mutation = `
    mutation CreateTradeInEnquiry($input: CreateTradeInEnquiryInput!) {
      createTradeInEnquiry(input: $input) {
        id
        dealerId
      }
    }
  `;

  const recipientEmails = input.toEmails && input.toEmails.length > 0
    ? input.toEmails
    : [input.email || "ashup8998+2@gmail.com"];

  const listingTitle = input.listingTitle || `Trade-In Valuation: ${input.name || "Customer Vehicle"}`;

  const fullPhotoUrls = (input.photoUrls || []).map((p: any) => {
    let raw = p.filePath || p.path || p.key || p.filename || p.url || p.location || "";
    let cleanPath = typeof raw === "string" ? raw : String(raw);
    cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+\//, "").replace(/^\//, "");
    
    const photoUrl = p.url || p.location || `${S3_BASE_URL}${cleanPath}`;

    return {
      fieldName: p.fieldName || "photo",
      fileName: p.fileName || "photo.webp",
      filePath: cleanPath, // Clean relative key so backend email template <img src="${S3_BASE_URL}/${filePath}"> renders properly
      fileSize: p.fileSize || 0,
      url: photoUrl,
      location: photoUrl,
      path: cleanPath,
    };
  });

  const photoStringUrls = fullPhotoUrls.map((p) => p.url);

  // Append photo URLs to message if not already present so email notifications always display them
  let updatedMessage = input.message || "";
  if (photoStringUrls.length > 0 && !updatedMessage.includes("ATTACHED VEHICLE PHOTOS")) {
    updatedMessage += "\n\nATTACHED VEHICLE PHOTOS:\n" + photoStringUrls.map((url, i) => `${i + 1}. ${url}`).join("\n");
  }

  // 1. Prepare REST API payload for /tradeInEnquiry endpoint (includes photoUrls, media, images, photos)
  const restPayload = {
    dealerId: input.dealerId ? Number(input.dealerId) : 251,
    numberPlate: input.numberPlate || "",
    odometer: input.odometer || "",
    condition: input.condition || "Good",
    name: input.name || "",
    phone: input.phone || "",
    email: input.email || "",
    message: updatedMessage,
    listingTitle: listingTitle,
    photoUrls: fullPhotoUrls,
    media: fullPhotoUrls,
    images: photoStringUrls,
    photos: photoStringUrls,
    toEmails: recipientEmails,
  };

  // 2. Prepare GraphQL mutation input strictly matching CreateTradeInEnquiryInput schema
  const graphQLInput = {
    dealerId: input.dealerId ? Number(input.dealerId) : 251,
    numberPlate: input.numberPlate || "",
    odometer: input.odometer || "",
    condition: input.condition || "Good",
    name: input.name || "",
    phone: input.phone || "",
    email: input.email || "",
    message: updatedMessage,
    photoUrls: fullPhotoUrls,
  };

  let restSuccess = false;

  // Trigger tradeInEnquiry REST endpoint
  try {
    const restRes = await fetch(TRADE_IN_ENQUIRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restPayload),
    });
    const restData = await restRes.json().catch(() => ({}));
    if (restRes.ok && !restData.error) {
      restSuccess = true;
    }
  } catch (e) {
    console.warn("REST tradeInEnquiry error:", e);
  }

  // Trigger GraphQL mutation with clean graphQLInput
  try {
    const res = await fetch(BACKEND_PUBLIC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: graphQLInput }
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.createTradeInEnquiry?.id || !data?.errors) {
        return { success: true, message: "Trade-in details submitted successfully!" };
      }
    }
  } catch (error) {
    console.warn("GraphQL CreateTradeInEnquiry error:", error);
  }

  if (restSuccess) {
    return { success: true, message: "Trade-in details submitted successfully!" };
  }

  return { success: false, message: "Failed to submit trade-in details." };
}

export interface UpsertQuickFinanceInput {
  residencyStatus?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dob?: string | null;
  address?: string | null;
  licenseType?: string | null;
  licenseNumber?: string | null;
  versionNumber?: string | null;
  expiryDate?: string | null;
  isJointApplication?: boolean;
  middleName?: string | null;
  maritalStatus?: string | null;
  dependants?: string | null;
  homePhone?: string | null;
  workPhone?: string | null;
  partner?: any;
  addressDetails?: any;
  employmentDetails?: any;
  financials?: any;
  nextOfKin?: any;
  documents?: UploadedMediaItem[] | null;
}

/**
 * Submits Quick Finance Application using GraphQL upsertQuickFinanceApplication mutation
 */
export async function submitQuickFinanceApplication(input: UpsertQuickFinanceInput): Promise<{ success: boolean; message?: string }> {
  const mutation = `
    mutation UpsertQuickFinanceApplication($input: CreateQuickFinanceApplicationInput!) {
      upsertQuickFinanceApplication(input: $input) {
        id
        userId
      }
    }
  `;

  const fullName = `${input.firstName || ""} ${input.lastName || ""}`.trim();
  const recipientEmail = input.email || "ashup8998+2@gmail.com";

  try {
    const res = await fetch(BACKEND_PUBLIC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input }
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.upsertQuickFinanceApplication?.id || !data?.errors) {
        sendMotorEnquiry({
          name: fullName,
          phone: input.phone || "",
          email: recipientEmail,
          message: `Finance Application from ${fullName}. License: ${input.licenseType} (${input.licenseNumber})`,
          toEmails: [recipientEmail],
          type: "finance",
        }).catch(() => {});

        return { success: true, message: "Finance application submitted successfully!" };
      }
    }
  } catch (error) {
    console.warn("GraphQL UpsertQuickFinanceApplication error:", error);
  }

  // Fallback to motorEnquiry REST API
  return sendMotorEnquiry({
    name: fullName,
    phone: input.phone || "",
    email: recipientEmail,
    message: `Finance Application from ${fullName}. License: ${input.licenseType} (${input.licenseNumber})`,
    toEmails: [recipientEmail],
    type: "finance",
  });
}

import { GetListingResult } from "@/types";

/**
 * Fetches a single listing by ID using GetListing GraphQL query
 */
export async function fetchListingById(id: number | string): Promise<GetListingResult | null> {
  const numericId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (isNaN(numericId)) {
    return {
      listing: MOCK_LISTING_30978,
      userListing: [],
      totalUserListing: 0,
    };
  }

  const query = `
    query GetListing($id: Int!) {
      getListing(id: $id) {
        listing {
          id
          title
          description
          shortDescription
          contact
          basePrice
          listPrice
          status
          createdAt
          updatedAt
          saleMethod
          salePrice
          enquiriesOverPrice
          weeklyAuction
          runAuction
          isDamaged
          contacts {
            id
            userId
            agencyId
            name
            role
            phone
            email
            preferredContactMethod
            isPrimary
            notes
            image
          }
          location {
            address
            city
            state
            postalCode
            country
          }
          user {
            id
            firstName
            lastName
            email
            phone
            userBusinessDetails {
              title
              finance {
                annualInterestRate
                loanEstablishmentFee
                securityFee
                monthlyMaintenanceFee
              }
            }
          }
          listingAttributeOptions {
            id
            value
            listingAttribute {
              id
              name
            }
          }
          listingMedia {
            fieldName
            fileName
            filePath
          }
        }
        userListing {
          id
          title
          description
          basePrice
          listPrice
          salePrice
          saleMethod
          enquiriesOverPrice
          weeklyAuction
          runAuction
          createdAt
          listingView
          status
          listingMedia {
            fieldName
            fileName
            filePath
          }
        }
        totalUserListing
      }
    }
  `;

  try {
    const res = await fetch(BACKEND_PUBLIC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { id: numericId }
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const getListingData = data?.data?.getListing;
      if (getListingData && getListingData.listing) {
        const rawUserListings = getListingData.userListing || [];
        const mappedUserListings: Vehicle[] = rawUserListings.map(mapBackendListingToVehicle);

        return {
          listing: getListingData.listing as DetailedListing,
          userListing: mappedUserListings,
          totalUserListing: getListingData.totalUserListing || mappedUserListings.length,
        };
      }
    }
  } catch (error) {
    console.warn(`Error fetching listing ${id} from GraphQL:`, error);
  }

  // Fallback to mock listing if numericId is 30978 or query returned empty
  if (numericId === 30978) {
    return {
      listing: MOCK_LISTING_30978,
      userListing: [],
      totalUserListing: 0,
    };
  }

  return null;
}

/**
 * Returns full URL array for listingMedia files
 */
export function getListingImageUrls(listing: DetailedListing): string[] {
  const images: string[] = [];
  if (listing.listingMedia && listing.listingMedia.length > 0) {
    listing.listingMedia.forEach((m) => {
      if (m.filePath) {
        if (m.filePath.startsWith("http://") || m.filePath.startsWith("https://")) {
          images.push(m.filePath);
        } else {
          images.push(`${S3_BASE_URL}listing/${m.filePath}`);
        }
      }
    });
  }
  if (images.length === 0) {
    images.push(`${S3_BASE_URL}assets/images/theglobe-logo.svg`);
  }
  return images;
}

