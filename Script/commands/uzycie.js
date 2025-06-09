module.exports.config = {
  name: "uzycie",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ChatGPT + January + aktualizacja: cwel",
  description: "Pokazuje instrukcje użycia komend",
  commandCategory: "📘 Pomoc",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const prefix = "/";

  const msg = 
`📌 Lista dostępnych komend i ich użycia:

🤖 AI / Generatory:
${prefix}aizdj — użycie: ${prefix}aizdj [tekst do wygenerowania (tylko po angielsku)]
${prefix}flux — użycie: ${prefix}flux [opis zdjęcia, które chcesz wygenerować]
${prefix}powiedz — użycie: ${prefix}powiedz [język] [tekst do przeczytania]

🎵 Muzyka:
${prefix}sing — użycie: ${prefix}sing [tytuł utworu]
${prefix}youtube — użycie:
• ${prefix}youtube -v [nazwa/link] – pobierz wideo z YouTube
• ${prefix}youtube -a [nazwa/link] – pobierz audio (MP3)
• ${prefix}youtube -i [nazwa/link] – wyświetl informacje o filmie

🎮 Zabawa:
${prefix}disco — użycie: ${prefix}disco [maksymalnie 25]
${prefix}ttt — użycie: ${prefix}ttt [liczby od 1 do 9]
${prefix}wybierz — użycie: ${prefix}wybierz [opcje oddzielone myślnikiem]

⚙️ Systemowe:
${prefix}giveaway — użycie: ${prefix}giveaway [create/details/join/roll/end] [IDGiveAway]
${prefix}zglos — użycie: ${prefix}zglos [co lub kogo zgłaszasz do administratora]

📥 Pobieranie i multimedia:
${prefix}pobierz — użycie: ${prefix}pobierz [odpowiedz na wiadomość np. głosówka/film/zdjęcie]
${prefix}zdj — użycie: ${prefix}zdj [czego szukasz]-[ile zdjęć]

📚 Edukacja:
${prefix}drgs — użycie: ${prefix}drgs [nazwa substancji, o której chcesz się dowiedzieć więcej]`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};