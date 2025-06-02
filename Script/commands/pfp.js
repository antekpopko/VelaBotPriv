const axios = require("axios");

module.exports = {
  config: {
    name: "pfp",
    version: "1.1",
    hasPermission: 0,
    usePrefix: true,
    credits: "Dipto (tłumaczenie i uproszczenie: January)",
    description: "Pobierz informacje o użytkowniku i jego zdjęcie profilowe",
    commandCategory: "informacje",
    cooldowns: 5,
  },

  run: async function ({ event, api, args }) {
    try {
      const uidFromArgs = args[0] && /^\d+$/.test(args[0]) ? args[0] : null;
      const uidFromMention = event.mentions ? Object.keys(event.mentions)[0] : null;
      const uidFromReply = event.type === "message_reply" ? event.messageReply.senderID : null;
      const uid = uidFromArgs || uidFromMention || uidFromReply || event.senderID;

      const userInfo = await api.getUserInfo(uid);
      const user = userInfo[uid];
      if (!user) {
        return api.sendMessage("❌ Nie udało się znaleźć informacji o użytkowniku.", event.threadID, event.messageID);
      }

      // Płeć
      let genderText = "❓ Nieznana";
      if (user.gender === 1) genderText = "👩 Kobieta";
      else if (user.gender === 2) genderText = "👨 Mężczyzna";

      // Urodziny - user.isBirthday to boolean, więc pokażemy info inaczej
      const birthdayText = user.isBirthday ? "🎉 Dziś są urodziny!" : "Brak danych o urodzinach";

      // Info o użytkowniku
      const info = `
📄 Informacje o użytkowniku:

👤 Imię i nazwisko: ${user.name || "Brak"}
🔖 Pseudonim: ${user.alternateName || "Brak"}
🆔 UID: ${uid}
📛 Nazwa użytkownika: ${user.vanity || "Brak"}
⚧️ Płeć: ${genderText}
🎂 Urodziny: ${birthdayText}
👥 Znajomy bota: ${user.isFriend ? "✅ Tak" : "❌ Nie"}
🌐 Link do profilu: https://facebook.com/${uid}
      `.trim();

      const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Pobierz zdjęcie profilowe (stream)
      const response = await axios.get(avatarUrl, { responseType: "stream", timeout: 10000 });

      return api.sendMessage({
        body: info,
        attachment: response.data,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error("Błąd w komendzie pfp:", error);
      return api.sendMessage("❌ Wystąpił błąd podczas pobierania informacji o użytkowniku.", event.threadID, event.messageID);
    }
  },
};