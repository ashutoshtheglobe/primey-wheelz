export interface SaleMethodDetails {
  code: string;
  label: string;
  isAuction: boolean;
  isPBN: boolean;
  isAskingPrice: boolean;
  formattedDisplay: string;
}

export function determineSaleMethod(listing: {
  saleMethod?: string | null;
  runAuction?: boolean | null;
  weeklyAuction?: boolean | null;
  enquiriesOverPrice?: number | null;
  basePrice?: number | null;
  listPrice?: number | null;
  salePrice?: number | null;
  price?: number | null;
}): SaleMethodDetails {
  const runAuction = Boolean(listing.runAuction);
  const weeklyAuction = Boolean(listing.weeklyAuction);
  const rawMethod = listing.saleMethod ? listing.saleMethod.toLowerCase().trim() : "";

  const price = listing.price ?? listing.salePrice ?? listing.listPrice ?? listing.basePrice ?? 0;
  const enquiriesOver = listing.enquiriesOverPrice ?? null;

  // 1. AUCTION - Only true if explicitly runAuction/weeklyAuction is true OR saleMethod is auction
  if (runAuction || weeklyAuction || rawMethod === "auction" || rawMethod === "weekly_auction") {
    const priceDisplay = price > 0 ? `$${price.toLocaleString("en-NZ")}` : "Auction";
    return {
      code: "auction",
      label: "Auction",
      isAuction: true,
      isPBN: false,
      isAskingPrice: false,
      formattedDisplay: priceDisplay,
    };
  }

  // 2. ENQUIRIES OVER - If saleMethod is enquiries_over OR enquiriesOverPrice is provided > 0
  if (rawMethod === "enquiries_over" || (enquiriesOver !== null && enquiriesOver > 0)) {
    const targetPrice = enquiriesOver || price;
    const priceText = targetPrice > 0 ? ` $${targetPrice.toLocaleString("en-NZ")}` : "";
    return {
      code: "enquiries_over",
      label: `Enquiries Over${priceText}`,
      isAuction: false,
      isPBN: false,
      isAskingPrice: false,
      formattedDisplay: `Enquiries Over${priceText}`,
    };
  }

  // 3. PRICE BY NEGOTIATION (PBN/POA) - If price is 0 or method is pbn/poa/by_negotiation/bpo
  if (
    rawMethod === "pbn" ||
    rawMethod === "poa" ||
    rawMethod === "by_negotiation" ||
    rawMethod === "bpo" ||
    (price === 0 && enquiriesOver === null)
  ) {
    return {
      code: "pbn",
      label: "Price By Negotiation",
      isAuction: false,
      isPBN: true,
      isAskingPrice: false,
      formattedDisplay: "Price By Negotiation",
    };
  }

  // 4. BUY NOW
  if (rawMethod === "buy_now") {
    return {
      code: "buy_now",
      label: "Buy Now",
      isAuction: false,
      isPBN: false,
      isAskingPrice: true,
      formattedDisplay: price > 0 ? `$${price.toLocaleString("en-NZ")}` : "Buy Now",
    };
  }

  // 5. DEFAULT: ASKING PRICE
  const priceDisplay = price > 0 ? `$${price.toLocaleString("en-NZ")}` : "Price By Negotiation";
  return {
    code: price > 0 ? "asking_price" : "pbn",
    label: price > 0 ? "Asking Price" : "Price By Negotiation",
    isAuction: false,
    isPBN: price === 0,
    isAskingPrice: price > 0,
    formattedDisplay: priceDisplay,
  };
}
