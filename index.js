const EASY = 3
const MEDIUM = 5
const HARD = 7
const TIME_LIMIT = 60
const COLOR_STEP = 255 * 2 / TIME_LIMIT
const MAX_WIDTH = 515
const GAP = 10

const MOLE = 'images/alex.png'

let difficulty = EASY
let isPlaying = false

let red, green, score, timeLeft
let timerInterval
let gameField


function resetGame() {
    red = 0
    green = 255
    score = 0
    timeLeft = TIME_LIMIT
    changeScore(score)
    changeTimer(timeLeft)
}

function play() {
    if (isPlaying) {
        stop()
    } else {
        resetGame();
        start()
    }
    isPlaying = !isPlaying;
}

function start() {
    gameField = getGameField()
    document.getElementById('play').innerHTML = 'END'
    startTimer()
    startMoles()
}

function stop() {
    document.getElementById('play').innerHTML = 'PLAY'
    clearInterval(timerInterval)
    for (let i = 0; i < difficulty; ++i) {
        for (let j = 0; j < difficulty; ++j) {
            if (gameField[i][j]) {
                clearTimeout(gameField[i][j]['timeout'])
                if (gameField[i][j]['state'] === 'disappearing') {
                    comeIntoTheHole(i, j, false)
                }
            }
        }
    }
}

function getGameField() {
    let field = []
    for (let i = 0; i < difficulty; ++i) {
        field.push([])
        for (let j = 0; j < difficulty; ++j) {
            field[i].push(null)
        }
    }
    return field
}

function setGameField() {
    document.body.getElementsByClassName('container')[0].style.gridTemplateColumns =
        `repeat(${difficulty}, 1fr)`
    const diameter = (MAX_WIDTH - GAP * (difficulty - 1)) / difficulty
    const style = `width: ${diameter}px; height: ${diameter}px;`
    for (let i = 0; i < difficulty; ++i) {
        for (let j = 0; j < difficulty; ++j) {
            document.body.getElementsByClassName('container')[0].insertAdjacentHTML('beforeend',
                `<div class="hole" data-x=${j} data-y=${i} style="${style}"></div>`)
        }
    }
}

function removeGameField() {
    document.getElementsByClassName("container")[0].innerHTML = ''
}

function setDifficulty(newDifficulty) {
    if (isPlaying) {
        play()
    }
    resetGame()
    removeGameField()
    difficulty = newDifficulty
    setGameField()
}

function changeScore(score) {
    document.getElementById('scoreCounter').innerHTML = score
}

function changeTimer(timer) {
    const width = Math.round(100 / (TIME_LIMIT - 1) * (timer - 1))
    let minutes = Math.floor(timer / 60)
    let seconds = timer % 60
    if (timer < TIME_LIMIT) {
        if (red < 255) {
            red = Math.round(red + COLOR_STEP)
        } else {
            green = Math.round(green - COLOR_STEP)
        }
    }
    document.getElementById('progress').style.width = `${width}%`
    document.getElementById('progress').style.backgroundColor = `rgb(${red}, ${green}, 0)`
    document.getElementById("timerCounter").innerHTML =
        `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

function getRandomAppearingTime() {
    return Math.round(Math.random() * 1000) % 500 + 500 + Math.round((difficulty ** -1) * 1000);
}

function getRandomDisappearingTime() {
    return Math.round(Math.random() * 1000) + 500
}

function getRandomHole() {
    let x = Math.round(Math.random() * 1000) % difficulty
    let y = Math.round(Math.random() * 1000) % difficulty
    if (gameField[x][y]) {
        return getRandomHole()
    }
    return [x, y];
}

function comeOutFromTheHole(x, y) {
    const mole = getMoleByHole(x, y)
    gameField[x][y]['listener'] = () => { whackAMole(x, y) }
    mole.innerHTML = `<img class="mole" src="${MOLE}" alt="">`
    mole.addEventListener('click', gameField[x][y]['listener'])
}

function comeIntoTheHole(x, y, whacked) {
    const mole = getMoleByHole(x, y)
    mole.innerHTML = ''
    mole.removeEventListener('click', gameField[x][y]['listener'])
    if (whacked) {
        clearTimeout(gameField[x][y]['timeout'])
        createMole()
    }
    gameField[x][y] = null
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft -= 1
        changeTimer(timeLeft)
        if (timeLeft === 0) {
            play()
        }
    }, 1000);
}

function startMoles() {
    for (let i = 0; i < Math.ceil(difficulty / 3); ++i) {
        createMole()
    }
}

function getMoleByHole(x, y) {
    return document.querySelector(`.hole[data-x="${x}"][data-y="${y}"]`)
}

function whackAMole(x, y) {
    comeIntoTheHole(x, y, true)
    changeScore(++score)
}

function appearMole(x, y) {
    return setTimeout(() => {
        removeMole(x, y)
        comeOutFromTheHole(x, y)
    }, getRandomDisappearingTime());
}

function disappearMole(x, y) {
    return setTimeout(() => {
        comeIntoTheHole(x, y, false)
        createMole()
    }, getRandomAppearingTime());
}

function createMole() {
    let [x, y] = getRandomHole()
    gameField[x][y] = {
        state: 'appearing',
        timeout: appearMole(x, y),
    }
}

function removeMole(x, y) {
    gameField[x][y] = {
        state: 'disappearing',
        timeout: disappearMole(x, y),
        listener: null
    }
}


resetGame()
setDifficulty(difficulty)

document.getElementById("easy").addEventListener('click', () => { setDifficulty(EASY) })
document.getElementById("medium").addEventListener('click', () => { setDifficulty(MEDIUM) })
document.getElementById("hard").addEventListener('click', () => { setDifficulty(HARD) })
document.getElementById("play").addEventListener('click', play)