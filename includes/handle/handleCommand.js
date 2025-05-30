module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const axios = require('axios')
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    let { body, senderID, threadID, messageID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    const threadSetting = threadData.get(threadID) || {};
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(threadSetting.PREFIX || PREFIX)})\\s*`);
    if (!prefixRegex.test(body)) return;

    const adminbot = require('./../../config.json');

    // tryb adminPaOnly
    if (!global.data.allThreadID.includes(threadID) && !ADMINBOT.includes(senderID) && adminbot.adminPaOnly == true)
      return api.sendMessage("MODE » Only admins can use bots in their own inbox", threadID, messageID);

    // tryb adminOnly
    if (!ADMINBOT.includes(senderID) && adminbot.adminOnly == true)
      return api.sendMessage('MODE » Only admins can use bots', threadID, messageID);

    // tryb ndhOnly
    if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly == true)
      return api.sendMessage('MODE » Only bot support can use bots', threadID, messageID);

    const dataAdbox = require('../../Script/commands/cache/data.json');
    const threadInf = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const findd = threadInf.adminIDs.find(el => el.id == senderID);
    if (dataAdbox.adminbox?.[threadID] === true && !ADMINBOT.includes(senderID) && !findd && event.isGroup === true)
      return api.sendMessage('MODE » Only admins can use bots', threadID, messageID);

    if ((userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == false && senderID == threadID) && !ADMINBOT.includes(senderID)) {
      if (userBanned.has(senderID)) {
        const { reason, dateAdded } = userBanned.get(senderID) || {};
        return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      } else if (threadBanned.has(threadID)) {
        const { reason, dateAdded } = threadBanned.get(threadID) || {};
        return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
          await new Promise(resolve => setTimeout(resolve, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      }
    }

    const [matchedPrefix] = body.match(prefixRegex);
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);

    if (!command)
      return api.sendMessage(`Nie znaleziono komendy o nazwie: "${commandName}"`, threadID, messageID);

    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [],
          banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5000))
            return api.unsendMessage(info.messageID);
          }, messageID);
        if (banUsers.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return api.unsendMessage(info.messageID);
          }, messageID);
      }
    }

    if (command.config.commandCategory?.toLowerCase() == 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
      return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return api.unsendMessage(info.messageID);
      }, messageID);

    let permssion = 0;
    const threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const find = threadInfoo.adminIDs.find(el => el.id == senderID);
    if (NDH.includes(senderID)) permssion = 2;
    if (ADMINBOT.includes(senderID)) permssion = 3;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion)
      return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), threadID, messageID);

    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Map());
    const timestamps = cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)
      return api.sendMessage(`Użyłeś niedawno tej komendy, spróbuj ponownie za ${((timestamps.get(senderID) + expirationTime - dateNow) / 1000).toFixed(1)} sekundy.`, threadID, messageID);

    let getText2;
    if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language)) {
      getText2 = (...values) => {
        let lang = command.languages[global.config.language][values[0]] || '';
        for (let i = values.length; i > 0; i--) {
          const expReg = RegExp('%' + i, 'g');
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    } else getText2 = () => { };

    try {
      const Obj = {
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion,
        getText: getText2
      };
      command.run(Obj);
      timestamps.set(senderID, dateNow);
      if (DeveloperMode)
        logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), Date.now() - dateNow), "[ DEV MODE ]");
      return;
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }
  };
};
