const body = document.getElementsByTagName('body')[0];
let user = {
  id: body.dataset.uuid,
  firstname: body.dataset.firstname,
  lastname: body.dataset.lastname,
  initials: body.dataset.initials,
  identifier: null,
  credits: null
};
let gameData = {
  home: {},
  away: {},
  status: {}
};

const socket = io('https://superbowl-pool-server.ryandantzler.repl.co');
// const socket = io('https://superbowl-pool-server-bitlab.onrender.com');
// const socket = io('https://superbowl-pool-server.onrender.com');
// const socket = io('http://localhost:3000');

// ----------------------------------------------------------
// initial screen
// ----------------------------------------------------------
const initialScreen = document.getElementById('initialScreen');
const createGameBtn = document.getElementById('createGameButton');
const browseGamesBtn = document.getElementById('browseGamesButton');
const navContainer = document.getElementById('nav-container');

createGameBtn.addEventListener('click', createGame);
browseGamesBtn.addEventListener('click', browseGames);

function createGame() {
  initialScreen.classList.toggle('hidden');
  createGameScreen.classList.toggle('hidden');
}

function browseGames() {
  socket.emit('getGameLobbies');

  initialScreen.classList.toggle('hidden');
  browseGamesScreen.classList.toggle('hidden');
}

// ----------------------------------------------------------
// create game screen
// ----------------------------------------------------------
const createGameScreen = document.getElementById('createGameScreen');
const createGameBackBtn = document.getElementById('createGameBackButton');
const lobbyNameInput = document.getElementById('lobbyNameInput');
const passwordReqCheckbox = document.getElementById('password-req');
const passwordSetInput = document.getElementById('setPasswordInput');
const newGameBtn = document.getElementById('newGameButton');

createGameBackBtn.addEventListener('click', createGame);
lobbyNameInput.addEventListener('input', gameSettingsChanged);
passwordReqCheckbox.addEventListener('change', checkboxChecked);
newGameBtn.addEventListener('click', newGame);

function gameSettingsChanged() {
  if (lobbyNameInput.value != '') {
    newGameBtn.disabled = false;
  } else {
    newGameBtn.disabled = true;
  }
}

function checkboxChecked(e) {
  if (e.currentTarget.checked) {
    passwordSetInput.disabled = false;
  } else {
    passwordSetInput.disabled = true;
    passwordSetInput.value = '';
  }
}

function newGame() {
  const settings = {
    name: lobbyNameInput.value,
    password: passwordSetInput.value,
    user: user
  }

  socket.emit('newGame', settings);
}

// ----------------------------------------------------------
// browse games screen
// ----------------------------------------------------------
const browseGamesScreen = document.getElementById('browseGamesScreen');
const browseGamesBackBtn = document.getElementById('browseGamesBackButton');
const lobbyList = document.getElementById('lobby-list');

browseGamesBackBtn.addEventListener('click', browseGames);

// ----------------------------------------------------------
// game screen
// ----------------------------------------------------------
const gameScreen = document.getElementById('gameScreen');
const tooltipDialog = document.getElementById('tooltip');
const confirmSelectionsBtn = document.getElementById('confirmSelectionsButton');
const creditsDisplay = document.getElementById('credits');

confirmSelectionsBtn.addEventListener('click', confirmSelections);

function confirmSelections() {
  tooltipDialog.classList.remove('active');
  let selections = document.querySelectorAll('.selected');

  for (let i = 0; i < selections.length; i++) {
    selections[i].textContent = user.identifier;
    selections[i].classList.remove("selected");
    selections[i].classList.add("glow", "owned");
  }

  //TODO: tell server that selections are confirmed
}

function handleSelectSquare() {
  if (user.credits > 0 && this.classList.contains("available")) {
    this.classList.replace("available", "selected");
    user.credits--;

    console.log("selectSquare");
    console.log(user);

    socket.emit("squareSelected", {
      user: user,
      squareId: this.dataset.squareId
    });
  } else if (this.classList.contains("selected")) {
    this.classList.replace("selected", "available");
    user.credits++;

    console.log("unselectSquare");
    console.log(user);

    socket.emit("squareUnselected", {
      squareId: this.dataset.squareId,
      user: user
    });
  }

  let openCount = document.getElementsByClassName('available').length;
  let info = document.getElementById('info');

  if (openCount > 0) {
    info.textContent = openCount + " SQUARES LEFT";
    info.style.color = "#03a203";
  } else {
    info.textContent = "#SHOWMETHEMONEY";
    info.style.color = '';
    info.style.fontStyle = "italic";
  }

  creditsDisplay.textContent = user.credits;
  creditsDisplay.classList = user.credits > 0 ? "active" : "";
  confirmSelectionsBtn.disabled = user.credits > 0;

  console.log(`credits: ${user.credits}`);
}

