const fs = require("fs");
const path = "./cache/groupSettings.json";

// Tworzenie pliku jeśli nie istnieje
if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports.config = {
  name: "groupProtect",
  eventType: [
    "log:thread-name",
    "log:thread-emoji",
    "log:thread-color"
  ],
  version: "2.0",
  credits: "ChatGPT",
  description: "Chroni wygląd grupy przed zmianami przez nieadminów"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const settings = JSON.parse(fs.readFileSync(path, "utf8"));
  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(i => i.id === author);

  // Pierwsze zapisanie danych grupy
  if (!settings[threadID]) {
    settings[threadID] = {
      name: threadInfo.threadName || "",
      emoji: threadInfo.emoji || "👍",
      color: threadInfo.threadColor || "#0084ff"
    };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return;
  }

  // Jeśli admin – aktualizuj dane
  if (isAdmin) {
    if (logMessageType === "log:thread-name") {
      settings[threadID].name = logMessageData.name;
    } else if (logMessageType === "log:thread-emoji") {
      settings[threadID].emoji = logMessageData.emoji;
    } else if (logMessageType === "log:thread-color") {
      settings[threadID].color = logMessageData.theme_color;
    }
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return;
  }

  // Cofnij zmianę, jeśli nieadmin
  try {
    if (logMessageType === "log:thread-name") {
      await api.setTitle(settings[threadID].name, threadID);
    } else if (logMessageType === "log:thread-emoji") {
      await api.changeThreadEmoji(settings[threadID].emoji, threadID);
    } else if (logMessageType === "log:thread-color") {
      await api.changeThreadColor(settings[threadID].color, threadID);
    }

    api.sendMessage("🚫 Tylko administratorzy mogą zmieniać wygląd grupy. Cofnięto zmianę.", threadID);
  } catch (err) {
    console.error("Błąd przy przywracaniu ustawień:", err);
  }
};