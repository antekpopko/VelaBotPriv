const cooldowns = {}; // RAM: cooldowny użytkowników

module.exports.config = {
  name: "zglos",
  version: "1.1",
  hasPermssion: 0,
  credits: "January",
  description: "Zgłoś problem adminowi (wysyła prywatną wiadomość do admina)",
  commandCategory: "narzędzia",
  usages: "[treść zgłoszenia]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const content = args.join(' ');
  const senderID = event.senderID;
  const now = Date.now();

  if (!content) return api.sendMessage('❌ Podaj treść zgłoszenia.', event.threadID, event.messageID);

  if (cooldowns[senderID] && now - cooldowns[senderID] < 180000) {
    const waitTime = Math.ceil((180000 - (now - cooldowns[senderID])) / 1000);
    return api.sendMessage(`⏱️ Poczekaj ${waitTime}s przed kolejnym zgłoszeniem.`, event.threadID, event.messageID);
  }

  cooldowns[senderID] = now;

  let userName = 'Nieznany';
  try {
    const userInfo = await api.getUserInfo(senderID);
    if (userInfo[senderID]) userName = userInfo[senderID].name;
  } catch (err) {
    console.error("Błąd pobierania danych użytkownika:", err);
  }

  const admins = ['61563352322805']; // ← PODMIEN NA SWOJE ID

  const messageToAdmin = `
📢 Nowe zgłoszenie:
👤 ${userName} (${senderID})
💬 Wątek: ${event.threadID}

📝 Treść:
${content}
  `;

  try {
    for (const adminID of admins) {
      await api.sendMessage(messageToAdmin, adminID);
    }
    return api.sendMessage('✅ Zgłoszenie wysłane do admina.', event.threadID, event.messageID);
  } catch (err) {
    console.error('❌ Błąd zgłoszenia:', err);
    return api.sendMessage('❌ Wystąpił błąd. Spróbuj ponownie później.', event.threadID, event.messageID);
  }
};