// ----------------------------------------------------------
// admin controls
// ----------------------------------------------------------
const demoModeBtn = document.getElementById('demoModeButton');
const demoModeDisplay = document.getElementById('demoMode');
const simulateBtn = document.getElementById('simulateButton');
const lockBoardBtn = document.getElementById('lockBoardButton');
const drawNumbersBtn = document.getElementById('drawNumbersButton');
const addCreditsLbl = document.getElementById('addCreditsLabel');
const playersSelectList = document.getElementById('playersSelect');
const creditsSelectList = document.getElementById('creditsSelect');
const addCreditsBtn = document.getElementById('addCreditsButton');

if (demoModeBtn) {
  demoModeBtn.addEventListener('click', toggleDemoMode);
}

if (simulateBtn) {
  simulateBtn.addEventListener('click', simulateGame);
}

if (lockBoardBtn) {
  lockBoardBtn.addEventListener('click', lockBoard);
}

if (drawNumbersBtn) {
  drawNumbersBtn.addEventListener('click', drawNumbers);
}

if (addCreditsBtn) {
  addCreditsBtn.addEventListener('click', addCredits);
}

function toggleDemoMode() {
  socket.emit('toggleDemoMode');
}

function simulateGame() {
  toggleNavigation();
  simulateBtn.classList.add('disabled');
  socket.emit('simulateGame');
}

function lockBoard() {
  toggleNavigation();
  lockBoardBtn.classList.add('disabled');
  socket.emit('lockBoard');
}

function drawNumbers() {
  toggleNavigation();
  drawNumbersBtn.classList.add('disabled');
  socket.emit('drawNumbers');
}

function addCredits() {
  alert("credits sent");
  addCreditsBtn.disabled = true;
  setTimeout(() => { addCreditsBtn.disabled = false }, 1500);

  socket.emit('addCredits', { user: playersSelectList.value, credits: creditsSelect.value });
}

// ----------------------------------------------------------
// socket.io broadcast listeners
// ----------------------------------------------------------
socket.on('connected', handleConnected);

// lobby system
socket.on('gameLobbies', handleGameLobbies);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('incorrectPassword', handleIncorrectPassword);

// game setup/update
socket.on('initGame', handleInitGame);
socket.on('stateUpdate', handleBoardUpdate);
socket.on('gameDataUpdate', handleGameDataUpdate);

// admin commands
socket.on('drawNumbers', handleDrawNumbers);
socket.on('boardLocked', handleBoardLocked);
socket.on('addCredits', handleAddCredits);
socket.on('demoMode', handleDemoMode);

function handleConnected(data) {
  updateGameData(data);
}

function handleGameLobbies(data) {
  let list = '';

  for (let lobby of Object.keys(data)) {
    if (data[lobby]) {
      list += `<div class="lobby-item ${data[lobby].password !== '' ? 'password-protected' : 'no-password'}">`
        + `<h3>${data[lobby].name}</h3>`
        + `<div class="lobby-details">`
        // + `<h4>${data[lobby].host}</h4>`
        + `<input type="text" placeholder="Password" class="passwordInput"/>`
        + `<button type="submit" class="button joinGameButton" data-value=${lobby}>Join Game</button>`
        + `</div>`
        + `</div>`
    }
  }

  if (list == '') {
    list = '<h2>No Games Found</h2>';
  }

  lobbyList.innerHTML = list;

  const passwordInputs = document.querySelectorAll('.passwordInput');

  passwordInputs.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  document.querySelectorAll('.lobby-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const selected = document.querySelector('.selected');
      if (selected)
        selected.classList.remove('selected');

      if (selected !== e.currentTarget)
        e.currentTarget.classList.toggle('selected');
    });
  });

  document.querySelectorAll('.joinGameButton').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      requestJoinGame(e.currentTarget.dataset.value, item.previousElementSibling.value)
    });
  });
}

