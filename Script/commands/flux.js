const axios = require("axios");

module.exports.config = {
  name: "flux",
  version: "2.1",
  hasPermssion: 0,
  credits: "Dipto (tłumaczenie i poprawki: January Sakiewka)",
  description: "Generator obrazów Flux",
  commandCategory: "🖼️ Generator Obrazów",
  usage: "{pn} [opis] --ratio 1024x1024\n{pn} [opis]",
  cooldowns: 15,
};

module.exports.run = async ({ event, args, api }) => {
  const fluxAPI = "https://www.noobs-api.rf.gd/dipto";

  try {
    const input = args.join(" ");

    // Szukamy '--ratio' i dzielimy input na prompt i ratio
    let promptText = input;
    let ratio = "1024x1024"; // domyślne ratio

    const ratioMatch = input.match(/--ratio\s+([^\s]+)/);
    if (ratioMatch) {
      ratio = ratioMatch[1].toLowerCase();
      promptText = input.replace(ratioMatch[0], "").trim();
    }

    if (!promptText) {
      return api.sendMessage(
        "❌ Podaj opis obrazu! Przykład:\nflux cyberpunkowe miasto nocą --ratio 1024x1024",
        event.threadID,
        event.messageID
      );
    }

    // Ujednolicone dozwolone ratio
    const validRatios = ["1:1", "16:9", "9:16", "1024x1024"];

    // Zamiana "1:1" na "1024x1024" bo API oczekuje formatu 'WxH'
    if (ratio === "1:1") ratio = "1024x1024";

    if (!validRatios.includes(ratio)) {
      return api.sendMessage(
        `❌ Nieprawidłowe ratio! Dozwolone wartości to:\n${validRatios.join(", ")}`,
        event.threadID,
        event.messageID
      );
    }

    const startTime = Date.now();

    const waitMsg = await api.sendMessage(
      `🖼️ Tworzę obraz na podstawie opisu:\n"${promptText}"\n⏳ Proszę czekać...`,
      event.threadID
    );

    try {
      await api.setMessageReaction("⌛", event.messageID, () => {}, true);
    } catch {}

    const apiUrl = `${fluxAPI}/flux?prompt=${encodeURIComponent(promptText)}&ratio=${encodeURIComponent(ratio)}`;
    const response = await axios.get(apiUrl, { responseType: "stream" });

    if (response.status !== 200) {
      throw new Error(`Błąd API (status ${response.status})`);
    }

    const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    try {
      await api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch {}

    await api.unsendMessage(waitMsg.messageID);

    return api.sendMessage(
      {
        body: `✅ Gotowe! Obraz wygenerowany w ${timeElapsed} sekundy\n🖌️ Opis: "${promptText}"`,
        attachment: response.data,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Wystąpił błąd: " + error.message, event.threadID, event.messageID);
  }
};