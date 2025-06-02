module.exports.config = {
  name: "cycki",
  version: "1.1",
  hasPermssion: 0,
  credits: "OpenAI / January",
  description: "Pobiera losowe zdjęcie z wybranych subreddits o tematyce cycków",
  commandCategory: "rozrywka",
  usages: "",
  cooldowns: 10
};

const axios = require("axios");

module.exports.run = async function({ api, event }) {
  try {
    // Lista subredditów z tematyki cycków
    const subreddits = [
      "boobs",
      "tits",
      "boobies",
      "breasts",
      "chesticles",
      "bigboobs",
      "cleavage"
    ];

    // Losowy wybór subreddita
    const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=50`);
    const posts = response.data.data.children;

    // Filtrujemy posty z obrazkami
    const imagePosts = posts.filter(post => {
      const url = post.data.url;
      return url.match(/\.(jpg|jpeg|png|gif)$/);
    });

    if (imagePosts.length === 0) {
      return api.sendMessage(`Nie znaleziono obrazków na subreddicie r/${subreddit}.`, event.threadID, event.messageID);
    }

    // Losowy obrazek
    const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
    const imageUrl = randomPost.data.url;

    return api.sendMessage({ body: `Zdjęcie z r/${subreddit}:`, attachment: await global.utils.getStream(imageUrl) }, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("Wystąpił błąd podczas pobierania zdjęć.", event.threadID, event.messageID);
  }
};