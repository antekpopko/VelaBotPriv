module.exports.config = {
  name: "ustawienia",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "𝐈𝐬𝐥𝐚𝐦𝐢𝐜𝐤 𝐂𝐲𝐛𝐞𝐫",
  description: "Menu ustawień bota dla adminów",
  commandCategory: "admin",
  usages: "",
  cooldowns: 10,
};

const totalPath = __dirname + '/cache/totalChat.json';
const _24hours = 86400000;
const fs = require("fs-extra");

function handleByte(byte) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0, usage = parseInt(byte, 10) || 0;
  while (usage >= 1024 && ++i) usage = usage / 1024;
  return usage.toFixed(usage < 10 && i > 0 ? 1 : 0) + ' ' + units[i];
}

function handleOS(ping) {
  const os = require("os");
  const cpus = os.cpus();
  if (!cpus) return;
  let model = cpus[0].model;
  let speed = cpus[0].speed;
  return `📌 Ping: ${Date.now() - ping}ms\nProcesor: ${model} (${speed}MHz)\n\n`;
}

module.exports.onLoad = function () {
  const { writeFileSync, existsSync } = require('fs-extra');
  const { resolve } = require("path");
  const path = resolve(__dirname, 'cache', 'data.json');
  if (!existsSync(path)) {
    const obj = { adminbox: {} };
    writeFileSync(path, JSON.stringify(obj, null, 4));
  } else {
    const data = require(path);
    if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
    writeFileSync(path, JSON.stringify(data, null, 4));
  }
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const menu = `
⚙️ 𝗠𝗘𝗡𝗨 𝗨𝗦𝗧𝗔𝗪𝗜𝗘Ń 𝗕𝗢𝗧𝗔 ⚙️

[1] 🔄 Uruchom ponownie bota
[2] ♻️ Przeładuj konfigurację
[3] 📦 Aktualizuj dane grup
[4] 👥 Aktualizuj dane użytkowników
[5] 🚪 Wyloguj z konta Facebook

[6] 🔓 Wyłącz tryb admin-only (wszyscy mogą używać bota)
[7] 🚫 Włącz/wyłącz blokadę wejścia dla użytkowników
[8] 🛡️ Włącz/wyłącz tryb antykradzieży
[9] 🚷 Włącz/wyłącz tryb anty-wyjścia
[10] 👢 Wyrzuć użytkowników Facebook z grupy

[11] ℹ️ Informacje o bocie
[12] 🏷️ Informacje o grupie
[13] 👑 Lista adminów grupy
[14] 📚 Księga adminów
[15] 📋 Lista grup

👉 Odpowiedz na tę wiadomość, wpisując numer wybranej opcji.
`;
  return api.sendMessage(menu, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      type: "choosee",
    });
  }, messageID);
};

module.exports.handleReply = async function ({ event, api, handleReply, Threads, Users }) {
  const { threadID, messageID, senderID, body } = event;
  switch (handleReply.type) {
    case "choosee": {
      switch (body) {
        case "1": {
          if (senderID !== "100015168369582")
            return api.sendMessage("❌ Brak uprawnień do tej akcji.", threadID, messageID);
          api.sendMessage("🔄 Restartowanie bota...", threadID, () => process.exit(1));
          break;
        }
        case "2": {
          if (senderID !== "61563352322805")
            return api.sendMessage("❌ Brak uprawnień do tej akcji.", threadID, messageID);
          delete require.cache[require.resolve(global.client.configPath)];
          global.config = require(global.client.configPath);
          return api.sendMessage("♻️ Konfiguracja została przeładowana.", threadID, messageID);
        }
        case "3": {
          if (senderID !== "61563352322805")
            return api.sendMessage("❌ Brak uprawnień do tej akcji.", threadID, messageID);
          const inbox = await api.getThreadList(100, null, ['INBOX']);
          const groups = inbox.filter(g => g.isSubscribed && g.isGroup);
          for (const group of groups) {
            const info = await api.getThreadInfo(group.threadID);
            await Threads.setData(group.threadID, { threadInfo: info });
            console.log(`Zaktualizowano dane grupy: ${group.threadID}`);
          }
          return api.sendMessage(`📦 Zaktualizowano dane ${groups.length} grup.`, threadID);
        }
        case "4": {
          if (senderID !== "61563352322805")
            return api.sendMessage("❌ Brak uprawnień do tej akcji.", threadID, messageID);
          const inbox = await api.getThreadList(100, null, ['INBOX']);
          const groups = inbox.filter(g => g.isSubscribed && g.isGroup);
          for (const group of groups) {
            const { participantIDs } = await Threads.getInfo(group.threadID) || await api.getThreadInfo(group.threadID);
            for (const id of participantIDs) {
              const userInfo = await api.getUserInfo(id);
              const name = userInfo[id]?.name || "Nieznany";
              await Users.setData(id, { name: name });
              console.log(`Zaktualizowano dane użytkownika: ${id}`);
            }
          }
          return api.sendMessage("👥 Zaktualizowano dane wszystkich użytkowników.", threadID);
        }
        case "5": {
          if (senderID !== "61563352322805")
            return api.sendMessage("❌ Brak uprawnień do tej akcji.", threadID, messageID);
          api.sendMessage("🚪 Wylogowywanie z Facebooka...", threadID);
          api.logout();
          break;
        }
        case "6": {
          const { writeFileSync } = require("fs-extra");
          const { resolve } = require("path");
          const pathData = resolve(__dirname, 'cache', 'data.json');
          const database = require(pathData);
          if (database.adminbox[threadID]) {
            database.adminbox[threadID] = false;
            api.sendMessage("🔓 Tryb admin-only wyłączony — wszyscy mogą używać bota.", threadID, messageID);
          } else {
            database.adminbox[threadID] = true;
            api.sendMessage("🔒 Tryb admin-only włączony — tylko admini mogą używać bota.", threadID, messageID);
          }
          writeFileSync(pathData, JSON.stringify(database, null, 4));
          break;
        }
        case "7": {
          const info = await api.getThreadInfo(threadID);
          if (!info.adminIDs.some(adm => adm.id == api.getCurrentUserID()))
            return api.sendMessage("❌ Bot musi mieć uprawnienia administratora.", threadID, messageID);
          let data = (await Threads.getData(threadID)).data || {};
          data.newMember = !data.newMember;
          await Threads.setData(threadID, { data });
          global.data.threadData.set(threadID, data);
          return api.sendMessage(`🚫 Blokada wejścia dla użytkowników ${(data.newMember) ? "włączona" : "wyłączona"}.`, threadID, messageID);
        }
        case "8": {
          const info = await api.getThreadInfo(threadID);
          if (!info.adminIDs.some(adm => adm.id == api.getCurrentUserID()))
            return api.sendMessage("❌ Bot musi mieć uprawnienia administratora.", threadID, messageID);
          let data = (await Threads.getData(threadID)).data || {};
          data.guard = !data.guard;
          await Threads.setData(threadID, { data });
          global.data.threadData.set(threadID, data);
          return api.sendMessage(`🛡️ Tryb antykradzieży ${(data.guard) ? "włączony" : "wyłączony"}.`, threadID, messageID);
        }
        case "9": {
          let data = (await Threads.getData(threadID)).data || {};
          data.antiout = !data.antiout;
          await Threads.setData(threadID, { data });
          global.data.threadData.set(threadID, data);
          return api.sendMessage(`🚷 Tryb anty-wyjścia ${(data.antiout) ? "włączony" : "wyłączony"}.`, threadID