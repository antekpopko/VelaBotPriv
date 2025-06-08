const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.6",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla info o substancjach psychoaktywnych z PsychonautWiki z tłumaczeniem i emoji oraz kluczowymi danymi.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({
  timeout: 7000
});

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

function shortenText(text, maxLength = 500) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

async function translateToPL(text) {
  if (!text) return "";
  try {
    const res = await axiosInstance.post("https://libretranslate.de/translate", {
      q: text,
      source: "en",
      target: "pl",
      format: "text"
    }, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    return res.data.translatedText;
  } catch (e) {
    console.warn("Błąd tłumaczenia:", e.message);
    return text;
  }
}

async function getPsychonautSummary(query) {
  const url = `https://psychonautwiki.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await axiosInstance.get(url);
    if (res.data.extract) {
      let drugClass = null;
      if (res.data.infobox && res.data.infobox.drug_class) {
        const dc = res.data.infobox.drug_class;
        drugClass = Array.isArray(dc) ? dc[0].toLowerCase() : dc.toLowerCase();
      }
      return {
        title: res.data.title,
        extract: res.data.extract,
        url: `https://psychonautwiki.org/wiki/${encodeURIComponent(query)}`,
        drugClass,
        infobox: res.data.infobox || {}
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs ketamine`.", event.threadID, event.messageID);
  }

  const query = args.join(" ");
  const psychoQuery = query.toLowerCase().replace(/\s+/g, "-");

  const psycho = await getPsychonautSummary(psychoQuery);

  if (!psycho) {
    return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w PsychonautWiki.", event.threadID, event.messageID);
  }

  const translatedPsycho = await translateToPL(psycho.extract);

  let emoji = emojiMap.other;
  if (psycho.drugClass && typeof psycho.drugClass === "string") {
    for (const [key, emojiVal] of Object.entries(emojiMap)) {
      if (psycho.drugClass.includes(key)) {
        emoji = emojiVal;
        break;
      }
    }
  }

  // Kluczowe pola z infoboxa
  const ib = psycho.infobox;
  const infoDetails = [];

  if (ib.common_names) infoDetails.push(`📛 Nazwy potoczne: ${Array.isArray(ib.common_names) ? ib.common_names.join(", ") : ib.common_names}`);
  if (ib.routes_of_administration) infoDetails.push(`💉 Drogi podania: ${Array.isArray(ib.routes_of_administration) ? ib.routes_of_administration.join(", ") : ib.routes_of_administration}`);
  if (ib.dosage) infoDetails.push(`🧪 Dawkowanie: ${typeof ib.dosage === "string" ? ib.dosage : JSON.stringify(ib.dosage)}`);
  if (ib.duration && ib.duration.total) infoDetails.push(`⏳ Czas działania: ${ib.duration.total}`);
  if (ib.toxicity) infoDetails.push(`☠️ Toksyczność: ${ib.toxicity}`);
  if (ib.cross_tolerance) infoDetails.push(`⚠️ Krzyżowa tolerancja: ${ib.cross_tolerance}`);
  if (ib.bioavailability) infoDetails.push(`📈 Biodostępność: ${ib.bioavailability}`);

  const infoboxText = infoDetails.length > 0 ? "\n\n📋 Kluczowe informacje:\n" + infoDetails.join("\n") : "";

  const message = `${emoji} *${psycho.title} (PsychonautWiki)*\n${shortenText(translatedPsycho)}${infoboxText}\n\n🔗 ${psycho.url}`;

  return api.sendMessage(message, event.threadID, event.messageID);
};