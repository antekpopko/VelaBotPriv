const axios = require('axios');

const apiURL = "https://smfahim.xyz/gedit";

module.exports.config = {
  name: "zdjedit",
  version: "1.0",
  credits: "Fahim API + ulepszenia: cwel",
  countDown: 5,
  hasPermssion: 0,
  commandCategory: "🎨 AI / Edycja zdjęć",
  description: "Edytuj zdjęcia za pomocą AI. Odpowiedz na zdjęcie i podaj prompt.",
  usages: "[prompt]",
  guide: {
    pl: "Odpowiedz na zdjęcie komendą: {pn} [opis edycji w języku angielskim]"
  }
};

async function handleEdit(api, event, args) {
  const url = event.messageReply?.attachments?.[0]?.url;
  const prompt = args.join(" ") || "Enhance this image";

  if (!url) {
    return api.sendMessage("❌ Musisz odpowiedzieć na wiadomość zawierającą zdjęcie.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(
      `${apiURL}?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(url)}`,
      {
        responseType: 'stream',
        validateStatus: () => true
      }
    );

    // Jeżeli odpowiedź to zdjęcie — wyślij je
    if (response.headers['content-type']?.startsWith('image/')) {
      return api.sendMessage(
        { attachment: response.data },
        event.threadID,
        event.messageID
      );
    }

    // Jeśli nie, spróbuj sparsować jako JSON
    let responseData = '';
    for await (const chunk of response.data) {
      responseData += chunk.toString();
    }

    const jsonData = JSON.parse(responseData);
    if (jsonData?.response) {
      return api.sendMessage(`📢 Odpowiedź AI: ${jsonData.response}`, event.threadID, event.messageID);
    }

    return api.sendMessage("⚠️ Brak poprawnej odpowiedzi z API.", event.threadID, event.messageID);

  } catch (err) {
    console.error("Błąd w komendzie 'edytuj':", err);
    return api.sendMessage("❌ Wystąpił błąd podczas przetwarzania zdjęcia. Spróbuj ponownie później.", event.threadID, event.messageID);
  }
}

module.exports.run = async ({ api, event, args }) => {
  if (!event.messageReply) {
    return api.sendMessage("❌ Musisz odpowiedzieć na zdjęcie tą komendą.", event.threadID, event.messageID);
  }
  await handleEdit(api, event, args);
};

module.exports.handleReply = async function ({ api, event, args }) {
  if (event.type === "message_reply") {
    await handleEdit(api, event, args);
  }
};