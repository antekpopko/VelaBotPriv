const axios = require("axios");

module.exports = {
  config: {
    name: "pfp",
    version: "1.1",
    hasPermission: 0,
    usePrefix: true,
    credits: "Dipto (tłumaczenie i ulepszenia: January)",
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
    const profileUrl = `https://facebook.com/${uid}`;

    // Tłumaczenie płci
    let genderText = "❓ Nieznana";
    if (user.gender === 1) genderText = "👩 Kobieta";
    else if (user.gender === 2) genderText = "👨 Mężczyzna";

    // Dodatkowe informacje
    const name = user.name || "Brak";
    const nickname = user.alternateName || "Brak";
    const vanity = user.vanity || "Brak";
    const birthday = user.isBirthday !== false ? user.isBirthday : "Ukryte";
    const isFriend = user.isFriend ? "✅ Tak" : "❌ Nie";
    const isVerified = user.isVerified ? "✅ Tak" : "❌ Nie";
    const mutualFriends = user.mutualFriends !== undefined ? `${user.mutualFriends}` : "Nieznana";

    const info = `
📄 Informacje o użytkowniku:

👤 Imię i nazwisko: ${name}
🔖 Pseudonim: ${nickname}
🆔 UID: ${uid}
📛 Nazwa użytkownika: ${vanity}
⚧️ Płeć: ${genderText}
🎂 Urodziny: ${birthday}
👥 Znajomy bota: ${isFriend}
🔵 Zweryfikowane konto: ${isVerified}
🤝 Wspólnych znajomych z botem: ${mutualFriends}
🔗 Link do profilu: ${profileUrl}
    `.trim();

    // Załaduj zdjęcie profilowe
    const avatarStream = (await axios.get(avatarUrl, { responseType: "stream" })).data;

    // Wyślij wiadomość
    return api.sendMessage({
      body: info,
      attachment: avatarStream,
      url: profileUrl // opcjonalne, ale niektóre boty obsługują klikane linki przez to pole
    }, event.threadID, event.messageID);
  },
};