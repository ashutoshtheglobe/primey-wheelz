import { WebsiteData, Vehicle, DetailedListing } from "@/types";
import { determineSaleMethod } from "@/utils/saleMethod";

const BACKEND_PUBLIC_GRAPHQL = "https://dev-api.theglobe.nz/graphql/public";
const S3_BASE_URL = "https://theglobe-development.s3.amazonaws.com/";

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
 * Fetches a single listing by ID using GetListing GraphQL query
 */
export async function fetchListingById(id: number | string): Promise<DetailedListing | null> {
  const numericId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (isNaN(numericId)) return MOCK_LISTING_30978;

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
            name
            phone
            email
          }
          location {
            address
            city
            state
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
      const listing = data?.data?.getListing?.listing;
      if (listing) {
        return listing as DetailedListing;
      }
    }
  } catch (error) {
    console.warn(`Error fetching listing ${id} from GraphQL:`, error);
  }

  // Fallback to mock listing if numericId is 30978 or query returned empty
  if (numericId === 30978) {
    return MOCK_LISTING_30978;
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

