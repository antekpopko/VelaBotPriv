const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "3.3",
  hasPermssion: 0,
  credits: "January Sakiewka + ChatGPT",
  description: "PsychonautWiki GraphQL – pełne dane o substancjach",
  commandCategory: "edukacja",
  usages: "[nazwa substancji]",
  cooldowns: 3
};

const axiosInstance = axios.create({
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

module.exports.run = async function({ api, event, args }) {
  if (!args.length)
    return api.sendMessage("🔍 Podaj substancję, np. `/drgs mdma`.", event.threadID, event.messageID);

  const query = args.join(" ");

  const payload = {
    query: `
    {
      substances(query: "${query}") {
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
        positiveEffects {
          name
          description
        }
        negativeEffects {
          name
          description
        }
        neutralEffects {
          name
          description
        }
        toxicity {
          LD50 {
            value
            units
            species
          }
          description
        }
        crossTolerance {
          name
          description
        }
        metabolism {
          name
          description
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
  const lines = [`*${s.name}*`];

  if (s.summary) {
    lines.push(s.summary, "");
  }

  for (const roa of s.roas) {
    const d = roa.dose;
    const doses = [];
    if (d.threshold) doses.push(`Próg: ${d.threshold} ${d.units}`);
    if (d.light?.min != null) doses.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
    if (d.common?.min != null) doses.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
    if (d.strong?.min != null) doses.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
    if (d.heavy) doses.push(`Bardzo ciężka: ${d.heavy} ${d.units}`);
    lines.push(`🧪 Dawkowanie (${roa.name}): ${doses.join(", ")}`);

    const dur = roa.duration;
    const durations = [
      dur.total && `Całkowity: ${dur.total.min}-${dur.total.max} ${dur.total.units}`,
      dur.onset && `Onset: ${dur.onset.min}-${dur.onset.max} ${dur.onset.units}`,
      dur.comeup && `Comeup: ${dur.comeup.min}-${dur.comeup.max} ${dur.comeup.units}`,
      dur.peak && `Peak: ${dur.peak.min}-${dur.peak.max} ${dur.peak.units}`,
      dur.offset && `Offset: ${dur.offset.min}-${dur.offset.max} ${dur.offset.units}`,
      dur.afterglow && `Afterglow: ${dur.afterglow.min}-${dur.afterglow.max} ${dur.afterglow.units}`
    ].filter(Boolean);
    lines.push(`⏳ Czas działania (${roa.name}): ${durations.join(" • ")}`);
  }

  // Efekty
  if (s.positiveEffects && s.positiveEffects.length) {
    lines.push("\n✅ Pozytywne efekty:");
    s.positiveEffects.forEach(e => lines.push(`- ${e.name}: ${e.description || "Brak opisu."}`));
  }
  if (s.negativeEffects && s.negativeEffects.length) {
    lines.push("\n❌ Negatywne efekty:");
    s.negativeEffects.forEach(e => lines.push(`- ${e.name}: ${e.description || "Brak opisu."}`));
  }
  if (s.neutralEffects && s.neutralEffects.length) {
    lines.push("\n⚪ Neutralne efekty:");
    s.neutralEffects.forEach(e => lines.push(`- ${e.name}: ${e.description || "Brak opisu."}`));
  }

  // Toksyczność
  if (s.toxicity) {
    if (s.toxicity.LD50) {
      const ld = s.toxicity.LD50;
      lines.push(`\n☠️ Toksyczność (LD50): ${ld.value} ${ld.units} (gatunek: ${ld.species || "nieznany"})`);
    }
    if (s.toxicity.description) {
      lines.push(`Opis toksyczności: ${s.toxicity.description}`);
    }
  }

  // Cross tolerance
  if (s.crossTolerance && s.crossTolerance.length) {
    lines.push("\n🔄 Krzyżowa tolerancja:");
    s.crossTolerance.forEach(t => lines.push(`- ${t.name}: ${t.description || "Brak opisu."}`));
  }

  // Metabolizm
  if (s.metabolism && s.metabolism.length) {
    lines.push("\n⚙️ Metabolizm:");
    s.metabolism.forEach(m => lines.push(`- ${m.name}: ${m.description || "Brak opisu."}`));
  }

  return api.sendMessage(lines.join("\n"), event.threadID, event.messageID);
};