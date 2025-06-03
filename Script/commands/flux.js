const axios = require("axios");

module.exports.config = {
  name: "flux",
  version: "2.1",
  hasPermssion: 0,
  credits: "Dipto (poprawki: January Sakiewka)",
  description: "Generator obrazów Flux",
  commandCategory: "🖼️ Generator Obrazów",
  usage: "{pn} [opis] --ratio 1024x1024\n{pn} [opis]",
  cooldowns: 15
};

module.exports.run = async ({ event, args, api }) => {
  const fluxAPI = "https://www.noobs-api.rf.gd/dipto";

  try {
    const input = args.join(" ");
    const ratioMatch = input.match(/--ratio\s+(\S+)/i);
    const ratio = ratioMatch ? ratioMatch[1] : "1024x1024";
    const promptText = input.replace(/--ratio\s+\S+/i, "").trim();

    if (!promptText) {
      return api.sendMessage(
        "❌ Podaj opis obrazu!\nPrzykład:\nflux cyberpunkowe miasto nocą --ratio 1024x1024",
        event.threadID,
        event.messageID
      );
    }

    const dozwoloneRatio = ["1:1", "16:9", "9:16", "1024x1024"];
    if (!dozwoloneRatio.includes(ratio)) {
      return api.sendMessage(
        `❌ Nieprawidłowe ratio!\nDozwolone wartości: ${dozwoloneRatio.join(", ")}`,
        event.threadID,
        event.messageID
      );
    }

    const startTime = Date.now();
    const oczekiwanie = await api.sendMessage(
      `🖼️ Tworzę obraz na podstawie opisu:\n"${promptText}"\n⏳ Proszę czekać...`,
      event.threadID
    );

    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const apiUrl = `${fluxAPI}/flux?prompt=${encodeURIComponent(promptText)}&ratio=${encodeURIComponent(ratio)}`;
    const response = await axios.get(apiUrl, { responseType: "stream" });

    if (response.status !== 200) {
      throw new Error(`Błąd API (status ${response.status})`);
    }

    const czas = ((Date.now() - startTime) / 1000).toFixed(2);

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    api.unsendMessage(oczekiwanie.messageID);

    return api.sendMessage(
      {
        body: `✅ Gotowe! Obraz wygenerowany w ${czas} sekundy\n🖌️ Opis: "${promptText}"`,
        attachment: response.data
      },
      event.threadID,
      event.messageID
    );
  } catch (e) {
    console.error("Błąd w komendzie flux:", e);
    return api.sendMessage(`❌ Wystąpił błąd:\n${e.message}`, event.threadID, event.messageID);
  }
};
