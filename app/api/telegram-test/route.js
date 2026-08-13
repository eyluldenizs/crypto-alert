import { sendTelegramMessage } from "../../../services/telegramService";

export async function POST() {
  try {
    await sendTelegramMessage("Crypto Alert test mesajı başarılı!");
    return Response.json({
      ok: true,
      message: "Telegram mesajı gönderildi.",
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
