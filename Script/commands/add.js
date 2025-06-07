const axios = require("axios");

module.exports.config = {
  name: "add",
  version: "1.1.0",
  hasPermssion: 1,
  credits: "cwel + ChatGPT",
  description: "Dodaje użytkownika do grupy po linku (również /share/)",
  commandCategory: "admin",
  usages: "[link do profilu lub share]",
  cooldowns: 5
};

// 🔧 Ulepszona funkcja pobierająca UID z nazwy profilu
async function getUID(username) {
  try {
    const res = await axios.get(`https://mbasic.facebook.com/${username}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    // Spróbuj znaleźć UID w linku do profilu
    const match = res.data.match(/href="\/profile\.php\?id=(\d+)"/);
    if (match) return match[1];

    // Alternatywa: entity_id (rzadziej działa)
    const matchAlt = res.data.match(/"entity_id":"(\d+)"/);
    if (matchAlt) return matchAlt[1];

  } catch (e) {
    console.error("Błąd przy pobieraniu UID:", e);
  }

  throw new Error("Nie udało się znaleźć UID z nazwy profilu.");
}

module.exports.run = async function({ api, event, args }) {
  const link = args[0];

  if (!link || !link.includes("facebook.com")) {
    return api.sendMessage("❌ Podaj prawidłowy link do profilu lub typu 'share'.", event.threadID, event.messageID);
  }

  try {
    // 1. Śledź przekierowanie linku share → profil
    const response = await axios.get(link, {
      maxRedirects: 5,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const finalUrl = response.request.res.responseUrl;

    // 2. Wyciągnij UID
    let uid;
    const idMatch = finalUrl.match(/profile\.php\?id=(\d+)/);
    const vanityMatch = finalUrl.match(/facebook\.com\/([^/?&]+)/);

    if (idMatch) {
      uid = idMatch[1];
    } else if (vanityMatch) {
      uid = await getUID(vanityMatch[1]);
    }

    if (!uid) throw new Error("Nie udało się odczytać UID użytkownika.");

    // 3. Dodaj użytkownika do grupy
    await api.addUserToGroup(uid, event.threadID);
    return api.sendMessage(`✅ Użytkownik (UID: ${uid}) został dodany do grupy.`, event.threadID, event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ Błąd podczas dodawania: ${err.message}`, event.threadID, event.messageID);
  }
};
