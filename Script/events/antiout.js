module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "0.1.0",
  credits: "CYBER BOT TEAM (skrócona wersja: January)",
  description: "Automatyczny powrót użytkownika po wyjściu z grupy"
};

module.exports.run = async ({ event, api }) => {
  const { threadID, author, logMessageData } = event;
  const userID = logMessageData.leftParticipantFbId;

  if (userID === api.getCurrentUserID()) return; // Bot opuścił - ignoruj
  if (author !== userID) return; // Usunięto kogoś ręcznie - ignoruj

  let name = global.data.userName?.get(userID);
  if (!name) {
    try {
      const info = await api.getUserInfo(userID);
      const raw = info[userID]?.name;
      name = raw && raw !== "Facebook User" ? raw : "użytkownika";
    } catch {
      name = "użytkownika";
    }
  }

  api.addUserToGroup(userID, threadID, (err) => {
    const msg = err
      ? `❌ Nie udało się dodać ${name} z powrotem.`
      : `✅ ${name} wrócił do grupy.`;
    api.sendMessage(msg, threadID);
  });
};
