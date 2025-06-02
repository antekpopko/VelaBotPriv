module.exports.config = {
  name: "antibd",
  eventType: ["log:user-nickname"],
  version: "1.0.1",
  credits: "January (PL wersja Islamick Chat Bot)",
  description: "Całkowicie blokuje zmianę nicku bota"
};

module.exports.run = async function ({ api, event, Users }) {
  const { logMessageData, threadID, author } = event;
  const botID = api.getCurrentUserID();
  const { BOTNAME, PREFIX } = global.config;

  if (logMessageData.participant_id == botID && author != botID) {
    const defaultNickname = `[ ${PREFIX} ] • ${BOTNAME || "BOT"}`;

    // Przywróć oryginalny nick
    try {
      await api.changeNickname(defaultNickname, threadID, botID);
    } catch (err) {
      console.error("Nie udało się zmienić nicku:", err);
    }

    // Pobierz nazwę użytkownika
    let name = "Ktoś";
    try {
      const info = await Users.getData(author);
      if (info?.name && info.name !== "Facebook User") name = info.name;
    } catch (e) {
      console.warn("Nie udało się pobrać danych użytkownika:", e);
    }

    return api.sendMessage(
      `${name}, nie próbuj zmieniać mojego nicku! 😼\nTylko ja decyduję, jak się nazywam.`,
      threadID
    );
  }
};