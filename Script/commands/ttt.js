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
  let str = "";
  for (let i = 0; i < 9; i++) {
    str += board[i] ? board[i] : `${i+1}`;
    str += (i+1) % 3 === 0 ? "\n" : " ";
  }
  return str.replace(/[1-9]/g, "⬛"); // zakryj numery
}

function getBestMove(board, botSymbol, playerSymbol) {
  // Wygrana?
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = botSymbol;
      if (checkWinner(board) === botSymbol) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // Blokowanie gracza
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = playerSymbol;
      if (checkWinner(board) === playerSymbol) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // Inaczej pierwszy wolny
  return board.findIndex(cell => cell === null);
}

function makeBotMove(game) {
  const { board, botPlayer, playerSymbol } = game;
  const move = getBestMove(board, botPlayer, playerSymbol);
  if (move !== -1) board[move] = botPlayer;
}

function resetGame(playerID) {
  const first = Math.random() < 0.5;
  games[playerID] = {
    board: Array(9).fill(null),
    inProgress: true,
    playerSymbol: first ? "❌" : "⭕",
    botPlayer: first ? "⭕" : "❌"
  };
}

module.exports.config = {
  name: "ttt",
  version: "2.1",
  hasPermssion: 0,
  credits: "January + Vex_Kshitiz",
  description: "Prosta gra kółko i krzyżyk z botem (z AI)",
  commandCategory: "🎮 Gry",
  usages: "[1-9] aby wykonać ruch",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const playerID = event.senderID;

  // Start gry
  if (!games[playerID] || !games[playerID].inProgress) {
    resetGame(playerID);

    const game = games[playerID];
    let msg = `🎮 Rozpoczynamy grę!\nJesteś: ${game.playerSymbol}, bot: ${game.botPlayer}`;

    // Jeśli bot zaczyna
    if (game.botPlayer === "❌") {
      makeBotMove(game);
      msg += "\n\n🤖 Bot wykonał pierwszy ruch:";
    }

    return api.sendMessage(`${msg}\n\n${displayBoard(game.board)}\n\n📝 Wpisz liczbę od 1 do 9, aby wykonać ruch.`, event.threadID, event.messageID);
  }

  const game = games[playerID];
  const pos = parseInt(args[0]);

  if (isNaN(pos) || pos < 1 || pos > 9) {
    return api.sendMessage("❗ Podaj liczbę od 1 do 9, aby zagrać.", event.threadID, event.messageID);
  }

  const idx = pos - 1;
  if (game.board[idx] !== null) {
    return api.sendMessage("🚫 To pole jest już zajęte. Wybierz inne.", event.threadID, event.messageID);
  }

  game.board[idx] = game.playerSymbol;

  if (checkWinner(game.board) === game.playerSymbol) {
    const final = displayBoard(game.board);
    delete games[playerID];
    return api.sendMessage(`🎉 Gratulacje, wygrałeś!\n${final}`, event.threadID, event.messageID);
  }

  if (isBoardFull(game.board)) {
    const final = displayBoard(game.board);
    delete games[playerID];
    return api.sendMessage(`🤝 Remis!\n${final}`, event.threadID, event.messageID);
  }

  // Bot move
  makeBotMove(game);

  if (checkWinner(game.board) === game.botPlayer) {
    const final = displayBoard(game.board);
    delete games[playerID];
    return api.sendMessage(`💀 Bot wygrał!\n${final}`, event.threadID, event.messageID);
  }

  if (isBoardFull(game.board)) {
    const final = displayBoard(game.board);
    delete games[playerID];
    return api.sendMessage(`🤝 Remis!\n${final}`, event.threadID, event.messageID);
  }

  return api.sendMessage(`🧠 Twój ruch:\n${displayBoard(game.board)}`, event.threadID, event.messageID);
};