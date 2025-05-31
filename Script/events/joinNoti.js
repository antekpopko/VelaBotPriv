module.exports.run = async function ({ api, event, Users }) {
  const { threadID, logMessageData } = event;

  // Jeśli bot został dodany do grupy 🤖
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const botNick = `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "BOT"}`;
    api.changeNickname(botNick, threadID, api.getCurrentUserID());

    return api.sendMessage({
      body: `🤖 Dziękuję za dodanie mnie do grupy!\n\n📜 Wpisz ${global.config.PREFIX}help, aby zobaczyć dostępne komendy.`,
      attachment: fs.createReadStream(path.join(__dirname, "cache", "ullash.mp4"))
    }, threadID);
  }

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;

    const names = [];
    const mentions = [];

    for (const participant of logMessageData.addedParticipants) {
      let name = participant.fullName;
      if (!name && typeof Users?.getNameUser === "function") {
        try {
          name = await Users.getNameUser(participant.userFbId);
        } catch (e) {
          name = "użytkowniku";
        }
      }
      name = name || "użytkowniku";
      names.push(name);
      mentions.push({ tag: name, id: participant.userFbId });
    }

    const msg = `👋 Witamy ${names.join(", ")}!\n\n🎉 Miło Cię widzieć w grupie ${threadName}! 💬`;

    const gifDir = path.join(__dirname, "cache", "joinGif", "randomgif");
    const gifFiles = fs.readdirSync(gifDir).filter(file => file.endsWith(".mp4") || file.endsWith(".gif"));

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