module.exports.config = {
  name: 'zglos',
  version: '1.0',
  permissions: 0,
  description: 'Zgłoś problem adminowi (wysyła prywatną wiadomość do admina)',
  usage: '[treść zgłoszenia]',
};

module.exports.run = async function({ args, api, event }) {
  const content = args.join(' ');
  if (!content) return api.sendMessage('❌ Podaj treść zgłoszenia.', event.threadID, event.messageID);

  // ID adminów - wpisz ID Facebook adminów, do których ma iść zgłoszenie
  const admins = ['61563352322805']; // przykładowe ID, zmień na swoje

  // Treść wiadomości dla admina
  const messageToAdmin = `
📢 Nowe zgłoszenie od użytkownika:
🔹 ID: ${event.senderID}
🔹 Wątek: ${event.threadID}

📝 Treść zgłoszenia:
${content}
  `;

  try {
    // Wysyłamy prywatną wiadomość do każdego admina
    for (const adminID of admins) {
      await api.sendMessage(messageToAdmin, adminID);
    }
    // Potwierdzenie dla użytkownika w wątku
    return api.sendMessage('✅ Twoje zgłoszenie zostało wysłane do adminów. Dziękujemy!', event.threadID, event.messageID);
  } catch (error) {
    console.error('Błąd podczas wysyłania zgłoszenia do admina:', error);
    return api.sendMessage('❌ Wystąpił błąd podczas wysyłania zgłoszenia. Spróbuj ponownie później.', event.threadID, event.messageID);
  }
};