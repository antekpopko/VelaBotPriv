const axios = require("axios");

const API_URL = "https://psychonautwiki.org/api/graphql";

const headers = {
  "Content-Type": "application/json",
};

const doseLabels = {
  threshold: "Próg",
  light: "Lekka",
  common: "Typowa",
  strong: "Silna",
  heavy: "Duża",
};

const timeUnits = {
  minutes: "min",
  minute: "min",
  hours: "h",
  hour: "h",
};

const roaMap = {
  oral: "doustna",
  insufflated: "donosowa",
  intravenous: "dożylna",
  smoked: "inhalacyjna",
  rectal: "doodbytnicza",
  sublingual: "podjęzykowa"
};

function formatTime(t) {
  if (!t) return "-";
  return `${t.min}-${t.max} ${timeUnits[t.units] || t.units}`;
}

function formatDuration(dur) {
  if (!dur) return "";
  const parts = [];
  if (dur.onset) parts.push(`Onset: ${formatTime(dur.onset)}`);
  if (dur.peak) parts.push(`Peak: ${formatTime(dur.peak)}`);
  if (dur.offset) parts.push(`Offset: ${formatTime(dur.offset)}`);
  if (dur.afterglow) parts.push(`Afterglow: ${formatTime(dur.afterglow)}`);
  if (dur.total) parts.push(`Całkowity czas: ${formatTime(dur.total)}`);
  return parts.join(" • ");
}

module.exports.config = {
  name: "drgs",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ChatGPT + cwel",
  description: "Edukacja o substancjach psychoaktywnych z PsychonautWiki",
  commandCategory: "edukacja",
  usages: "drgs [nazwa substancji]",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args }) {
  const name = args.join(" ");
  if (!name) return api.sendMessage("❌ Podaj nazwę substancji, np. /drgs MDMA", event.threadID, event.messageID);

  const query = {
    query: `query { substance(name: \"${name}\") {
      name
      summary
      effects { name }
      dosage { name threshold { min max units } light { min max units } common { min max units } strong { min max units } heavy { min max units } } 
      roa { name duration { onset { min max units } peak { min max units } offset { min max units } afterglow { min max units } total { min max units } } }
    }}`
  };

  try {
    const res = await axios.post(API_URL, query, { headers });
    const s = res.data.data.substance;
    if (!s) return api.sendMessage("❌ Nie znaleziono informacji o podanej substancji.", event.threadID, event.messageID);

    let msg = `🧪 **${s.name}**\n\n`;
    msg += s.summary ? `${s.summary}\n\n` : "Brak opisu.\n\n";

    if (s.roa?.length) {
      const roa = s.roa[0];
      const droga = roaMap[roa.name.toLowerCase()] || roa.name;
      msg += `📍 *Droga podania:* ${droga}\n`;
      msg += `🧮 *Dawkowanie:* `;
      const dawki = s.dosage || {};
      msg += Object.entries(doseLabels).map(([key, label]) => {
        const val = dawki[key];
        return val ? `${label}: ${val.min}-${val.max} ${val.units}` : null;
      }).filter(Boolean).join(", ") + "\n";

      const czas = formatDuration(roa.duration);
      if (czas) msg += `⏱️ *Czas działania:* ${czas}\n`;
    }

    if (s.effects?.length) {
      msg += `✨ *Efekty:*\n` + s.effects.map(e => `- ${e.name}`).join("\n") + "\n";
    }

    return api.sendMessage(msg.trim(), event.threadID, event.messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Błąd podczas pobierania danych. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};
