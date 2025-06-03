module.exports.config = {
  name: "zasady",
  version: "1.1",
  hasPermssion: 0,
  credits: "January Sakiewka",
  description: "Wyświetla zasady grupy w estetycznym formacie z emoji.",
  commandCategory: "Informacyjne",
  usages: "/zasady",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  try {
    const rules = [
      "📢 **Szanuj innych członków grupy** — żadnych obraźliwych komentarzy.",
      "🚫 **Zakaz spamu** — dbamy o porządek.",
      "🛑 **Nie udostępniaj nielegalnych treści** — w tym pirackich plików, narkotyków itp.",
      "💬 **Dbaj o kulturę wypowiedzi** — unikaj wulgaryzmów.",
      "📌 **Korzystaj z wyszukiwarki przed zadaniem pytania** — być może temat już był omawiany.",
      "🤝 **Pomagaj innym i bądź aktywny** — współpraca to podstawa.",
      "🔒 **Nie udostępniaj prywatnych danych** — szanuj prywatność swoją i innych.",
      "📆 **Bądź aktywny** — udział w rozmowach buduje społeczność."
    ];

    const message = `📜 𝗭𝗮𝘀𝗮𝗱𝘆 𝗴𝗿𝘂𝗽𝘆:\n\n${rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n\n")}`;

    return api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error("Błąd w komendzie zasady:", error);
    return api.sendMessage("❌ Wystąpił błąd podczas wyświetlania zasad.", event.threadID, event.messageID);
  }
};
