module.exports.config = {
  name: "zasady",
  version: "1.0",
  hasPermssion: 0,
  credits: "January Sakiewka",
  description: "Wyświetla zasady grupy w ładnym formacie z emoji.",
  commandCategory: "info",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const rules = [
    "📢 **Szanuj innych członków grupy** — żadnych obraźliwych komentarzy.",
    "🚫 **Zakaz spamu** — dbamy o porządek.",
    "🛑 **Nie udostępniaj nielegalnych treści** — w tym pirackich plików, narkotyków itp.",
    "💬 **Dbaj o kulturę wypowiedzi** — unikaj wulgaryzmów.",
    "📌 **Korzystaj z wyszukiwarki przed zadaniem pytania** — być może temat już był omawiany.",
    "🤝 **Pomagaj innym i bądź aktywny** — współpraca to podstawa.",
    "🔒 **Nie udostępniaj prywatnych danych** — szanuj prywatność swoją i innych.",
    "📆 **Aktywność jest ważna** — pamiętaj o udziale w rozmowach."
  ];

  const message = "📜 **Zasady grupy:**\n\n" + rules.map((r, i) => `${i + 1}. ${r}`).join("\n\n");

  return api.sendMessage(message, event.threadID, event.messageID);
};
