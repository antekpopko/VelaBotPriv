module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "0.0.3",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️ + poprawka: January",
  description: "Automatyczny powrót użytkownika po wyjściu z grupy"
};

module.exports.run = async ({ event, api }) => {
  try {
    const leftID = event.logMessageData.leftParticipantFbId;
    const threadID = event.threadID;

    // Ignoruj, jeśli bot sam wyszedł
    if (leftID === api.getCurrentUserID()) return;

    // Pobierz imię użytkownika
    let name = global.data.userName?.get(leftID);
    if (!name) {
      try {
        const info = await api.getUserInfo(leftID);
        const rawName = info[leftID]?.name;
        name = (rawName && rawName !== "Facebook User") ? rawName : "użytkownika";
      } catch {
        name = "użytkownika";
      }
    }

    // Sprawdź, czy użytkownik wyszedł sam (autor eventu to ten sam user)
    const isSelfLeave = event.author === leftID;

    if (isSelfLeave) {
      // Spróbuj dodać użytkownika z powrotem do grupy
      api.addUserToGroup(leftID, threadID, (err) => {
        if (err) {
          api.sendMessage(`❌ Nie mogę ponownie dodać ${name} do grupy 😞`, threadID);
          console.error(`Antiout: błąd dodawania użytkownika ${leftID} do grupy ${threadID}:`, err);
        } else {
          api.sendMessage(`✅ ${name} został ponownie dodany do grupy. Z tej grupy nie uciekniesz! 😉`, threadID);
          console.log(`Antiout: ponownie dodano użytkownika ${leftID} do grupy ${threadID}.`);
        }
      });
    }
  } catch (error) {
    console.error("Antiout: nieoczekiwany błąd:", error);
  }
};