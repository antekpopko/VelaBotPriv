module.exports.config = {
  name: "votekick",
  version: "1.1.0",
  hasPermission: 2,
  credits: "ChatGPT + TY",
  description: "Głosowanie na wyrzucenie użytkownika z grupy (z limitem czasu)",
  commandCategory: "admin",
  usages: "[tag użytkownika] [liczba głosów]",
  cooldowns: 5
};

const activeVotes = new Map();

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const mentioned = Object.keys(event.mentions);
  if (mentioned.length === 0 || isNaN(args[1])) {
    return api.sendMessage("❗ Użycie: votekick @użytkownik liczba_głosów", threadID, event.messageID);
  }

  const targetID = mentioned[0];
  const targetName = event.mentions[targetID];
  const requiredVotes = parseInt(args[1]);

  const threadInfo = await api.getThreadInfo(threadID);
  if (!threadInfo.adminIDs.some(e => e.id == senderID)) {
    return api.sendMessage("❌ Tylko administratorzy mogą rozpocząć głosowanie.", threadID, event.messageID);
  }

  const msg = `📢 Rozpoczęto głosowanie na wyrzucenie ${targetName}!\n` +
              `✅ Aby zagłosować, zareaguj na tę wiadomość.\n` +
              `📊 Potrzebne głosy: ${requiredVotes}\n` +
              `⏳ Głosowanie trwa 2 minuty.`;

  api.sendMessage(msg, threadID, async (err, info) => {
    if (err) return;

    const voteID = `${threadID}_${info.messageID}`;
    activeVotes.set(voteID, {
      targetID,
      requiredVotes,
      voters: new Set(),
      messageID: info.messageID,
      threadID,
      timeout: setTimeout(async () => {
        const currentVote = activeVotes.get(voteID);
        if (currentVote && currentVote.voters.size < currentVote.requiredVotes) {
          await api.sendMessage(`⏳ Głosowanie zakończone. Nie osiągnięto wymaganej liczby głosów (${currentVote.voters.size}/${currentVote.requiredVotes}).`, threadID);
        }
        activeVotes.delete(voteID);
      }, 2 * 60 * 1000) // 2 minuty
    });

    global.client.handleReaction.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: senderID,
      voteID
    });
  });
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
  const { threadID, messageID, userID } = event;
  const voteID = handleReaction.voteID;

  const voteData = activeVotes.get(voteID);
  if (!voteData || voteData.messageID !== messageID || voteData.threadID !== threadID) return;
  if (voteData.voters.has(userID)) return;

  voteData.voters.add(userID);

  if (voteData.voters.size >= voteData.requiredVotes) {
    clearTimeout(voteData.timeout);
    await api.sendMessage(`✅ Wystarczająca liczba głosów (${voteData.voters.size})!\n👢 Użytkownik zostaje wyrzucony.`, threadID);
    await api.removeUserFromGroup(voteData.targetID, threadID);
    activeVotes.delete(voteID);
  }
};
