import { fetchAllAssetPrices } from "../../../services/serverPriceService";

export async function GET() {
  try {
    const prices = await fetchAllAssetPrices();

    return Response.json({
      ok: true,
      prices,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || "Fiyatlar alınırken bir hata oluştu.",
      },
      { status: 500 },
    );
  }
}
