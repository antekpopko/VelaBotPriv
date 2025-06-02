const cooldowns = {}; // przechowuje cooldowny użytkowników (w RAM)

module.exports.config = {
  name: 'zglos',
  version: '1.1',
  permissions: 0,
  description: 'Zgłoś problem adminowi (wysyła prywatną wiadomość do admina, z blokadą co 3 minuty)',
  usage: '[treść zgłoszenia]',
};

module.exports.run = async function({ args, api, event }) {
  const content = args.join(' ');
  const senderID = event.senderID;
  const now = Date.now();

  if (!content) return api.sendMessage('❌ Podaj treść zgłoszenia.', event.threadID, event.messageID);

  // ⏳ Cooldown: 3 minuty (180000 ms)
  if (cooldowns[senderID] && now - cooldowns[senderID] < 180000) {
    const waitTime = Math.ceil((180000 - (now - cooldowns[senderID])) / 1000);
    return api.sendMessage(`⏱️ Poczekaj ${waitTime}s przed kolejnym zgłoszeniem.`, event.threadID, event.messageID);
  }

  // 🔁 Zapisz czas ostatniego zgłoszenia
  cooldowns[senderID] = now;

  // 📥 Pobierz imię i nazwisko zgłaszającego
  let userName = 'Nieznany użytkownik';
  try {
    const userInfo = await api.getUserInfo(senderID);
    if (userInfo[senderID]) {
      userName = `${userInfo[senderID].name}`;
    }
  } catch (err) {
    console.error('Błąd pobierania danych użytkownika:', err);
  }

  // 📤 Lista ID adminów
  const admins = ['61563352322805']; // <- podmień na prawdziwe ID

  const messageToAdmin = `
📢 Nowe zgłoszenie od użytkownika:
👤 Imię i nazwisko: ${userName}
🆔 ID: ${senderID}
💬 Wątek (threadID): ${event.threadID}

📝 Treść zgłoszenia:
${content}
  `;

  try {
    for (const adminID of admins) {
      await api.sendMessage(messageToAdmin, adminID);
    }

    return api.sendMessage('✅ Twoje zgłoszenie zostało przesłane do admina. Dziękujemy!', event.threadID, event.messageID);
  } catch (error) {
    console.error('Błąd podczas wysyłania zgłoszenia:', error);
    return api.sendMessage('❌ Wystąpił błąd przy wysyłaniu zgłoszenia. Spróbuj ponownie później.', event.threadID, event.messageID);
  }
};