const fs = require("fs");

module.exports.config = {
  name: "votekick",
  version: "1.2.0",
  hasPermssion: 1,
  credits: "January Sakiewka",
  description: "Głosowanie na wyrzucenie użytkownika przez reakcje",
  commandCategory: "Grupa",
  usages: "votekick @osoba liczba_głosów",
  cooldowns: 5
};

let activeVotes = {}; // { threadID: { targetID, requiredVotes, voters, messageID } }

module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID, mentions, isGroup } = event;

  if (!isGroup) return api.sendMessage("❌ Ta komenda działa tylko w grupach.", threadID);

  // Sprawdzenie czy nadawca to admin
  const threadInfo = await api.getThreadInfo(threadID);
  const adminIDs = threadInfo.adminIDs.map(a => a.id);
  if (!adminIDs.includes(senderID)) return api.sendMessage("❌ Tylko administratorzy mogą rozpocząć głosowanie.", threadID);

  if (args.length < 2 || Object.keys(mentions).length === 0)
    return api.sendMessage("ℹ️ Użycie: votekick @osoba liczba_głosów", threadID);

  const mentionID = Object.keys(mentions)[0];
  const requiredVotes = parseInt(args[args.length - 1]);

  if (isNaN(requiredVotes) || requiredVotes < 1)
    return api.sendMessage("❌ Podaj poprawną liczbę głosów potrzebnych do wyrzucenia.", threadID);

  activeVotes[threadID] = {
    targetID: mentionID,
    requiredVotes,
    voters: new Set()
  };

  return api.sendMessage(
    `🗳️ Głosowanie rozpoczęte!\n👤 Użytkownik: ${mentions[mentionID].replace("@", "")}\n📊 Wymagane głosy: ${requiredVotes}\n\nDodaj **dowolną reakcję** do tej wiadomości, aby zagłosować.`,
    threadID,
    async (err, info) => {
      if (err) return console.error(err);
      activeVotes[threadID].messageID = info.messageID;
    }
  );
};

module.exports.handleReaction = async ({ api, event }) => {
  const { threadID, messageID, userID } = event;

  if (!activeVotes[threadID]) return;
  if (messageID !== activeVotes[threadID].messageID) return;
  if (activeVotes[threadID].voters.has(userID)) return;

  activeVotes[threadID].voters.add(userID);

  const currentVotes = activeVotes[threadID].voters.size;
  const required = activeVotes[threadID].requiredVotes;

  if (currentVotes >= required) {
    const targetID = activeVotes[threadID].targetID;
    delete activeVotes[threadID];

    try {
      await api.removeUserFromGroup(targetID, threadID);
      return api.sendMessage("✅ Głosowanie zakończone! Użytkownik został wyrzucony z grupy.", threadID);
    } catch (err) {
      return api.sendMessage("❌ Nie udało się wyrzucić użytkownika. Czy bot ma uprawnienia administratora?", threadID);
    }
  } else {
    return api.sendMessage(`📥 Głos zaakceptowany! (${currentVotes}/${required})`, threadID);
  }
};
