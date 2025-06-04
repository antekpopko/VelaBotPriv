const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "resend",
  version: "2.1.0",
  hasPermssion: 2,
  credits: "Zmienione przez January, ulepszone przez ChatGPT",
  description: "🔁 Pokazuje usuniętą wiadomość lub załącznik",
  commandCategory: "narzędzia",
  usages: "",
  cooldowns: 0,
  hide: true,
  dependencies: {
    axios: "",
    "fs-extra": ""
  },
  ignoredUsers: ["61575371644018"]
};

module.exports.handleEvent = async function ({ event, api, Users }) {
  try {
    const { messageID, senderID, threadID, body, attachments, type } = event;

    const botID = global.data.botID || (global.data.botID = api.getCurrentUserID());
    if (module.exports.config.ignoredUsers.includes(String(senderID))) return;
    if (senderID === botID || global.config.ADMINBOT?.includes(senderID)) return;

    if (!global.logMessage) global.logMessage = new Map();

    if (type !== "message_unsend") {
      global.logMessage.set(messageID, {
        msgBody: body,
        attachment: attachments
      });
    } else {
      const oldMsg = global.logMessage.get(messageID);
      if (!oldMsg) return;

      const senderName = await Users.getNameUser(senderID);
      const messageText = oldMsg.msgBody || "brak treści";

      // Bez załączników
      if (!oldMsg.attachment || oldMsg.attachment.length === 0) {
        return api.sendMessage(
          `❌ ${senderName} usunął wiadomość:\n\n🗨️ ${messageText}`,
          threadID
        );
      }

      // Z załącznikami
      const messageData = {
        body: `❌ ${senderName} usunął ${oldMsg.attachment.length} załącznik(i).` + (oldMsg.msgBody ? `\n\n🗨️ Treść: ${messageText}` : ""),
        attachment: [],
        mentions: [{
          tag: senderName,
          id: senderID
        }]
      };

      let count = 0;
      for (const att of oldMsg.attachment) {
        count++;
        try {
          const url = new URL(att.url);
          const ext = path.extname(url.pathname) || ".bin";
          const filePath = path.join(__dirname, `/cache/resend_${count}${ext}`);
          const fileData = (await axios.get(att.url, { responseType: "arraybuffer" })).data;

          await fs.writeFile(filePath, fileData);
          messageData.attachment.push(fs.createReadStream(filePath));
        } catch (err) {
          console.error(`❗ Błąd pobierania załącznika #${count}:`, err);
        }
      }

      return api.sendMessage(messageData, threadID, () => {
        // Czyszczenie cache po wysłaniu
        for (let i = 1; i <= count; i++) {
          const files = fs.readdirSync(path.join(__dirname, `/cache`));
          files.filter(f => f.startsWith(`resend_${i}`)).forEach(f => {
            fs.unlink(path.join(__dirname, `/cache`, f), () => {});
          });
        }
      });
    }
  } catch (e) {
    console.error("❗ Błąd w resend handleEvent:", e);
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
