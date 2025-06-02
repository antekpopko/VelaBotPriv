const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports.config = {
  name: "sing",
  version: "2.1.0",
  aliases: ["muzyka", "play", "piosenka"],
  credits: "dipto (tłumaczenie: January Sakiewka)",
  countDown: 5,
  hasPermssion: 0,
  description: "Pobierz muzykę z YouTube",
  commandCategory: "🎵 Media",
  usages: "{pn} <nazwa utworu> lub <link do YouTube>\nPrzykład:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async function({ api, args, event }) {
  try {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    let videoID;
    const urlYtb = checkurl.test(args[0]);

    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
      const { data: { title, downloadLink } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      return api.sendMessage({
        body: `🎧 Tytuł: ${title}`,
        attachment: await pobierzPlik(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
    }

    let keyWord = args.join(" ");
    keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;

    let result;
    try {
      result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, 6);
    } catch (err) {
      return api.sendMessage("❌ Wystąpił błąd podczas wyszukiwania:\n" + err.message, event.threadID, event.messageID);
    }

    if (result.length === 0)
      return api.sendMessage("🔍 Nie znaleziono wyników dla: " + keyWord, event.threadID, event.messageID);

    let msg = "";
    let i = 1;
    const thumbnails = [];

    for (const info of result) {
      try {
        thumbnails.push(await pobierzMiniaturkę(info.thumbnail, `thumb${i}.jpg`));
      } catch {
        // jeśli nie uda się pobrać miniaturki, pomiń ją
      }
      msg += `${i++}. 🎵 ${info.title}\n⏱️ Czas: ${info.time}\n📺 Kanał: ${info.channel.name}\n\n`;
    }

    api.sendMessage({
      body: msg + "🔁 Odpowiedz na tę wiadomość numerem piosenki, którą chcesz pobrać (1-6)",
      attachment: thumbnails.length ? thumbnails : undefined
    }, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        result
      });
    }, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Wystąpił błąd w komendzie.", event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function({ event, api, handleReply }) {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (!isNaN(choice) && choice > 0 && choice <= result.length) {
      const selected = result[choice - 1];
      const videoID = selected.id;
      const { data: { title, downloadLink, quality } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      await api.unsendMessage(handleReply.messageID);
      return api.sendMessage({
        body: `🎶 Tytuł: ${title}\n📦 Jakość: ${quality}`,
        attachment: await pobierzPlik(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);

    } else {
      return api.sendMessage("❌ Nieprawidłowy wybór. Wpisz numer od 1 do 6.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("⭕ Przepraszamy, wystąpił problem z pobraniem audio (możliwe, że przekracza 26MB).", event.threadID, event.messageID);
  }
};

async function pobierzPlik(url, nazwaPliku) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(nazwaPliku, Buffer.from(response));
  return fs.createReadStream(nazwaPliku);
}

async function pobierzMiniaturkę(url, nazwa) {
  const response = await axios.get(url, { responseType: "stream" });
  // Nie trzeba ustawiać ścieżki, wystarczy zwrócić stream
  return response.data;
}