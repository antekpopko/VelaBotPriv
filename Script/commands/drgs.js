const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "2.0",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla dokładne info o substancjach psychoaktywnych z PsychonautWiki.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

async function fetchFromPsychonaut(query) {
  const formattedQuery = query.toLowerCase().replace(/\s+/g, '_');

  const graphqlQuery = {
    query: `
    query {
      substance(name: "${formattedQuery}") {
        name
        class {
          chemical
          psychoactive
        }
        addictionPotential
        toxicity
        tolerance
        crossTolerances
        commonNames
        routesOfAdministration {
          name
          bioavailability
          dose {
            units
            threshold
            light
            common
            strong
            heavy
          }
          duration {
            afterglow
            comeup
            duration
            offset
            onset
            peak
          }
        }
      }
    }
    `
  };

  try {
    const res = await axios.post("https://psychonautwiki.org/graphql", graphqlQuery, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });

    return res.data.data.substance;
  } catch (e) {
    return null;
  }
}

function formatDose(dose) {
  if (!dose) return "";
  return [
    dose.threshold ? `Próg: ${dose.threshold}` : "",
    dose.light ? `Lekka: ${dose.light}` : "",
    dose.common ? `Typowa: ${dose.common}` : "",
    dose.strong ? `Silna: ${dose.strong}` : "",
    dose.heavy ? `Bardzo ciężka: ${dose.heavy}` : ""
  ].filter(Boolean).join(", ");
}

function formatDuration(duration) {
  if (!duration) return "";
  return [
    duration.duration ? `Całkowity: ${duration.duration}` : "",
    duration.onset ? `Onset: ${duration.onset}` : "",
    duration.comeup ? `Comeup: ${duration.comeup}` : "",
    duration.peak ? `Peak: ${duration.peak}` : "",
    duration.offset ? `Offset: ${duration.offset}` : "",
    duration.afterglow ? `Afterglow: ${duration.afterglow}` : ""
  ].filter(Boolean).join(" • ");
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs mdma`", event.threadID, event.messageID);
  }

  const query = args.join(" ");
  const substance = await fetchFromPsychonaut(query);

  if (!substance) {
    return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w PsychonautWiki.", event.threadID, event.messageID);
  }

  const result = [];

  result.push(`*${substance.name}*`);

  if (substance.commonNames?.length) {
    result.push(`📛 Nazwy potoczne: ${substance.commonNames.join(", ")}`);
  }

  if (substance.class?.psychoactive?.length) {
    result.push(`🧠 Klasa (psychoaktywna): ${substance.class.psychoactive.join(", ")}`);
  }

  if (substance.addictionPotential) {
    result.push(`⚠️ Potencjał uzależniający: ${substance.addictionPotential}`);
  }

  if (substance.tolerance) {
    result.push(`📉 Tolerancja: ${substance.tolerance}`);
  }

  if (substance.crossTolerances?.length) {
    result.push(`🔁 Krzyżowa tolerancja: ${substance.crossTolerances.join(", ")}`);
  }

  if (substance.toxicity) {
    result.push(`☠️ Toksyczność: ${substance.toxicity}`);
  }

  if (substance.routesOfAdministration?.length) {
    for (const route of substance.routesOfAdministration) {
      result.push(`\n💊 *${route.name}*`);
      const doseStr = formatDose(route.dose);
      const durationStr = formatDuration(route.duration);
      if (doseStr) result.push(`🧪 Dawkowanie: ${doseStr}`);
      if (durationStr) result.push(`⏳ Czas działania: ${durationStr}`);
      if (route.bioavailability) result.push(`📈 Biodostępność: ${route.bioavailability}`);
    }
  }

  api.sendMessage(result.join("\n"), event.threadID, event.messageID);
};