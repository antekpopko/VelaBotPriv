module.exports.config = {
  name: "zdj",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "January (na bazie Shaon Ahmed)",
  description: "Wyszukiwanie obrazów przez Google Images (obsługuje polskie frazy)",
  commandCategory: "Wyszukiwanie",
  usages: "[fraza]-[ilość]",
  cooldowns: 2,
};

const fs = require("fs-extra");
const axios = require("axios");
const google = require("googlethis");

module.exports.run = async function({ api, event, args }) {
  try {
    api.setMessageReaction("🔍", event.messageID, () => {}, true);

    const input = args.join(" ");
    if (!input.includes("-")) {
      return api.sendMessage(
        '❌ Użycie: zdj [fraza]-[ilość]\n▶️ Przykład: zdj zamek-3',
        event.threadID,
        event.messageID
      );
    }

    const searchTerm = input.slice(0, input.indexOf("-")).trim();
    const amount = parseInt(input.split("-").pop()) || 3;

    const options = {
      safe: false,
      additional_params: {
        hl: "pl",   // język interfejsu
        gl: "pl"    // kraj: Polska
      },
      host: "google.pl"
    };

    const response = await google.image(searchTerm, options);
    const images = response.slice(0, Math.min(amount, 10));

    if (images.length === 0)
      return api.sendMessage("❌ Nie znaleziono żadnych zdjęć.", event.threadID, event.messageID);

    const attachments = [];

    for (let i = 0; i < images.length; i++) {
      const url = images[i].url;
      const path = __dirname + `/cache/google${i}.jpg`;
      const buffer = (await axios.get(url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, buffer);
      attachments.push(fs.createReadStream(path));
    }

    await api.sendMessage({
      body: `✅ Znalazłem ${attachments.length} wyników dla: "${searchTerm}"`,
      attachment: attachments,
    }, event.threadID, event.messageID);

    for (let i = 0; i < attachments.length; i++) {
      fs.unlinkSync(__dirname + `/cache/google${i}.jpg`);
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);
  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    api.sendMessage("❌ Wystąpił błąd przy wyszukiwaniu obrazów.", event.threadID, event.messageID);
  }
};
