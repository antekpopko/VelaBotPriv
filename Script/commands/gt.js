module.exports.config = {
  name: "gt",
  version: "1.0",
  hasPermssion: 1,
  credits: "ChatGPT + January Sakiewka",
  description: "Losowo dodaje 1 użytkownika z innej grupy do Twojej grupy",
  commandCategory: "admin",
  usages: "[sourceThreadID]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID: targetThreadID, messageID } = event;
  if (!args[0]) {
    return api.sendMessage("❗ Podaj ID grupy, z której chcesz przenieść użytkownika. Przykład:\n/transferuser 1234567890123456", targetThreadID, messageID);
  }

  const sourceThreadID = args[0];
  try {
    // Pobierz listę członków z grupy źródłowej
    const data = await api.getThreadInfo(sourceThreadID);
    if (!data || !data.participantIDs || data.participantIDs.length === 0) {
      return api.sendMessage("❌ Nie udało się pobrać użytkowników z podanej grupy lub grupa jest pusta.", targetThreadID, messageID);
    }

    // Losowo wybierz 1 użytkownika spośród uczestników, który nie jest botem (czyli nie jest Twoim ID)
    const botID = api.getCurrentUserID(); // ID konta bota
    const candidates = data.participantIDs.filter(id => id !== botID);
    if (candidates.length === 0) {
      return api.sendMessage("❌ Brak użytkowników do dodania (poza botem).", targetThreadID, messageID);
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const userToAdd = candidates[randomIndex];

    // Spróbuj dodać użytkownika do Twojej grupy
    try {
      await api.addUserToGroup(userToAdd, targetThreadID);
      api.sendMessage(`✅ Użytkownik ${userToAdd} został pomyślnie dodany do tej grupy!`, targetThreadID, messageID);
      console.log(`✅ Dodano użytkownika ${userToAdd} z grupy ${sourceThreadID} do grupy ${targetThreadID}`);
    } catch (err) {
      api.sendMessage(`❌ Nie udało się dodać użytkownika ${userToAdd}: ${err.message}`, targetThreadID, messageID);
      console.log(`❌ Błąd przy dodawaniu użytkownika ${userToAdd}:`, err);
    }

  } catch (error) {
    console.log("❌ Błąd przy pobieraniu uczestników grupy:", error);
    return api.sendMessage("❌ Wystąpił błąd podczas pobierania uczestników grupy źródłowej.", targetThreadID, messageID);
  }
};