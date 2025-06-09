const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ChatGPT + ulepszone przez cwel",
  description: "📚 Sprawdź informacje o substancjach psychoaktywnych z PsychonautWiki",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (!args.length) {
    return api.sendMessage("ℹ️ Podaj nazwę substancji, np. `/drgs mdma`", event.threadID, event.messageID);
  }

  const queryStr = args.join(" ");
  const payload = {
    query: `
      {
        substances(query: "${queryStr}") {
          name
          summary
          effects {
            name
          }
          roas {
            name
            dose {
              units
              threshold
              light {
                min
                max
              }
              common {
                min
                max
              }
              strong {
                min
                max
              }
              heavy
            }
            duration {
              onset {
                min
                max
                units
              }
              peak {
                min
                max
                units
              }
              offset {
                min
                max
                units
              }
              afterglow {
                min
                max
                units
              }
              total {
                min
                max
                units
              }
            }
          }
        }
      }
    `
  };

  try {
    const res = await axios.post("https://api.psychonautwiki.org/", payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const subs = res.data.data?.substances;
    if (!subs || subs.length === 0) {
      return api.sendMessage("❌ Nie znaleziono substancji. Spróbuj wpisać inną nazwę.", event.threadID, event.messageID);
    }

    const s = subs[0];
    let msg = `🧪 **${s.name}**\n\n${s.summary || "Brak opisu."}\n\n`;

    for (const roa of s.roas) {
      msg += `📍 *Droga podania:* ${roa.name}\n`;

      // Dawkowanie
      const d = roa.dose;
      const daw = [];
      if (d.threshold) daw.push(`Próg: ${d.threshold} ${d.units}`);
      if (d.light) daw.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
      if (d.common) daw.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
      if (d.strong) daw.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
      if (d.heavy) daw.push(`Duża: ${d.heavy} ${d.units}`);
      if (daw.length) msg += `🧮 *Dawkowanie:* ${daw.join(", ")}\n`;

      // Czas działania
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

    if (s.effects && s.effects.length) {
      msg += `✨ *Efekty:* ${s.effects.map(e => e.name).join(", ")}`;
    }

    return api.sendMessage(msg.trim(), event.threadID, event.messageID);

  } catch (e) {
    console.error("❌ Błąd API:", e.response?.data || e.message);
    return api.sendMessage("❌ Błąd podczas pobierania danych. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};