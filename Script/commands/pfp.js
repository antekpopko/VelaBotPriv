const axios = require("axios");

module.exports = {
  config: {
    name: "pfp",
    version: "1.0",
    hasPermission: 0,
    usePrefix: true,
    credits: "Dipto (tłumaczenie i uproszczenie: January)",
    description: "Pobierz informacje o użytkowniku i jego zdjęcie profilowe",
    commandCategory: "informacje",
    cooldowns: 5,
  },

  run: async function ({ event, Users, api, args }) {
    const uidFromArgs = /^\d+$/.test(args[0]) ? args[0] : null;
    const uidFromMention = Object.keys(event.mentions)[0];
    const uidFromReply = event.type === "message_reply" ? event.messageReply.senderID : null;
    const uid = uidFromArgs || uidFromMention || uidFromReply || event.senderID;

    const userInfo = await api.getUserInfo(uid);
    const user = userInfo[uid];
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // Tłumaczenie płci
    let genderText = "❓ Nieznana";
    if (user.gender === 1) genderText = "👩 Kobieta";
    else if (user.gender === 2) genderText = "👨 Mężczyzna";

    // Dane użytkownika
    const info = `
📄 Informacje o użytkowniku:

👤 Imię i nazwisko: ${user.name || "Brak"}
🔖 Pseudonim: ${user.alternateName || "Brak"}
🆔 UID: ${uid}
📛 Nazwa użytkownika: ${user.vanity || "Brak"}
⚧️ Płeć: ${genderText}
🎂 Urodziny: ${user.isBirthday !== false ? user.isBirthday : "Ukryte"}
👥 Znajomy bota: ${user.isFriend ? "✅ Tak" : "❌ Nie"}
🌐 Link do profilu: https://facebook.com/${uid}
    `.trim();

    // Wczytaj zdjęcie profilowe
    const avatarStream = (await axios.get(avatarUrl, { responseType: "stream" })).data;

    // Wyślij wiadomość
    return api.sendMessage({
      body: info,
      attachment: avatarStream,
    }, event.threadID, event.messageID);
  },
};