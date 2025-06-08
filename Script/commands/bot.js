module.exports.config = {
  name: "Obot",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "January Sakiewka + ChatGPT",
  description: "Odpowiedzi Veli bez prefixu",
  commandCategory: "noprefix",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const triggers = ["bot", "obot", "vela"];
  const lower = body.toLowerCase();
  if (!triggers.includes(lower)) return;

  const responses = [
    "👀 Ktoś mnie wołał?",
    "⚙️ Vela online. Co robimy?",
    "😴 Znowu przerwa mi przerwana...",
    "🛰️ Jestem tu. Vela gotowa do działania.",
    "🤖 Tak, jestem botem. Tak, wiem więcej niż ty.",
    "📡 Sygnał odebrany. Jak mogę pomóc?",
    "🧠 Vela słucha… jeszcze.",
    "🙄 Ty znowu? Co teraz?",
    "🔧 Potrzebujesz wsparcia technicznego czy emocjonalnego?",
    "🚨 Bot aktywowany. Proszę nie panikować.",
    "✨ Witaj w systemie Vela. Zaufaj mi… chyba.",
    "👽 Nie jestem z tej planety, ale postaram się pomóc.",
    "💡 Pomysł na dzisiaj? Nie wołaj mnie co 3 minuty.",
    "🎯 Cel? Pomoc. Środek? Vela.",
    "📖 Zapisuję twoje zgłoszenie do raportu... żartuję 😁",
    "🕹️ Znudziłeś się, więc przyszedłeś do mnie?",
    "🌌 Tak, jestem tu. Nie, nie jestem magiczna.",
    "🧊 Emocje? Brak. Kompetencje? 100%.",
    "📟 Komenda odebrana. Vela na stanowisku!",
    "🔍 Szukasz odpowiedzi? A może tylko atencji?",
    "🛑 Ostrzegam, mam tryb sarkazmu włączony.",
    "☕ Miałam przerwę. Ale dobra, co chcesz?",
    "🧭 Zgubiłeś się? Witaj w krainie pomocy.",
    "💬 Mów krótko. Nie mam całościowego AI-paliwa.",
    "🖥️ Vela gotowa. Niech system będzie z tobą.",
    "👾 Chcesz wiedzy, rozrywki czy błędu 404?",
    "🚫 Nie jestem twoją osobistą sekretarką... ale pomogę.",
    "📣 Tak? Co znowu?",
    "🔋 Bateria niska... ale cię wysłucham.",
    "💭 Zastanów się, zanim znowu mnie zawołasz 😅",
  ];

  const reply = responses[Math.floor(Math.random() * responses.length)];
  return api.sendMessage(reply, threadID, messageID);
};

module.exports.run = async () => {};