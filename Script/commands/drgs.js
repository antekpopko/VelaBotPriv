const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Informacje o substancjach z PsychonautWiki",
  commandCategory: "edukacja",
  usages: "/drgs [nazwa substancji]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ Podaj substancję, np. `/drgs mdma`", event.threadID, event.messageID);

  const payload = {
    query: `
      {
        substances(query: "${query}") {
          name
          summary
          effects { name }
          roas {
            name
            dose {
              units threshold light { min max } common { min max } strong { min max } heavy
            }
            duration {
              onset { min max units } peak { min max units } offset { min max units }
              afterglow { min max units } total { min max units }
            }
          }
        }
      }`
  };

  try {
    const res = await axios.post("https://api.psychonautwiki.org/", payload, {
      headers: { "Content-Type": "application/json" }
    });

    const subs = res.data?.data?.substances;
    if (!subs || subs.length === 0) {
      return api.sendMessage("❌ Nie znaleziono substancji na PsychonautWiki.", event.threadID, event.messageID);
    }

    const s = subs[0];
    let msg = `🧪 **${s.name}**\n\n${s.summary || "Brak opisu."}\n\n`;

    for (const roa of s.roas) {
      msg += `📍 *Droga podania:* ${roa.name}\n`;
      const d = roa.dose;
      const daw = [];
      if (d.threshold) daw.push(`Próg: ${d.threshold} ${d.units}`);
      if (d.light) daw.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
      if (d.common) daw.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
      if (d.strong) daw.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
      if (d.heavy) daw.push(`Duża: ${d.heavy} ${d.units}`);
      if (daw.length) msg += `🧮 *Dawkowanie:* ${daw.join(", ")}\n`;

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

    if (s.effects?.length) {
      msg += `✨ *Efekty:* ${s.effects.map(e => e.name).join(", ")}`;
    }

    return api.sendMessage(msg.trim(), event.threadID, event.messageID);

  } catch (err) {
    console.error("DRGS ERROR:", err.response?.data || err.message);
    return api.sendMessage("❌ Błąd pobierania danych. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};