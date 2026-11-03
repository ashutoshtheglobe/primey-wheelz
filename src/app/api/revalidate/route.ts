import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearAllMemoryCaches } from "@/services/backendApi";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET || "primey-wheelz-secret";

  if (secret && secret !== expectedSecret) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  try {
    clearAllMemoryCaches();
    revalidatePath("/vehicles");
    revalidatePath("/");
    return NextResponse.json({
      revalidated: true,
      paths: ["/vehicles", "/"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to revalidate paths", error: String(error) },
      { status: 500 }
    );
  }
}
