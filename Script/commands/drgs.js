const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "3.1",
  hasPermssion: 2,
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
  const lines = [`*${s.name}*`];

  if (s.summary) {
    lines.push(s.summary);
    lines.push("");
  }

  for (const roa of s.roas) {
    const d = roa.dose;
    const dg = [];
    if (d.threshold) dg.push(`Próg: ${d.threshold} ${d.units}`);
    if (d.light?.min != null) dg.push(`Lekka: ${d.light.min}-${d.light.max} ${d.units}`);
    if (d.common?.min != null) dg.push(`Typowa: ${d.common.min}-${d.common.max} ${d.units}`);
    if (d.strong?.min != null) dg.push(`Silna: ${d.strong.min}-${d.strong.max} ${d.units}`);
    if (d.heavy) dg.push(`Bardzo ciężka: ${d.heavy} ${d.units}`);
    lines.push(`🧪 Dawkowanie (${roa.name}): ${dg.join(", ")}`);

    const dur = roa.duration;
    const dd = [
      dur.total && `Całkowity: ${dur.total.min}-${dur.total.max} ${dur.total.units}`,
      dur.onset && `Onset: ${dur.onset.min}-${dur.onset.max} ${dur.onset.units}`,
      dur.comeup && `Comeup: ${dur.comeup.min}-${dur.comeup.max} ${dur.comeup.units}`,
      dur.peak && `Peak: ${dur.peak.min}-${dur.peak.max} ${dur.peak.units}`,
      dur.offset && `Offset: ${dur.offset.min}-${dur.offset.max} ${dur.offset.units}`,
      dur.afterglow && `Afterglow: ${dur.afterglow.min}-${dur.afterglow.max} ${dur.afterglow.units}`
    ].filter(Boolean);
    lines.push(`⏳ Czas działania (${roa.name}): ${dd.join(" • ")}`);
  }

  const msg = lines.join("\n");
  return api.sendMessage(msg, event.threadID, event.messageID);
};