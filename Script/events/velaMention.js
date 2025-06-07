module.exports.config = {
  name: "velaMention",
  eventType: ["message", "message_reply"],
  version: "1.0",
  credits: "cwel",
  description: "Reaguje na wzmiankę i odpowiada AI"
};

const axios = require("axios");

module.exports.run = async function ({ api, event }) {
  const botID = api.getCurrentUserID();

  if (!event.mentions || !event.mentions[botID]) return;
  const message = event.body.replace(/@\S+/, "").trim();
  if (!message) return;

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Jesteś pomocnym, dowcipnym asystentem o imieniu Vela. Mówisz po polsku." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json"
      }
    });

    const reply = res.data.choices[0].message.content.trim();
    return api.sendMessage(reply, event.threadID, event.messageID);
  } catch (err) {
    return api.sendMessage("❌ AI nie działa:\n" + (err.response?.data?.error?.message || err.message), event.threadID, event.messageID);
  }
};
