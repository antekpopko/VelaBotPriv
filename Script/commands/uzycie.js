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
`${prefix}aizdj — użycie: ${prefix}aizdj [tekst do wygenerowania (tylko po angielsku)]
${prefix}disco — użycie: ${prefix}disco [max 25]
${prefix}drgs — użycie: ${prefix}drgs [nazwa drgs o ktorym chcesz sie doedukowac]
${prefix}flux — użycie: ${prefix}flux [opis zdjecia ktore chcesz wygenerować]
${prefix}giveaway — użycie: ${prefix}giveaway [create/details/join/roll/end] [IDGiveAway]
${prefix}pobierz — użycie: ${prefix}pobierz [odpowiedz na wiadomosc np glosowka/film/zdjecie]
${prefix}powiedz — użycie: ${prefix}powiedz [jezyk] [tekst]
${prefix}sing — użycie: ${prefix}sing [tytul utworu ktory chcesz aby zostal wyslany]
${prefix}ttt — użycie: ${prefix}ttt [liczby od 1 do 9]
${prefix}wybierz — użycie: ${prefix}wybierz [opcje oddzielone myslnikiem]
${prefix}zdj — użycie: ${prefix}zdj [co chcesz wyszukac-ile zdjec]`;

    return api.sendMessage(msg, event.threadID, event.messageID);
};