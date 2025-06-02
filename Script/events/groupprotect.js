const fs = require("fs");
const path = "./groupSettings.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");

module.exports.config = {
  name: "groupProtect",
  eventType: ["log:thread-name", "log:thread-emoji", "log:thread-color"],
  version: "3.0",
  credits: "ChatGPT + January Sakiewka",
  description: "Blokuje zmiany wyglądu grupy przez nieadminów"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const settings = JSON.parse(fs.readFileSync(path, "utf8"));
  const info = await api.getThreadInfo(threadID);
  const isAdmin = info.adminIDs.some(u => u.id === author);

  // Ustaw wartości domyślne jeśli brak rekordu
  if (!settings[threadID]) {
    settings[threadID] = {
      name: "Wariatkowo 😛",
      emoji: "👍",
      color: "#0084ff"
    };
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
  }

  // Admin – aktualizuje zapisane dane
  if (isAdmin) {
    if (logMessageType === "log:thread-name") settings[threadID].name = logMessageData.name;
    if (logMessageType === "log:thread-emoji") settings[threadID].emoji = logMessageData.emoji;
    if (logMessageType === "log:thread-color") settings[threadID].color = logMessageData.theme_color;
    fs.writeFileSync(path, JSON.stringify(settings, null, 2));
    return;
  }

  // Nieadmin – cofamy zmianę
  try {
    if (logMessageType === "log:thread-name") {
      await api.setTitle(settings[threadID].name, threadID);
    }
    if (logMessageType === "log:thread-emoji") {
      await api.changeThreadEmoji(settings[threadID].emoji, threadID);
    }
    if (logMessageType === "log:thread-color") {
      await api.changeThreadColor(settings[threadID].color, threadID);
    }

    await api.sendMessage("🚫 Tylko administratorzy mogą zmieniać wygląd grupy. Zmiana cofnięta.", threadID);
  } catch (err) {
    console.error("[❌] Błąd przy przywracaniu ustawień:", err);
  }
};