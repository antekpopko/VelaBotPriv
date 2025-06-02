const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.2",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla info o narkotykach z Wikipedii i PsychonautWiki z tłumaczeniem i emoji.",
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
        drugClass
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
  const results = [];

  const [plWiki, enWiki, psycho] = await Promise.all([
    getWikiSummary(query, 'pl'),
    getWikiSummary(query, 'en'),
    getPsychonautSummary(psychoQuery)
  ]);

  if (plWiki) {
    results.push(`🇵🇱 *${plWiki.title} (Wikipedia PL)*\n${shortenText(plWiki.extract)}\n🔗 ${plWiki.url}`);
  }

  if (enWiki && (!plWiki || plWiki.extract.length < 200)) {
    const translated = await translateToPL(enWiki.extract);
    results.push(`🇬🇧 *${enWiki.title} (Wikipedia EN)*\n${shortenText(translated)}\n🔗 ${enWiki.url}`);
  }

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
    results.push(`${emoji} *${psycho.title} (PsychonautWiki)*\n${shortenText(translatedPsycho)}\n🔗 ${psycho.url}`);
  }

  if (results.length === 0) {
    return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w dostępnych źródłach.", event.threadID, event.messageID);
  }

  return api.sendMessage(results.join("\n\n"), event.threadID, event.messageID);
};