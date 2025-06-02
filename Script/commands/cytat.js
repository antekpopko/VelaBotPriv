const axios = require("axios");
const cheerio = require("cheerio");

const GENIUS_API_TOKEN = "YPBYJtsbH69MWuC0Kj730Cp1S4PpRDzWd1y_qhjzrROKSco9c7VweNeVV0qdWdyK"; // <- Podstaw swój token

module.exports.config = {
  name: "cytat",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT + Genius",
  description: "Losowy cytat z Genius",
  commandCategory: "muzyka",
  usages: "/quote",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  try {
    // Szukamy losowej popularnej piosenki
    const search = await axios.get("https://api.genius.com/songs/3039923", {
      headers: { Authorization: `Bearer ${GENIUS_API_TOKEN}` },
    });

    const songData = search.data.response.song;
    const url = songData.url;
    const title = songData.title;
    const artist = songData.primary_artist.name;

    // Pobieramy stronę z tekstem
    const page = await axios.get(url);
    const $ = cheerio.load(page.data);

    // Wyciągamy tekst z .lyrics lub z nowszej struktury
    let lyrics = $("div[class^='Lyrics__Container']").first().text().trim();

    if (!lyrics) {
      lyrics = $(".lyrics").text().trim(); // fallback dla starszych stron
    }

    // Skracamy cytat do np. 2–3 linijek
    const lines = lyrics.split("\n").filter(line => line.trim() !== "");
    const quote = lines.slice(0, 3).join("\n");

    return api.sendMessage(
      `🎶 "${quote}"\n— ${artist} – ${title}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error("Błąd Genius:", error.message);
    return api.sendMessage("❌ Nie udało się pobrać cytatu z Genius 😢", event.threadID, event.messageID);
  }
};