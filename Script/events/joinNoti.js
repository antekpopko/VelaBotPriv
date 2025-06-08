const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "2.0.0",
  credits: "CYBER BOT TEAM (skrócona wersja: January)",
  description: "Proste powitanie z gifem (PL)",
};

module.exports.onLoad = function () {
  const gifFolder = path.join(__dirname, "cache", "joinGif", "randomgif");
  if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;

  // Jeśli bot został dodany do grupy
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const botNick = `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "BOT"}`;
    api.changeNickname(botNick, threadID, api.getCurrentUserID());

    return api.sendMessage("🤖 Jestem gotowy do działania!", threadID);
  }

  // Powitanie nowych użytkowników
  try {
    const participants = logMessageData.addedParticipants;
    const names = [];
    const mentions = [];

    const userInfo = await api.getUserInfo(participants.map(p => p.userFbId));

    for (const p of participants) {
      const user = userInfo[p.userFbId];
      const name = (user && user.name && user.name !== "Facebook User") ? user.name : (p.fullName || "użytkowniku");
      names.push(name);
      mentions.push({ tag: name, id: p.userFbId });
    }

    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "grupie";

    const msg = names.length > 1
      ? `👋 Witamy nowych członków w ${threadName}!`
      : `👋 Cześć ${names[0]}! Witaj w ${threadName}!`;

    const gifDir = path.join(__dirname, "cache", "joinGif", "randomgif");
    const gifFiles = fs.existsSync(gifDir)
      ? fs.readdirSync(gifDir).filter(file => file.endsWith(".mp4") || file.endsWith(".gif"))
      : [];

    const formPush = { body: msg, mentions };

    // 30% szansy na dołączenie GIF-a
    if (gifFiles.length > 0 && Math.random() < 0.3) {
      const selected = gifFiles[Math.floor(Math.random() * gifFiles.length)];
      formPush.attachment = fs.createReadStream(path.join(gifDir, selected));
    }

    return api.sendMessage(formPush, threadID);
  } catch (e) {
    console.error("Błąd w joinNoti:", e);
  }
};
