module.exports.config = {
  name: "autoreact",
  version: "1.1.1",
  hasPermission: 2,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Bot React",
  commandCategory: "No Prefix",
  usages: '[]',
  cooldowns: 0,
};

module.exports.handleEvent = function({ api, event }) {
  const { threadID, messageID, body } = event;
  const react = body?.toLowerCase() || "";

  if (react.includes("zboczeniec")) {
    api.setMessageReaction("🤮", messageID, (err) => {}, true);
  }
};

module.exports.run = function({ api, event }) {};
