module.exports.config = {
  name: "autokick",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "January Sakiewka",
  description: "Wykrywa zbyt długie wiadomości i wyrzuca użytkownika",
  commandCategory: "Moderacja",
  usages: "Automatyczne wyrzucanie spamerów",
  cooldowns: 0,
  ignoredUsers: ["61575371644018"] // dodajemy ignorowanych użytkowników
};

module.exports.handleEvent = async function ({ api, event }) {
  const maxLength = 1400; // limit znaków
  const { threadID, senderID, body, messageID } = event;

  // Ignoruj wiadomości od użytkowników na liście ignorowanych
  if (module.exports.config.ignoredUsers.includes(String(senderID))) return;

  if (!body || body.length < maxLength) return;

  try {
    // sprawdź, czy bot jest adminem
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const botIsAdmin = threadInfo.adminIDs.some(e => e.id == botID);

    if (!botIsAdmin) return;

    // wyrzucenie użytkownika
    await api.removeUserFromGroup(senderID, threadID);
    api.sendMessage(`Użytkownik został wyrzucony za spam (${body.length} znaków).`, threadID);
  } catch (err) {
    console.error("Błąd przy usuwaniu użytkownika:", err);
  }
};

module.exports.run = () => {};