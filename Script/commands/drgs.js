const axios = require("axios");

const WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/";

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Wikipedia",
  hasPermssion: 0,
  description: "Informacje o substancjach z Wikipedii (wersja beta)",
  commandCategory: "informacje",
};

module.exports.run = async function({ args, api, event }) {
  if (!args.length)
    return api.sendMessage("Podaj nazwę substancji do wyszukania.", event.threadID, event.messageID);

  const query = args.join(" ");

  try {
    const res = await axios.get(WIKI_API + encodeURIComponent(query));
    if (res.data && (res.data.type === "standard" || res.data.type === "disambiguation")) {
      const title = res.data.title || query;
      const extract = res.data.extract || "Brak opisu.";
      const pageUrl = res.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;

      let msg = `🧪 *${title}*\n\n${extract}\n\n🔗 Więcej: ${pageUrl}\n\n⚠️ Uwaga: to jest wersja beta komendy i chwilowo działa tylko tak.`;

      return api.sendMessage(msg, event.threadID, event.messageID);
    } else {
      return api.sendMessage("Nie znaleziono informacji o tej substancji na Wikipedii.", event.threadID, event.messageID);
    }
  } catch (e) {
    return api.sendMessage("Błąd podczas wyszukiwania informacji.", event.threadID, event.messageID);
  }
};