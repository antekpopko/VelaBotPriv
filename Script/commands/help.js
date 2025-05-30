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
    const images = [
        "https://i.postimg.cc/9ftbdvdg/komendy.gif"
    ];

    const allCmds = Array.from(commands.keys()).sort();
    const perPage = 70;
    const paginated = allCmds.slice(0, perPage); // zawsze tylko pierwsza strona

    let msg = `Dostępnych komend: ${allCmds.length}\n\n`;
    for (const cmd of paginated) msg += `• ${cmd}\n`;

    const img = images[Math.floor(Math.random() * images.length)];
    const path = __dirname + "/cache/help.jpg";

    request(encodeURI(img)).pipe(fs.createWriteStream(path)).on("close", () => {
        api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => {
            fs.unlinkSync(path);
        }, messageID);
    });
};
