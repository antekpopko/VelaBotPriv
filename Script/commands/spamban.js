const num = 10; // liczba wiadomości w krótkim czasie uznanych za spam
const timee = 8; // czas (w sekundach), w którym nie można przekroczyć liczby num

module.exports.config = {
  name: "spamkick",
  version: "2.1.0",
  hasPermssion: 2,
  credits: "CYBER BOT TEAM + January",
  description: `Automatycznie wyrzuca użytkownika, jeśli spamuje wiadomościami (${num} w ${timee} sek.)`,
  commandCategory: "System",
  usages: "x",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(`Bot automatycznie wyrzuci użytkownika, jeśli wyśle więcej niż ${num} wiadomości w ciągu ${timee} sekund.`, event.threadID, event.messageID);
};

module.exports.handleEvent = async function ({ Users, Threads, api, event }) {
  const { senderID, threadID } = event;

  if (!global.client.autokick) global.client.autokick = {};

  if (!global.client.autokick[senderID]) {
    global.client.autokick[senderID] = {
      timeStart: Date.now(),
      count: 0
    };
  }

  const userData = global.client.autokick[senderID];

  if ((userData.timeStart + (timee * 1000)) <= Date.now()) {
    global.client.autokick[senderID] = {
      timeStart: Date.now(),
      count: 1
    };
  } else {
    userData.count++;
    if (userData.count >= num) {
      const moment = require("moment-timezone");
      const timeDate = moment.tz("Europe/Warsaw").format("DD/MM/YYYY HH:mm:ss");
      const dataUser = await Users.getData(senderID) || {};
      const name = dataUser.name || "Nieznany";

      api.removeUserFromGroup(senderID, threadID, (err) => {
        if (err) return api.sendMessage(`❌ Nie udało się wyrzucić użytkownika ${name}.`, threadID);
        api.sendMessage(`⚠️ Użytkownik ${name} został wyrzucony za spamowanie (${num}+ wiadomości w ${timee} sek.)`, threadID);
      });

      const admins = global.config.ADMINBOT || [];
      for (let ad of admins) {
        api.sendMessage(
          `🚨 WYRZUCENIE ZA SPAM 🚨\n👤 Nazwa: ${name}\n🆔 ID: ${senderID}\n💬 Spam: ${num} wiadomości\n🧵 Grupa: ${threadID}\n🕒 Czas: ${timeDate}`,
          ad
        );
      }

      global.client.autokick[senderID] = {
        timeStart: Date.now(),
        count: 0
      };
    }
  }
};
