module.exports.config = {
  name: "help",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "January (przerobione przez ChatGPT)",
  description: "Wyświetla listę komend",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const prefix = global.config.PREFIX || "/";

  // Pobierz wszystkie komendy
  const allCommands = [...global.client.commands.values()];

  // Podziel na user/admin wg hasPermssion
  const userCommands = allCommands
    .filter(cmd => cmd.config.hasPermssion === 0)
    .map(cmd => `• ${prefix}${cmd.config.name}`)
    .sort();

  const adminCommands = allCommands
    .filter(cmd => cmd.config.hasPermssion > 0)
    .map(cmd => `• ${prefix}${cmd.config.name}`)
    .sort();

  // Sprawdź, czy user jest adminem (czyli ma jakieś admin perm w event)
  const isAdmin = event.hasPermssion && event.hasPermssion > 0;

  // Budujemy wiadomość
  let msg = "📜 Lista dostępnych komend\n";
  msg += "──────────────────────────────\n\n";
  msg += `👥 Komendy użytkownika (${userCommands.length}):\n\n`;
  msg += userCommands.join("\n") + "\n";

  if (isAdmin && adminCommands.length > 0) {
    msg += "\n🔒 Komendy administratora (" + adminCommands.length + "):\n\n";
    msg += adminCommands.join("\n") + "\n";
  }

  msg += "\n──────────────────────────────\n";
  msg += "ℹ️ Użyj prefixu przed nazwą komendy";

  return api.sendMessage(msg, threadID, messageID);
};