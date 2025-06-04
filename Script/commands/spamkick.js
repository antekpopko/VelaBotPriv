const moment = require("moment-timezone");

module.exports.config = {
  name: "spamkick",
  version: "2.3.1",
  hasPermssion: 2,
  credits: "CYBER BOT TEAM + January + ChatGPT",
  description: "Automatycznie wyrzuca użytkownika, jeśli spamuje wiadomościami",
  commandCategory: "System",
  usages: "spamkick",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
    "🚨 Funkcja *spamkick* włączona!\nBot automatycznie wyrzuci użytkownika, jeśli wyśle zbyt wiele wiadomości w krótkim czasie.",
    event.threadID,
    event.messageID
  );
};

module.exports.handleEvent = async function ({ Users, api, event }) {
  const { senderID, threadID } = event;
  const botID = api.getCurrentUserID();

  if (senderID === botID) return;

  const ADMINS = global.config.ADMINBOT || [];
  if (ADMINS.includes(senderID)) return; // nie wyrzucaj adminów

  const SPAM_LIMIT = 10;
  const TIME_LIMIT = 8000;

  if (!global.client.autokick) global.client.autokick = {};

  // 🧹 Jeśli użytkownik został już wyrzucony — usuń jego dane i zakończ
  const threadInfo = global.data.threadInfo?.[threadID];
  const isStillInGroup = threadInfo?.participantIDs?.includes(senderID);
  if (threadInfo && !isStillInGroup) {
    delete global.client.autokick[senderID];
    return;
  }

  if (!global.client.autokick[senderID]) {
    global.client.autokick[senderID] = { timeStart: Date.now(), count: 1 };
    return;
  }

  const userData = global.client.autokick[senderID];
  const now = Date.now();

  if (now - userData.timeStart > TIME_LIMIT) {
    global.client.autokick[senderID] = { timeStart: now, count: 1 };
  } else {
    userData.count++;

    if (userData.count >= SPAM_LIMIT) {
      try {
        const timeDate = moment.tz("Europe/Warsaw").format("DD/MM/YYYY HH:mm:ss");
        const dataUser = await Users.getData(senderID) || {};
        const name = dataUser.name || "Nieznany";

        api.removeUserFromGroup(senderID, threadID, async (err) => {
          if (err) {
            console.error("❌ Błąd przy usuwaniu użytkownika:", err);
            return;
          }

          api.sendMessage(
            `⚠️ ${name} został wyrzucony za spamowanie (${SPAM_LIMIT}+ wiadomości w ${TIME_LIMIT / 1000} sek.)`,
            threadID
          );

          for (const adminID of ADMINS) {
            api.sendMessage(
              `🚨 *WYRZUCENIE ZA SPAM* 🚨\n👤 Nazwa: ${name}\n🆔 ID: ${senderID}\n💬 Spam: ${SPAM_LIMIT}+ wiadomości\n🧵 Grupa: ${threadID}\n🕒 Czas: ${timeDate}`,
              adminID
            );
          }

          // ✅ Trwałe usunięcie danych po wyrzuceniu
          delete global.client.autokick[senderID];
        });
      } catch (e) {
        console.error("❗ Błąd w module spamkick:", e);
      }
    }
  }
};
