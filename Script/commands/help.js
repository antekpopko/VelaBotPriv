module.exports.config = {
  name: "help",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "January (przerobione przez ChatGPT)",
  description: "Wyświetla listę komend",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 20
  }
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  const { commands } = global.client;
  const prefix = global.config.PREFIX || "/";

  const isAdmin = event.hasPermssion && event.hasPermssion > 0;

  const userCommands = [];
  const adminCommands = [];

  for (const [name, cmd] of commands) {
    if (typeof cmd.config?.hasPermssion === "number") {
      if (cmd.config.hasPermssion === 0) userCommands.push(name);
      else if (cmd.config.hasPermssion > 0) adminCommands.push(name);
    }
  }

  userCommands.sort();
  adminCommands.sort();

  let msg = "📜 *Lista dostępnych komend*\n";
  msg += "──────────────────────────────\n\n";

  msg += `👥 *Komendy użytkownika* (${userCommands.length}):\n`;
  userCommands.forEach(cmd => {
    msg += `• \`${prefix}${cmd}\`\n`;
  });

  if (isAdmin && adminCommands.length > 0) {
    msg += `\n🔒 *Komendy administratora* (${adminCommands.length}):\n`;
    adminCommands.forEach(cmd => {
      msg += `• \`${prefix}${cmd}\`\n`;
    });
  }

  msg += "\n──────────────────────────────\n";
  msg += "_Użyj komendy z prefixem przed nazwą_\n";

  return api.sendMessage(msg, threadID, messageID);
};