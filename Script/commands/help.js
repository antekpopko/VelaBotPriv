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

module.exports.run = async function ({ api, event, getText }) {
    const { threadID, messageID } = event;
    const { commands } = global.client;
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    let adminCommands = [];
    let userCommands = [];
    let otherCommands = [];

    for (const [name, cmd] of commands) {
        if (typeof cmd.config?.hasPermssion === "number") {
            if (cmd.config.hasPermssion > 0) adminCommands.push(name);
            else if (cmd.config.hasPermssion === 0) userCommands.push(name);
            else otherCommands.push(name);
        } else {
            otherCommands.push(name);
        }
    }

    adminCommands.sort();
    userCommands.sort();
    otherCommands.sort();

    let msg = `Dostępnych komend: ${commands.size}\n\n`;

    if (userCommands.length) {
        msg += "👤 Komendy użytkownika:\n";
        userCommands.forEach(cmd => msg += `• ${prefix}${cmd}\n`);
        msg += "\n";
    }

    if (adminCommands.length) {
        msg += "🔒 Komendy administratora:\n";
        adminCommands.forEach(cmd => msg += `• ${prefix}${cmd}\n`);
        msg += "\n";
    }

    if (otherCommands.length) {
        msg += "❓ Inne komendy:\n";
        otherCommands.forEach(cmd => msg += `• ${prefix}${cmd}\n`);
        msg += "\n";
    }

    const images = [
        "https://i.postimg.cc/9ftbdvdg/komendy.gif"
    ];
    const img = images[Math.floor(Math.random() * images.length)];
    const path = __dirname + "/cache/help.jpg";

    request(encodeURI(img)).pipe(fs.createWriteStream(path)).on("close", () => {
        api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => {
            fs.unlinkSync(path);
        }, messageID);
    });
};
