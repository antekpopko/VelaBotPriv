const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Erowid",
  hasPermssion: 0,
  description: "Informacje o substancjach psychoaktywnych z Erowid",
  commandCategory: "informacje",
};

async function getErowidInfo(substance) {
  try {
    // Formatowanie nazwy na URL Erowid
    const urlName = substance.toLowerCase().replace(/\s+/g, '');
    const url = `https://erowid.org/chemicals/${urlName}/${urlName}.shtml`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Opis pobieramy z pierwszego większego paragrafu w #main-content
    let description = "";
    $("#main-content p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && !description) {
        description = text;
      }
    });

    // Dawkowanie - próbujemy znaleźć pod nagłówkiem "Dosage"
    let dosage = "";
    $("h3").each((i, el) => {
      const header = $(el).text().toLowerCase();
      if (header.includes("dosage")) {
        dosage = $(el).next("p").text().trim();
      }
    });

    // Jeśli nic nie znaleziono, ustaw info o braku danych
    if (!description) description = "Brak opisu.";
    if (!dosage) dosage = "Brak informacji o dawkowaniu.";

    return { description, dosage, url };
  } catch (error) {
    return null;
  }
}

module.exports.run = async function({ args, api, event }) {
  if (!args.length) {
    return api.sendMessage("Podaj nazwę substancji!", event.threadID, event.messageID);
  }

  const substance = args.join(" ");

  const data = await getErowidInfo(substance);

  if (!data) {
    return api.sendMessage("Nie znaleziono informacji o tej substancji na Erowid.", event.threadID, event.messageID);
  }

  const msg = `🧪 Informacje o *${substance}* z Erowid:\n\n` +
              `📖 Opis:\n${data.description}\n\n` +
              `💊 Dawkowanie:\n${data.dosage}\n\n` +
              `🌐 Więcej informacji: ${data.url}`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};