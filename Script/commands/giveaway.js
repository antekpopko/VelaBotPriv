module.exports.config = {
  name: "giveaway",
  version: "0.0.1",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Zarządzaj giveawayami: stwórz, dołącz, losuj zwycięzcę i zakończ",
  commandCategory: "fun",
  usages: "[create/details/join/roll/end] [IDGiveAway]",
  cooldowns: 5
};

module.exports.handleReaction = async ({ api, event, Users, handleReaction }) => {
  let data = global.data.GiveAway.get(handleReaction.ID);
  if (!data || data.status === "close" || data.status === "ended") return;

  if (event.reaction === undefined) {
    const index = data.joined.indexOf(event.userID);
    if (index !== -1) data.joined.splice(index, 1);
    global.data.GiveAway.set(handleReaction.ID, data);

    let value = await api.getThreadInfo(event.threadID);
    if (!value.nicknames[event.userID]) {
      value = (await Users.getInfo(event.userID)).name;
    } else {
      value = value.nicknames[event.userID];
    }

    return api.sendMessage(`${value} opuścił giveaway o ID: #${handleReaction.ID}`, event.userID);
  }

  if (!data.joined.includes(event.userID)) data.joined.push(event.userID);
  global.data.GiveAway.set(handleReaction.ID, data);

  let value = await api.getThreadInfo(event.threadID);
  if (!value.nicknames[event.userID]) {
    value = (await Users.getInfo(event.userID)).name;
  } else {
    value = value.nicknames[event.userID];
  }

  return api.sendMessage(`${value} dołączył do giveaway o ID: #${handleReaction.ID}`, event.userID);
};

module.exports.run = async ({ api, event, args, Users }) => {
  if (!global.data.GiveAway) global.data.GiveAway = new Map();

  const subcommand = args[0];
  const threadID = event.threadID;
  const senderID = event.senderID;

  if (subcommand === "create") {
    const reward = args.slice(1).join(" ");
    if (!reward) return api.sendMessage("Podaj nagrodę dla giveaway.", threadID, event.messageID);

    const randomNumber = (Math.floor(Math.random() * 100000) + 100000).toString().substring(1);
    let authorName;
    const threadInfo = await api.getThreadInfo(threadID);
    authorName = threadInfo.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;

    api.sendMessage(
      `====== GiveAway ======\n` +
      `Stworzony przez: ${authorName}\n` +
      `Nagroda: ${reward}\n` +
      `ID GiveAway: #${randomNumber}\n` +
      `Zareaguj na tę wiadomość, aby dołączyć!`,
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
    if (!ID) return api.sendMessage("Podaj ID giveaway, aby zobaczyć szczegóły.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("Podane ID giveaway nie istnieje.", threadID, event.messageID);

    return api.sendMessage(
      `====== GiveAway ======\n` +
      `Stworzony przez: ${data.author} (${data.authorID})\n` +
      `Nagroda: ${data.reward}\n` +
      `ID GiveAway: #${data.ID}\n` +
      `Liczba uczestników: ${data.joined.length}\n` +
      `Status: ${data.status}`,
      threadID,
      data.messageID
    );

  } else if (subcommand === "join") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("Podaj ID giveaway, aby dołączyć.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.joined.includes(senderID)) return api.sendMessage("Już dołączyłeś do tego giveaway.", threadID);

    data.joined.push(senderID);
    global.data.GiveAway.set(ID, data);

    let value = await api.getThreadInfo(threadID);
    value = value.nicknames?.[senderID] || (await Users.getInfo(senderID)).name;

    return api.sendMessage(`${value} dołączył do giveaway o ID: #${ID}`, threadID);

  } else if (subcommand === "roll") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("Podaj ID giveaway, aby wylosować zwycięzcę.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("Nie jesteś organizatorem tego giveaway.", threadID, event.messageID);

    if (data.joined.length === 0) return api.sendMessage("Nikt nie dołączył do tego giveaway.", threadID, event.messageID);

    const winnerID = data.joined[Math.floor(Math.random() * data.joined.length)];
    const userInfo = await Users.getInfo(winnerID);
    const name = userInfo.name;

    return api.sendMessage({
      body: `Gratulacje ${name}! Wygrałeś giveaway o ID: #${data.ID}\nSkontaktuj się z: ${data.author} (https://fb.me/${data.authorID})`,
      mentions: [{ tag: name, id: winnerID }]
    }, threadID, event.messageID);

  } else if (subcommand === "end") {
    const ID = args[1]?.replace("#", "");
    if (!ID) return api.sendMessage("Podaj ID giveaway, aby zakończyć.", threadID, event.messageID);

    const data = global.data.GiveAway.get(ID);
    if (!data) return api.sendMessage("Podane ID giveaway nie istnieje.", threadID, event.messageID);
    if (data.authorID !== senderID) return api.sendMessage("Nie jesteś organizatorem tego giveaway.", threadID, event.messageID);

    data.status = "ended";
    global.data.GiveAway.set(ID, data);

    api.unsendMessage(data.messageID);
    return api.sendMessage(`Giveaway o ID: #${data.ID} został zakończony przez ${data.author}`, threadID, event.messageID);

  } else {
    return global.utils.throwError(this.config.name, threadID, event.messageID);
  }
};
