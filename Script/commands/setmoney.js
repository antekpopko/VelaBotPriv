module.exports.config = {
	name: "setmoney",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "CYBER ☢️ TEAM + poprawki: January",
	description: "Zmień saldo swoje lub oznaczonej osoby 💰",
	commandCategory: "system",
	usages: "setmoney [me | del | @tag | UID]",
	cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
	const { threadID, messageID, senderID, mentions, body } = event;
	const mentionID = Object.keys(mentions)[0];
	const prefix = global.config.PREFIX || ";";

	try {
		// setmoney me 1000
		if (args[0] === "me") {
			const amount = parseInt(args[1]);
			if (isNaN(amount)) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
			await Currencies.setData(senderID, { money: amount });
			return api.sendMessage(`✅ Zmieniono Twoje saldo na: ${amount} 💸`, threadID, messageID);
		}

		// setmoney del me
		if (args[0] === "del" && args[1] === "me") {
			const current = (await Currencies.getData(senderID)).money || 0;
			await Currencies.setData(senderID, { money: 0 });
			return api.sendMessage(`✅ Usunięto Twoje całe saldo: ${current} 💸`, threadID, messageID);
		}

		// setmoney del @tag
		if (args[0] === "del" && mentionID) {
			const current = (await Currencies.getData(mentionID)).money || 0;
			await Currencies.setData(mentionID, { money: 0 });
			const name = mentions[mentionID].replace("@", "");
			return api.sendMessage(`✅ Usunięto całe saldo użytkownika ${name}: ${current} 💸`, threadID, messageID);
		}

		// setmoney @tag 1234
		if (mentionID && args[1]) {
			const amount = parseInt(args[1]);
			if (isNaN(amount)) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
			await Currencies.setData(mentionID, { money: amount });
			const name = mentions[mentionID].replace("@", "");
			return api.sendMessage({
				body: `✅ Zmieniono saldo użytkownika ${name} na: ${amount} 💸`,
				mentions: [{ tag: name, id: mentionID }]
			}, threadID, messageID);
		}

		// setmoney UID 123456789 2000
		if (args[0] === "UID" && args[1] && args[2]) {
			const uid = args[1];
			const amount = parseInt(args[2]);
			if (isNaN(amount)) return api.sendMessage("❌ Podaj poprawną kwotę.", threadID, messageID);
			const name = (await Users.getData(uid))?.name || "Użytkownik";
			await Currencies.setData(uid, { money: amount });
			return api.sendMessage(`✅ Zmieniono saldo użytkownika ${name} (${uid}) na: ${amount} 💸`, threadID, messageID);
		}

		// Jeśli nic nie pasuje
		else {
			return api.sendMessage("❌ Niepoprawna składnia. Użyj np.:\n- setmoney me 1000\n- setmoney del me\n- setmoney @user 1000\n- setmoney del @user\n- setmoney UID 123456789 1000", threadID, messageID);
		}

	} catch (err) {
		console.error("Błąd w komendzie setmoney:", err);
		return api.sendMessage("⚠️ Wystąpił błąd przy zmianie salda.", threadID, messageID);
	}
};