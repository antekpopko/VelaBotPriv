const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.4",
  credits: "CYBER BOT TEAM (polonizacja: January)",
  description: "Wiadomość powitalna z losowym gifem lub wideo (PL)",
};

module.exports.onLoad = function () {
  const gifFolder = path.join(__dirname, "cache", "joinGif", "randomgif");
  if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;

  // Jeśli bot został dodany do grupy 🤖
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const botNick = `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "BOT"}`;
    api.changeNickname(botNick, threadID, api.getCurrentUserID());

    const videoPath = path.join(__dirname, "cache", "ullash.mp4");
    const hasVideo = fs.existsSync(videoPath);

    return api.sendMessage({
      body: `🤖 Dziękuję za dodanie mnie do grupy!\n\n📜 Wpisz ${global.config.PREFIX}help, aby zobaczyć dostępne komendy.`,
      attachment: hasVideo ? fs.createReadStream(videoPath) : undefined
    }, threadID);
  }

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;

    const names = logMessageData.addedParticipants.map(p => p.fullName || "użytkowniku");
    const mentions = logMessageData.addedParticipants.map(p => ({
      tag: p.fullName || "użytkowniku",
      id: p.userFbId
    }));

    const msg = `👋 Witamy ${names.join(", ")}!\n\n🎉 Miło Cię widzieć w grupie ${threadName}! 💬`;

    const gifDir = path.join(__dirname, "cache", "joinGif", "randomgif");
    const gifFiles = fs.existsSync(gifDir) ? fs.readdirSync(gifDir).filter(file => file.endsWith(".mp4") || file.endsWith(".gif")) : [];

    const formPush = { body: msg, mentions };

    if (gifFiles.length > 0) {
      const selected = gifFiles[Math.floor(Math.random() * gifFiles.length)];
      formPush.attachment = fs.createReadStream(path.join(gifDir, selected));
    }

    return api.sendMessage(formPush, threadID);
  } catch (e) {
    console.error("Błąd w joinNoti:", e);
  }
};