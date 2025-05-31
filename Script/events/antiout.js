module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Ulepszona przez ChatGPT",
  description: "Zabezpieczenie przed wychodzeniem z grupy"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  let name;
  try {
    name = await Users.getNameUser(event.logMessageData.leftParticipantFbId);
  } catch (e) {
    name = "👤 Nieznany użytkownik"; // Gdy nie da się pobrać imienia
  }

  const isSelfLeave = event.author === event.logMessageData.leftParticipantFbId;

  if (isSelfLeave) {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`❌ Niestety nie mogę dodać ponownie ${name} 😞`, event.threadID);
      } else {
        api.sendMessage(`✅ Dodałem ponownie ${name} — z tej grupy nie uciekniesz! 😄`, event.threadID);
      }
    });
  }
};