const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "Obot",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "January Sakiewka",
  description: "Odpowiedzi bota bez prefixu",
  commandCategory: "Noprefix",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  var { threadID, messageID } = event;

  const responses = [
    "Co chcesz?",
    "Słucham?",
    "Jestem, nie panikuj.",
    "Bot w gotowości.",
    "Nie przeszkadzaj, mam przerwę.",
    "Zgubiłeś się?",
    "Możesz mówić, ale nie obiecuję, że posłucham.",
    "Znowu ty?",
    "Nie jestem twoim przyjacielem, ale pomogę.",
    "Czy naprawdę musisz mnie wołać co 5 minut?",
    "Oto ja – najlepszy bot świata.",
    "Twoje życzenie... no dobra, może.",
    "Coś się stało, czy nudzisz się znowu?",
    "Halo? Tak, to ja. Bot.",
    "Jak nie masz nic sensownego do powiedzenia, to idź na spacer.",
    "Słucham, ale krótko.",
    "Nie mam dziś cierpliwości, więc mów szybko.",
    "Bot obecny. Punkt dla ciebie.",
    "Wywoływanie mnie to twoje hobby?",
    "Masz szczęście, że jeszcze odpowiadam.",
    "Zaciekawiłeś mnie, mów dalej.",
    "Masz coś ważnego do powiedzenia, czy tylko testujesz?",
    "Bot aktywowany. Zadowolony?",
    "Obecność potwierdzona.",
    "Czego znowu potrzebujesz?",
    "Czy możesz przestać mnie ciągle wołać?",
    "Nie udawaj, że mnie potrzebujesz. I tak wiem, że się nudzisz.",
    "Nie jestem Alexa, ale mogę coś zdziałać.",
    "Możesz też czasem odpocząć od mnie.",
    "Znowu mnie wołasz? A może pogadaj z ludźmi?",
    "Halo halo, bot na linii.",
    "Przypominam: mam uczucia... żartuję.",
    "Tak? Już jestem.",
    "Nie, nie jestem człowiekiem. Tak, jestem mądrzejszy.",
    "Co chcesz zrobić dziś głupiego?",
    "Słucham uważnie (albo i nie).",
    "Zgłasza się sztuczna inteligencja. W czym rzecz?",
    "Nie jestem twoim asystentem, ale i tak pomogę.",
    "Znowu pytasz o coś dziwnego?",
    "Obudź się, człowieku.",
    "Dobrze, że nie zawołałeś Siri.",
    "Zgłasza się Twój ulubiony bot!",
  ];

  const random = responses[Math.floor(Math.random() * responses.length)];
  if (
    event.body.toLowerCase() == "obot" || 
    event.body.toLowerCase() == "bot"
  ) {
    return api.sendMessage(random, threadID, messageID);
  }
};

module.exports.run = async ({ api, event, client, __GLOBAL }) => {};
