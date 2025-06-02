module.exports.config = {
  name: "mention",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Przerobione przez ChatGPT na bazie CYBER TEAM",
  description: "Bot odpowiada, gdy ktoś oznaczy admina",
  commandCategory: "inne",
  usages: "",
  cooldowns: 1
};

module.exports.handleEvent = function ({ api, event }) {
  const adminID = "61563352322805"; // UID admina
  const mentionedIDs = Object.keys(event.mentions || {});

  if (event.senderID === adminID) return;

  if (mentionedIDs.includes(adminID)) {
    const responses = [
      "Nie oznaczaj szefa, jest teraz zajęty okradaniem ludzi!",
      "Ktoś znowu woła admina... tym razem Ty.",
      "Zanim zawołasz admina, upewnij się, że to ważne.",
      "Szef ma ważniejsze sprawy niż Twoje tagi.",
      "Czemu znowu oznaczasz admina? Daj mu spokój!",
      "Admin okrada ludzi. Nie przeszkadzaj!",
      "Oznaczyłeś admina. Czy to było konieczne?"
    ];

    const randomReply = responses[Math.floor(Math.random() * responses.length)];

    return api.sendMessage(randomReply, event.threadID, event.messageID);
  }
};

module.exports.run = async function () {};
