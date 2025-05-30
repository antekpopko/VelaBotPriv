module.exports.config = {
  name: "slots",
  version: "2.0",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Zagraj w sloty dla zabawy",
  commandCategory: "gry",
  usages: "[kwota (dla zabawy)]",
  cooldowns: 5,
};

module.exports.languages = {
  "pl": {
    "missingInput": "🎰 Podaj kwotę do postawienia (dla zabawy).",
    "invalidInput": "🎰 Wpisz poprawną, dodatnią liczbę!",
    "limitBet": "🎰 Minimalna kwota do postawienia to 50!",
    "returnWin": "🎰 %1 | %2 | %3 🎰\n🎉 Wygrałbyś %4$ (ale to tylko zabawa!)",
    "returnLose": "🎰 %1 | %2 | %3 🎰\n😢 Przegrałbyś %4$ (na szczęście to tylko zabawa!)"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const slotItems = ["🍇", "🍉", "🍊", "🍏", "7⃣", "🍓", "🍒", "🍌", "🥝", "🥑", "🌽"];

  let moneyBet = parseInt(args[0]);
  if (!args[0]) return api.sendMessage(getText("missingInput"), threadID, messageID);
  if (isNaN(moneyBet) || moneyBet <= 0) return api.sendMessage(getText("invalidInput"), threadID, messageID);
  if (moneyBet < 50) return api.sendMessage(getText("limitBet"), threadID, messageID);

  const number = [
    Math.floor(Math.random() * slotItems.length),
    Math.floor(Math.random() * slotItems.length),
    Math.floor(Math.random() * slotItems.length)
  ];

  const icons = [slotItems[number[0]], slotItems[number[1]], slotItems[number[2]]];
  let win = false;

  if (number[0] === number[1] && number[1] === number[2]) {
    moneyBet *= 9;
    win = true;
  } else if (number[0] === number[1] || number[0] === number[2] || number[1] === number[2]) {
    moneyBet *= 2;
    win = true;
  }

  const result = win
    ? getText("returnWin", icons[0], icons[1], icons[2], moneyBet)
    : getText("returnLose", icons[0], icons[1], icons[2], moneyBet);

  return api.sendMessage(result, threadID, messageID);
};