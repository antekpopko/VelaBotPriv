module.exports.config = {
  name: "rozwal",
  version: "1.0.0",
  hasPermssion: 2, // tylko admin botów
  credits: "cwel",
  description: "Dodaje konkretnego użytkownika do grupy",
  commandCategory: "admin",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const userID = "facebook.com/danielmagical";
  const threadID = event.threadID;

  try {
    await api.addUserToGroup(userID, threadID);
    api.sendMessage(`✅ Użytkownik o profilu ${userID} został dodany do tej grupy.`, threadID);
  } catch (error) {
    console.error(error);
    let msg = "❌ Nie udało się dodać użytkownika. ";
    if (error.errorDescription?.includes("already in thread")) {
      msg += "Użytkownik jest już w grupie.";
    } else if (error.errorDescription?.includes("not friends")) {
      msg += "Bot nie jest znajomym z tym użytkownikiem.";
    } else {
      msg += "Błąd: " + error.message;
    }
    api.sendMessage(msg, threadID);
  }
};
