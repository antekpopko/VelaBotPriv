let games = {};

function checkWinner(board) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

function displayBoard(board) {
  let display = "";
  for (let i = 0; i < 9; i++) {
    display += board[i] ? board[i] : "⬛";
    display += (i+1) % 3 === 0 ? "\n" : " ";
  }
  return display;
}

function makeBotMove(board, playerID) {
  const botPlayer = games[playerID].botPlayer;
  const opponent = botPlayer === "❌" ? "⭕" : "❌";

  // Prosty ruch botem - pierwszy wolny
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = botPlayer;
      break;
    }
  }
}

function resetGame(playerID) {
  games[playerID] = {
    board: Array(9).fill(null),
    currentPlayer: Math.random() < 0.5 ? "❌" : "⭕",
    inProgress: true,
    botPlayer: "❌"
  };
}

module.exports.config = {
  name: "ttt",
  version: "2.0",
  hasPermssion: 0,
  credits: "Vex_Kshitiz",
  description: "Prosta gra kółko i krzyżyk z botem",
  commandCategory: "game",
  usages: "[1-9] aby wykonać ruch",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const playerID = event.senderID;
  if (!games[playerID] || !games[playerID].inProgress) {
    resetGame(playerID);
    const boardMsg = displayBoard(games[playerID].board);
    return api.sendMessage(`Rozpoczynam grę!\n${boardMsg}\nWpisz liczbę 1-9 aby wykonać ruch.`, event.threadID, event.messageID);
  }

  const pos = parseInt(args[0]);
  if (isNaN(pos) || pos < 1 || pos > 9) {
    return api.sendMessage("Podaj poprawną pozycję od 1 do 9.", event.threadID, event.messageID);
  }

  if (games[playerID].board[pos - 1] !== null) {
    return api.sendMessage("To pole jest już zajęte. Wybierz inne.", event.threadID, event.messageID);
  }

  // Ruch gracza (zawsze "⭕")
  games[playerID].board[pos - 1] = "⭕";

  // Sprawdź czy gracz wygrał
  if (checkWinner(games[playerID].board) === "⭕") {
    const finalBoard = displayBoard(games[playerID].board);
    games[playerID].inProgress = false;
    return api.sendMessage(`Gratulacje! Wygrałeś!\n${finalBoard}`, event.threadID, event.messageID);
  }

  if (isBoardFull(games[playerID].board)) {
    const finalBoard = displayBoard(games[playerID].board);
    games[playerID].inProgress = false;
    return api.sendMessage(`Remis!\n${finalBoard}`, event.threadID, event.messageID);
  }

  // Ruch bota
  makeBotMove(games[playerID].board, playerID);

  // Sprawdź czy bot wygrał
  if (checkWinner(games[playerID].board) === "❌") {
    const finalBoard = displayBoard(games[playerID].board);
    games[playerID].inProgress = false;
    return api.sendMessage(`Bot wygrał!\n${finalBoard}`, event.threadID, event.messageID);
  }

  if (isBoardFull(games[playerID].board)) {
    const finalBoard = displayBoard(games[playerID].board);
    games[playerID].inProgress = false;
    return api.sendMessage(`Remis!\n${finalBoard}`, event.threadID, event.messageID);
  }

  // Kontynuuj grę
  const boardMsg = displayBoard(games[playerID].board);
  api.sendMessage(`Twój ruch:\n${boardMsg}`, event.threadID, event.messageID);
};
