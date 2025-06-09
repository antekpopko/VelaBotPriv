const axios = require("axios");

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";

const TRANSLATE_API = "https://libretranslate.de/translate";

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Wikipedia + LibreTranslate",
  hasPermssion: 0,
  description: "Informacje o substancjach z Wikipedii (wersja beta)",
  commandCategory: "informacje",
};

async function translateText(text, targetLang = "pl") {
  try {
    const res = await axios.post(
      TRANSLATE_API,
      {
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.data && res.data.translatedText) return res.data.translatedText;
    return text; // fallback
  } catch {
    return text; // fallback jeśli coś nie działa
  }
}

module.exports.run = async function({ args, api, event }) {
  if (!args.length)
    return api.sendMessage("Podaj nazwę substancji do wyszukania.", event.threadID, event.messageID);

  const query = args.join(" ");

  try {
    const wikiRes = await axios.get(WIKI_API + encodeURIComponent(query));
    if (wikiRes.data.type === "disambiguation" || wikiRes.data.type === "standard") {
      const title = wikiRes.data.title;
      const extract = wikiRes.data.extract;
      const pageUrl = wikiRes.data.content_urls.desktop.page;

      const extractPL = await translateText(extract, "pl");

      let msg = `🧪 *${title}*\n\n${extractPL}\n\n🔗 Więcej: ${pageUrl}\n\n⚠️ Uwaga: to jest wersja beta komendy i chwilowo działa tylko tak.`;

      return api.sendMessage(msg, event.threadID, event.messageID);
    } else {
      return api.sendMessage("Nie znaleziono informacji o tej substancji na Wikipedii.", event.threadID, event.messageID);
    }
  } catch (e) {
    return api.sendMessage("Błąd podczas wyszukiwania informacji.", event.threadID, event.messageID);
  }
};