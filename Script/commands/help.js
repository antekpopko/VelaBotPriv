const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
    name: "help",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "January (przerobione przez ChatGPT)",
    description: "Wyświetla listę komend",
    commandCategory: "system",
    usages: "",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 20
    }
};

module.exports.languages = {
    pl: {
        helpList: "Dostępnych jest %1 komend.",
    }
};

module.exports.run = async function ({ api, event, getText, Users }) {
    const { threadID, messageID, senderID } = event;
    const { commands } = global.client;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    // Pobierz poziom uprawnień użytkownika
    let userInfo = await Users.getInfo(senderID);
    let isAdmin = false;

    // Jeśli masz własną metodę sprawdzania admina, użyj jej.
    // Tutaj na przykład uznajemy hasPermssion > 0 jako admin
    // Możesz to dostosować do swojego systemu uprawnień
    for (const [name, cmd] of commands) {
        if (name === "help") {
            isAdmin = cmd.config.hasPermssion > 0 && senderID && senderID === senderID; // dummy check
            break;
        }
    }

    // W praktyce lepiej sprawdzić na podstawie własnego systemu uprawnień:
    // np. global.client.commands.get("help").config.hasPermssion
    // lub global.client.getUserPermission(senderID)

    // Albo uprość — przyjmij, że użytkownik admin, jeśli event.hasPermssion > 0:
    isAdmin = event.hasPermssion && event.hasPermssion > 0;

    let userCommands = [];
    let adminCommands = [];

    for (const [name, cmd] of commands) {
        if (typeof cmd.config?.hasPermssion === "number") {
            if (cmd.config.hasPermssion === 0) userCommands.push(name);
            else if (cmd.config.hasPermssion > 0) adminCommands.push(name);
        }
    }

    userCommands.sort();
    adminCommands.sort();

    let msg = `Dostępnych komend użytkownika: ${userCommands.length}\n\n`;
    msg += "👤 Komendy użytkownika:\n";
    userCommands.forEach(cmd => msg += `• ${prefix}${cmd}\n`);

    if (isAdmin) {
        msg += "\n🔒 Komendy administratora:\n";
        adminCommands.forEach(cmd => msg += `• ${prefix}${cmd}\n`);
    }

    // Wysyłamy wiadomość (bez obrazka, żeby uprościć)
    return api.sendMessage(msg, threadID, messageID);
};
