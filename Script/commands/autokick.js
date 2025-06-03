module.exports.config = {
  name: "autokick",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "January Sakiewka",
  description: "Wykrywa zbyt długie wiadomości i wyrzuca użytkownika",
  commandCategory: "Moderacja",
  usages: "Automatyczne wyrzucanie spamerów",
  cooldowns: 0,
  ignoredUsers: ["61575371644018"] // Lista ignorowanych ID
};

module.exports.handleEvent = async function ({ api, event }) {
  const maxLength = 1400;
  const { threadID, senderID, body, messageID } = event;

  if (!body || typeof body !== "string") return;
  const trimmedBody = body.trim();

  // Ignoruj jeśli nie przekracza limitu lub użytkownik jest na liście ignorowanych
  if (trimmedBody.length < maxLength || module.exports.config.ignoredUsers.includes(String(senderID))) return;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();

    // Sprawdź czy bot jest adminem
    const botIsAdmin = threadInfo.adminIDs.some(admin => admin.id == botID);
    if (!botIsAdmin) return;

    // Nie wyrzucaj innych adminów ani samego siebie
    const isSenderAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);
    if (isSenderAdmin || senderID == botID) return;

    // Wyrzuć użytkownika
    await api.removeUserFromGroup(senderID, threadID);

    api.sendMessage(
      `🚫 Użytkownik został wyrzucony za spamowanie wiadomością o długości ${trimmedBody.length} znaków.`,
      threadID
    );

    // (opcjonalnie) wyślij wiadomość prywatną
    try {
      await api.sendMessage(
        `Zostałeś wyrzucony z grupy za wysłanie zbyt długiej wiadomości (${trimmedBody.length} znaków).`,
        senderID
      );
    } catch (_) {
      // nie udało się wysłać prywatnej wiadomości – może ma wyłączone PM
    }
  } catch (err) {
    console.error(`[autokick] Błąd przy usuwaniu użytkownika (${senderID}):`, err);
  }
};

module.exports.run = () => {};
