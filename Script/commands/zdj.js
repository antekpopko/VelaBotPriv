module.exports.config = {
  name: "zdj",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Shaon Ahmed",
  description: "Wyszukiwanie obrazów",
  commandCategory: "Wyszukiwanie",
  usages: "[tekst]-[ilość]",
  cooldowns: 0,
};

const axios = require("axios");
const fs = require("fs-extra");

module.exports.run = async function({ api, event, args }) {
  const keySearch = args.join(" ");
  if (!keySearch.includes("-")) {
    return api.sendMessage(
      'Podaj frazę i ilość w formacie: zdj keyword-5\nPrzykład: zdj kot-3\n(Wyświetli 3 zdjęcia kota)',
      event.threadID,
      event.messageID
    );
  }

  const keySearchs = keySearch.substr(0, keySearch.indexOf("-")).trim();
  const numberSearch = parseInt(keySearch.split("-").pop()) || 6;

  try {
    const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
    const Shaon = apis.data.api;
    const res = await axios.get(`${Shaon}/pinterest?search=${encodeURIComponent(keySearchs)}`);

    const data = res.data.data;
    if (!data || data.length === 0) {
      return api.sendMessage("Nie znaleziono żadnych obrazów dla podanego hasła.", event.threadID, event.messageID);
    }

    let imgData = [];
    for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
      const path = __dirname + `/cache/${i + 1}.jpg`;
      const imgBuffer = (await axios.get(data[i], { responseType: "arraybuffer" })).data;
      await fs.writeFile(path, Buffer.from(imgBuffer));
      imgData.push(fs.createReadStream(path));
    }

    await api.sendMessage({
      body: `Znalazłem ${imgData.length} wyników dla: "${keySearchs}"`,
      attachment: imgData,
    }, event.threadID, event.messageID);

    // Usuń pobrane pliki
    for (let i = 0; i < imgData.length; i++) {
      await fs.unlink(__dirname + `/cache/${i + 1}.jpg`);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("Wystąpił błąd podczas wyszukiwania obrazów.", event.threadID, event.messageID);
  }
};
