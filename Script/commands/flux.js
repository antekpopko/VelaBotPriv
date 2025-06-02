const axios = require("axios");

module.exports.config = {
  name: "flux",
  version: "2.2",
  hasPermssion: 0,
  credits: "Dipto (tłumaczenie i poprawki: January Sakiewka)",
  description: "Generator obrazów Flux",
  commandCategory: "🖼️ Generator Obrazów",
  usage: "{pn} [opis] --ratio 1024x1024\n{pn} [opis]",
  cooldowns: 15,
};

module.exports.run = async ({ event, args, api }) => {
  // Możesz zmienić API z powrotem na swoje, gdy będzie działać:
  const fluxAPI = "https://jan-images.vercel.app"; // lub: "https://www.noobs-api.rf.gd/dipto"

  try {
    const input = args.join(" ");

    let promptText = input;
    let ratio = "1024x1024";

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

    const validRatios = ["1:1", "16:9", "9:16", "1024x1024"];
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
    console.log("🔍 Zapytanie do API:", apiUrl);

    const response = await axios.get(apiUrl, {
      responseType: "stream",
      timeout: 20000 // 20 sekund
    });

    console.log("✅ Odpowiedź API:", response.status, response.headers["content-type"]);

    if (!response.headers["content-type"].startsWith("image/")) {
      throw new Error("API nie zwróciło obrazu. Typ: " + response.headers["content-type"]);
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
    console.error("❌ Błąd komendy flux:", error);
    return api.sendMessage("❌ Wystąpił błąd: " + error.message, event.threadID, event.messageID);
  }
};