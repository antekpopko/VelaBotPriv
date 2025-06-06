const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "powiedz",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM + poprawki: January Sakiewka",
  description: "Bot odtwarza podany tekst jako dźwięk (Google TTS)",
  commandCategory: "🔊 Media",
  usages: "[pl/en/ru/ja/tl/bn] [tekst]",
  cooldowns: 5
};

// Pomocnicza funkcja pobierania pliku z Google TTS
async function downloadFile(url, filePath) {
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0" // wymagane przez Google
    }
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports.run = async function ({ api, event, args }) {
  const supportedLangs = ["pl", "en", "ru", "pr", "ja", "tl", "bn"];
  let input = (event.type === "message_reply") ? event.messageReply.body : args.join(" ");
  if (!input) return api.sendMessage("❌ Podaj tekst do odczytania. Możesz też użyć np. `pl Witaj świecie`.", event.threadID, event.messageID);

  let language = "pl";
  let message = input.trim();

  const words = input.split(" ");
  const firstWord = words[0].toLowerCase();

  if (supportedLangs.includes(firstWord)) {
    language = firstWord;
    message = words.slice(1).join(" ");
  }

  if (!message) {
    return api.sendMessage("❌ Podaj tekst po kodzie języka. Przykład: `pl Witaj świecie`.", event.threadID, event.messageID);
  }

  try {
    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.resolve(cacheDir, `${event.threadID}_${event.senderID}.mp3`);
    const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message)}&tl=${language}&client=tw-ob`;

    await downloadFile(ttsURL, filePath);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage("❌ Nie udało się pobrać pliku dźwiękowego.", event.threadID, event.messageID);
    }

    try { await api.setMessageReaction("🔊", event.messageID, () => {}, true); } catch {}

    return api.sendMessage({
      body: `✅ Odczytuję w języku: ${language.toUpperCase()}\n🗣️ Treść: ${message}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  } catch (err) {
    console.error("Błąd przy generowaniu TTS:", err);
    return api.sendMessage("❌ Wystąpił błąd podczas generowania dźwięku.", event.threadID, event.messageID);
  }
};