function requestJoinGame(roomId, password) {
  const data = {
    game: { roomId: roomId, password: password },
    user: user
  };

  socket.emit('joinGame', data);
}

function handleUnknownGame() {
  alert("Unknown game roomId.");
}

function handleTooManyPlayers() {
  alert("This game room is full.");
}

function handleIncorrectPassword() {
  alert("Password Incorrect");
}

function handleInitGame(game) {
  initGame(game);
}

function handleBoardUpdate(data) {
  let { squareId, user } = data;
  const square = document.querySelector('[data-square-id="' + squareId + '"]');

  if (square.classList.contains("selected")) {
    square.classList.remove("selected");
    user.credits++;
    //TODO: alert user that square was taken
    confirmSelectionsBtn.disabled = user.credits > 0;
    creditsDisplay.classList = user.credits > 0 ? "active" : "";
  }

  if (user) {
    console.log(`squareUpdate: ${squareId} by ${user.identifier}`);

    square.textContent = user.identifier;
    square.classList.remove('available');
    square.removeEventListener('click', handleSelectSquare);
  } else {
    console.log(`squareUpdate: ${squareId} unselected`);

    square.textContent = "";
    square.classList.add('available');
    square.addEventListener('click', handleSelectSquare);
  }

  let openCount = document.getElementsByClassName('available').length;
  let info = document.getElementById('info');

  if (openCount > 0) {
    info.textContent = openCount + " SQUARES LEFT";
    info.style.color = "#03a203";
  } else {
    info.textContent = "#SHOWMETHEMONEY";
    info.style.color = '';
    info.style.fontStyle = "italic";
  }
}

function handleGameDataUpdate(data) {
  console.log("game data update.");
  if (!data) {
    return;
  }
  updateGameData(data);
  updateView(gameData);
}

function updateGameData(data) {
  gameData.home = {
    score: parseInt(data.competitors[0].score),
    linescores: []
  };

  for (const score in data.competitors[0].linescores) {
    gameData.home.linescores.push(parseInt(data.competitors[0].linescores[score].value));
  }

  gameData.away = {
    score: parseInt(data.competitors[1].score),
    linescores: []
  };

  for (const score in data.competitors[1].linescores) {
    gameData.away.linescores.push(parseInt(data.competitors[1].linescores[score].value));
  }

  gameData.state = data.status.type.state;
  gameData.clock = data.status.displayClock;
  gameData.description = data.status.type.description.toUpperCase();
  gameData.period = data.status.period;

  console.log(data);
  console.log(gameData);
}

function handleBoardLocked() {
  if (lockBoardBtn) {
    lockBoardBtn.classList.add('disabled');
  }

  if (drawNumbersBtn) {
    drawNumbersBtn.classList.remove('disabled');
  }

  disableBoard();
  confirmSelections();
  user.credits = 0;

  setTimeout(() => { document.getElementById('gameboard').classList.add('locked'); }, 2500)
}

function disableBoard() {
  document.querySelectorAll('.play_nums div').forEach(node => {
    node.removeEventListener('click', handleSelectSquare);
    node.classList.remove('available');
  });
}

function handleDrawNumbers(numbers) {
  if (drawNumbersBtn) {
    drawNumbersBtn.classList.add('disabled');
  }

  if (numbers && numbers.length > 0) {
    let homeNumbers = document.querySelectorAll('#row_0 div');

    for (let i = 1; i < homeNumbers.length; i++) {
      setTimeout(() => {
        homeNumbers[i].textContent = numbers[0][i - 1]
      }, 500 * numbers[0][i - 1]);
    }

    let awayNumbers = document.querySelectorAll('.col_0');

    for (let i = 1; i < awayNumbers.length; i++) {
      setTimeout(() => {
        awayNumbers[i].textContent = numbers[1][i - 1]
      }, 5000 + (500 * numbers[1][i - 1]));
    }
  }

  setTimeout(() => { updateView(gameData) }, 10000);
}

function handleAddCredits(data) {
  console.log("add credits");
  console.log(data);
  console.log(`before: ${user.credits}, after: ${data.players[user.id].credits}`);

  user.credits = data.players[user.id].credits;

  creditsDisplay.textContent = user.credits;

  if (user.credits > 0) {
    confirmSelectionsBtn.disabled = true;
    creditsDisplay.classList = "active";
    tooltipDialog.classList.add('active');
  }
}

