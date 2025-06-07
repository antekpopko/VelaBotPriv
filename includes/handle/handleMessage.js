const axios = require("axios");

module.exports = async function ({ api, event }) {
  const botID = api.getCurrentUserID();
  console.log("[DEBUG] Bot ID:", botID);

  const isMentioned = event.mentions && event.mentions[botID];
  if (!isMentioned) return console.log("[DEBUG] Bot nie został oznaczony");

  const message = event.body.replace(/@\S+/, "").trim();
  console.log("[DEBUG] Odebrana wiadomość:", message);

  if (!message) return console.log("[DEBUG] Brak wiadomości po usunięciu wzmianki");

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo", // Zmieniaj na "gpt-4" tylko jeśli masz dostęp
      messages: [
        { role: "system", content: "Jesteś pomocnym, dowcipnym asystentem o imieniu Vela. Mówisz po polsku." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content.trim();
    console.log("[DEBUG] Odpowiedź AI:", reply);

    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (err) {
    console.error("[DEBUG] Błąd przy zapytaniu do OpenAI:", err.response?.data || err.message);
    api.sendMessage("❌ AI nie działa:\n" + (err.response?.data?.error?.message || err.message), event.threadID, event.messageID);
  }
};
