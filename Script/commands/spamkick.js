module.exports.config = {
  name: "spamkick",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ChatGPT + January",
  description: "Wyrzuca spamujących użytkowników (10+ wiadomości w 8 sek.)",
  commandCategory: "System",
  usages: "Automatycznie aktywna",
  cooldowns: 0
};

module.exports.run = function() {
  // pusty, bo moduł działa tylko jako event handler
};

module.exports.handleEvent = async function ({ api, event }) {
  const { senderID, threadID } = event;
  const botID = api.getCurrentUserID();
  const ADMINS = global.config.ADMINBOT || [];

  if (senderID === botID || ADMINS.includes(senderID)) return;

  const SPAM_LIMIT = 10;
  const TIME_WINDOW = 8000;

  if (!global.client._spamData) global.client._spamData = {};
  const spamData = global.client._spamData;

  if (!spamData[senderID]) {
    spamData[senderID] = [];
  }

  const now = Date.now();
  spamData[senderID].push(now);

  spamData[senderID] = spamData[senderID].filter(time => now - time < TIME_WINDOW);

  if (spamData[senderID].length >= SPAM_LIMIT) {
    try {
      await api.removeUserFromGroup(senderID, threadID);
      api.sendMessage(`⚠️ Użytkownik ${senderID} został wyrzucony za spam (10+ wiadomości w 8 sek.)`, threadID);
      delete spamData[senderID];
    } catch (err) {
      console.error("❌ Nie udało się wyrzucić użytkownika:", err);
    }
  }
};