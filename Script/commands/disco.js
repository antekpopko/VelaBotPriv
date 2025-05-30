module.exports.config = {
  name: "disco",
  version: "1.1.1",
  hasPermssion: 0,
  credits: "CYBER ⚡ + ChatGPT",
  description: "Zmienia kolor rozmowy losowo, określoną liczbę razy (max 25)",
  commandCategory: "System",
  usages: "disco [ilość]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const count = parseInt(args[0]);
  if (isNaN(count)) return api.sendMessage("❌ To nie jest liczba!", event.threadID);
  if (count < 1) return api.sendMessage("⚠️ Liczba musi być większa od 0!", event.threadID);
  if (count > 25) return api.sendMessage("🚫 Maksymalna liczba zmian to 25!", event.threadID);

  const colors = [
    '196241301102133', '169463077092846', '2442142322678320', '234137870477637',
    '980963458735625', '175615189761153', '2136751179887052', '2058653964378557',
    '2129984390566328', '174636906462322', '1928399724138152', '417639218648241',
    '930060997172551', '164535220883264', '370940413392601', '205488546921017',
    '809305022860427'
  ];

  api.sendMessage(`🌈 Rozpoczynam tęczowy pokaz z ${count} zmianami...`, event.threadID);

  for (let i = 0; i < count; i++) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      await api.changeThreadColor(randomColor, event.threadID);
    } catch (e) {
      console.log("Błąd zmiany koloru:", e.message);
    }
    await new Promise(res => setTimeout(res, 1200)); // 1.2 sekundy pomiędzy
  }

  return api.sendMessage("✅ Tęczowy pokaz zakończony!", event.threadID);
};
