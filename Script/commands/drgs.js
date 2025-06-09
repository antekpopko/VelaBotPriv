const axios = require("axios");

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Wikipedia (beta)",
  hasPermssion: 0,
  description: "Szukaj danych o substancjach na Wikipedii (beta)",
  commandCategory: "informacje",
};

async function searchWikipedia(query) {
  try {
    // Szukaj artykułu w Wikipedia API
    const searchRes = await axios.get("https://en.wikipedia.org/w/api.php", {
      params: {
        action: "query",
        list: "search",
        srsearch: query,
        format: "json",
        srlimit: 1,
      },
    });

    if (!searchRes.data.query.search.length) return null;

    const title = searchRes.data.query.search[0].title;

    // Pobierz podsumowanie artykułu
    const summaryRes = await axios.get(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title)
    );

    return {
      title: summaryRes.data.title,
      extract: summaryRes.data.extract,
      url: summaryRes.data.content_urls?.desktop.page || null,
    };
  } catch {
    return null;
  }
}

module.exports.run = async function({ args, api, event }) {
  if (!args.length)
    return api.sendMessage("Podaj nazwę substancji!", event.threadID, event.messageID);

  const query = args.join(" ");

  const data = await searchWikipedia(query);

  if (!data)
    return api.sendMessage(
      "Nie znaleziono informacji o tej substancji na Wikipedii.",
      event.threadID,
      event.messageID
    );

  let msg = `🧪 *${data.title}*\n\n${data.extract}\n\n🔗 Więcej: ${data.url}\n\n⚠️ Uwaga: to jest wersja beta komendy i chwilowo działa tylko tak.`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};