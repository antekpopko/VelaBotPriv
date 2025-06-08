const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.4",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla info o substancjach psychoaktywnych z PsychonautWiki i Wikipedii z tłumaczeniem i emoji.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({
  timeout: 15000 // 15 sekund na timeout, bo tłumaczenie czasem trwa dłużej
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
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

async function translateToPL(text) {
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

async function getWikiSummary(query, lang = 'pl') {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await axiosInstance.get(url);
    if (res.data.extract) {
      return {
        title: res.data.title,
        extract: res.data.extract,
        url: res.data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        lang
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function getPsychonautSummary(query) {
  const baseURL = "https://psychonautwiki.org/api/rest_v1/page/summary/";

  // Normalizacja nazwy - usuń przecinki i inne niechciane znaki
  function normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/,/g, "")          // usuń przecinki
      .replace(/\s+/g, "-")       // spacje na myślniki
      .replace(/[^a-z0-9\-]/g, "")// usuń znaki inne niż małe litery, cyfry i myślniki
  }

  const normalized = normalizeName(query);

  async function tryQuery(name) {
    try {
      const url = baseURL + encodeURIComponent(name);
      const res = await axiosInstance.get(url);
      if (res.data && res.data.extract) {
        return {
          title: res.data.title,
          extract: res.data.extract,
          url: `https://psychonautwiki.org/wiki/${encodeURIComponent(name)}`,
          drugClass: res.data.infobox?.drug_class ? (Array.isArray(res.data.infobox.drug_class) ? res.data.infobox.drug_class[0].toLowerCase() : res.data.infobox.drug_class.toLowerCase()) : null,
          infobox: res.data.infobox || {}
        };
      }
    } catch (err) {
      return null;
    }
  }

  // Próbuj tylko z wersją znormalizowaną
  return await tryQuery(normalized);
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs ketamine`.", event.threadID, event.messageID);
  }

  const query = args.join(" ");

  const psycho = await getPsychonautSummary(query);
  let plWiki = null, enWiki = null;

  if (!psycho) {
    plWiki = await getWikiSummary(query, 'pl');
    enWiki = await getWikiSummary(query, 'en');
  }

  const results = [];

  if (psycho) {
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

    const ib = psycho.infobox;
    let infoDetails = [];
    if (ib.common_names) infoDetails.push(`📛 Nazwy potoczne: ${Array.isArray(ib.common_names) ? ib.common_names.join(", ") : ib.common_names}`);
    if (ib.routes_of_administration) infoDetails.push(`💉 Drogi podania: ${Array.isArray(ib.routes_of_administration) ? ib.routes_of_administration.join(", ") : ib.routes_of_administration}`);
    if (ib.dosage) infoDetails.push(`🧪 Dawkowanie: ${typeof ib.dosage === "string" ? ib.dosage : JSON.stringify(ib.dosage)}`);
    if (ib.duration && ib.duration.total) infoDetails.push(`⏳ Czas działania: ${ib.duration.total}`);
    if (ib.toxicity) infoDetails.push(`☠️ Toksyczność: ${ib.toxicity}`);
    if (ib.cross_tolerance) infoDetails.push(`⚠️ Krzyżowa tolerancja: ${ib.cross_tolerance}`);
    if (ib.bioavailability) infoDetails.push(`📈 Biodostępność: ${ib.bioavailability}`);

    results.push(`${emoji} *${psycho.title} (PsychonautWiki)*\n${shortenText(translatedPsycho)}\n\n${infoDetails.join("\n")}\n🔗 ${psycho.url}`);
  } else {
    if (plWiki) {
      results.push(`🇵🇱 *${plWiki.title} (Wikipedia PL)*\n${shortenText(plWiki.extract)}\n🔗 ${plWiki.url}`);
    }
    if ((!plWiki || (plWiki.extract.length < 200)) && enWiki) {
      const translated = await translateToPL(enWiki.extract);
      results.push(`🇬🇧 *${enWiki.title} (Wikipedia EN)*\n${shortenText(translated)}\n🔗 ${enWiki.url}`);
    }
  }

  if (results.length === 0) {
    return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w dostępnych źródłach.", event.threadID, event.messageID);
  }

  return api.sendMessage(results.join("\n\n"), event.threadID, event.messageID);
};