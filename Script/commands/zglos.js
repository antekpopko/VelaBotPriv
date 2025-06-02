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

module.exports.run = async function({ api, event, args }) {
  const zgłoszenie = args.join(' ');
  if (!zgłoszenie) {
    return api.sendMessage('❌ Podaj treść zgłoszenia.\nUżycie: zglos [treść]', event.threadID, event.messageID);
  }

  // 👉 Wpisz tutaj prawdziwe ID adminów
  const adminIDs = ['61563352322805']; // Zmień na własne UID

  const msg = `📨 Nowe zgłoszenie od użytkownika:
👤 ID: ${event.senderID}
📍 Wątek ID: ${event.threadID}
📝 Treść zgłoszenia: ${zgłoszenie}`;

  let sukces = 0, blad = 0;

  for (const id of adminIDs) {
    await api.sendMessage(msg, id, (err) => {
      if (err) {
        console.error(`[zglos] ❌ Błąd przy wysyłaniu do admina ${id}:`, err);
        blad++;
      } else {
        sukces++;
      }

      if (sukces + blad === adminIDs.length) {
        if (sukces > 0) {
          api.sendMessage('✅ Twoje zgłoszenie zostało wysłane do administratora.', event.threadID, event.messageID);
        } else {
          api.sendMessage('❌ Nie udało się wysłać zgłoszenia. Skontaktuj się bezpośrednio z administracją.', event.threadID, event.messageID);
        }
      }
    });
  }
};