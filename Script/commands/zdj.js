module.exports.config = {
  name: "zdj",
  version: "1.2.1",
  hasPermssion: 0,
  credits: "January (na bazie Shaon Ahmed)",
  description: "Wyszukiwanie obrazów przez Google Images (obsługuje polskie frazy)",
  commandCategory: "Wyszukiwanie",
  usages: "[fraza]-[ilość (1-10)]",
  cooldowns: 2,
};

const fs = require("fs-extra");
const axios = require("axios");
const google = require("googlethis");
const path = require("path");

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    const input = args.join(" ");
    if (!input.includes("-")) {
      return api.sendMessage(
        '❌ Użycie: zdj [fraza]-[ilość 1-10]\n▶️ Przykład: zdj koty-4',
        threadID,
        messageID
      );
    }

    const [termPart, amountPart] = input.split("-");
    const searchTerm = termPart.trim();
    let amount = parseInt(amountPart.trim());

    if (isNaN(amount) || amount < 1 || amount > 10) amount = 3;

    const options = {
      safe: false,
      additional_params: { hl: "pl", gl: "pl" },
      host: "google.pl"
    };

    const response = await google.image(searchTerm, options);
    const images = response.slice(0, amount);

    if (images.length === 0)
      return api.sendMessage("❌ Nie znaleziono żadnych zdjęć.", threadID, messageID);

    const attachments = [];
    const paths = [];

    for (let i = 0; i < images.length; i++) {
      const url = images[i].url;
      const filePath = path.join(__dirname, "cache", `google${i}.jpg`);
      const buffer = (await axios.get(url, { responseType: "arraybuffer" })).data;
      await fs.outputFile(filePath, buffer);
      attachments.push(fs.createReadStream(filePath));
      paths.push(filePath);
    }

    await api.sendMessage({
      body: `✅ Znalazłem ${attachments.length} wyników dla: "${searchTerm}"`,
      attachment: attachments
    }, threadID, messageID);

    // Zawsze usuń pliki, nawet jeśli wystąpi błąd
    paths.forEach(p => fs.unlink(p).catch(() => {}));
    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch (err) {
    console.error("Błąd w komendzie zdj:", err.message);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ Wystąpił błąd przy wyszukiwaniu obrazów.", threadID, messageID);
  }
};