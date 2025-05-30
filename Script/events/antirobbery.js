module.exports.config = {
    name: "antirobbery",
    eventType: ["log:thread-admins"],
    version: "1.0.2",
    credits: "CYBER BOT TEAM (edycja: ChatGPT)",
    description: "Zabiera admina osobie, która odebrała admina komuś innemu",
};

module.exports.run = async function ({ event, api }) {
    const { logMessageType, logMessageData } = event;

    if (logMessageType !== "log:thread-admins") return;
    if (event.author === api.getCurrentUserID()) return;
    if (logMessageData.TARGET_ID === api.getCurrentUserID()) return;

    // Reagujemy tylko na odebranie admina
    if (logMessageData.ADMIN_EVENT === "remove_admin") {
        // Przywracamy admina osobie, której został odebrany
        api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, true);

        // Zabieramy admina osobie, która to zrobiła
        api.changeAdminStatus(event.threadID, event.author, false, (err) => {
            if (err) return api.sendMessage("Coś poszło nie tak 😝", event.threadID, event.messageID);
            api.sendMessage("Nie odbieraj admina innym! 😉", event.threadID, event.messageID);
        });
    }
};
