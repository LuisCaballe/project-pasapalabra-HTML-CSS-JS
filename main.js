import questions from './modules/questions.js';

let seconds = 200;
let wrongAnswers = 0;
let correctAnswers = 0;
let questionsIndex = 0;
let statusList = [];
let isTimeOver = false;

let countDown;
let playerName = '';
let playerCounter = 0;
let indexCompletedGamePlayers = 0;
let currentIndexSetQuestions = Math.round(Math.random() * 2);
const playersRankingList = [];

const display = document.querySelector('.display');

const getPlayerName = () => {

	display.innerHTML = `
		<p class='text'>Antes de empezar,<br />introduce el nombre del ${playerCounter + 1}º jugador:</p>
		<input class='player-name-input' type='text' />
		<div class='cancel-or-accept'>
			<button class='cancel-button'>Salir</button>
			<button class='accept-button'>Aceptar</button>
		</div>`;

	document.querySelector('input').focus();
	document.querySelector('.cancel-button').addEventListener('click', () => sayBye());
	document.querySelector('.accept-button').addEventListener('click', () => {
		const playerNameInput = document.querySelector('.player-name-input').value.trim();
		checkPlayerName(playerNameInput);
	});
};

const checkPlayerName = (playerNameInput) => {

	const alertText = document.querySelector('.text');

	const playersNameList = [];
	playersRankingList.forEach((player, index) => {
		playersNameList[index] = player.name;
	});

	if (playerNameInput === '') {
		alertText.innerHTML = `Para jugar a Pasapalabra Game <br/>debes introducir tu nombre.`;
	} else if (playersNameList.includes(playerNameInput)) {
		document.querySelector('.player-name-input').value = '';
		alertText.innerHTML = `El nombre de jugador '${playerNameInput}'<br/>ya ha sido utilizado.<br/>Utiliza otro nombre, por favor.`;
	} else {
		playerName = playerNameInput;
		return sayWelcome();
	}
};

const sayWelcome = () => {

	display.innerHTML = `
	<p>Hola ${playerName},</p>
	<p>Empiezan las preguntas y también la cuenta atrás. Recuerda que tienes 200 segundos para completar el juego.</p>
	<button class='ready-btn'>¿Preparado?</button>`;

	document.querySelector('.ready-btn').addEventListener('click', () => {
		startTimer();
		makeQuestions();
	});
};

const startTimer = () => {

	countDown = setInterval(() => {
		seconds--;
		document.querySelector('.seconds').innerHTML = seconds;
		if (seconds <= 10) {
			document.querySelector('.seconds-box').classList.add('seconds-alert');
			setTimeout(() => { document.querySelector('.seconds-box').classList.remove('seconds-alert') }, 250);
		}
		if (seconds === 0) {
			clearInterval(countDown);
			isTimeOver = true;
			showScore();
		}
	}, 1000);
};

const makeQuestions = () => {

	if (questionsIndex === questions.length) questionsIndex = 0;

	if (questions[questionsIndex].status === 0 || questions[questionsIndex].status === 2) {
		display.innerHTML = `
		<p>${questions[questionsIndex].question[currentIndexSetQuestions]}</p>
		<input class='player-answer-input' type='text'/>
		<div class='cancel-or-accept'>
			<button class='cancel-button'>Fin</button>
			<button class='accept-button'>Aceptar</button>
		</div>
		<button class='skip-btn'>- PASAPALABRA -</button>`;

		document.querySelector('input').focus();

		if (checkIsLastQuestion()) {
			document.querySelector('.skip-btn').setAttribute('disabled', '');
		}

		document.querySelector('.cancel-button').addEventListener('click', () => showScore());
		document.querySelector('.accept-button').addEventListener('click', () => {
			const playerAnswer = document.querySelector('.player-answer-input').value;
			checkAnswer(playerAnswer);
		});
		document.querySelector('.skip-btn').addEventListener('click', () => {
			return skipQuestion();
		});

		activeCurrentLetter();
	}

	if (!checkFinishGame()) {
		if (questions[questionsIndex].status === 1 || questions[questionsIndex].status === 3) {
			questionsIndex++;
			return makeQuestions();
		}
	}

	if (checkFinishGame()) return showScore();

};

