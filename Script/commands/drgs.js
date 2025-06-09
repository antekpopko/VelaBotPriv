const axios = require("axios");

const PW_API = "https://api.psychonautwiki.org/graphql";

const effectsTranslate = {
  "Auditory hallucination": "Halucynacje słuchowe",
  "Visual hallucination": "Halucynacje wzrokowe",
  "Euphoria": "Euforia",
  "Anxiety": "Lęk",
  "Nausea": "Nudności",
  "Increased heart rate": "Przyspieszone tętno",
  "Pupil dilation": "Rozszerzenie źrenic",
  // Dodaj inne tłumaczenia według potrzeby
};

function translateEffects(effects = []) {
  if (!effects.length) return "Brak danych o efektach.";
  return effects
    .map(e => effectsTranslate[e] || e)
    .join(", ");
}

async function fetchSubstanceData(name) {
  const query = `
    query SubstanceInfo($name: String!) {
      substance(name: $name) {
        name
        aliases
        description
        administration {
          method
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
        }
        effects {
          common
          uncommon
          rare
        }
      }
    }
  `;
  try {
    const res = await axios.post(PW_API, {
      query,
      variables: { name }
    });
    if (res.data.errors) return null;
    return res.data.data.substance;
  } catch {
    return null;
  }
}

function formatDosage(d) {
  if (!d) return "Brak danych.";
  const parts = [];
  if (d.threshold) parts.push(`Próg: ${d.threshold}`);
  if (d.light) parts.push(`Lekka: ${d.light}`);
  if (d.common) parts.push(`Typowa: ${d.common}`);
  if (d.strong) parts.push(`Silna: ${d.strong}`);
  if (d.heavy) parts.push(`Duża: ${d.heavy}`);
  return parts.join(", ");
}

function formatDuration(d) {
  if (!d) return "Brak danych.";
  const parts = [];
  if (d.onset) parts.push(`Początek: ${d.onset}`);
  if (d.peak) parts.push(`Szczyt: ${d.peak}`);
  if (d.offset) parts.push(`Spadek: ${d.offset}`);
  if (d.afterglow) parts.push(`Afterglow: ${d.afterglow}`);
  if (d.total) parts.push(`Całkowity czas: ${d.total}`);
  return parts.join(" • ");
}

function formatAdministration(administration) {
  if (!administration || administration.length === 0) return "Brak danych o drodze podania.";
  return administration
    .map(a => 
      `📍 Droga podania: ${a.method}\n🧮 Dawkowanie: ${formatDosage(a.dosage)}\n⏱️ Czas działania: ${formatDuration(a.duration)}`
    )
    .join("\n\n");
}

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "PsychonautWiki GraphQL",
  hasPermssion: 0,
  description: "Informacje o substancjach psychoaktywnych z PsychonautWiki",
  commandCategory: "informacje",
};

module.exports.run = async function({ args, api, event }) {
  if (!args.length) return api.sendMessage("Podaj nazwę substancji!", event.threadID, event.messageID);

  const query = args.join(" ").toLowerCase();

  const data = await fetchSubstanceData(query);
  if (!data) return api.sendMessage("Nie znaleziono informacji o tej substancji w PsychonautWiki.", event.threadID, event.messageID);

  let msg = `🧪 *${data.name}*`;

  if (data.aliases && data.aliases.length) msg += `\n📝 Nazwy potoczne: ${data.aliases.join(", ")}`;

  if (data.description) msg += `\n\n📖 Opis:\n${data.description}`;

  msg += `\n\n${formatAdministration(data.administration)}`;

  const allEffects = [
    ...(data.effects.common || []),
    ...(data.effects.uncommon || []),
    ...(data.effects.rare || []),
  ];
  msg += `\n\n✨ Efekty:\n${translateEffects(allEffects)}`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};