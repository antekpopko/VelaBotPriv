module.exports.config = {
  name: 'zglos',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'January Sakiewka',
  description: 'Zgłoś problem do administratora (wiadomość prywatna)',
  commandCategory: 'grupa',
  usages: '[treść zgłoszenia]',
  cooldowns: 5,
};

module.exports.run = function({ api, event, args }) {
  const zgłoszenie = args.join(' ');
  if (!zgłoszenie) {
    return api.sendMessage('❌ Podaj treść zgłoszenia.\nUżycie: zglos [treść]', event.threadID, event.messageID);
  }

  const adminIDs = ['61563352322805']; // ← wpisz tu swoje ID jako stringi

  const msg = `📨 Nowe zgłoszenie od użytkownika:
👤 ID: ${event.senderID}
💬 Wątek: ${event.threadID}
📝 Treść: ${zgłoszenie}`;

  for (let id of adminIDs) {
    api.sendMessage(msg, id, (err) => {
      if (err) {
        return api.sendMessage('❌ Nie udało się wysłać zgłoszenia do admina.', event.threadID, event.messageID);
      }
    });
  }

  return api.sendMessage('✅ Twoje zgłoszenie zostało wysłane do admina. Dziękujemy!', event.threadID, event.messageID);
};