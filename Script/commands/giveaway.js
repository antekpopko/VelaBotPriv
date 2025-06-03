module.exports.config = {
  name: "giveaway",
  version: "0.0.1",
  hasPermission: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + poprawki ChatGPT",
  description: "Zarządzaj giveawayami: stwórz, dołącz, losuj zwycięzcę i zakończ",
  commandCategory: "fun",
  usages: "[create/details/join/roll/end] [IDGiveAway]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Users, client }) => {
  if (!global.data.GiveAway) global.data.GiveAway = new Map();

  const subcommand = args[0];
  const threadID = event.threadID;
  const senderID = event.senderID;

  if (subcommand === "create") {
    const reward = args.slice(1).join(" ");
    if (!reward) return api.sendMessage("🎁 Podaj nagrodę dla giveaway.", threadID, event.messageID);

    const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const threadInfo = await api.getThreadInfo(threadID);
    const authorName = threadInfo.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;

    api.sendMessage(
      `🎉====== GIVEAWAY ======🎉\n` +
      `👤 Organizator: ${authorName}\n` +
      `🎁 Nagroda: ${reward}\n` +
      `🆔 ID: #${randomNumber}\n` +
      `✅ Zareaguj na tę wiadomość, aby dołączyć!`,
      threadID,
      (err, info) => {
        const dataGA = {
          ID: randomNumber,
          author: authorName,
          authorID: senderID,
          messageID: info.messageID,
          reward: reward,
          joined: [],
          status: "open"
        };
        global.data.GiveAway.set(randomNumber, dataGA);
        client.handleReaction.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          ID: randomNumber
        });
      }
    );

  } else if (subcommand === "details") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("ℹ️ Podaj ID giveaway, aby zobaczyć szczegóły.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Nie znaleziono giveaway z tym ID.", threadID, event.messageID);

    return api.sendMessage(
      `🎉====== GIVEAWAY ======🎉\n` +
      `👤 Organizator: ${data.author} (${data.authorID})\n` +
      `🎁 Nagroda: ${data.reward}\n` +
      `🆔 ID: #${data.ID}\n` +
      `👥 Uczestnicy: ${data.joined.length}\n` +
      `📌 Status: ${data.status}`,
      threadID,
      event.messageID
    );

  } else if (subcommand === "join") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("✋ Podaj ID giveaway, aby dołączyć.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Nie znaleziono giveaway z tym ID.", threadID, event.messageID);
    if (data.joined.includes(senderID)) return api.sendMessage("✅ Już dołączyłeś do tego giveaway.", threadID, event.messageID);

    data.joined.push(senderID);
    global.data.GiveAway.set(ID, data);

    const name = (await Users.getInfo(senderID)).name;
    return api.sendMessage(`✅ ${name} dołączył(a) do giveaway o ID: #${ID}`, threadID, event.messageID);

  } else if (subcommand === "roll") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("🎲 Podaj ID giveaway do losowania zwycięzcy.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Nie znaleziono giveaway z tym ID.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("🚫 Tylko organizator może losować zwycięzcę.", threadID, event.messageID);
    if (data.joined.length === 0) return api.sendMessage("😢 Nikt nie dołączył do giveaway.", threadID, event.messageID);

    const winnerID = data.joined[Math.floor(Math.random() * data.joined.length)];
    const winnerInfo = await Users.getInfo(winnerID);
    const name = winnerInfo.name;

    data.status = "ended";
    global.data.GiveAway.set(ID, data);

    return api.sendMessage({
      body: `🎉 Gratulacje ${name}! Wygrałeś giveaway o ID: #${data.ID}\n📞 Skontaktuj się z: ${data.author} (https://fb.me/${data.authorID})`,
      mentions: [{ tag: name, id: winnerID }]
    }, threadID, event.messageID);

  } else if (subcommand === "end") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("📛 Podaj ID giveaway do zakończenia.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Nie znaleziono giveaway z tym ID.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("🚫 Tylko organizator może zakończyć giveaway.", threadID, event.messageID);

    data.status = "ended";
    global.data.GiveAway.set(ID, data);

    if (data.messageID) api.unsendMessage(data.messageID);
    return api.sendMessage(`🛑 Giveaway #${data.ID} został zakończony przez ${data.author}`, threadID, event.messageID);

  } else {
    return api.sendMessage("❓ Nieznana subkomenda. Użycie: create/details/join/roll/end", threadID, event.messageID);
  }
};

module.exports.handleReaction = async function ({ event, api, Users }) {
  const { messageID, userID, threadID } = event;

  for (let [, data] of global.data.GiveAway) {
    if (data.messageID === messageID && data.status === "open") {
      if (data.joined.includes(userID)) {
        return api.sendMessage("✅ Już dołączyłeś do tego giveaway!", threadID);
      }

      data.joined.push(userID);
      global.data.GiveAway.set(data.ID, data);

      const name = (await Users.getInfo(userID)).name;
      return api.sendMessage(`✅ ${name} dołączył(a) do giveaway o ID: #${data.ID}`, threadID);
    }
  }
};
