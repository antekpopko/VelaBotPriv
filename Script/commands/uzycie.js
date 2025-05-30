module.exports.config = {
    name: "uzycie",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ChatGPT + January",
    description: "Pokazuje instrukcje użycia komend",
    commandCategory: "system",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const prefix = "/";
    const msg = 
`${prefix}aizdj — użycie: ${prefix}aizdj [tekst do wygenerowania]
${prefix}disco — użycie: ${prefix}disco
${prefix}dodaj — użycie: ${prefix}dodaj [parametry]
${prefix}giveaway — użycie: ${prefix}giveaway [create/details/join/roll/end] [IDGiveAway]
${prefix}help — użycie: ${prefix}help
${prefix}lista — użycie: ${prefix}lista
${prefix}pobierz — użycie: ${prefix}pobierz [link lub coś do pobrania]
${prefix}powiedz — użycie: ${prefix}powiedz [tekst]
${prefix}uid — użycie: ${prefix}uid [tag użytkownika lub ID]
${prefix}wlasciciel — użycie: ${prefix}wlasciciel
${prefix}wybierz — użycie: ${prefix}wybierz [opcje oddzielone przecinkami]
${prefix}zdj — użycie: ${prefix}zdj [tekst lub coś do zdjęcia]`;

    return api.sendMessage(msg, event.threadID, event.messageID);
};
