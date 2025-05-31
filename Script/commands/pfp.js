const axios = require("axios");

module.exports = {
  config: {
    name: "pfp",
    version: "1.2",
    hasPermission: 0,
    usePrefix: true,
    credits: "Dipto (edytowane przez January)",
    description: "Wyświetla informacje o użytkowniku",
    commandCategory: "informacje",
    cooldowns: 10,
  },

  run: async function ({ event, api, args }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];
      let uid;

      // Ustal UID na podstawie argumentów lub odpowiedzi
      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid = event.type === "message_reply"
          ? event.messageReply.senderID
          : uid2 || uid1;
      }

      const userInfo = await api.getUserInfo(uid);
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Płeć
      const gender = userInfo[uid]?.gender;
      const genderText = gender === 1
        ? "👩 Kobieta"
        : gender === 2
        ? "👨 Mężczyzna"
        : "❓ Nieznana";

      // Treść wiadomości
      const info = 
`📄 Informacje o użytkowniku:

👤 Imię i nazwisko: ${userInfo[uid].name}
🔖 Pseudonim: ${userInfo[uid].alternateName || "Brak"}
🆔 UID: ${uid}
📛 Nazwa użytkownika: ${userInfo[uid].vanity || "Brak"}
⚧️ Płeć: ${genderText}
🎂 Urodziny: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Ukryte"}
👥 Znajomy bota: ${userInfo[uid].isFriend ? "✅ Tak" : "❌ Nie"}
🌐 Link do profilu: ${userInfo[uid].profileUrl}`;

      const avatarStream = (await axios.get(avatarUrl, { responseType: "stream" })).data;

      return api.sendMessage({
        body: info,
        attachment: avatarStream
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error("Błąd w komendzie spy:", err);
      return api.sendMessage("❌ Wystąpił błąd podczas pobierania informacji o użytkowniku.", event.threadID, event.messageID);
    }
  },
};