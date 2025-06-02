const axios = require("axios");
const cheerio = require("cheerio");

const GENIUS_API_TOKEN = "FcHZF-UEomMue3MW8E_YFFaOdQ_i85181onS553-fyrGQXa5dNHzizd64hOmfJwx";

module.exports.config = {
  name: "quote",
  version: "1.0",
  hasPermssion: 0,
  credits: "ChatGPT + Genius",
  description: "Losowy cytat z piosenki dzięki Genius API",
  commandCategory: "muzyka",
  usages: "/quote",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    console.log("Losowa litera:", randomLetter);

    const response = await axios.get(`https://api.genius.com/search?q=${randomLetter}`, {
      headers: { Authorization: `Bearer ${GENIUS_API_TOKEN}` }
    });

    console.log("Dane z Genius:", response.data);

    const results = response.data.response.hits;
    if (!results || results.length === 0) throw new Error("Brak wyników z Genius");

    const randomSong = results[Math.floor(Math.random() * results.length)].result;
    console.log("Wybrana piosenka:", randomSong.full_title);

    const songUrl = randomSong.url;
    const html = await axios.get(songUrl);
    const $ = cheerio.load(html.data);

    let lyrics = $("div[class^='Lyrics__Container']").text().trim();
    if (!lyrics) lyrics = $(".lyrics").text().trim();
    if (!lyrics) throw new Error("Nie udało się odczytać tekstu piosenki");

    const lines = lyrics.split("\n").filter(line => line.trim() !== "");
    const start = Math.floor(Math.random() * Math.max(1, lines.length - 3));
    const quote = lines.slice(start, start + 3).join("\n");

    return api.sendMessage(`🎵 ${randomSong.full_title}\n\n"${quote}"`, event.threadID, event.messageID);

  } catch (error) {
    console.error("Błąd Genius /quote:", error);
    return api.sendMessage("❌ Nie udało się pobrać cytatu z Genius 😢", event.threadID, event.messageID);
  }
};