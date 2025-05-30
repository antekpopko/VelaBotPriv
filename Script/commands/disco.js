module.exports.config = {
  name: "disco",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Zmienia kolor rozmowy losowo, określoną liczbę razy (max 25)",
  commandCategory: "System",
  usages: "tęcza [liczba_zmian]",
  cooldowns: 0,
  dependencies: []
};

module.exports.run = async ({ api, event, args }) => {
  var value = args[0];
  if (isNaN(value)) 
    return api.sendMessage("To nie jest liczba!", event.threadID, event.messageID);

  if (value > 25) 
    return api.sendMessage("Maksymalna liczba zmian to 25!", event.threadID, event.messageID);

  if (value < 1)
    return api.sendMessage("Podaj liczbę większą od 0!", event.threadID, event.messageID);

  var kolory = [
    '196241301102133', '169463077092846', '2442142322678320', '234137870477637', 
    '980963458735625', '175615189761153', '2136751179887052', '2058653964378557', 
    '2129984390566328', '174636906462322', '1928399724138152', '417639218648241', 
    '930060997172551', '164535220883264', '370940413392601', '205488546921017', 
    '809305022860427'
  ];

  for (let i = 0; i < value; i++) {
    let losowyKolor = kolory[Math.floor(Math.random() * kolory.length)];
    api.changeThreadColor(losowyKolor, event.threadID);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
