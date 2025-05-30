module.exports.config = {
  name: "usun",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Usuwa wiadomość bota",
  commandCategory: "system",
  usages: "unsend",
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
    returnCant: "Nie można usunąć czyjejś wiadomości.",
    missingReply: "Odpowiedz na wiadomość bota, którą chcesz usunąć.",
  },
};

module.exports.run = async function({ api, event, getText }) {
  if (event.type !== "message_reply") {
    return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
  }
  if (event.messageReply.senderID !== api.getCurrentUserID()) {
    return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
  }
  await api.unsendMessage(event.messageReply.messageID);
};
