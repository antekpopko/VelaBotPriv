module.exports.config = {
  name: "autoreact",
  version: "1.4.0",
  hasPermission: 2,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + ChatGPT",
  description: "Bot automatycznie reaguje emoji na różne słowa (dużo słów i losowe emoji)",
  commandCategory: "No Prefix",
  usages: '[]',
  cooldowns: 0,
};

module.exports.handleEvent = function({ api, event }) {
  const { messageID, body } = event;
  if (!body) return;
  const msg = body.toLowerCase();

  const reactions = [
    { 
      keywords: ["zboczeniec", "brudas", "zbok", "perwers", "przekręt", "łajdak", "skurwiel", "podły"], 
      emojis: ["🤮", "🤢", "😡", "🤬", "👿", "😤"] 
    },
    { 
      keywords: ["kocham", "love", "uwielbiam", "serce", "❤", "♥️", "💕", "😍", "miłość", "romantyczny"], 
      emojis: ["❤️", "😍", "🥰", "💖", "💞", "💘"] 
    },
    { 
      keywords: ["xd", "lol", "haha", "hehe", "😂", "🤣", "rofl", "lmao", "śmiech", "haha"], 
      emojis: ["😂", "🤣", "😆", "😹", "😄", "😝"] 
    },
    { 
      keywords: ["smutek", "przykro", "płacz", "😭", "😢", "zły", "nie fajnie", "żałosne", "łza", "rozczarowanie"], 
      emojis: ["😢", "😭", "😞", "😔", "😟", "😩"] 
    },
    { 
      keywords: ["super", "dobrze", "git", "ok", "👌", "👍", "świetnie", "brawo", "dobra robota", "wow", "extra"], 
      emojis: ["👍", "👌", "😎", "🙌", "👏", "🤩"] 
    },
    { 
      keywords: ["idiota", "głupek", "debil", "kretyn", "dureń", "baran", "ciemny", "niekumaty", "głupi"], 
      emojis: ["🙄", "😒", "😤", "🤦‍♂️", "🤦‍♀️", "🤷‍♂️"] 
    },
    { 
      keywords: ["cwel", "pedal", "pajac", "śmieszek", "troll", "świr", "wariatek"], 
      emojis: ["😝", "😜", "😛", "🤡", "🙃", "😈"] 
    },
    {
      keywords: ["hej", "siema", "cześć", "elo", "witam", "yo", "hejka", "hello"], 
      emojis: ["👋", "😊", "😄", "🙌", "🤗", "👍"] 
    },
    {
      keywords: ["dzięki", "dzieki", "thx", "thanks", "dzień dobry", "dobry wieczór"], 
      emojis: ["🙏", "🤝", "😊", "👍", "💐", "🌸"] 
    },
    {
      keywords: ["smacznego", "na zdrowie", "życie", "toast", "impreza"], 
      emojis: ["🍻", "🥂", "🍷", "🎉", "🎊", "🍹"] 
    },
    {
      keywords: ["przepraszam", "sorry", "wybacz", "mój błąd", "mea culpa"], 
      emojis: ["🙏", "😔", "🙇‍♂️", "🙇‍♀️", "😞"] 
    }
  ];

  for (const group of reactions) {
    if (group.keywords.some(word => msg.includes(word))) {
      const randomEmoji = group.emojis[Math.floor(Math.random() * group.emojis.length)];
      return api.setMessageReaction(randomEmoji, messageID, () => {}, true);
    }
  }
};

module.exports.run = function({}) {};