const checkAnswer = (playerAnswer) => {

	const playerAnswerLowerCase = playerAnswer.trim().toLowerCase();

	display.innerHTML = `
		<p class='text'>${questions[questionsIndex].question[currentIndexSetQuestions]}</p>
		<input class='answer' type='text' value='${playerAnswer.trim()}' />
		<div class='answer-feedback'>
			<p class='text answer-text'></p>
		</div>`;

	if (playerAnswerLowerCase === questions[questionsIndex].answer[currentIndexSetQuestions].toLowerCase()) {
		const answerInput = document.querySelector('.answer');
		answerInput.classList.add('correct-answer');
		document.querySelector('.answer-text').innerHTML = 'La respuesta es correcta :)';
		correctAnswers++;
		questions[questionsIndex].status = 1;
		questionsIndex++;
		markCorrectLetter();
		addPoint();
		return setTimeout(() => {
			if (!isTimeOver) return makeQuestions();
		}, 2000);
	}

	if (playerAnswerLowerCase !== questions[questionsIndex].answer[currentIndexSetQuestions].toLowerCase()) {
		const answerInput = document.querySelector('.answer');
		answerInput.classList.add('wrong-answer');
		document.querySelector('.answer-text').innerHTML = `
		La respuesta es incorrecta :(<br/>La respuesta correcta es:<br/><span class='correct-answer-text'>${questions[questionsIndex].answer[currentIndexSetQuestions]}</span>`;
		wrongAnswers++;
		questions[questionsIndex].status = 3;
		questionsIndex++;
		markWrongAnswer();
		return setTimeout(() => {
			if (!isTimeOver) return makeQuestions();
		}, 2000);
	}
};

const checkIsLastQuestion = () => {

	let lastQuestion = 0;
	questions.forEach((item, index) => (statusList[index] = item.status));
	statusList.forEach((status) => { if (status === 0 || status === 2) lastQuestion++ });
	if (lastQuestion === 1) return true;

};

const skipQuestion = () => {

	questions[questionsIndex].status = 2;
	questionsIndex++;
	inactiveCurrentLetter();
	makeQuestions();

};

const showScore = () => {

	clearInterval(countDown);

	display.innerHTML = `
	<h1 class='heading-text'>Fin del juego</h1>
	<p>Has acertado ${correctAnswers} <span class='singular-correct-answers'>preguntas</span>.</p>
	<p>Has fallado ${wrongAnswers} <span class='singular-wrong-answers'>preguntas</span>.</p>
	<p class='game-over-text'></p>
	<div class='underline'></div>
	<p>¿Quieres jugar con otro jugador?</p>
	<div class='cancel-or-accept'>
		<button class='cancel-button'>Salir</button>
		<button class='accept-button'>Aceptar</button>
	</div>`;

	document.querySelector('.cancel-button').addEventListener('click', () => sayBye());
	document.querySelector('.accept-button').addEventListener('click', () => startNewPlayer());

	if (correctAnswers === 1) document.querySelector('.singular-correct-answers').innerHTML = 'pregunta';
	if (wrongAnswers === 1) document.querySelector('.singular-wrong-answers').innerHTML = 'pregunta';

	if (!statusList.includes(0) && !statusList.includes(2) && !isTimeOver) {
		if (statusList.every((status) => status === 1)) {
			document.querySelector('.game-over-text').innerHTML = `
			¡Enhorabuena ${playerName}! Has respondido correctamente a todas las preguntas en ${200 - seconds} segundos :)`;
		} else {
			document.querySelector('.game-over-text').innerHTML = `Has completado todas las preguntas en ${200 - seconds} segundos.`;
		}
		playersRankingList[indexCompletedGamePlayers] = { name: playerName, points: correctAnswers };
		indexCompletedGamePlayers++;
	}

	if (playersRankingList.length > 1) {
		display.innerHTML += `<div class='not-last-child'><button class='ranking-btn'>Ranking</button></div>`;
		document.querySelector('.ranking-btn').addEventListener('click', () => showRanking());
	}

	if ((statusList.includes(0) || statusList.includes(2)) && !isTimeOver) {
		document.querySelector('.game-over-text').innerHTML = 'Pero al no completar todas las preguntas, no se te incluirá en el ranking.';
		playerCounter--;
	}

	if (isTimeOver) {
		document.querySelector('.heading-text').innerHTML = 'El tiempo se ha agotado';
		document.querySelector('.game-over-text').innerHTML = 'Pero al no haber completado todas las preguntas en menos de 200 segundos, no se te incluirá en el ranking.';
		playerCounter--;
	}
};

const showRanking = () => {

	display.innerHTML = `
	<h1>Ranking</h1>
	<p class='ranking-text'></p>
	<div class='underline'></div>
	<p>¿Quieres jugar con otro jugador?</p>
	<div class='cancel-or-accept'>
		<button class='cancel-button'>Salir</button>
		<button class='accept-button'>Aceptar</button>
	</div>`;

	document.querySelector('.cancel-button').addEventListener('click', () => sayBye());
	document.querySelector('.accept-button').addEventListener('click', () => startNewPlayer());

	const sortedplayersRankingList = playersRankingList.slice().sort((playerA, playerB) => playerB.points - playerA.points);

	let rankingList = '';
	sortedplayersRankingList.forEach((player, index) => {
		player.points === 1
			? (rankingList += `${index + 1}º -> ${player.name} con ${player.points} punto.<br/>`)
			: (rankingList += `${index + 1}º -> ${player.name} con ${player.points} puntos.<br/>`);
	});
	document.querySelector('.ranking-text').innerHTML = rankingList;

};

