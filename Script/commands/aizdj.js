module.exports.config = {
  name: "aizdj",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Generuje obraz na podstawie tekstu",
  commandCategory: "image",
  usages: "tekst do wygenerowania",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("Podaj tekst lub do wygenerowania obrazu.", threadID, messageID);

  const path = __dirname + "/cache/poli.png";

  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    api.sendMessage({
      body: `“${query}” - obraz został wygenerowany.`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  } catch (error) {
    api.sendMessage("Wystąpił błąd podczas generowania obrazu.", threadID, messageID);
  }
};
