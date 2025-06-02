const moment = require("moment-timezone");

module.exports.config = {
  name: "spamkick",
  version: "2.2.0",
  hasPermssion: 2,
  credits: "CYBER BOT TEAM + January",
  description: "Automatycznie wyrzuca użytkownika, jeśli spamuje wiadomościami",
  commandCategory: "System",
  usages: "x",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
    "Bot automatycznie wyrzuci użytkownika, jeśli wyśle zbyt dużo wiadomości w krótkim czasie.",
    event.threadID,
    event.messageID
  );
};

module.exports.handleEvent = async function ({ Users, api, event }) {
  const { senderID, threadID } = event;

  // Ignoruj wiadomości bota
  if (senderID == api.getCurrentUserID()) return;

  if (!global.client.autokick) global.client.autokick = {};

  if (!global.client.autokick[senderID]) {
    global.client.autokick[senderID] = {
      timeStart: Date.now(),
      count: 0
    };
  }

  const userData = global.client.autokick[senderID];

  // Okres 8 sekund na spam, limit 10 wiadomości
  const SPAM_LIMIT = 10;
  const TIME_LIMIT = 8000;

  if ((userData.timeStart + TIME_LIMIT) <= Date.now()) {
    // Reset licznika po upływie czasu
    global.client.autokick[senderID] = {
      timeStart: Date.now(),
      count: 1
    };
  } else {
    userData.count++;
    if (userData.count >= SPAM_LIMIT) {
      const timeDate = moment.tz("Europe/Warsaw").format("DD/MM/YYYY HH:mm:ss");
      const dataUser = await Users.getData(senderID) || {};
      const name = dataUser.name || "Nieznany";

      api.removeUserFromGroup(senderID, threadID, (err) => {
        if (err) 
          return api.sendMessage(`❌ Nie udało się wyrzucić użytkownika ${name}.`, threadID);
        api.sendMessage(`⚠️ Użytkownik ${name} został wyrzucony za spamowanie (${SPAM_LIMIT}+ wiadomości w ${TIME_LIMIT/1000} sek.)`, threadID);
      });

      // Powiadomienie adminom
      const admins = global.config.ADMINBOT || [];
      for (let ad of admins) {
        api.sendMessage(
          `🚨 WYRZUCENIE ZA SPAM 🚨\n👤 Nazwa: ${name}\n🆔 ID: ${senderID}\n💬 Spam: ${SPAM_LIMIT} wiadomości\n🧵 Grupa: ${threadID}\n🕒 Czas: ${timeDate}`,
          ad
        );
      }

      // Reset po wyrzuceniu
      global.client.autokick[senderID] = {
        timeStart: Date.now(),
        count: 0
      };
    }
  }
};