module.exports.config = {
  name: "autoreact",
  version: "1.1.1",
  hasPermission: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Bot automatycznie reaguje na brzydkie słowa",
  commandCategory: "No Prefix",
  usages: '[]',
  cooldowns: 0,
};

module.exports.handleEvent = function({ api, event }) {
  const { messageID, body } = event;
  const react = body?.toLowerCase() || "";

  const triggerWords = ["zboczeniec", "brudas", "zbok"];
  const shouldReact = triggerWords.some(word => react.includes(word));

  if (shouldReact) {
    api.setMessageReaction("🤮", messageID, () => {}, true);
  }
};

module.exports.run = function({}) {};
