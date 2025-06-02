module.exports.config = {
  name: "wybierz",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM + January",
  description: "Losowo wybiera jedną z opcji oddzielonych myślnikiem, średnikiem lub przecinkiem",
  commandCategory: "Narzędzia",
  usages: "[Opcja 1] - [Opcja 2] - [Opcja 3] ...",
  cooldowns: 5
};

module.exports.languages = {
  pl: {
    return: "🎲 Bot mówi: %1 to najlepszy wybór!",
    tooFew: "❗ Podaj przynajmniej dwie opcje!",
    noSeparator: "❗ Podaj kilka opcji oddzielonych myślnikiem (-), przecinkiem (,) lub średnikiem (;)\n📌 Przykład: pizza - sushi - burger"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  const { threadID, messageID } = event;

  const input = args.join(" ").trim();
  if (!/[-;,]/.test(input)) {
    return api.sendMessage(getText("noSeparator"), threadID, messageID);
  }

  const options = input
    .split(/[-;,]/) // dzieli po '-', ';' lub ','
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);

  if (options.length < 2) {
    return api.sendMessage(getText("tooFew"), threadID, messageID);
  }

  const choice = options[Math.floor(Math.random() * options.length)];
  return api.sendMessage(getText("return", choice), threadID, messageID);
};