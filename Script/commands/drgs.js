const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "2.1",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Info o substancjach psychoaktywnych (PsychonautWiki GraphQL).",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({ timeout: 15000 });
const emojiMap = {
  stimulant: "⚡", depressant: "💤", psychedelic: "🌈",
  empathogen: "💜", dissociative: "🌀", opioid: "💉",
  benzodiazepine: "💊", deliriant: "😵", other: "❓"
};

async function translateToPL(text) {
  if (!text) return "";
  try {
    const res = await axiosInstance.post("https://libretranslate.de/translate", {
      q: text, source: "en", target: "pl", format: "text"
    }, {
      headers: { accept: "application/json", "Content-Type": "application/json" }
    });
    return res.data.translatedText;
  } catch {
    return text;
  }
}

// Funkcja do pobierania danych przez GraphQL
async function fetchPsychonaut(name) {
  const gql = {
    query: `
    query($q:String!) {
      substances(query:$q) {
        name summary
        class { psychoactive }
        commonNames
        routesOfAdministration
        dosage {
          oral { units threshold light commonMedium commonHeavy heavy }
        }
        duration { total { min max units } }
        bioavailability
        crossTolerances
        toxicity
      }
    }`,
    variables: { q: name }
  };

  try {
    const res = await axiosInstance.post("https://api.psychonautwiki.org/", gql);
    return res.data?.data?.substances?.[0] || null;
  } catch {
    return null;
  }
}

function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports.run = async function({ api, event, args }) {
  if (!args.length) 
    return api.sendMessage("🔍 Podaj substancję, np. `/drgs mdma`.", event.threadID, event.messageID);

  const name = args.join(" ");
  const data = await fetchPsychonaut(name);
  if (!data) 
    return api.sendMessage("❌ Nie znaleziono tej substancji na PsychonautWiki.", event.threadID, event.messageID);

  let msg = "";
  const emoji = data.class?.psychoactive?.[0]?.toLowerCase();
  msg += `${emojiMap[emoji] || emojiMap.other} *${data.name}* (PsychonautWiki)\n`;

  if (data.summary) {
    const pl = await translateToPL(data.summary);
    msg += `${pl}\n\n`;
  }

  const info = [];
  if (data.commonNames?.length) 
    info.push(`📛 Nazwy potoczne: ${data.commonNames.join(", ")}`);
  if (data.routesOfAdministration?.length) 
    info.push(`💉 Drogi użycia: ${data.routesOfAdministration.join(", ")}`);

  const oral = data.dosage?.oral;
  if (oral) {
    const parts = [];
    if (oral.threshold) parts.push(`Próg: ${oral.threshold} ${oral.units}`);
    if (oral.light) parts.push(`Lekka: ${oral.light} ${oral.units}`);
    if (oral.commonMedium) parts.push(`Typowa: ${oral.commonMedium} ${oral.units}`);
    if (oral.commonHeavy) parts.push(`Ciężka: ${oral.commonHeavy} ${oral.units}`);
    if (oral.heavy) parts.push(`Bardzo ciężka: ${oral.heavy} ${oral.units}`);
    info.push(`🧪 Dawkowanie (doustne): ${parts.join(", ")}`);
  }

  const dur = data.duration?.total;
  if (dur?.min && dur?.max && dur?.units) 
    info.push(`⏳ Czas działania: ${dur.min}-${dur.max} ${dur.units}`);

  if (data.bioavailability) 
    info.push(`📈 Biodostępność: ${data.bioavailability}`);
  if (data.crossTolerances?.length) 
    info.push(`⚠️ Krzyżowa tolerancja: ${data.crossTolerances.join(", ")}`);
  if (data.toxicity) 
    info.push(`☠️ Toksyczność: ${data.toxicity}`);

  msg += info.join("\n");
  return api.sendMessage(msg, event.threadID, event.messageID);
};