module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "0.0.1",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Listen events"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  // Usunięto sprawdzanie data.antiout - antiout działa cały czas

  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) 
    || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "involuntary";

  if (type === "self-separation") {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`❌ Niestety nie mogę dodać ponownie ${name} 😞`, event.threadID);
      } else {
        api.sendMessage(`✅ Dodałem ponownie ${name} — z tej grupy nie uciekniesz 😉`, event.threadID);
      }
    });
  }
};
