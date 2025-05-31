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

  // Nowy użytkownik został dodany 👋
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;

    const names = await Promise.all(logMessageData.addedParticipants.map(async (p) => {
      return p.fullName || await Users.getNameUser(p.userFbId) || "użytkowniku";
    }));

    const mentions = await Promise.all(logMessageData.addedParticipants.map(async (p, index) => {
      const name = p.fullName || await Users.getNameUser(p.userFbId) || "użytkowniku";
      return { tag: name, id: p.userFbId };
    }));

    let msg = `👋 Witamy ${names.join(", ")}!\n\n🎉 Miło Cię widzieć w grupie ${threadName}! 💬`;

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