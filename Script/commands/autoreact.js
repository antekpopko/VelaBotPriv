module.exports.config = {
  name: "autoreact",
  version: "1.2.0",
  hasPermission: 2,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + ChatGPT",
  description: "Bot automatycznie reaguje emoji na różne słowa",
  commandCategory: "No Prefix",
  usages: '[]',
  cooldowns: 0,
};

module.exports.handleEvent = function({ api, event }) {
  const { messageID, body } = event;
  if (!body) return;
  const msg = body.toLowerCase();

  const reactions = [
    { keywords: ["zboczeniec", "brudas", "zbok"], emoji: "🤮" },
    { keywords: ["kocham", "love", "uwielbiam"], emoji: "❤️" },
    { keywords: ["xd", "lol", "haha"], emoji: "😂" },
    { keywords: ["smutek", "przykro", "płacz"], emoji: "😢" },
    { keywords: ["super", "dobrze", "git"], emoji: "👍" },
    { keywords: ["idiota", "głupek", "debil"], emoji: "🙄" }
  ];

  for (const group of reactions) {
    if (group.keywords.some(word => msg.includes(word))) {
      return api.setMessageReaction(group.emoji, messageID, () => {}, true);
    }
  }
};

module.exports.run = function({}) {};