function handleDemoMode(enabled) {
  console.log("demo mode enabled: " + enabled);

  if (demoModeDisplay) {
    demoModeDisplay.textContent = enabled ? "On" : "Off";
  }

  if (simulateBtn) {
    simulateBtn.classList = enabled ? "" : "disabled";
  }

  if (enabled) {
    gameData.home = {
      score: 0,
      linescores: []
    };

    gameData.away = {
      score: 0,
      linescores: []
    };

    gameData.state = "in";
    gameData.clock = "15:00";
    gameData.description = "";
    gameData.period = 1;

    clearWinners();
  }

  //TODO: refresh live data from server when demo mode disabled

  updateView(gameData);
}

// ----------------------------------------------------------
// game setup functions
// ----------------------------------------------------------
function initGame(state) {
  if (!state) {
    console.log("error: unable to retrieve state");
    return;
  }

  console.log(state);

  navContainer.classList.remove('full');
  initialScreen.style.display = "none";
  createGameScreen.style.display = "none";
  browseGamesScreen.style.display = "none";
  gameScreen.style.display = "flex";

  gameScreen.querySelector('.header').innerHTML = `<h3>${state.name}</h3>`;

  user.identifier = state.players[user.id].identifier;
  user.credits = state.players[user.id].credits;

  clearGameBoard(); //TODO: remove in production
  setupGameBoard();
  loadGameBoard(state.board, state.numbers, state.locked);
  if (!state.demoMode) {
    updateView(gameData);
  }
  setupAdminControls(state);
}

function clearGameBoard() {
  document.querySelectorAll('#row_0 div').forEach(node => {
    node.textContent = "";
  });

  document.querySelectorAll('.col_0').forEach(node => {
    node.textContent = "";
  });
}

function setupGameBoard() {
  let squares = document.querySelectorAll('.play_nums div:not(.col_0)');
  for (let i = 0; i < squares.length; i++) {
    squares[i].dataset.squareId = i;
  }
}

function setupAdminControls(data) {
  if (playersSelectList) {
    for (const player in data.players) {
      playersSelectList.add(new Option(data.players[player].firstname, data.players[player].id));
    }
  }

  if (creditsSelectList) {
    for (let i = 1; i < 100; i++) {
      creditsSelectList.add(new Option(i));
    }
    creditsSelectList.disabled = false;
  }

  if (playersSelectList) {
    playersSelectList.disabled = false;
  }

  if (addCreditsLbl) {
    addCreditsLbl.classList.remove('disabled');
  }

  if (addCreditsBtn) {
    addCreditsBtn.disabled = false;
  }

  if (demoModeDisplay) {
    demoModeDisplay.textContent = data.demoMode ? "On" : "Off";
    demoModeBtn.classList.remove('disabled');
  }

  if (simulateBtn) {
    simulateBtn.classList = data.demoMode ? "" : "disabled";
  }
}

function loadGameBoard(board, numbers, locked) {
  if (locked) {
    document.getElementById('gameboard').classList.add('locked');

    if (lockBoardBtn) {
      lockBoardBtn.classList.add('disabled');
    }

    if (drawNumbersBtn) {
      if (numbers.length > 0) {
        drawNumbersBtn.classList.add('disabled');
      } else {
        drawNumbersBtn.classList.remove('disabled');
      }
    }
  }

  let rows = document.querySelectorAll('.play_nums');

  for (let i = 0; i < rows.length; i++) {
    let squares = rows[i].querySelectorAll('div');
    for (let j = 1; j < squares.length; j++) {
      if (board[i][j - 1] == '0') {
        squares[j].textContent = "";

        if (!locked) {
          squares[j].classList.add("available");
          squares[j].addEventListener('click', handleSelectSquare);
        }
      } else {
        squares[j].textContent = board[i][j - 1];
      }
    }
  }

  if (numbers && numbers.length > 0) {
    let homeNumbers = document.querySelectorAll('#row_0 div');

    for (let i = 1; i < homeNumbers.length; i++) {
      homeNumbers[i].textContent = numbers[0][i - 1];
    }

    let awayNumbers = document.querySelectorAll('.col_0');

    for (let i = 1; i < awayNumbers.length; i++) {
      awayNumbers[i].textContent = numbers[1][i - 1];
    }
  }

  creditsDisplay.textContent = user.credits;

  if (!locked && user.credits > 0) {
    setTimeout(() => { tooltipDialog.classList.add('active') }, 1000);
  }
}

