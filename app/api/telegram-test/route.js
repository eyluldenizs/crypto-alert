export async function POST() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return Response.json(
      { ok: false, error: "Telegram token veya chat id eksik." },
      { status: 500 },
    );
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: "Crypto Alert test mesajı başarılı!",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return Response.json(
      {
        ok: false,
        error: data.description || "Telegram mesajı gönderilemedi.",
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    message: "Telegram mesajı gönderildi.",
  });
}
