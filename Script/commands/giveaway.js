module.exports.config = {
  name: "giveaway",
  version: "0.0.1",
  hasPermission: 0,
  credits: "CYBER BOT TEAM",
  description: "Zarządzaj giveawayami: stwórz, dołącz, losuj zwycięzcę i zakończ",
  commandCategory: "fun",
  usages: "[create/details/join/roll/end] [IDGiveAway]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Users }) => {
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
      `🎉====== GiveAway ======\n` +
      `👤 Stworzony przez: ${authorName}\n` +
      `🎁 Nagroda: ${reward}\n` +
      `🆔 ID GiveAway: #${randomNumber}\n` +
      `✅ Zareaguj na tę wiadomość, aby dołączyć!`,
      threadID,
      (err, info) => {
        if (err) return;
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
        global.client.handleReaction.push({
          name: module.exports.config.name,
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
    if (!data) return api.sendMessage("❌ Podane ID giveaway nie istnieje.", threadID, event.messageID);

    return api.sendMessage(
      `🎉====== GiveAway ======\n` +
      `👤 Stworzony przez: ${data.author} (${data.authorID})\n` +
      `🎁 Nagroda: ${data.reward}\n` +
      `🆔 ID GiveAway: #${data.ID}\n` +
      `👥 Uczestnicy: ${data.joined.length}\n` +
      `📌 Status: ${data.status}`,
      threadID,
      event.messageID
    );

  } else if (subcommand === "join") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("🆔 Podaj ID giveaway, aby dołączyć.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.joined.includes(senderID)) return api.sendMessage("✅ Już dołączyłeś do tego giveaway.", threadID, event.messageID);

    data.joined.push(senderID);
    global.data.GiveAway.set(ID, data);

    const threadInfo = await api.getThreadInfo(threadID);
    const name = threadInfo.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;

    return api.sendMessage(`🎉 ${name} dołączył do giveaway o ID: #${ID}`, threadID, event.messageID);

  } else if (subcommand === "roll") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("🆔 Podaj ID giveaway, aby wylosować zwycięzcę.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("🚫 Nie jesteś organizatorem tego giveaway.", threadID, event.messageID);

    if (data.joined.length === 0) return api.sendMessage("❗ Nikt nie dołączył do tego giveaway.", threadID, event.messageID);

    const winnerID = data.joined[Math.floor(Math.random() * data.joined.length)];
    const userInfo = await Users.getInfo(winnerID);
    const name = userInfo.name;

    data.status = "ended";
    global.data.GiveAway.set(ID, data);

    return api.sendMessage({
      body: `🏆 Gratulacje ${name}! Wygrałeś giveaway o ID: #${data.ID}\n📩 Skontaktuj się z: ${data.author} (https://fb.me/${data.authorID})`,
      mentions: [{ tag: name, id: winnerID }]
    }, threadID, event.messageID);

  } else if (subcommand === "end") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("🆔 Podaj ID giveaway, aby zakończyć.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("❌ Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("🚫 Nie jesteś organizatorem tego giveaway.", threadID, event.messageID);

    data.status = "ended";
    global.data.GiveAway.set(ID, data);

    if (data.messageID) api.unsendMessage(data.messageID);
    return api.sendMessage(`🛑 Giveaway o ID: #${data.ID} został zakończony przez ${data.author}`, threadID, event.messageID);

  } else {
    return global.utils.throwError(this.config.name, threadID, event.messageID);
  }
};

module.exports.handleReaction = async function ({ api, event, Users, handleReaction }) {
  const { messageID, userID, threadID } = event;

  if (!handleReaction || !handleReaction.ID) return;

  const data = global.data.GiveAway.get(handleReaction.ID);
  if (!data || data.status !== "open") return;

  if (data.joined.includes(userID)) {
    return api.sendMessage("✅ Już jesteś zapisany do tego giveaway!", threadID);
  }

  const name = (await Users.getInfo(userID)).name;

  data.joined.push(userID);
  global.data.GiveAway.set(data.ID, data);

  return api.sendMessage(`🎉 ${name} dołączył(a) do giveaway #${data.ID}`, threadID);
};
