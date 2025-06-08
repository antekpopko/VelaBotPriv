module.exports.config = {
  name: "mention",
  version: "1.0.5",
  hasPermssion: 2, // <--- zmiana na hasPermssion, jeśli taki klucz jest w innych Twoich modułach
  credits: "Przerobione przez ChatGPT na bazie CYBER TEAM",
  description: "Bot odpowiada z różnymi emocjami, gdy ktoś oznaczy admina, z emoji w wiadomościach",
  commandCategory: "inne",
  usages: "",
  cooldowns: 1
};

module.exports.handleEvent = async function ({ api, event }) {
  const adminIDs = ["61563352322805"];
  const mentionedIDs = Object.keys(event.mentions || {});

  const botID = api.getCurrentUserID();
  if (event.senderID === botID) return;
  if (adminIDs.includes(event.senderID)) return;

  const isMentionedAdmin = mentionedIDs.some(id => adminIDs.includes(id));
  if (!isMentionedAdmin) return;

  const responses = [
    "😡 Ej, przestań mnie oznaczać, mam lepsze rzeczy do roboty!",
    "🚫 Znowu admina tagujesz? Serio? Odwal się!",
    "😤 Nie jestem tu po to, żeby słuchać twoich bzdur!",
    "🙄 Oznaczasz admina i myślisz, że to coś da? Błąd!",
    "😒 Naprawdę musisz tak ciągle spamować oznaczenia?!",
    "😠 Przestań już! Nikt tu nie ma czasu na twoje pierdoły!",
    "🤬 Daj spokój, zanim wyłączę ci mikrofon! 🔇",
    "🤨 Myślałeś, że admin od razu zareaguje? Pomyliłeś się! 😂",
    "😏 Oznaczenie admina? To nie bilet na szybkie rozwiązanie problemu.",
    "😑 Kolejny, który nie potrafi użyć funkcji wyszukiwania.",
    "😒 Proszę, trochę szacunku i mniej oznaczania.",
    "😓 Znowu ty? Odczekaj chwilę i zastanów się.",
    "🤯 O kurczę, znowu to samo! Chyba czas na przerwę.",
    "😤 Nie denerwuj admina — to może się źle skończyć.",
    "🙃 Twoje oznaczanie admina nic nie zmieni — serio.",
    "😂 Jeśli myślisz, że to działa, to żyj w błogiej nieświadomości.",
    "😬 Zamiast oznaczać admina, może spróbuj coś sam?",
    "😎 Spokojnie, admin ma wszystko pod kontrolą — chyba.",
    "😥 Znowu oznaczanie... kiedy się to skończy?",
    "🤐 Lepiej uważaj, co piszesz, bo admin ma oko na ciebie.",
    "🙄 Oznaczenie admina nie znaczy, że twoje problemy znikną.",
    "😣 O nie, nie znowu ktoś chce czegoś od admina...",
    "😜 Hej, oznaczaj dalej — to taki śmieszny spam.",
    "😇 Wiesz, że admin ma też swoje życie, prawda?",
    "😤 Dobra, daj spokój — już cię zauważyłem.",
    "😝 No dobra, śmieszne trochę, ale przestań już.",
    "🤓 Lepiej zajmij się czymś innym niż ciągłym oznaczaniem.",
    "😠 Nie zadzieraj z adminem, bo… no wiesz co.",
    "🙃 Oznaczaj admina, a zobaczysz jak szybko zniknie.",
    "😳 Ej, co ty wyprawiasz? Oznaczasz admina jak leci!",
    "🤡 Chyba pomyliłeś admina z clownem, co?",
  ];

  const randomReply = responses[Math.floor(Math.random() * responses.length)];

  return api.sendMessage(randomReply, event.threadID);
};