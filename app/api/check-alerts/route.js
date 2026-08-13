import { checkPendingAlertRules } from "../../../services/alertCheckerService";

export async function POST() {
  try {
    const result = await checkPendingAlertRules();

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Kontrol sırasında hata oluştu." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST();
}

export async function HEAD() {
  await POST();

  return new Response(null, {
    status: 200,
  });
}
