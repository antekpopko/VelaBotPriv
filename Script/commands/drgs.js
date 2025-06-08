module.exports.config = {
  name: "drgs",
  version: "3.4",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Komenda w trakcie naprawy",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  const msg = "🚧⚙️ Komenda jest w trakcie naprawy, spróbuj później! ⚙️🚧";
  return api.sendMessage(msg, event.threadID, event.messageID);
};