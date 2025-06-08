module.exports.config = {
  name: "votekick",
  version: "1.0.2",
  hasPermission: 2,
  credits: "ChatGPT + user",
  description: "Rozpocznij głosowanie na wyrzucenie użytkownika",
  commandCategory: "group",
  usages: "@użytkownik liczba_głosów",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID, messageID, mentions } = event;
  const mentioned = Object.keys(mentions);
  const voteCount = parseInt(args[args.length - 1]);

  if (mentioned.length === 0 || isNaN(voteCount)) {
    return api.sendMessage("❗ Użycie: votekick @użytkownik liczba_głosów", threadID, messageID);
  }

  const threadInfo = await api.getThreadInfo(threadID);
  const admins = threadInfo.adminIDs.map(a => a.id);

  if (!admins.includes(senderID)) {
    return api.sendMessage("🚫 Tylko administrator grupy może rozpocząć głosowanie.", threadID, messageID);
  }

  const targetID = mentioned[0];
  const targetName = mentions[targetID].replace("@", "");

  if (admins.includes(targetID)) {
    return api.sendMessage("⚠️ Nie można głosować na administratora.", threadID, messageID);
  }

  if (voteCount < 4 || voteCount > threadInfo.participantIDs.length - 1) {
    return api.sendMessage("❗ Liczba głosów musi być większa niż 3 i mniejsza niż liczba członków grupy.", threadID, messageID);
  }

  const msg = await api.sendMessage(
    `🗳️ Głosowanie o wyrzucenie rozpoczęte!\n👤 Cel: ${targetName}\n✅ Potrzebne głosy: ${voteCount}\n⏱️ Czas: 2 minuty\n\nZareaguj na tę wiadomość, aby oddać głos.`,
    threadID
  );

  const voteData = {
    name: this.config.name,
    messageID: msg.messageID,
    threadID,
    targetID,
    required: voteCount,
    voters: []
  };

  global.client.handleReaction.push(voteData);

  // Automatyczne zakończenie po 2 minutach
  setTimeout(() => {
    const index = global.client.handleReaction.findIndex(e => e.messageID === msg.messageID);
    if (index !== -1) {
      global.client.handleReaction.splice(index, 1);
      api.sendMessage("⌛ Głosowanie zakończone — nie osiągnięto wymaganej liczby głosów.", threadID);
    }
  }, 2 * 60 * 1000);
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
  const { threadID, userID } = event;
  const data = handleReaction;

  if (userID === data.targetID) return; // cel nie może głosować na siebie
  if (data.voters.includes(userID)) return; // jeden głos na osobę

  data.voters.push(userID);
  const currentVotes = data.voters.length;

  api.sendMessage(`🗳️ Oddano głos (${currentVotes}/${data.required})`, threadID);

  if (currentVotes >= data.required) {
    try {
      await api.removeUserFromGroup(data.targetID, threadID);
      api.sendMessage(`✅ Cel osiągnięty — użytkownik został usunięty z grupy.`, threadID);
    } catch (err) {
      api.sendMessage("⚠️ Nie udało się wyrzucić użytkownika (być może jest administratorem lub został już usunięty).", threadID);
    }

    // Usuń głosowanie
    const index = global.client.handleReaction.findIndex(e => e.messageID === data.messageID);
    if (index !== -1) global.client.handleReaction.splice(index, 1);
  }
};