module.exports.config = {
  name: "usun",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "CYBER BOT TEAM",
  description: "Usuwa wiadomość wysłaną przez bota",
  commandCategory: "🛠️ System",
  usages: "usun (odpowiedz na wiadomość bota)",
  cooldowns: 0,
};

module.exports.languages = {
  vi: {
    returnCant: "Không thể gỡ tin nhắn của người khác.",
    missingReply: "Hãy reply tin nhắn cần gỡ.",
  },
  en: {
    returnCant: "I can't unsend other people's messages.",
    missingReply: "Please reply to the bot's message you want to unsend.",
  },
  pl: {
    returnCant: "❌ Nie można usunąć wiadomości, której bot nie napisał.",
    missingReply: "ℹ️ Odpowiedz na wiadomość bota, którą chcesz usunąć.",
  },
};

module.exports.run = async function({ api, event, getText }) {
  // Sprawdź, czy użytkownik odpowiedział na wiadomość
  if (event.type !== "message_reply") {
    return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
  }

  // Sprawdź, czy wiadomość została wysłana przez bota
  const botID = api.getCurrentUserID();
  if (event.messageReply.senderID !== botID) {
    return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
  }

  // Usuń wiadomość
  return api.unsendMessage(event.messageReply.messageID);
};
