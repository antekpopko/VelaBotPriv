module.exports.config = {
  name: "aizdj",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + poprawka: January",
  description: "Generuje obraz na podstawie tekstu",
  commandCategory: "image",
  usages: "tekst do wygenerowania",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");

  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("❗ Podaj tekst, z którego mam wygenerować obraz.", threadID, messageID);
  }

  const imagePath = path.join(__dirname, "cache", "aigen.png");

  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
      responseType: "arraybuffer"
    });

    await fs.outputFile(imagePath, response.data);

    return api.sendMessage({
      body: `🧠 Obraz wygenerowany na podstawie: “${query}”`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlink(imagePath), messageID);
  } catch (error) {
    console.error("Błąd podczas pobierania obrazu:", error.message);
    return api.sendMessage("❌ Wystąpił błąd podczas generowania obrazu. Spróbuj ponownie później.", threadID, messageID);
  }
};