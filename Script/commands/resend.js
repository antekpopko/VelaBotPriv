const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "resend",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Zmienione przez January",
  description: "🔁 Automatycznie pokazuje usuniętą wiadomość lub załącznik",
  commandCategory: "narzędzia",
  usages: "",
  cooldowns: 0,
  hide: true,
  dependencies: {
    axios: "",
    "fs-extra": ""
  },
  ignoredUsers: ["61575371644018"] // tutaj możesz dodawać ignorowanych użytkowników
};

module.exports.handleEvent = async function ({ event, api, Users }) {
  try {
    const { messageID, senderID, threadID, body, attachments, type } = event;
    const botID = global.data.botID || (global.data.botID = api.getCurrentUserID());

    // Ignoruj od użytkowników na liście ignorowanych
    if (module.exports.config.ignoredUsers.includes(String(senderID))) return;

    if (!global.logMessage) global.logMessage = new Map();
    if (!global.data.threadData.has(threadID)) global.data.threadData.set(threadID, {});

    // Jeśli to wiadomość bota lub administratora - zignoruj
    if (senderID == botID || global.config.ADMINBOT.includes(senderID)) return;

    if (type !== "message_unsend") {
      // Zapisz wiadomość do mapy
      global.logMessage.set(messageID, {
        msgBody: body,
        attachment: attachments
      });
    } else {
      const oldMsg = global.logMessage.get(messageID);
      if (!oldMsg) return;

      const senderName = await Users.getNameUser(senderID);

      if (!oldMsg.attachment || oldMsg.attachment.length === 0) {
        return api.sendMessage(`${senderName} usunął wiadomość:\n\n🗨️ Treść: ${oldMsg.msgBody || "brak treści"}`, threadID);
      }

      const messageData = {
        body: `${senderName} usunął ${oldMsg.attachment.length} załącznik(i).` + (oldMsg.msgBody ? `\n\n🗨️ Treść: ${oldMsg.msgBody}` : ""),
        attachment: [],
        mentions: [{
          tag: senderName,
          id: senderID
        }]
      };

      let count = 0;
      for (const att of oldMsg.attachment) {
        count++;
        const ext = att.url.split(".").pop();
        const filePath = __dirname + `/cache/resend_${count}.${ext}`;
        const fileData = (await axios.get(att.url, { responseType: "arraybuffer" })).data;
        await fs.writeFile(filePath, fileData);
        messageData.attachment.push(fs.createReadStream(filePath));
      }

      return api.sendMessage(messageData, threadID);
    }
  } catch (e) {
    console.error("Błąd w resend handleEvent:", e);
  }
};

module.exports.languages = {
  pl: {
    on: "Włączone",
    off: "Wyłączone",
    successText: "Resend działa"
  }
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("✅ Funkcja 'resend' jest zawsze aktywna i nie może zostać wyłączona.", event.threadID, event.messageID);
};
