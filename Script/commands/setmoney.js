module.exports.config = {
  name: "setmoney",
  version: "1.0.3",
  hasPermssion: 2,
  credits: "CYBER ☢️ TEAM + poprawki: January + Vela Edition",
  description: "Zmień saldo swoje lub innej osoby 💰",
  commandCategory: "system",
  usages: "[me | del | @tag | UID] [kwota]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
  const { threadID, messageID, senderID, mentions, body, type, messageReply } = event;
  const mentionID = Object.keys(mentions)[0];
  const prefix = global.config.PREFIX || "/";

  const parseAmount = input => {
    const amount = parseInt(input);
    return isNaN(amount) || amount < 0 ? null : amount;
  };

  try {
    // === Set own money ===
    if (args[0] === "me") {
      const amount = parseAmount(args[1]);
      if (amount === null) return api.sendMessage("❌ Podaj poprawną kwotę (liczbę dodatnią).", threadID, messageID);

      await Currencies.setData(senderID, { money: amount });
      return api.sendMessage(`✅ Twoje saldo zostało ustawione na ${amount} 💸`, threadID, messageID);
    }

    // === Delete own money ===
    if (args[0] === "del" && args[1] === "me") {
      await Currencies.setData(senderID, { money: 0 });
      return api.sendMessage(`✅ Twoje saldo zostało wyzerowane 💸`, threadID, messageID);
    }

    // === Delete mentioned user's money ===
    if (args[0] === "del" && mentionID) {
      await Currencies.setData(mentionID, { money: 0 });
      const name = mentions[mentionID].replace("@", "");
      return api.sendMessage(`✅ Saldo użytkownika ${name} zostało wyzerowane 💸`, threadID, messageID);
    }

    // === Set money by mention ===
    if (mentionID && args[1]) {
      const amount = parseAmount(args[1]);
      if (amount === null) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
      await Currencies.setData(mentionID, { money: amount });
      const name = mentions[mentionID].replace("@", "");
      return api.sendMessage({
        body: `✅ Saldo użytkownika ${name} zostało ustawione na ${amount} 💸`,
        mentions: [{ tag: name, id: mentionID }]
      }, threadID, messageID);
    }

    // === Set money by UID ===
    if (args[0] === "UID" && args[1] && args[2]) {
      const uid = args[1];
      const amount = parseAmount(args[2]);
      if (amount === null) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
      const name = (await Users.getData(uid))?.name || "Użytkownik";
      await Currencies.setData(uid, { money: amount });
      return api.sendMessage(`✅ Saldo użytkownika ${name} (${uid}) zostało ustawione na ${amount} 💸`, threadID, messageID);
    }

    // === Set by reply ===
    if (type === "message_reply" && args[0]) {
      const amount = parseAmount(args[0]);
      if (amount === null) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
      const uid = messageReply.senderID;
      const name = (await Users.getData(uid))?.name || "Użytkownik";
      await Currencies.setData(uid, { money: amount });
      return api.sendMessage(`✅ Saldo użytkownika ${name} zostało ustawione na ${amount} 💸`, threadID, messageID);
    }

    // === Help ===
    return api.sendMessage(
      `❌ Niepoprawna składnia. Użycie:\n` +
      `• ${prefix}setmoney me 1000\n` +
      `• ${prefix}setmoney del me\n` +
      `• ${prefix}setmoney @użytkownik 1000\n` +
      `• ${prefix}setmoney del @użytkownik\n` +
      `• ${prefix}setmoney UID 123456789 1000\n` +
      `• ${prefix}setmoney [kwota] (w odpowiedzi na wiadomość)`,
      threadID,
      messageID
    );

  } catch (err) {
    console.error("❌ Błąd w komendzie setmoney:", err);
    return api.sendMessage("⚠️ Wystąpił błąd przy zmianie salda. Sprawdź logi.", threadID, messageID);
  }
};
