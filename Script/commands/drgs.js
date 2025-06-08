const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.3",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla info o narkotykach z PsychonautWiki (priorytetowo) i Wikipedii z tłumaczeniem i emoji.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({ timeout: 7000 });

const emojiMap = {
  stimulant: "⚡", depressant: "💤", psychedelic: "🌈",
  empathogen: "💜", dissociative: "🌀", opioid: "💉",
  benzodiazepine: "💊", deliriant: "😵", other: "❓"
};

function shortenText(text, maxLength = 700) {
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

async function translateToPL(text) {
  try {
    const res = await axiosInstance.post("https://libretranslate.de/translate", {
      q: text, source: "en", target: "pl", format: "text"
    }, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    return res.data.translatedText;
  } catch (e) {
    return text;
  }
}

async function getWikiSummary(query, lang = 'pl') {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await axiosInstance.get(url);
    if (res.data.extract) {
      return {
        title: res.data.title,
        extract: res.data.extract,
        url: res.data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        lang
      };
    }
  } catch (_) {}
  return null;
}

async function getPsychonautSummary(query) {
  const formats = [query, query.replace(/\s+/g, "_"), query.toLowerCase(), query.charAt(0).toUpperCase() + query.slice(1)];
  for (const formatted of formats) {
    try {
      const url = `https://psychonautwiki.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`;
      const res = await axiosInstance.get(url);
      if (res.data.extract) {
        const drugClass = Array.isArray(res.data.infobox?.drug_class)
          ? res.data.infobox.drug_class[0].toLowerCase()
          : res.data.infobox?.drug_class?.toLowerCase() || null;
        const effects = res.data.infobox?.effects?.map(e => `- ${e}`).join("\n") || null;
        return {
          title: res.data.title,
          extract: res.data.extract,
          effects,
          url: `https://psychonautwiki.org/wiki/${encodeURIComponent(formatted)}`,
          drugClass
        };
      }
    } catch (_) {}
  }
  return null;
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs ketamine`.", event.threadID, event.messageID);
  }

  const query = args.join(" ");
  const results = [];

  const [psycho, plWiki, enWiki] = await Promise.all([
    getPsychonautSummary(query),
    getWikiSummary(query, 'pl'),
    getWikiSummary(query, 'en')
  ]);

  if (psycho) {
    const translatedPsycho = await translateToPL(psycho.extract);
    const translatedEffects = psycho.effects ? await translateToPL(psycho.effects) : null;
    let emoji = emojiMap.other;
    if (psycho.drugClass) {
      for (const [key, emojiVal] of Object.entries(emojiMap)) {
        if (psycho.drugClass.includes(key)) {
          emoji = emojiVal;
          break;
        }
      }
    }
    results.push(`${emoji} *${psycho.title} (PsychonautWiki)*\n${shortenText(translatedPsycho)}\n${translatedEffects ? `\n🧠 Efekty:\n${shortenText(translatedEffects, 400)}` : ""}\n🔗 ${psycho.url}`);
  }

  if (plWiki && (!psycho || plWiki.extract.length > 200)) {
    results.push(`🇵🇱 *${plWiki.title} (Wikipedia PL)*\n${shortenText(plWiki.extract)}\n🔗 ${plWiki.url}`);
  }

  if (enWiki && (!plWiki || plWiki.extract.length < 200)) {
    const translated = await translateToPL(enWiki.extract);
    results.push(`🇬🇧 *${enWiki.title} (Wikipedia EN)*\n${shortenText(translated)}\n🔗 ${enWiki.url}`);
  }

  if (results.length === 0) {
    return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w dostępnych źródłach.", event.threadID, event.messageID);
  }

  return api.sendMessage(results.join("\n\n"), event.threadID, event.messageID);
};
