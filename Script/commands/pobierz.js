module.exports.config = {
  name: "pobierz",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Pobierz link do pliku wideo, audio lub zdjęcia z odpowiedzi na wiadomość w grupie",
  commandCategory: "Narzędzia",
  usages: "pobierz",
  cooldowns: 5,
};

module.exports.languages = {
  pl: {
    invalidFormat: "❌ Musisz odpowiedzieć na wiadomość zawierającą audio, wideo lub zdjęcie.",
    noAttachments: "❌ W wiadomości nie znaleziono żadnych załączników do pobrania.",
    multipleLinks: "🔗 Znaleziono kilka załączników, oto linki:",
  },
  en: {
    invalidFormat: "❌ You need to reply to a message containing audio, video or picture.",
    noAttachments: "❌ No downloadable attachments found in the replied message.",
    multipleLinks: "🔗 Multiple attachments found, here are the links:",
  }
};

module.exports.run = async ({ api, event, getText }) => {
  try {
    if (event.type !== "message_reply") {
      return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);
    }

    const attachments = event.messageReply?.attachments;
    if (!attachments || attachments.length === 0) {
      return api.sendMessage(getText("noAttachments"), event.threadID, event.messageID);
    }

    // Filtrujemy tylko pliki audio, video lub zdjęcia
    const validAttachments = attachments.filter(att => 
      ["audio", "video", "photo"].includes(att.type)
    );

    if (validAttachments.length === 0) {
      return api.sendMessage(getText("noAttachments"), event.threadID, event.messageID);
    }

    if (validAttachments.length === 1) {
      // Jeden załącznik — zwróć link bezpośrednio
      return api.sendMessage(validAttachments[0].url, event.threadID, event.messageID);
    } else {
      // Więcej niż jeden — wypisz linki w czytelnej formie
      const message = validAttachments
        .map((att, i) => `${i + 1}. ${att.type.toUpperCase()}: ${att.url}`)
        .join("\n");
      return api.sendMessage(`${getText("multipleLinks")}\n${message}`, event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Błąd w komendzie pobierz:", error);
    return api.sendMessage("❌ Wystąpił błąd podczas pobierania linku.", event.threadID, event.messageID);
  }
};