const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "2.0",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla szczegółowe informacje o substancjach psychoaktywnych z PsychonautWiki i Wikipedii.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

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

const axiosInstance = axios.create({ timeout: 10000 });

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  } catch {
    return text;
  }
}

async function getPsychonautData(query) {
  const graphQLEndpoint = "https://psychonautwiki.org/graphql";
  const queryString = `
  query {
    substance(name: "${query}") {
      name
      url
      class {
        chemical
        psychoactive
      }
      dosage {
        oral {
          units threshold heavy commonLight commonHeavy commonMedium
        }
      }
      duration {
        total {
          min max units
        }
      }
      bioavailability
      crossTolerances
      toxicity
      effects {
        subjective
        cognitive
        visual
        physical
        auditory
      }
      routesOfAdministration
      commonNames
      summary
    }
  }`;

  try {
    const res = await axiosInstance.post(graphQLEndpoint, { query: queryString });
    return res.data.data.substance || null;
  } catch {
    return null;
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
        url: res.data.content_urls?.desktop?.page
      };
    }
  } catch {
    return null;
  }
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("🔍 Podaj nazwę substancji, np. `/drgs ketamine`.", event.threadID, event.messageID);
  }

  const name = args.join(" ");
  let resultMsg = "";

  let substance = await getPsychonautData(name);
  if (!substance) {
    const altName = name.toLowerCase().replace(/\s+/g, "-");
    substance = await getPsychonautData(altName);
  }

  if (substance) {
    const emoji = substance.class?.psychoactive?.[0]?.toLowerCase() && emojiMap[substance.class.psychoactive[0].toLowerCase()] || "🌐";

    resultMsg += `${emoji} *${substance.name} (PsychonautWiki)*\n`;

    if (substance.summary) {
      const translated = await translateToPL(substance.summary);
      resultMsg += `${translated}\n\n`;
    }

    const details = [];

    if (substance.commonNames?.length) {
      details.push(`📛 Nazwy potoczne: ${substance.commonNames.join(", ")}`);
    }
    if (substance.routesOfAdministration?.length) {
      details.push(`💉 Drogi podania: ${substance.routesOfAdministration.join(", ")}`);
    }

    const oral = substance.dosage?.oral;
    if (oral) {
      const doseStr = [
        oral.threshold && `Próg: ${oral.threshold} ${oral.units}`,
        oral.commonLight && `Lekka: ${oral.commonLight} ${oral.units}`,
        oral.commonMedium && `Średnia: ${oral.commonMedium} ${oral.units}`,
        oral.commonHeavy && `Ciężka: ${oral.commonHeavy} ${oral.units}`,
        oral.heavy && `Bardzo ciężka: ${oral.heavy} ${oral.units}`
      ].filter(Boolean).join(", ");
      details.push(`🧪 Dawkowanie (doustnie): ${doseStr}`);
    }

    const duration = substance.duration?.total;
    if (duration?.min && duration?.max) {
      details.push(`⏳ Czas działania: ${duration.min}-${duration.max} ${duration.units}`);
    }

    if (substance.bioavailability) {
      details.push(`📈 Biodostępność: ${substance.bioavailability}`);
    }

    if (substance.crossTolerances?.length) {
      details.push(`⚠️ Krzyżowa tolerancja: ${substance.crossTolerances.join(", ")}`);
    }

    if (substance.toxicity) {
      details.push(`☠️ Toksyczność: ${substance.toxicity}`);
    }

    if (substance.effects) {
      const effectsText = Object.entries(substance.effects)
        .map(([k, v]) => v && v.length ? `• ${capitalize(k)}: ${v.join(", ")}` : null)
        .filter(Boolean)
        .join("\n");
      if (effectsText) {
        details.push(`🎯 Efekty:\n${effectsText}`);
      }
    }

    resultMsg += `${details.join("\n")}\n🔗 ${substance.url}`;
    return api.sendMessage(resultMsg, event.threadID, event.messageID);
  }

  // jeśli nie znaleziono w PsychonautWiki
  const plWiki = await getWikiSummary(name, "pl");
  if (plWiki) {
    resultMsg += `🇵🇱 *${plWiki.title} (Wikipedia PL)*\n${plWiki.extract}\n🔗 ${plWiki.url}`;
    return api.sendMessage(resultMsg, event.threadID, event.messageID);
  }

  const enWiki = await getWikiSummary(name, "en");
  if (enWiki) {
    const translated = await translateToPL(enWiki.extract);
    resultMsg += `🇬🇧 *${enWiki.title} (Wikipedia EN)*\n${translated}\n🔗 ${enWiki.url}`;
    return api.sendMessage(resultMsg, event.threadID, event.messageID);
  }

  return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w dostępnych źródłach.", event.threadID, event.messageID);
};