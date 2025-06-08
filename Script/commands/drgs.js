const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "3.2",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "PsychonautWiki GraphQL – pełne dane o substancjach",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({
  timeout: 15000,
  headers: { "Accept": "application/json", "Content-Type": "application/json" }
});

// Emoji według klasy substancji (możesz rozbudować wg potrzeb)
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

module.exports.run = async function({ api, event, args }) {
  if (!args.length)
    return api.sendMessage("🔍 Podaj substancję, np. `/drgs mdma`.", event.threadID, event.messageID);

  const q = args.join(" ");

  const payload = {
    query: `
      {
        substances(query: "${q}") {
          name
          summary
          drugClass
          roas {
            name
            dose {
              units
              threshold
              light { min max }
              common { min max }
              strong { min max }
              heavy
            }
            duration {
              onset { min max units }
              comeup { min max units }
              peak { min max units }
              offset { min max units }
              afterglow { min max units }
              total { min max units }
            }
          }
        }
      }`
  };

  let res;
  try {
    res = await axiosInstance.post("https://api.psychonautwiki.org/", payload);
  } catch (e) {
    return api.sendMessage("❌ Błąd podczas pobierania danych z PsychonautWiki.", event.threadID, event.messageID);
  }

  const subs = res.data?.data?.substances;
  if (!Array.isArray(subs) || subs.length === 0) {
    return api.sendMessage("❌ Nie znaleziono tej substancji na PsychonautWiki.", event.threadID, event.messageID);
  }

  const s = subs[0];
  const emoji = emojiMap[s.drugClass?.toLowerCase()] || emojiMap.other;

  const lines = [`${emoji} *${s.name}*`];

  if (s.summary) {
    // Skróć do 500 znaków, aby nie przeciążać wiadomości
    const summary = s.summary.length > 500 ? s.summary.slice(0, 500) + "..." : s.summary;
    lines.push(summary);
    lines.push("");
  }

  if (Array.isArray(s.roas) && s.roas.length > 0) {
    for (const roa of s.roas) {
      const d = roa.dose || {};
      const dg = [];
      if (d.threshold != null) dg.push(`Próg: ${d.threshold} ${d.units}`);
      if (d.light?.min != null) dg.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
      if (d.common?.min != null) dg.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
      if (d.strong?.min != null) dg.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
      if (d.heavy != null) dg.push(`Bardzo ciężka: ${d.heavy} ${d.units}`);
      if (dg.length > 0) lines.push(`🧪 Dawkowanie (${roa.name}): ${dg.join(", ")}`);

      const dur = roa.duration || {};
      const dd = [
        dur.total ? `Całkowity: ${dur.total.min}-${dur.total.max} ${dur.total.units}` : null,
        dur.onset ? `Onset: ${dur.onset.min}-${dur.onset.max} ${dur.onset.units}` : null,
        dur.comeup ? `Comeup: ${dur.comeup.min}-${dur.comeup.max} ${dur.comeup.units}` : null,
        dur.peak ? `Peak: ${dur.peak.min}-${dur.peak.max} ${dur.peak.units}` : null,
        dur.offset ? `Offset: ${dur.offset.min}-${dur.offset.max} ${dur.offset.units}` : null,
        dur.afterglow ? `Afterglow: ${dur.afterglow.min}-${dur.afterglow.max} ${dur.afterglow.units}` : null
      ].filter(Boolean);

      if (dd.length > 0) lines.push(`⏳ Czas działania (${roa.name}): ${dd.join(" • ")}`);
    }
  }

  const msg = lines.join("\n");
  return api.sendMessage(msg, event.threadID, event.messageID);
};