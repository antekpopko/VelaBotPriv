module.exports.config = {
	name: "lista",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
	description: "Pokaż zdjęcie lista.jpg z folderu cache",
	commandCategory: "Obrazki",
	usages: "lista",
	cooldowns: 1,
};

const fs = require("fs");
const path = require("path");

module.exports.run = async ({ api, event }) => {
  const sciezka = path.join(__dirname, "cache", "lista.png");

  if (!fs.existsSync(sciezka)) {
    return api.sendMessage("Nie znaleziono pliku lista.jpg w folderze cache.", event.threadID, event.messageID);
  }

  api.sendMessage({
    attachment: fs.createReadStream(sciezka)
  }, event.threadID, event.messageID);
};
