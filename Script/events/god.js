module.exports.config = {
	name: "god",
	eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
	version: "1.0.1",
	credits: "CYBER ☢️ TEAM + poprawki: January",
	description: "Rejestruje aktywności bota w grupach",
	envConfig: {
		enable: true
	}
};

module.exports.run = async function ({ api, event, Threads }) {
	const logger = require("../../utils/log");
	if (!global.configModule[this.config.name]?.enable) return;

	const threadID = event.threadID;
	const authorID = event.author || "Nieznany";

	let task = "";
	const time = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });

	switch (event.logMessageType) {
		case "log:thread-name": {
			const oldData = await Threads.getData(threadID);
			const oldName = oldData?.name || "Nieznana nazwa";
			const newName = event.logMessageData.name || "Brak nowej nazwy";
			task = `📝 Zmieniono nazwę grupy:\nZ: '${oldName}'\nNa: '${newName}'`;
			await Threads.setData(threadID, { name: newName });
			break;
		}
		case "log:subscribe": {
			const added = event.logMessageData.addedParticipants || [];
			const isBot = added.some(p => p.userFbId == api.getCurrentUserID());
			if (isBot) task = `➕ Bot został dodany do nowej grupy.`;
			break;
		}
		case "log:unsubscribe": {
			const leftID = event.logMessageData.leftParticipantFbId;
			if (leftID == api.getCurrentUserID()) {
				task = `❌ Bot został usunięty z grupy.`;
			}
			break;
		}
	}

	if (!task) return;

	const report = [
		`=== 🛠️ AKTYWNOŚĆ BOTA ===`,
		`📍 ID konwersacji: ${threadID}`,
		`👤 Autor akcji: ${authorID}`,
		`📄 Akcja: ${task}`,
		`⏰ Czas: ${time}`
	].join("\n");

	const god = "61563352322805"; // Twój UID lub miejsce, gdzie mają trafiać powiadomienia

	api.sendMessage(report, god, (error) => {
		if (error) logger(report, "[Logging Event]");
	});
};
