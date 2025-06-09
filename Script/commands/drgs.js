const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ChatGPT + ulepszenia",
  description: "Informacje o substancjach psychoaktywnych z PsychonautWiki, zoptymalizowane",
  commandCategory: "edukacja",
  usages: "/drgs [nazwa substancji]",
  cooldowns: 3
};

const translateRoute = {
  oral: "doustnie",
  nasal: "donosowo",
  intravenous: "dożylnie",
  intramuscular: "domięśniowo",
  rectal: "doodbytniczo",
  sublingual: "podjęzykowo",
  smoked: "palona",
  vaporized: "waporyzowana"
};

const effectTranslations = {
  "Euphoria": "Euforia",
  "Empathy, affection and sociability enhancement": "Empatia i towarzyskość",
  "Stimulation": "Pobudzenie",
  "Visual hallucination": "Halucynacje wzrokowe",
  "Auditory hallucination": "Halucynacje słuchowe",
  "Time distortion": "Zniekształcenie czasu",
  "Increased heart rate": "Przyspieszone tętno",
  "Pupil dilation": "Rozszerzone źrenice",
  "Dry mouth": "Suchość w ustach",
  "Anxiety": "Lęk",
  "Depression": "Obniżenie nastroju",
  "Teeth grinding": "Zgrzytanie zębami",
};

function translateEffects(effects) {
  return [...new Set(effects.map(e => effectTranslations[e] || e))]
    .slice(0, 12); // pokaż maksymalnie 12 nazw
}

module.exports.run = async function({ api, event, args }) {
  const query = args.join(" ");
  if (!query) return api.sendMessage("❌ Podaj nazwę substancji, np. `/drgs MDMA`", event.threadID, event.messageID);

  const payload = {
    query: `
    {
      substances(query: "${query}") {
        name
        routesOfAdministration { name }
        dosage {
          units
          threshold light common strong heavy
        }
        duration {
          onset { min max units }
          peak { min max units }
          offset { min max units }
          afterglow { min max units }
          total { min max units }
        }
        effects { name }
      }
    }`
  };

  try {
    const res = await axios.post("https://api.psychonautwiki.org/", payload, {
      headers: { "Content-Type": "application/json" }
    });

    const s = res.data.data.substances?.[0];
    if (!s) {
      return api.sendMessage("❌ Nie znaleziono tej substancji.", event.threadID, event.messageID);
    }

    const rp = s.routesOfAdministration?.map(r => translateRoute[r.name] || r.name).join(", ") || "—";
    const d = s.dosage || {};
    const dosageLines = [
      `Próg: ${d.threshold || "—"} ${d.units || ""}`,
      `Lekka: ${d.light || "—"} ${d.units || ""}`,
      `Typowa: ${d.common || "—"} ${d.units || ""}`,
      `Silna: ${d.strong || "—"} ${d.units || ""}`,
      `Duża: ${d.heavy || "—"} ${d.units || ""}`
    ].join("\n");

    const dur = s.duration;
    const durationParts = [];
    if (dur) {
      if (dur.onset) durationParts.push(`Początek: ${dur.onset.min}-${dur.onset.max} ${dur.onset.units}`);
      if (dur.peak) durationParts.push(`Szczyt: ${dur.peak.min}-${dur.peak.max} ${dur.peak.units}`);
      if (dur.offset) durationParts.push(`Zakończenie: ${dur.offset.min}-${dur.offset.max} ${dur.offset.units}`);
      if (dur.afterglow) durationParts.push(`Afterglow: ${dur.afterglow.min}-${dur.afterglow.max} ${dur.afterglow.units}`);
      if (dur.total) durationParts.push(`Całkowity czas: ${dur.total.min}-${dur.total.max} ${dur.total.units}`);
    }

    const effets = translateEffects(s.effects.map(e => e.name));

    let msg = `🧪 **${s.name}**\n\n`;
    msg += `📍 *Drogi podania:* ${rp}\n`;
    msg += `🧮 *Dawkowanie (${d.units}):*\n${dosageLines}\n`;
    msg += `⏱️ *Czas działania:*\n${durationParts.join("\n")}\n`;
    msg += `\n✨ *Efekty (${effets.length}):*\n- ${effets.join("\n- ")}`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  } catch (err) {
    console.error("drgs ERR:", err.response?.data || err.message);
    return api.sendMessage("❌ Błąd pobierania danych. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
};