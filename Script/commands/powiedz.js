module.exports.config = {
  name: "powiedz",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM, poprawione przez January",
  description: "Bot odtwarza podany tekst jako dźwięk Google TTS",
  commandCategory: "media",
  usages: "[pl/en/ru/ja/tl] [tekst]",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
  const { resolve } = global.nodemodule["path"];

  // Zawartość wiadomości
  let content = (event.type === "message_reply") ? event.messageReply.body : args.join(" ");
  if (!content) return api.sendMessage("Podaj tekst do odczytania.", event.threadID, event.messageID);

  // Lista wspieranych języków
  const supportedLangs = ["pl", "en", "ru", "pr", "ja", "tl", "bn"];
  let languageToSay = global.config.language || "pl";
  let msg = content;

  // Sprawdź, czy pierwszy element to język
  const firstWord = content.split(" ")[0].toLowerCase();
  if (supportedLangs.includes(firstWord)) {
    languageToSay = firstWord;
    msg = content.split(" ").slice(1).join(" ");
  }

  try {
    const path = resolve(__dirname, "cache", `${event.threadID}_${event.senderID}.mp3`);
    await global.utils.downloadFile(
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`,
      path
    );
    return api.sendMessage({ attachment: createReadStream(path) }, event.threadID, () => unlinkSync(path), event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("Wystąpił błąd podczas generowania dźwięku.", event.threadID, event.messageID);
  }
};
