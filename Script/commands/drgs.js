const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "2.0",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "Wyświetla info o substancjach psychoaktywnych z PsychonautWiki z kluczowymi danymi.",
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

function formatDosage(dosage) {
  let str = "";
  for (const roa in dosage) {
    str += `\n💊 *${roa}*:`;
    for (const level in dosage[roa]) {
      str += ` ${level}: ${dosage[roa][level]}`;
    }
  }
  return str.trim();
}

function formatDuration(duration) {
  let str = "";
  for (const roa in duration) {
    str += `\n⏱️ *${roa}*:`;
    for (const phase in duration[roa]) {
      str += ` ${phase}: ${duration[roa][phase]}`;
    }
  }
  return str.trim();
}

async function getPsychonautData(query) {
  const url = `https://psychonautwiki.org/graphql`;
  const queryStr = `{
    substance(name: \"${query}\") {
      name
      summary
      class {
        chemical
        psychoactive
      }
      tolerance {
        full
        cross
      }
      addictionPotential
      toxicity
      dosage {
        ... on DosageRange {
          units
          threshold
          light
          common
          strong
          heavy
          roa
        }
      }
      duration {
        ... on Duration {
          roa
          comeup
          onset
          peak
          offset
          total
          afterglow
        }
      }
    }
  }`;

  try {
    const res = await axios.post(url, { query: queryStr }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const data = res.data.data.substance;
    if (!data) return null;

    return data;
  } catch (e) {
    console.warn("Błąd pobierania danych z PW:", e.message);
    return null;
  }
}

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) return api.sendMessage("🔍 Podaj nazwę substancji, np. `/drgs LSD`", event.threadID, event.messageID);

  const query = args.join(" ");
  const data = await getPsychonautData(query);

  if (!data) return api.sendMessage("❌ Nie znaleziono informacji o tej substancji w PsychonautWiki.", event.threadID, event.messageID);

  const { name, summary, class: drugClass, tolerance, addictionPotential, toxicity, dosage, duration } = data;

  let emoji = emojiMap.other;
  if (drugClass && drugClass.psychoactive) {
    const lower = drugClass.psychoactive[0]?.toLowerCase();
    if (emojiMap[lower]) emoji = emojiMap[lower];
  }

  let msg = `${emoji} *${name}*\n`;
  if (summary) msg += `\n🧠 ${summary}`;

  if (dosage && dosage.length > 0) {
    const grouped = {};
    dosage.forEach(d => {
      if (!grouped[d.roa]) grouped[d.roa] = {};
      grouped[d.roa] = {
        Próg: d.threshold,
        Lekka: d.light,
        Typowa: d.common,
        Silna: d.strong,
        Bardzo_silna: d.heavy
      };
    });
    msg += `\n\n🧪 *Dawkowanie:*${formatDosage(grouped)}`;
  }

  if (duration && duration.length > 0) {
    const grouped = {};
    duration.forEach(d => {
      grouped[d.roa] = {
        Onset: d.onset,
        Comeup: d.comeup,
        Peak: d.peak,
        Offset: d.offset,
        Całkowity: d.total,
        Afterglow: d.afterglow
      };
    });
    msg += `\n\n⏳ *Czas działania:*${formatDuration(grouped)}`;
  }

  if (toxicity) msg += `\n\n☠️ *Toksyczność:* ${toxicity}`;
  if (tolerance?.cross) msg += `\n⚠️ *Krzyżowa tolerancja:* ${tolerance.cross}`;
  if (addictionPotential) msg += `\n🚫 *Potencjał uzależnienia:* ${addictionPotential}`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};
