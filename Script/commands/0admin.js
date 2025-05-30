const { writeFileSync, existsSync } = require("fs-extra");
const { resolve } = require("path");

module.exports.config = {
    name: "0admin",
    version: "1.0.5",
    hasPermssion: 2,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Konfiguracja admina",
    commandCategory: "Admin",
    usages: "Admin",
    cooldowns: 2,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "pl": {
        "listAdmin": `===「 Lista Adminów 」===\n━━━━━━━━━━━━━━━\n%1\n\n==「 Wspierający bota 」==\n━━━━━━━━━━━━━━━\n%2`,
        "notHavePermssion": '❌ Nie masz uprawnień, aby użyć funkcji "%1"',
        "addedNewAdmin": '✅ Dodano %1 użytkowników jako Adminów bota\n\n%2',
        "addedNewSupport": '✅ Dodano %1 użytkowników jako Wspierających bota\n\n%2',
        "removedAdmin": '✅ Usunięto rolę Admin od %1 użytkowników\n\n%2',
        "removedSupport": '✅ Usunięto rolę Wspierającego od %1 użytkowników\n\n%2'
    }
};

module.exports.onLoad = function () {
    const path = resolve(__dirname, 'cache', 'data.json');
    if (!existsSync(path)) {
        const obj = {
            adminbox: {}
        };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
    }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const content = args.slice(1);
    const { threadID, messageID, mentions } = event;
    const configPath = global.client.configPath;
    const ADMINBOT = global.config.ADMINBOT || [];
    const SUPPORT = global.config.NDH || [];
    const mentionIDs = Object.keys(mentions);

    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);

    if (!args[0]) {
        const helpMessage = `
=== [ Ustawienia Admina ] ===
━━━━━━━━━━━━━━━
admin list        => Wyświetl listę Adminów i Wspierających
admin add         => Dodaj użytkownika jako Admina
admin remove      => Usuń użytkownika z Adminów
admin addsupport  => Dodaj użytkownika jako Wspierającego
admin removesupport => Usuń użytkownika z Wspierających
admin qtvonly     => Przełącz tryb tylko dla adminów w wątku
admin supportonly => Przełącz tryb tylko dla wspierających w wątku
━━━━━━━━━━━━━━━
Użyj: ${global.config.PREFIX}admin <komenda> [tag lub ID]
        `;
        return api.sendMessage(helpMessage, threadID, messageID);
    }

    switch (args[0].toLowerCase()) {
        case "list":
        case "all":
        case "-a": {
            let listAdminMsg = [];
            for (const idAdmin of ADMINBOT) {
                if (parseInt(idAdmin)) {
                    const name = (await Users.getData(idAdmin)).name;
                    listAdminMsg.push(`Imię: ${name}\n» FB: https://www.facebook.com/${idAdmin}`);
                }
            }
            let listSupportMsg = [];
            for (const idSupport of SUPPORT) {
                if (parseInt(idSupport)) {
                    const name = (await Users.getData(idSupport)).name;
                    listSupportMsg.push(`Imię: ${name}\n» FB: https://www.facebook.com/${idSupport}`);
                }
            }
            return api.sendMessage(getText("listAdmin", listAdminMsg.join("\n\n"), listSupportMsg.join("\n\n")), threadID, messageID);
        }

        case "add": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);

            if (event.type === "message_reply") content[0] = event.messageReply.senderID;

            if (mentionIDs.length && isNaN(content[0])) {
                let addedList = [];
                for (const id of mentionIDs) {
                    if (!ADMINBOT.includes(id)) {
                        ADMINBOT.push(id);
                        config.ADMINBOT.push(id);
                        addedList.push(`${id} - ${event.mentions[id]}`);
                    }
                }
                writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                return api.sendMessage(getText("addedNewAdmin", addedList.length, addedList.join("\n").replace(/@/g, "")), threadID, messageID);
            } else if (content.length && !isNaN(content[0])) {
                if (!ADMINBOT.includes(content[0])) {
                    ADMINBOT.push(content[0]);
                    config.ADMINBOT.push(content[0]);
                    const name = (await Users.getData(content[0])).name;
                    writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                    return api.sendMessage(getText("addedNewAdmin", 1, `Admin - ${name}`), threadID, messageID);
                }
            } else return global.utils.throwError(this.config.name, threadID, messageID);
            break;
        }

        case "addsupport": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "addsupport"), threadID, messageID);

            if (event.type === "message_reply") content[0] = event.messageReply.senderID;

            if (mentionIDs.length && isNaN(content[0])) {
                let addedList = [];
                for (const id of mentionIDs) {
                    if (!SUPPORT.includes(id)) {
                        SUPPORT.push(id);
                        config.NDH.push(id);
                        addedList.push(`${id} - ${event.mentions[id]}`);
                    }
                }
                writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                return api.sendMessage(getText("addedNewSupport", addedList.length, addedList.join("\n").replace(/@/g, "")), threadID, messageID);
            } else if (content.length && !isNaN(content[0])) {
                if (!SUPPORT.includes(content[0])) {
                    SUPPORT.push(content[0]);
                    config.NDH.push(content[0]);
                    const name = (await Users.getData(content[0])).name;
                    writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                    return api.sendMessage(getText("addedNewSupport", 1, `Wspierający - ${name}`), threadID, messageID);
                }
            } else return global.utils.throwError(this.config.name, threadID, messageID);
            break;
        }

        case "remove":
        case "rm":
        case "delete": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);

            if (event.type === "message_reply") content[0] = event.messageReply.senderID;

            if (mentionIDs.length && isNaN(content[0])) {
                let removedList = [];
                for (const id of mentionIDs) {
                    let index = config.ADMINBOT.indexOf(id);
                    if (index !== -1) {
                        ADMINBOT.splice(index, 1);
                        config.ADMINBOT.splice(index, 1);
                        removedList.push(`${id} - ${event.mentions[id]}`);
                    }
                }
                writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                return api.sendMessage(getText("removedAdmin", removedList.length, removedList.join("\n").replace(/@/g, "")), threadID, messageID);
            } else if (content.length && !isNaN(content[0])) {
                let index = config.ADMINBOT.indexOf(content[0]);
                if (index !== -1) {
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    const name = (await Users.getData(content[0])).name;
                    writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
                    return api.sendMessage(getText("removedAdmin", 1, `${content[0]} - ${name}`), threadID, messageID);
                }
            } else return global.utils.throwError(this.config.name, threadID, messageID);
            break;
        }

        case "removesupport": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "removesupport"), threadID, messageID);

            if (event.type === "message_reply") content[0] = event.messageReply.senderID;

            if
