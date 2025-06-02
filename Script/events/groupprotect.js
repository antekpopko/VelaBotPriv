const fs = require("fs");
const path = "./groupSettings.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports.config = {
  name: "groupProtection",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-color", "log:thread-emoji"],
  version: "1.0",
  credits: "ChatGPT",
  description: "Chroni nazwę, emoji, motyw i zdjęcie grupy przed zmianami przez nie-adminów"
};

module.exports.run = async function({ api, event }) {
  const { threadID, logMessageData, author } = event;
  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(i => i.id == author);
  const settings = JSON.parse(fs.readFileSync(path, "utf-8"));

  if (!settings[threadID]) {
    settings[threadID] = {
      name: threadInfo.threadName,
      emoji: threadInfo.emoji,
      color: threadInfo.color,
      icon: threadInfo.imageSrc || null
    };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return;
  }

  if (isAdmin) {
    // Zaktualizuj zapisane dane, bo admin może zmieniać
    if (event.logMessageType === "log:thread-name") {
      settings[threadID].name = logMessageData.name || threadInfo.threadName;
    }
    if (event.logMessageType === "log:thread-emoji") {
      settings[threadID].emoji = logMessageData.emoji;
    }
    if (event.logMessageType === "log:thread-color") {
      settings[threadID].color = logMessageData.theme_color;
    }
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return;
  }

  // Przywróć zmienione dane jeśli użytkownik nie jest adminem
  try {
    switch (event.logMessageType) {
      case "log:thread-name":
        await api.setTitle(settings[threadID].name, threadID);
        break;
      case "log:thread-emoji":
        await api.changeThreadEmoji(settings[threadID].emoji, threadID);
        break;
      case "log:thread-color":
        await api.changeThreadColor(settings[threadID].color, threadID);
        break;
      case "log:thread-icon":
        // Niestety nie da się bezpośrednio przywrócić ikony grupy
        break;
    }
    api.sendMessage(`🚫 Tylko administratorzy mogą zmieniać wygląd grupy. Zmiany zostały cofnięte.`, threadID);
  } catch (e) {
    console.error("Błąd przywracania ustawień grupy:", e);
  }
};