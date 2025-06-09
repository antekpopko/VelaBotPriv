const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
  return base.data.api;
};

module.exports = {
  config: {
    name: "youtube",
    version: "1.2.0",
    credits: "dipto (PL modyfikacja: cwel)",
    countDown: 5,
    hasPermssion: 0,
    description: "Pobierz film, muzykę lub informacje z YouTube",
    category: "🎬 Media",
    commandCategory: "media",
    usePrefix: true,
    prefix: true,
    usages:
      "{pn} -v [nazwa lub link] – pobierz wideo\n" +
      "{pn} -a [nazwa lub link] – pobierz audio\n" +
      "{pn} -i [nazwa lub link] – pokaż informacje\n" +
      "Przykłady:\n" +
      "{pn} -v chipi chipi\n{pn} -a https://youtu.be/abc123\n{pn} -i chipi chipi",
  },

  run: async ({ api, args, event }) => {
    const { threadID, messageID, senderID } = event;

    if (!args[0]) return api.sendMessage("❌ Podaj opcję: -v, -a lub -i", threadID, messageID);
    const action = args[0].toLowerCase();

    const checkurl = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/;
    const isLink = args[1] && checkurl.test(args[1]);

    // LINK: pobierz bez wyszukiwania
    if (isLink) {
      const format =
        ["-v", "video", "mp4"].includes(action) ? "mp4" :
        ["-a", "audio", "mp3", "music"].includes(action) ? "mp3" : null;

      if (!format) return api.sendMessage("❌ Nieprawidłowy format. Użyj -v (wideo) lub -a (audio).", threadID, messageID);

      try {
        const link = args[1];
        const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${link}&format=${format}&quality=3`);
        const path = `ytb_${Date.now()}.${format}`;

        await api.sendMessage({
          body: `🎵 Tytuł: ${title}\n🎞️ Jakość: ${quality}`,
          attachment: await downloadFile(downloadLink, path),
        }, threadID, () => fs.unlinkSync(path), messageID);
      } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Nie udało się pobrać. Spróbuj ponownie później.", threadID, messageID);
      }
      return;
    }

    // SZUKAJ PO NAZWIE
    args.shift();
    const query = args.join(" ");
    if (!query) return api.sendMessage("❌ Podaj słowo kluczowe do wyszukania.", threadID, messageID);

    try {
      const searchResult = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(query)}`)).data.slice(0, 6);
      if (!searchResult.length) return api.sendMessage(`❌ Brak wyników dla: ${query}`, threadID, messageID);

      let msg = "";
      const thumbs = [];

      searchResult.forEach((info, i) => {
        thumbs.push(streamImage(info.thumbnail, `thumb_${i + 1}.jpg`));
        msg += `${i + 1}. ${info.title}\n⏳ Czas: ${info.time}\n📺 Kanał: ${info.channel.name}\n\n`;
      });

      api.sendMessage({
        body: msg + "👉 Odpowiedz numerem, aby wybrać film.",
        attachment: await Promise.all(thumbs),
      }, threadID, (err, info) => {
        if (err) return console.error(err);
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          result: searchResult,
          action,
        });
      }, messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Wystąpił błąd podczas wyszukiwania.", threadID, messageID);
    }
  },

  handleReply: async ({ event, api, handleReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice <= 0 || choice > handleReply.result.length)
      return api.sendMessage("❌ Podaj poprawny numer z listy.", threadID, messageID);

    const selected = handleReply.result[choice - 1];
    const link = selected.url || selected.link || selected.id || null;

    if (!link) return api.sendMessage("❌ Nie udało się uzyskać linku wideo.", threadID, messageID);

    const action = handleReply.action;
    await api.unsendMessage(handleReply.messageID);

    if (["-v", "video", "mp4", "-a", "audio", "mp3", "music"].includes(action)) {
      const format = ["-v", "video", "mp4"].includes(action) ? "mp4" : "mp3";
      try {
        const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${link}&format=${format}&quality=3`);
        const path = `ytb_${Date.now()}.${format}`;

        await api.sendMessage({
          body: `🎵 Tytuł: ${title}\n🎞️ Jakość: ${quality}`,
          attachment: await downloadFile(downloadLink, path),
        }, threadID, () => fs.unlinkSync(path), messageID);
      } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Nie udało się pobrać pliku.", threadID, messageID);
      }
    }

    if (action === "-i" || action === "info") {
      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytfullinfo?videoID=${extractVideoID(link)}`);
        await api.sendMessage({
          body: `🎬 Tytuł: ${data.title}\n⏳ Czas trwania: ${(data.duration / 60).toFixed(2)} min\n📺 Rozdzielczość: ${data.resolution}\n👁️ Wyświetlenia: ${data.view_count}\n👍 Polubienia: ${data.like_count}\n💬 Komentarze: ${data.comment_count}\n📂 Kategoria: ${data.categories[0]}\n📢 Kanał: ${data.channel}\n👥 Subskrybenci: ${data.channel_follower_count}\n🔗 Link: ${data.webpage_url}`,
          attachment: await streamImage(data.thumbnail, "info_thumb.jpg"),
        }, threadID, messageID);
      } catch (e) {
        console.error(e);
        return api.sendMessage("❌ Nie udało się pobrać informacji.", threadID, messageID);
      }
    }
  }
};

async function downloadFile(url, pathName) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(pathName, Buffer.from(res.data));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

async function streamImage(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    throw err;
  }
}

function extractVideoID(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$)/);
  return match ? match[1] : null;
}