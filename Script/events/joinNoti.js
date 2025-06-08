const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.6",
  credits: "CYBER BOT TEAM + January",
  description: "Krótkie powitanie z gifem/wideo (PL)",
};

module.exports.onLoad = function () {
  const gifFolder = path.join(__dirname, "cache", "joinGif", "randomgif");
  if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });
};

module.exports.run = async function ({ api, event }) {
  const { threadID, logMessageData } = event;

  // Bot został dodany do grupy
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const botNick = `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "BOT"}`;
    api.changeNickname(botNick, threadID, api.getCurrentUserID());

    const videoPath = path.join(__dirname, "cache", "ullash.mp4");
    const hasVideo = fs.existsSync(videoPath);

    return api.sendMessage({
      body: `🤖 Dzięki za dodanie mnie!\n📜 Wpisz ${global.config.PREFIX}help, by poznać komendy.`,
      attachment: hasVideo ? fs.createReadStream(videoPath) : undefined
    }, threadID);
  }

  // Z 60% szansą – witamy użytkowników
  if (Math.random() > 0.6) return;

  try {
    const participants = logMessageData.addedParticipants;
    const userInfo = await api.getUserInfo(participants.map(p => p.userFbId));
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "tej grupie";

    const names = [];
    const mentions = [];

    for (const p of participants) {
      const user = userInfo[p.userFbId];
      if (user?.name && user.name !== "Facebook User") {
        names.push(user.name);
        mentions.push({ tag: user.name, id: p.userFbId });
      }
    }

    let msg;
    if (names.length > 0) {
      msg = `👋 Witamy ${names.join(", ")}!\n🎉 Miło Cię widzieć w grupie ${threadName}!`;
    } else {
      msg = `👋 Witamy nowych członków w grupie ${threadName}!`;
    }

    const gifDir = path.join(__dirname, "cache", "joinGif", "randomgif");
    const gifFiles = fs.existsSync(gifDir)
      ? fs.readdirSync(gifDir).filter(f => f.endsWith(".mp4") || f.endsWith(".gif"))
      : [];

    const formPush = { body: msg };
    if (mentions.length > 0) formPush.mentions = mentions;
    if (gifFiles.length > 0) {
      const selected = gifFiles[Math.floor(Math.random() * gifFiles.length)];
      formPush.attachment = fs.createReadStream(path.join(gifDir, selected));
    }

    return api.sendMessage(formPush, threadID);
  } catch (e) {
    console.error("joinNoti: błąd:", e);
  }
};
