module.exports.config = {
  name: "gt",
  version: "1.0.0",
  hasPermssion: 2, // wymagane uprawnienia admina bota
  credits: "CYBER ☢️_𖣘 -BOT TEAM_ ☢️",
  description: "Przenosi losowego użytkownika z innej grupy do tej grupy",
  commandCategory: "admin",
  usages: "<ID_źródłowej_grupy>",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, getText }) {
  const { threadID: targetThreadID, messageID } = event;

  if (!args[0]) return api.sendMessage("❌ Podaj ID źródłowej grupy, z której chcesz przenieść użytkownika.", targetThreadID, messageID);

  const sourceThreadID = args[0];

  try {
    // Pobierz listę członków z grupy źródłowej
    const sourceThreadInfo = await api.getThreadInfo(sourceThreadID);
    if (!sourceThreadInfo || !sourceThreadInfo.participantIDs || sourceThreadInfo.participantIDs.length === 0) {
      return api.sendMessage("❌ Nie udało się pobrać listy użytkowników z podanej grupy lub grupa jest pusta.", targetThreadID, messageID);
    }

    // Losowy wybór użytkownika, który nie jest botem (możesz rozszerzyć filtrowanie)
    const possibleUsers = sourceThreadInfo.participantIDs.filter(id => id != api.getCurrentUserID());
    if (possibleUsers.length === 0) {
      return api.sendMessage("❌ W grupie źródłowej nie znaleziono użytkowników do przeniesienia (oprócz bota).", targetThreadID, messageID);
    }

    const randomIndex = Math.floor(Math.random() * possibleUsers.length);
    const userToAdd = possibleUsers[randomIndex];

    // Próbujemy dodać użytkownika do docelowej grupy
    try {
      await api.addUserToGroup(userToAdd, targetThreadID);
      api.sendMessage(`✅ Użytkownik ${userToAdd} został pomyślnie dodany do tej grupy!`, targetThreadID, messageID);
      console.log(`✅ Dodano użytkownika ${userToAdd} z grupy ${sourceThreadID} do grupy ${targetThreadID}`);
    } catch (err) {
      console.error(`❌ Błąd przy dodawaniu użytkownika ${userToAdd}:`, err);
      const errorMessage = err && err.message ? err.message : JSON.stringify(err);
      api.sendMessage(`❌ Nie udało się dodać użytkownika ${userToAdd}: ${errorMessage}`, targetThreadID, messageID);
    }

  } catch (err) {
    console.error("❌ Błąd przy pobieraniu informacji o grupie źródłowej:", err);
    api.sendMessage("❌ Wystąpił błąd podczas pobierania danych grupy źródłowej.", targetThreadID, messageID);
  }
};
