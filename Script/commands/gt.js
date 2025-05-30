module.exports.config = {
  name: "gt",
  version: "1.0",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Dodaje losowych członków z innej grupy do tej grupy.",
  commandCategory: "admin",
  usages: "[sourceThreadID] [ilość]",
  cooldowns: 5,
};

const getRandom = (arr, n) => {
  const result = [];
  const used = new Set();
  while (result.length < n && used.size < arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    if (!used.has(idx)) {
      result.push(arr[idx]);
      used.add(idx);
    }
  }
  return result;
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const [sourceID, limit] = args;

  if (!sourceID || isNaN(limit)) {
    return api.sendMessage("❗ Użycie: /grouptransfer [sourceThreadID] [ilość osób]", threadID, messageID);
  }

  try {
    const sourceInfo = await api.getThreadInfo(sourceID);
    const targetInfo = await api.getThreadInfo(threadID);

    const sourceMembers = Object.keys(sourceInfo.participantIDs);
    const targetMembers = new Set(targetInfo.participantIDs);

    const toAdd = getRandom(sourceMembers.filter(uid => !targetMembers.has(uid)), parseInt(limit));

    if (toAdd.length === 0) {
      return api.sendMessage("ℹ️ Brak użytkowników do dodania (wszyscy są już w tej grupie).", threadID, messageID);
    }

    let added = 0, failed = 0;

    for (const userID of toAdd) {
      try {
        await api.addUserToGroup(userID, threadID);
        added++;
      } catch (e) {
        failed++;
      }
    }

    return api.sendMessage(
      `✅ Dodano ${added} użytkowników.\n❌ Nie udało się dodać ${failed}.`,
      threadID,
      messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Wystąpił błąd podczas pobierania danych grupy lub dodawania członków.", threadID, messageID);
  }
};