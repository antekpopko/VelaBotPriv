const axios = require("axios");

module.exports.config = {
  name: "rozwal",
  version: "1.0.0",
  hasPermssion: 2, // tylko admini bota
  credits: "cwel",
  description: "Dodaje danielmagical do grupy",
  commandCategory: "admin",
  usages: "",
  cooldowns: 5,
};

async function getUIDFromProfileURL(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const match = res.data.match(/"userID":"(\d+)"/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const profileURL = "https://www.facebook.com/danielmagical";

  const uid = await getUIDFromProfileURL(profileURL);

  if (!uid) {
    return api.sendMessage("❌ Nie udało się uzyskać UID profilu danielmagical. Upewnij się, że profil jest publiczny.", threadID);
  }

  try {
    await api.addUserToGroup(uid, threadID);
    api.sendMessage("✅ Użytkownik Daniel Magical został dodany do tej grupy 😈", threadID);
  } catch (error) {
    console.error(error);
    let msg = "❌ Nie udało się dodać Daniela Magicala. ";
    if (error.errorDescription?.includes("already in thread")) {
      msg += "On już tu jest.";
    } else if (error.errorDescription?.includes("not friends")) {
      msg += "Bot nie jest z nim znajomym.";
    } else {
      msg += "Błąd: " + error.message;
    }
    api.sendMessage(msg, threadID);
  }
};
