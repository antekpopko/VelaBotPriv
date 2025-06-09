const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "4.0",
  hasPermssion: 0,
  credits: "GraphQL API + ChatGPT",
  description: "Informacje o substancjach psychoaktywnych: dawki, czas, efekty.",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  if (!args.length) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs mdma`.", threadID, messageID);
  }

  const queryStr = args.join(" ");
  // GraphQL query – żądanie POST
  const payload = {
    query: `
      {
        substances(query: "${queryStr}") {
          name
          summary
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
    res = await axios.post("https://api.psychonautwiki.org/", payload, {
      headers: { "Content-Type": "application/json", "Accept": "application/json" }
    });
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Błąd podczas pobierania danych z PsychonautWiki.", threadID, messageID);
  }

  const subs = res.data?.data?.substances;
  if (!subs || !subs.length) {
    return api.sendMessage("❌ Nie znaleziono tej substancji na PsychonautWiki.", threadID, messageID);
  }

  const s = subs[0];
  let msg = `🧪 **${s.name}**\n\n${s.summary || "Brak opisu."}\n\n`;

  for (const roa of s.roas || []) {
    msg += `📍 *Droga podania:* ${roa.name}\n`;

    const d = roa.dose;
    const doses = [];
    if (d.threshold) doses.push(`Próg: ${d.threshold} ${d.units}`);
    if (d.light?.min != null) doses.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
    if (d.common?.min != null) doses.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
    if (d.strong?.min != null) doses.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
    if (d.heavy) doses.push(`Duża: ${d.heavy} ${d.units}`);
    if (doses.length) msg += `🧮 *Dawkowanie:* ${doses.join(", ")}\n`;

    const dur = roa.duration;
    const parts = [];
    if (dur.onset) parts.push(`Onset: ${dur.onset.min}-${dur.onset.max} ${dur.onset.units}`);
    if (dur.peak) parts.push(`Peak: ${dur.peak.min}-${dur.peak.max} ${dur.peak.units}`);
    if (dur.offset) parts.push(`Offset: ${dur.offset.min}-${dur.offset.max} ${dur.offset.units}`);
    if (dur.afterglow) parts.push(`Afterglow: ${dur.afterglow.min}-${dur.afterglow.max} ${dur.afterglow.units}`);
    if (dur.total) parts.push(`Całkowity czas: ${dur.total.min}-${dur.total.max} ${dur.total.units}`);
    if (parts.length) msg += `⏱️ *Czas działania:* ${parts.join(" • ")}\n`;

    msg += "\n";
  }

  return api.sendMessage(msg.trim(), threadID, messageID);
};