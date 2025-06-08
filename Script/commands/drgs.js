const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "3.0",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Info o substancjach psychoaktywnych (PsychonautWiki GraphQL).",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({ timeout: 15000 });
const emojiMap = {
  stimulant: "⚡",
  depressant: "💤",
  psychedelic: "🌈",
  empathogen: "💜",
  dissociative: "🌀",
  opioid: "💉",
  benzodiazepine: "💊",
  deliriant: "😵",
  other: "❓"
};

// Tłumaczenie, jeśli trzeba
async function translate(text) {
  try {
    const res = await axiosInstance.post("https://libretranslate.de/translate", {
      q: text, source: "en", target: "pl", format: "text"
    }, { headers: { accept: "application/json", "Content-Type": "application/json" } });
    return res.data.translatedText;
  } catch {
    return text;
  }
}

// GrapQL – pobranie danych
async function fetchPsychonaut(name) {
  const gql = {
    query: `
      query($q: String!) {
        substances(query: $q) {
          name
          summary
          class { psychoactive }
          commonNames
          routesOfAdministration
          dosage {
            oral {
              units threshold light commonMedium commonHeavy heavy
            }
          }
          duration {
            total { min max units }
          }
          bioavailability
          crossTolerances
          toxicity
        }
      }`,
    variables: { q: name }
  };

  try {
    const res = await axiosInstance.post("https://api.psychonautwiki.org/", gql);
    const list = res.data?.data?.substances;
    if (Array.isArray(list) && list.length) return list[0];
  } catch {
    return null;
  }
  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports.run = async function({ api, event, args }) {
  if (!args.length) {
    return api.sendMessage("🔍 Podaj nazwę substancji, np. `/drgs mdma`.", event.threadID, event.messageID);
  }

  const name = args.join(" ");
  const data = await fetchPsychonaut(name);
  if (!data) {
    const alt = name.toLowerCase();
    const tryAlt = await fetchPsychonaut(alt);
    if (!tryAlt) {
      return api.sendMessage("❌ Nie znaleziono tej substancji na PsychonautWiki.", event.threadID, event.messageID);
    }
    return finalizeMessage(tryAlt);
  }
  return finalizeMessage(data);

  async function finalizeMessage(data) {
    let msg = "";
    const cls = data.class?.psychoactive?.[0]?.toLowerCase();
    msg += `${emojiMap[cls] || emojiMap.other} *${data.name}*\n`;

    if (data.summary) {
      const txt = await translate(data.summary);
      msg += `${txt}\n\n`;
    }

    const info = [];
    if (data.commonNames?.length) 
      info.push(`📛 Nazwy potoczne: ${data.commonNames.join(", ")}`);
    if (data.routesOfAdministration?.length) 
      info.push(`💉 Drogi podania: ${data.routesOfAdministration.join(", ")}`);

    const oral = data.dosage?.oral;
    if (oral) {
      const parts = [
        oral.threshold && `Próg: ${oral.threshold} ${oral.units}`,
        oral.light && `Lekka: ${oral.light} ${oral.units}`,
        oral.commonMedium && `Średnia: ${oral.commonMedium} ${oral.units}`,
        oral.commonHeavy && `Ciężka: ${oral.commonHeavy} ${oral.units}`,
        oral.heavy && `Bardzo ciężka: ${oral.heavy} ${oral.units}`
      ].filter(Boolean).join(", ");
      info.push(`🧪 Dawkowanie (doustne): ${parts}`);
    }

    const dur = data.duration?.total;
    if (dur?.min != null && dur?.max != null && dur.units) 
      info.push(`⏳ Czas działania: ${dur.min}-${dur.max} ${dur.units}`);

    if (data.bioavailability) info.push(`📈 Biodostępność: ${data.bioavailability}`);
    if (data.crossTolerances?.length) info.push(`⚠️ Krzyżowa tolerancja: ${data.crossTolerances.join(", ")}`);
    if (data.toxicity) info.push(`☠️ Toksyczność: ${data.toxicity}`);

    msg += info.join("\n");
    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};