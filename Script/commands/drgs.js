const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "📘 Informacje o substancjach psychoaktywnych",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3,
};

const translateRoute = {
  oral: "doustnie",
  nasal: "donosowo",
  intravenous: "dożylnie",
  intramuscular: "domięśniowo",
  rectal: "doodbytniczo",
  sublingual: "podjęzykowo",
  smoked: "palona",
  vaporized: "waporyzowana",
  buccal: "dopoliczkowo",
};

const commonEffectsPL = {
  "Euphoria": "Euforia",
  "Empathy, affection and sociability enhancement": "Zwiększona empatia i towarzyskość",
  "Stimulation": "Pobudzenie",
  "Visual hallucination": "Halucynacje wizualne",
  "Auditory hallucination": "Halucynacje słuchowe",
  "Time distortion": "Zniekształcenie czasu",
  "Anxiety": "Lęk",
  "Depression": "Depresja",
  "Increased heart rate": "Zwiększone tętno",
  "Nausea": "Nudności",
  "Pupil dilation": "Rozszerzenie źrenic",
  "Dry mouth": "Suchość w ustach",
};

function translateEffects(effects) {
  const translated = effects.map(effect => commonEffectsPL[effect] || effect);
  return [...new Set(translated)].join(", ");
}

function formatDosage(dosage) {
  if (!dosage) return "Brak danych";
  const entries = Object.entries(dosage).map(
    ([level, value]) => `${level}: ${value}`
  );
  return entries.join(", ");
}

function formatDuration(duration) {
  if (!duration) return "Brak danych";
  const segments = [
    duration.onset && `Onset: ${duration.onset}`,
    duration.peak && `Peak: ${duration.peak}`,
    duration.offset && `Offset: ${duration.offset}`,
    duration.afterglow && `Afterglow: ${duration.afterglow}`,
    duration.total && `Całkowity czas: ${duration.total}`,
  ].filter(Boolean);
  return segments.join(" • ");
}

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ Podaj nazwę substancji.", event.threadID, event.messageID);

  const gql = {
    query: `query($query: String!) {
      substances(query: $query) {
        name
        url
        summary
        routesOfAdministration {
          name
        }
        dosage {
          threshold
          light
          common
          strong
          heavy
        }
        duration {
          onset
          peak
          offset
          afterglow
          total
        }
        effects {
          name
        }
      }
    }`,
    variables: { query }
  };

  try {
    const res = await axios.post("https://psychonautwiki.org/api/graphql", gql, {
      headers: { "Content-Type": "application/json" }
    });

    const substance = res.data.data.substances?.[0];
    if (!substance) return api.sendMessage("❌ Nie znaleziono substancji.", event.threadID, event.messageID);

    const {
      name,
      url,
      summary,
      routesOfAdministration,
      dosage,
      duration,
      effects
    } = substance;

    const podanie = routesOfAdministration?.map(r => translateRoute[r.name] || r.name).join(", ") || "Brak danych";
    const dawkowanie = formatDosage(dosage);
    const czas = formatDuration(duration);
    const efekty = effects?.length ? translateEffects(effects.map(e => e.name)) : "Brak danych";

    const msg = `🧪 *${name}*\n\n${
      summary || "Brak opisu."
    }\n\n📍 *Droga podania:* ${podanie}\n🧮 *Dawkowanie:* ${dawkowanie}\n⏱️ *Czas działania:* ${czas}\n\n✨ *Efekty:* ${efekty}\n\n🔗 Więcej: ${url}`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Błąd podczas pobierania danych. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};