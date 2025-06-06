const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "powiedz",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM + poprawki: January Sakiewka",
  description: "Bot odtwarza podany tekst jako dźwięk (Google TTS)",
  commandCategory: "media",
  usages: "[pl/en/ru/ja/tl/bn] [tekst]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const supportedLangs = ["pl", "en", "ru", "ja", "tl", "bn"];
  let input = (event.type === "message_reply") ? event.messageReply.body : args.join(" ");

  if (!input || input.trim() === "") {
    return api.sendMessage("❌ Podaj tekst do przeczytania, np. `pl Witaj świecie`", event.threadID, event.messageID);
  }

  let language = "pl";
  let message = input.trim();
  const words = input.split(" ");
  const firstWord = words[0].toLowerCase();

  if (supportedLangs.includes(firstWord)) {
    language = firstWord;
    message = words.slice(1).join(" ");
  }

  if (!message) {
    return api.sendMessage("❌ Podaj tekst po kodzie języka, np. `pl Witaj świecie`", event.threadID, event.messageID);
  }

  try {
    const filePath = path.resolve(__dirname, "cache", `${event.threadID}_${event.senderID}.mp3`);
    const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message)}&tl=${language}&client=tw-ob`;

    const response = await axios.get(ttsURL, {
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0" // wymagane przez Google
      }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `✅ Język: ${language.toUpperCase()}\n🗣️ Treść: ${message}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });

    writer.on("error", err => {
      console.error("Błąd zapisu pliku TTS:", err);
      api.sendMessage("❌ Wystąpił błąd podczas zapisywania pliku dźwiękowego.", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error("❌ Błąd przy pobieraniu TTS:", err);
    return api.sendMessage("❌ Nie udało się wygenerować dźwięku. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};
