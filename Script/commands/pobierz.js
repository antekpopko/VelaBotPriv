module.exports.config = {
	name: "pobierz",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
	description: "Pobierz link do pliku wideo, audio lub zdjęcia z odpowiedzi na wiadomość w grupie",
	commandCategory: "Narzędzia",
	usages: "pobierz",
	cooldowns: 5,
};

module.exports.languages = {
	"pl": {
		"invalidFormat": "❌ Musisz odpowiedzieć na wiadomość zawierającą audio, wideo lub zdjęcie"
	},
	"en": {
		"invalidFormat": "❌ You need to reply to a message containing audio, video or picture"
	}
}

module.exports.run = async ({ api, event, getText }) => {
	if (event.type !== "message_reply") 
		return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);

	if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) 
		return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);

	if (event.messageReply.attachments.length > 1) 
		return api.sendMessage(getText("invalidFormat"), event.threadID, event.messageID);

	return api.sendMessage(event.messageReply.attachments[0].url, event.threadID, event.messageID);
}
