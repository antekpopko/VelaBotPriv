module.exports.config = {
	name: "uid",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "CYBER BOT TEAM",
	description: "Pobiera UID użytkownika lub wspomnianych osób",
	commandCategory: "🔧 Narzędzia",
	cooldowns: 5
};

module.exports.run = function({ api, event }) {
	const mentions = event.mentions;

	if (Object.keys(mentions).length === 0) {
		// Jeśli nikt nie został wspomniany, wyślij UID autora wiadomości
		return api.sendMessage(`🆔 Twój UID: ${event.senderID}`, event.threadID, event.messageID);
	}

	// Jeśli są wspomnienia, wypisz UIDy wspomnianych osób
	const reply = Object.entries(mentions)
		.map(([uid, name]) => `🆔 ${name.replace('@', '')}: ${uid}`)
		.join('\n');

	return api.sendMessage(reply, event.threadID, event.messageID);
};
