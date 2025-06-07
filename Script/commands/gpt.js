const axios = require("axios");
const tracker = {};

module.exports.config = {
  name: "gpt",
  version: "2.0",
  hasPermssion: 2,
  credits: "rehat--",
  description: "Chat GPT 3.5 Turbo",
  commandCategory: "ai",
  usages: "<query>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, usersData }) {
  const { threadID, messageID, senderID } = event;

  if (!args.length) return api.sendMessage("❗ Proszę wpisz zapytanie.", threadID, messageID);

  if (args[0].toLowerCase() === "clear") {
    if (tracker[senderID]) {
      delete tracker[senderID];
      return api.sendMessage("✅ Historia konwersacji została wyczyszczona.", threadID, messageID);
    } else {
      return api.sendMessage("❌ Nie znaleziono historii do wyczyszczenia.", threadID, messageID);
    }
  }

  const prompt = args.join(" ");
  const userName = await usersData.getName(senderID) || "User";

  if (!tracker[senderID]) tracker[senderID] = `${userName}.\n`;
  tracker[senderID] += `${prompt}.\n`;

  // Reakcja '⏳' - niestety api.sendMessage nie ma metody reaction w tym formacie,
  // można ją pominąć lub użyć api.setMessageReaction jeśli masz w systemie
  // Przykład (jeśli jest obsługa):
  // await api.setMessageReaction("⏳", messageID, threadID, true);

  try {
    const url = `https://public-apis-project86.vercel.app/api/chat?query=${encodeURIComponent(`- Current prompt: ${prompt}\n\n - Conversation:\n${tracker[senderID]}`)}`;

    const response = await axios.post(url, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resultText = response.data.answer || "Brak odpowiedzi od API.";
    tracker[senderID] += `${resultText}\n`;

    api.sendMessage(`${resultText}\n\nMożesz odpisać, aby kontynuować rozmowę.`, threadID, (error, info) => {
      if (!error) {
        global.client.handleReply.set(info.messageID, {
          commandName: "gpt",
          author: senderID,
        });
      }
    }, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Wystąpił błąd podczas komunikacji z API.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, args, usersData, Reply }) {
  const { senderID, threadID, messageID } = event;

  if (Reply.author !== senderID) return;

  if (!args.length) return api.sendMessage("❗ Proszę wpisz zapytanie.", threadID, messageID);

  const prompt = args.join(" ");
  const userName = await usersData.getName(senderID) || "User";

  if (!tracker[senderID]) tracker[senderID] = `${userName}.\n`;
  tracker[senderID] += `${prompt}.\n`;

  try {
    const url = `https://public-apis-project86.vercel.app/api/chat?query=${encodeURIComponent(`- Current prompt: ${prompt}\n\n - Conversation:\n${tracker[senderID]}`)}`;

    const response = await axios.post(url, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resultText = response.data.answer || "Brak odpowiedzi od API.";
    tracker[senderID] += `${resultText}\n`;

    api.sendMessage(`${resultText}\n\nMożesz odpisać, aby kontynuować rozmowę.`, threadID, (error, info) => {
      if (!error) {
        global.client.handleReply.set(info.messageID, {
          commandName: "gpt",
          author: senderID,
        });
      }
    }, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Wystąpił błąd podczas komunikacji z API.", threadID, messageID);
  }
};
