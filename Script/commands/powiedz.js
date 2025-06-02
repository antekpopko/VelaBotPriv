module.exports.config = {
  name: "powiedz",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM + poprawki: January Sakiewka",
  description: "Bot odtwarza podany tekst jako dźwięk (Google TTS)",
  commandCategory: "🔊 Media",
  usages: "[pl/en/ru/ja/tl/bn] [tekst]",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { createReadStream, unlinkSync, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { resolve } = global.nodemodule["path"];

  const supportedLangs = ["pl", "en", "ru", "pr", "ja", "tl", "bn"];
  let input = (event.type === "message_reply") ? event.messageReply.body : args.join(" ");
  if (!input) return api.sendMessage("❌ Podaj tekst do odczytania. Możesz też użyć np. `pl Witaj świecie`.", event.threadID, event.messageID);

  let language = global.config.language || "pl";
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
    // Upewnij się, że folder cache istnieje
    const cacheDir = resolve(__dirname, "cache");
    if (!existsSync(cacheDir)) mkdirSync(cacheDir);

    const filePath = resolve(cacheDir, `${event.threadID}_${event.senderID}.mp3`);
    const ttsURL = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message)}&tl=${language}&client=tw-ob`;

    await global.utils.downloadFile(ttsURL, filePath);

    // Reakcja
    try { await api.setMessageReaction("🔊", event.messageID, () => {}, true); } catch {}

    return api.sendMessage({
      body: `✅ Odczytuję w języku: ${language.toUpperCase()}\n🗣️ Treść: ${message}`,
      attachment: createReadStream(filePath)
    }, event.threadID, () => unlinkSync(filePath), event.messageID);

  } catch (err) {
    console.error("Błąd przy generowaniu TTS:", err);
    return api.sendMessage("❌ Wystąpił błąd podczas generowania dźwięku.", event.threadID, event.messageID);
  }
};