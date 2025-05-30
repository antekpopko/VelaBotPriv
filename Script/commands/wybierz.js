module.exports.config = {
	name: "wybierz",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "CYBER BOT TEAM + January",
	description: "Losowo wybiera jedną z opcji oddzielonych myślnikiem",
	commandCategory: "Narzędzia",
	usages: "[Opcja 1] - [Opcja 2] - [Opcja 3] ...",
	cooldowns: 5
};

module.exports.languages = {
	"pl": {
		"return": "Bot mówi: %1 to najlepszy wybór! 🎲✨"
	}
};

module.exports.run = async ({ api, event, args, getText }) => {
	const { threadID, messageID } = event;

	const input = args.join(" ").trim();
	if (!input.includes("-")) {
		return api.sendMessage("Podaj kilka opcji oddzielonych myślnikiem, np.: pizza - sushi - burger", threadID, messageID);
	}

	const options = input.split(" - ").map(opt => opt.trim()).filter(opt => opt.length > 0);
	if (options.length < 2) {
		return api.sendMessage("Podaj przynajmniej dwie opcje!", threadID, messageID);
	}

	const choice = options[Math.floor(Math.random() * options.length)];
	return api.sendMessage(getText("return", choice), threadID, messageID);
};
