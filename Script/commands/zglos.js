module.exports.config = {
  name: 'zglos',
  version: '1.0',
  permissions: 0,
  description: 'Zgłoś problem adminowi (wysyła prywatną wiadomość do admina)',
  usage: '[treść zgłoszenia]',
  credits: 'January Sakiewka'
};

module.exports.run = async function({ args, api, event }) {
  const content = args.join(' ');
  if (!content) {
    return api.sendMessage('❌ Podaj treść zgłoszenia.\nUżycie: zglos [treść]', event.threadID, event.messageID);
  }

  // Wprowadź tutaj ID adminów (jako stringi!)
  const adminIDs = ['61563352322805']; // ← ZMIEŃ na prawidłowe ID adminów!

  const messageToAdmin = `📢 Nowe zgłoszenie od użytkownika:
👤 ID: ${event.senderID}
💬 Wątek: ${event.threadID}
📝 Treść: ${content}`;

  try {
    for (const adminID of adminIDs) {
      await api.sendMessage(messageToAdmin, adminID);
    }

    return api.sendMessage('✅ Twoje zgłoszenie zostało wysłane do adminów. Dziękujemy!', event.threadID, event.messageID);
  } catch (err) {
    console.error('Błąd podczas wysyłania wiadomości do admina:', err);
    return api.sendMessage('❌ Wystąpił błąd przy wysyłaniu zgłoszenia:\n' + err.message, event.threadID, event.messageID);
  }
};