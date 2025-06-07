const axios = require("axios");

module.exports.config = {
  name: "gpt",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "cwel + OpenRouter",
  description: "Rozmawiaj z GPT-3.5 Turbo",
  commandCategory: "ai",
  usages: "[zapytanie]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) {
    return api.sendMessage("❗ Podaj zapytanie, np:\n/gpt jak działa czarna dziura?", threadID, messageID);
  }

  try {
    api.sendMessage("⏳ Przetwarzam zapytanie...", threadID, messageID);

    const res = await axios.post("https://openrouter.ai/api/chat", {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: input
        }
      ]
    }, {
      headers: {
        "Authorization": "Bearer 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", // OpenRouter demo token
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content;

    api.sendMessage(reply, threadID, (err, info) => {
      global.client.handleReply.set(info.messageID, {
        name: module.exports.config.name,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error("❌ Błąd GPT:", err.message);
    return api.sendMessage("❌ Wystąpił błąd podczas przetwarzania zapytania GPT.", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author !== senderID) return;

  try {
    const res = await axios.post("https://openrouter.ai/api/chat", {
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "user", content: body }
      ]
    }, {
      headers: {
        "Authorization": "Bearer DEMO",
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content;

    api.sendMessage(reply, threadID, (err, info) => {
      global.client.handleReply.set(info.messageID, {
        name: module.exports.config.name,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    console.error("❌ Błąd GPT:", err.message);
    return api.sendMessage("❌ Nie udało się uzyskać odpowiedzi od GPT.", threadID, messageID);
  }
};
