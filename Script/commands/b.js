module.exports.config = {
	name: "b",
	version: "1.0.3",
	hasPermssion: 2,
	credits: "CYBER ☢️ TEAM + poprawki: January",
	description: "Sprawdź ilość swoich lub cudzych monet 💰",
	commandCategory: "ekonomia",
	usages: "[oznacz użytkownika]",
	cooldowns: 5
};

module.exports.languages = {
	"vi": {
		"sotienbanthan": "Số tiền bạn đang có: %1$",
		"sotiennguoikhac": "Số tiền của %1 hiện đang có là: %2$"
	},
	"en": {
		"sotienbanthan": "Your current balance: %1$",
		"sotiennguoikhac": "%1's current balance: %2$."
	},
	"pl": {
		"sotienbanthan": "💸 Twój obecny stan konta: %1$",
		"sotiennguoikhac": "💸 Stan konta użytkownika %1 to: %2$"
	}
};

module.exports.run = async function({ api, event, args, Currencies, getText }) {
	const { threadID, messageID, senderID, mentions } = event;

	try {
		// Sprawdzenie własnego salda
		if (!args[0]) {
			const userData = await Currencies.getData(senderID);
			const money = userData?.money || 0;
			return api.sendMessage(getText("sotienbanthan", money), threadID, messageID);
		}

		// Sprawdzenie salda oznaczonego użytkownika
		else if (Object.keys(mentions).length === 1) {
			const mentionID = Object.keys(mentions)[0];
			const userData = await Currencies.getData(mentionID);
			const money = userData?.money || 0;
			const tagName = mentions[mentionID].replace(/@/g, "");
			return api.sendMessage({
				body: getText("sotiennguoikhac", tagName, money),
				mentions: [{
					tag: tagName,
					id: mentionID
				}]
			}, threadID, messageID);
		}

		// Obsługa wielu tagów
		else {
			return api.sendMessage("❌ Podaj tylko jednego użytkownika!", threadID, messageID);
		}
	} catch (err) {
		console.error("Błąd w komendzie b.js:", err);
		return api.sendMessage("⚠️ Wystąpił błąd podczas pobierania salda.", threadID, messageID);
	}
};