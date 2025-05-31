module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "0.0.2",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + poprawka: January",
  description: "Automatyczny powrót użytkownika po wyjściu z grupy"
};

module.exports.run = async ({ event, api, Users }) => {
  const leftID = event.logMessageData.leftParticipantFbId;
  const threadID = event.threadID;

  if (leftID == api.getCurrentUserID()) return;

  // 🧠 Pobierz imię użytkownika lub użyj fallbacku
  let name = global.data.userName.get(leftID);
  if (!name) {
    try {
      const info = await api.getUserInfo(leftID);
      name = info[leftID]?.name || "użytkownika";
    } catch (e) {
      name = "użytkownika";
    }
  }

  // 👤 Sprawdź, czy użytkownik sam się usunął
  const isSelfLeave = event.author == leftID;

  if (isSelfLeave) {
    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        api.sendMessage(`❌ Nie mogę dodać ponownie ${name} 😞`, threadID);
      } else {
        api.sendMessage(`✅ Dodałem ponownie ${name} — z tej grupy nie uciekniesz! 😄`, threadID);
      }
    });
  }
};