module.exports.config = {
    name: "antirobbery",
    eventType: ["log:thread-admins"],
    version: "1.0.1",
    credits: "CYBER BOT TEAM",
    description: "Blokowanie zmian adminów - zawsze włączone",
};

module.exports.run = async function ({ event, api }) {
    const { logMessageType, logMessageData } = event;

    if (logMessageType === "log:thread-admins") {
        if (logMessageData.ADMIN_EVENT === "add_admin") {
            if (event.author === api.getCurrentUserID()) return;
            if (logMessageData.TARGET_ID === api.getCurrentUserID()) return;

            api.changeAdminStatus(event.threadID, event.author, false);
            api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, false, (err) => {
                if (err) return api.sendMessage("Coś poszło nie tak 😝", event.threadID, event.messageID);
                api.sendMessage("» Aktywowano tryb antykradzieżowy 🖤", event.threadID, event.messageID);
            });
        } else if (logMessageData.ADMIN_EVENT === "remove_admin") {
            if (event.author === api.getCurrentUserID()) return;
            if (logMessageData.TARGET_ID === api.getCurrentUserID()) return;

            // Przywracamy admina osobie, której odebrano admina
            api.changeAdminStatus(event.threadID, logMessageData.TARGET_ID, true);

            // Odbieramy admina osobie, która próbowała odebrać admina
            api.changeAdminStatus(event.threadID, event.author, false, (err) => {
                if (err) return api.sendMessage("Coś poszło nie tak 😝", event.threadID, event.messageID);
                api.sendMessage("» Aktywowano tryb antykradzieżowy 🖤", event.threadID, event.messageID);
            });
        }
    }
};
