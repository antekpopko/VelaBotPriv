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
    api.changeNickname(defaultNickname, threadID, botID);

    // Pobierz nazwę użytkownika
    const info = await Users.getData(author);
    const name = info?.name || "Ktoś";

    return api.sendMessage(
      `${name}, nie próbuj zmieniać mojego nicku! 😼\nTylko ja decyduję, jak się nazywam.`,
      threadID
    );
  }
};
