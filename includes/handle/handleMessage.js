const axios = require("axios");

module.exports = async function ({ api, event }) {
  const botID = api.getCurrentUserID();

  // Sprawdź, czy bot został oznaczony
  const isMentioned = event.mentions && event.mentions[botID];
  if (!isMentioned) return;

  const message = event.body.replace(/@\S+/, "").trim();
  if (!message) return;

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4",
      messages: [
        { role: "system", content: "Jesteś pomocnym, dowcipnym asystentem o imieniu Vela. Mówisz po polsku." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        "Authorization": `Bearer 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,
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content.trim();
    api.sendMessage(reply, event.threadID, event.messageID);
  } catch (err) {
    console.error("Błąd OpenAI:", err);
    api.sendMessage("❌ Coś poszło nie tak z AI. Spróbuj później.", event.threadID, event.messageID);
  }
};
