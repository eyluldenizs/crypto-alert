const axios = require("axios");

const coinId = "bitcoin";
const targetPrice = 70000;

async function checkPrice() {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
    );

    const price = response.data[coinId].usd;

    console.log(`${coinId} fiyatı: $${price}`);

    if (price >= targetPrice) {
      console.log(`UYARI: ${coinId} hedef fiyata ulaştı!`);
    } else {
      console.log(`Henüz hedef fiyatın altında.`);
    }
  } catch (error) {
    console.log("Fiyat alınamadı:", error.message);
  }
}

checkPrice();
