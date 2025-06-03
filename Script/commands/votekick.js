const fs = require("fs");

module.exports.config = {
  name: "votekick",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "January Sakiewka",
  description: "Rozpoczyna głosowanie na wyrzucenie członka grupy",
  commandCategory: "Grupa",
  usages: "[@osoba] [liczba głosów]",
  cooldowns: 5
};

let activeVotes = {}; // { threadID: { targetID, voteCount, requiredVotes, voters } }

module.exports.run = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const senderID = event.senderID;

  if (!event.isGroup) return api.sendMessage("Ta komenda działa tylko w grupach.", threadID);

  if (args.length < 2 || event.mentions == undefined)
    return api.sendMessage("Użycie: votekick @osoba liczba_głosów", threadID);

  const mention = Object.keys(event.mentions)[0];
  const requiredVotes = parseInt(args[args.length - 1]);

  if (isNaN(requiredVotes) || requiredVotes < 1)
    return api.sendMessage("Podaj poprawną liczbę głosów potrzebnych do wyrzucenia.", threadID);

  if (mention == senderID)
    return api.sendMessage("Nie możesz głosować na samego siebie.", threadID);

  activeVotes[threadID] = {
    targetID: mention,
    voteCount: 0,
    requiredVotes,
    voters: new Set()
  };

  return api.sendMessage(
    `🗳️ Rozpoczęto głosowanie na wyrzucenie:\n👤 ${event.mentions[mention].replace("@", "")}\n✅ Potrzebne głosy: ${requiredVotes}\n\nOdpowiedz na tę wiadomość znakiem \`+\` aby zagłosować.`,
    threadID,
    (err, info) => {
      activeVotes[threadID].messageID = info.messageID;
    }
  );
};

module.exports.handleReply = async ({ api, event }) => {
  const threadID = event.threadID;
  const replyID = event.messageReply?.messageID;
  const userID = event.senderID;
  const body = event.body?.trim();

  if (!activeVotes[threadID]) return;
  if (replyID !== activeVotes[threadID].messageID) return;
  if (body !== "+") return;
  if (activeVotes[threadID].voters.has(userID)) return api.sendMessage("Już zagłosowałeś!", threadID);

  activeVotes[threadID].voteCount++;
  activeVotes[threadID].voters.add(userID);

  if (activeVotes[threadID].voteCount >= activeVotes[threadID].requiredVotes) {
    const targetID = activeVotes[threadID].targetID;
    delete activeVotes[threadID];

    try {
      await api.removeUserFromGroup(targetID, threadID);
      return api.sendMessage("✅ Głosowanie zakończone. Użytkownik został wyrzucony z grupy.", threadID);
    } catch (e) {
      return api.sendMessage("❌ Nie udało się wyrzucić użytkownika. Czy bot ma uprawnienia admina?", threadID);
    }
  } else {
    return api.sendMessage(
      `✅ Zagłosowano! (${activeVotes[threadID].voteCount}/${activeVotes[threadID].requiredVotes})`,
      threadID
    );
  }
};