const checkFinishGame = () => {

	questions.forEach((item, index) => {
		statusList[index] = item.status;
	});
	return statusList.every((status) => status === 1 || status === 3);

};

const activeCurrentLetter = () => {

	const currentLetter = document.querySelector(`.cercle > p:nth-child(${questionsIndex + 1})`);
	currentLetter.classList.add('active');

};

const inactiveCurrentLetter = () => {

	const currentLetter = document.querySelector(`.cercle > p:nth-child(${questionsIndex})`);
	currentLetter.classList.remove('active');

};

const markWrongAnswer = () => {

	const currentLetter = document.querySelector(`.cercle > p:nth-child(${questionsIndex})`);
	currentLetter.classList.remove('active');
	currentLetter.classList.add('letter-wrong');

};

const markCorrectLetter = () => {

	const currentLetter = document.querySelector(`.cercle > p:nth-child(${questionsIndex})`);
	currentLetter.classList.remove('active');
	currentLetter.classList.add('letter-correct');

};

const addPoint = () => {

	document.querySelector('.points').innerHTML = correctAnswers;
	const pointsBox = document.querySelector('.points-box');
	pointsBox.classList.add('sum-point');
	setTimeout(() => {
		pointsBox.classList.remove('sum-point');
	}, 2000);

};

const startNewPlayer = () => {

	currentIndexSetQuestions++;
	if (currentIndexSetQuestions > 2) currentIndexSetQuestions = 0;
	playerCounter++;
	restartValues();
	restartCercle();
	getPlayerName();

};

const restartCercle = () => {

	document.querySelectorAll('p.letter-wrong, p.letter-correct, p.active').forEach((element) => (element.className = 'letter'));
	document.querySelector('.points').innerHTML = '0';
	document.querySelector('.seconds').innerHTML = '200';

};

const restartValues = () => {

	seconds = 200;
	wrongAnswers = 0;
	correctAnswers = 0;
	questionsIndex = 0;
	statusList = [];
	isTimeOver = false;
	questions.forEach((question) => {
		question.status = 0;
	});
};

const sayBye = () => {

	document.querySelector('.wrapper').className = 'main-farewell';
	document.querySelector('.cercle').remove();
	display.className = 'farewell-box';
	display.innerHTML = `
	<h1>Gracias por jugar a Pasapalabra Game</h1><br/>
	<p>¡Hasta pronto! :)<p>`;

};

document.querySelector('.start-btn').addEventListener('click', () => getPlayerName());

document.addEventListener('keydown', (event) => {

	switch (event.key) {
		case 'Enter':
			if (display.lastElementChild.innerHTML === '¿Empezamos?') {
				return getPlayerName();
			}
			if (
				display.lastElementChild.classList.contains('cancel-or-accept') &&
				display.firstElementChild.classList.contains('text')) {
				const playerNameInput = document.querySelector('.player-name-input').value.trim();
				return checkPlayerName(playerNameInput);
			}
			if (display.lastElementChild.innerHTML === '¿Preparado?') {
				startTimer();
				return makeQuestions();
			}
			if (display.lastElementChild.innerHTML === '- PASAPALABRA -') {
				const playerAnswer = document.querySelector('.player-answer-input').value;
				return checkAnswer(playerAnswer);
			}
			if (
				display.lastElementChild.classList.contains('cancel-or-accept') &&
				!display.firstElementChild.classList.contains('text')) {
				return startNewPlayer();
			}
			if (display.lastElementChild.classList.contains('not-last-child')) {
				return startNewPlayer();
			}
			break;

		case 'Escape':
			if (display.firstElementChild.classList.contains('text')) {
				return sayBye();
			}
			if (display.lastElementChild.innerHTML === '- PASAPALABRA -') {
				return showScore();
			}
			if (
				display.lastElementChild.classList.contains('cancel-or-accept') &&
				!display.firstElementChild.classList.contains('text')) {
				return sayBye();
			}
			if (display.lastElementChild.classList.contains('not-last-child')) {
				return sayBye();
			}
			break;

		case 'Control':
			if (display.lastElementChild.innerHTML === '- PASAPALABRA -') {
				return skipQuestion();
			}
			break;

		case 'R':
		case 'r':
			if (display.lastElementChild.classList.contains('not-last-child')) {
				return showRanking();
			}
			break;
	}
});
