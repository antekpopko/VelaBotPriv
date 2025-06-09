const axios = require("axios");
const cheerio = require("cheerio");

function formatErowidUrlName(name) {
  const parts = name.toLowerCase().split(/\s+/);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

async function getErowidInfo(substance) {
  try {
    const urlName = formatErowidUrlName(substance);
    const url = `https://erowid.org/chemicals/${urlName}/${urlName}.shtml`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let description = "";
    // Szukamy pierwszego dłuższego paragrafu w main-content
    $("#main-content p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50 && !description) {
        description = text;
      }
    });

    let dosage = "";
    // Szukamy sekcji z nagłówkiem "Dosage"
    $("h3").each((i, el) => {
      const header = $(el).text().toLowerCase();
      if (header.includes("dosage")) {
        dosage = $(el).next("p").text().trim();
      }
    });

    if (!description) description = "Brak opisu.";
    if (!dosage) dosage = "Brak informacji o dawkowaniu.";

    return { description, dosage, url };
  } catch (error) {
    return null;
  }
}

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Erowid.org",
  hasPermssion: 0,
  description: "Informacje o substancjach psychoaktywnych z Erowid",
  commandCategory: "informacje",
};

module.exports.run = async function({ args, api, event }) {
  if (!args.length) 
    return api.sendMessage("Podaj nazwę substancji!", event.threadID, event.messageID);

  const query = args.join(" ");

  const data = await getErowidInfo(query);
  if (!data) 
    return api.sendMessage("Nie znaleziono informacji o tej substancji na Erowid.", event.threadID, event.messageID);

  let msg = `🧪 Informacje o *${query}* z Erowid:\n\n`;
  msg += `📖 Opis:\n${data.description}\n\n`;
  msg += `🧮 Dawkowanie:\n${data.dosage}\n\n`;
  msg += `🔗 Więcej: ${data.url}`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};