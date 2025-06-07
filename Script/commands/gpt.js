const axios = require('axios');
const tracker = {};

module.exports = {
  config: {
    name: "gpt",
    version: "2.0",
    author: "rehat--",
    role: 2,
    category: "ai",
    description: "Chat GPT 3.5 Turbo",
    guide: "{pn} <query>",
    countDown: 5,
  },

  clearHistory(userID) {
    if (tracker[userID]) {
      delete tracker[userID];
      return true;
    }
    return false;
  },

  async onStart({ message, event, args, usersData }) {
    const userID = event.senderID;
    if (!args.length) return message.reply("Proszę wpisz zapytanie.");

    if (args[0].toLowerCase() === "clear") {
      const cleared = this.clearHistory(userID);
      if (cleared) return message.reply("Historia konwersacji została wyczyszczona.");
      else return message.reply("Nie znaleziono historii do wyczyszczenia.");
    }

    const userName = await usersData.getName(userID);
    const prompt = args.join(" ");
    await runGPT(prompt, userID, message, userName);
  },

  async onReply({ event, message, args, usersData, Reply }) {
    const userID = event.senderID;
    if (Reply.author !== userID) return; // tylko autor odpowiedzi może kontynuować

    if (!args.length) return message.reply("Proszę wpisz zapytanie.");

    const userName = await usersData.getName(userID);
    const prompt = args.join(" ");
    await runGPT(prompt, userID, message, userName);
  },
};

async function runGPT(text, userID, message, userName) {
  await message.react("⏳");

  if (!tracker[userID]) tracker[userID] = `User: ${userName}\n`;

  tracker[userID] += `User: ${text}\n`;

  try {
    const url = `https://public-apis-project86.vercel.app/api/chat?query=${encodeURIComponent(
      `- Current prompt: ${text}\n\n - Conversation:\n${tracker[userID]}`
    )}`;

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const resultText = response.data.answer;
    tracker[userID] += `Bot: ${resultText}\n`;

    const info = await message.reply(
      `${resultText}\n\nMożesz odpisać, aby kontynuować rozmowę.`
    );

    global.client.handleReply.set(info.messageID, {
      commandName: "gpt",
      author: userID,
    });

    await message.react("✅");
  } catch (error) {
    console.error(error);
    await message.react("❌");
    await message.reply("Wystąpił błąd podczas komunikacji z API.");
  }
}