// ----------------------------------------------------------
// game update functions
// ----------------------------------------------------------
function getWinners(homeScore, awayScore) {
  let winningCol;

  homeScore = homeScore.toString();
  awayScore = awayScore.toString();

  document.querySelectorAll('#row_0 div').forEach(node => {
    if (parseInt(node.textContent) == homeScore[homeScore.length - 1]) {
      winningCol = node.classList[0];
    }
  });

  document.querySelectorAll('.play_nums .col_0').forEach(node => {
    if (parseInt(node.textContent) == awayScore[awayScore.length - 1]) {
      node.parentElement.querySelector("." + winningCol).classList.add('winner');
    }
  });
}

function clearWinners() {
  let winners = document.querySelectorAll('.winner');

  winners.forEach(node => {
    node.classList.remove('winner');
  });
}

function updateView(game) {
  let openCount = 0;
  let home = game.home;
  let away = game.away;
  let lastNumHome = parseInt(home.score % 10);
  let lastNumAway = parseInt(away.score % 10);
  let quarter = "Q" + game.period;

  let info = document.getElementById('info');
  let gameClock = document.getElementById('game-clock');

  document.querySelectorAll('.play_nums div:not(.col_0)').forEach(node => {
    if (node.textContent == "") {
      openCount++;
    }
  });

  if (openCount > 0) {
    info.textContent = openCount + " SQUARES LEFT";
    info.style.color = "#03a203";
  } else {
    info.textContent = "#SHOWMETHEMONEY";
    info.style.color = '';
    info.style.fontStyle = "italic";
  }

  document.getElementById('home-score').textContent = home.score;
  document.getElementById('away-score').textContent = away.score;

  if (game.state !== "pre") {

    if (game.description == "HALFTIME" || game.state == "post") {
      gameClock.textContent = game.description;
      quarter = game.description;
    } else {
      gameClock.textContent = quarter + " " + game.clock;
    }

    switch (quarter) {
      case "Q2":
        getWinners(home.linescores[0], away.linescores[0]);
        break;
      case "HALFTIME":
      case "Q3":
        getWinners(home.linescores[0], away.linescores[0]);
        getWinners(home.linescores[0] + home.linescores[1],
          away.linescores[0] + away.linescores[1]);
        break;
      case "Q4":
      case "OT":
        getWinners(home.linescores[0], away.linescores[0]);
        getWinners(home.linescores[0] + home.linescores[1],
          away.linescores[0] + away.linescores[1]);
        getWinners(home.linescores[0] + home.linescores[1] + home.linescores[2],
          away.linescores[0] + away.linescores[1] + away.linescores[2]);
        break;
      case "FINAL":
      case "FINAL/OT":
        getWinners(home.linescores[0], away.linescores[0]);
        getWinners(home.linescores[0] + home.linescores[1],
          away.linescores[0] + away.linescores[1]);
        getWinners(home.linescores[0] + home.linescores[1] + home.linescores[2],
          away.linescores[0] + away.linescores[1] + away.linescores[2]);
        getWinners(home.score, away.score);
        break;
      default:
        break;
    }

    // clear active rows and columns
    document.querySelectorAll('.active-row').forEach(node => node.classList.remove('active-row'));
    document.querySelectorAll('.active-col').forEach(node => node.classList.remove('active-col'));

    // add active class to winning row
    document.querySelectorAll('.play_nums .col_0').forEach(node => {
      if (parseInt(node.textContent) == lastNumAway) {
        node.parentElement.classList.add('active-row');
      }
    });

    // get winning column
    document.querySelectorAll('#row_0 div').forEach(node => {
      if (parseInt(node.textContent) == lastNumHome) {
        // add active class to winning columns
        document.querySelectorAll("." + node.classList[0]).forEach(node => {
          node.classList.add('active-col');
        });
      }
    });
  }
}

// ----------------------------------------------------------
// misc
// ----------------------------------------------------------

// prevent double-tap zoom
document.ondblclick = function (e) {
  e.preventDefault();
}