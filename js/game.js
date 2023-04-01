'use strict'

const BEGINNER = { SIZE: 4, MINES: 2, DIFFICULTY: 'BEGINNER' }
const MEDIUM = { SIZE: 8, MINES: 14, DIFFICULTY: 'MEDIUM' }
const EXPERT = { SIZE: 12, MINES: 32, DIFFICULTY: 'EXPERT' }

const HAPPY_IMG = '<img src="img/happy.png" />'
const EXPLODING_IMG = '<img src="img/exploding.png" />'
const VICTORY_IMG = '<img src="img/victory.png" />'
const HINT_IMG = '<img src="img/hint.png" />'
const HINT_READY_IMG = '<img src="img/hint-ready.png" />'
const LIFE_IMG = '<img class="life-img" src="img/life.png" />'

var gBoard
var gLevel
var gGame
var gGameTimerInterval
var gHints
var gSafeClickCount
var gScore = { BEGINNER: null, MEDIUM: null, EXPERT: null }
var gUndoBoardStack
var gUndoGameStack
var gMega

function onInit() {
    if (!gLevel) gLevel = MEDIUM
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        sandboxOn: false,
        isDarkMode: false,
    }
    gBoard = buildBoard()
    gUndoBoardStack = []
    gUndoGameStack = []
    gSafeClickCount = 3
    gHints = initHints()
    gMega = {
        megaHintOn: false,
        isUsed: false,
        topLeftIdx: null,
        bottomRightIdx: null,
    }
    saveAction()
    clearInterval(gGameTimerInterval)
    gGameTimerInterval = null
    renderBoard(gBoard, '.board-container')
    renderHUD()
    closeModal()
    var elToolbox = document.querySelector('.toolbox')
    dragElement(elToolbox)
}

function onChooseDifficulty(difficulty) {
    const diffOpts = [BEGINNER, MEDIUM, EXPERT]
    for (var i = 0; i < diffOpts.length; i++) {
        if (+difficulty === i) {
            gLevel = diffOpts[i]
            onInit()
        }
    }
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}

function randomizeMines(board, i, j) {
    var mineCount = 0
    while (mineCount < gLevel.MINES) {
        var randI = getRandomInt(0, gLevel.SIZE)
        var randJ = getRandomInt(0, gLevel.SIZE)
        if (!board[randI][randJ].isMine && randI !== i && randJ !== j) {
            board[randI][randJ].isMine = true
            mineCount++
        }
    }
    setMinesNegsCount(board)
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var minesNegsCount = 0
            for (var k = i - 1; k <= i + 1; k++) {
                if (k < 0 || k >= board.length) continue
                for (var l = j - 1; l <= j + 1; l++) {
                    if (l < 0 || l >= board[i].length) continue
                    if (k === i && l === j) continue
                    var negCell = board[k][l]
                    if (negCell.isMine) minesNegsCount++
                }
            }
            board[i][j].minesAroundCount = minesNegsCount
        }
    }
    return board
}

function renderHUD() {
    renderBestScore()
    renderHints()
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = formatTime(gGame.secsPassed)
    updateMarkCount()
    var elLives = document.querySelector('.lives')
    if (gLevel === BEGINNER) {
        gGame.lives = 1 // In beginner mode no reason to have more than 1 life (there are only 2 mines)
    }
    renderLives(elLives)
    var elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerHTML = HAPPY_IMG
    updateSafeClickButton()
    var elMegaHintBtn = document.querySelector('.mega-hint-btn')
    if (gMega.isUsed) elMegaHintBtn.disabled = true
    else elMegaHintBtn.disabled = false
    var elDarkModeTxt = document.querySelector('.dark-mode-txt')
    elDarkModeTxt.innerText = gGame.isDarkMode ? 'Day Mode' : 'Dark Mode'
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat.length; j++) {
            var cell = mat[i][j]
            var className = `cell`
            className += cell.isShown ? ' cell-shown' : ' cell-hidden'
            if (cell.isMine && cell.isShown) className += ' cell-mine'
            if (cell.isMarked && !cell.isShown) className += ' cell-marked'
            strHTML += `<td id="cell-${i}-${j}" class="${className}" onclick="onCellClicked(this,${i},${j})" >`
            if (!cell.isMine && cell.minesAroundCount > 0 && cell.isShown) {
                strHTML += `${cell.minesAroundCount}`
            }
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    var elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    handleRightClicks('.cell')
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gMega.isOn) {
        megaChooseSubBoard(elCell)
        return
    }
    if (gBoard[i][j].isShown) return

    if (isHintSelected()) {
        useSelectedHint(elCell)
        return
    }
    if (gBoard[i][j].isMine) {
        updateMarkCount()
        checkGameLost(elCell, i, j)
        return
    }
    startTimer()
    if (countMines() === 0) {
        randomizeMines(gBoard, i, j)
    }
    saveAction()
    updateMarkCount()
    expandShown(i, j)
    if (gBoard[i][j].isMarked) {
        removeMark(elCell, i, j)
    }
    var elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerHTML = HAPPY_IMG
    checkVictory()
}

function onCellMarked(elCell) {
    if (!gGame.isOn) return
    var coords = getCellCoord(elCell.id)
    if (gBoard[coords.i][coords.j].isShown) return
    saveAction()
    startTimer()
    gBoard[coords.i][coords.j].isMarked = !gBoard[coords.i][coords.j].isMarked
    elCell.classList.toggle('cell-marked')
    if (gBoard[coords.i][coords.j].isMarked) gGame.markedCount++
    else gGame.markedCount--
    updateMarkCount()
    checkVictory()
}

//This is my original algorithm to expand cells shown to neigbors of first degree
// function expandShown(posX, posY) {
//     for (var i = posX - 1; i <= posX + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = posY - 1; j <= posY + 1; j++) {
//             if (j < 0 || j >= gBoard[i].length) continue
//             if (i === posX && j === posY) continue
//             var currCell = gBoard[i][j]
//             if (!currCell.isMine) {
//                 gGame.shownCount++
//                 gBoard[i][j].isShown = true
//                 var pos = { i, j }
//                 var elCell = document.querySelector(`#${getClassName(pos)}`)
//                 revealCell(elCell, i, j)
//             }
//         }
//     }
// }

//This algorithm expands cells shown as used in original Mine-Sweeper
//I used a stack data structure to keep track of potential cells to be shown. I didn't use recursion, although it would be a similar solution
function expandShown(rowIdx, colIdx) {
    const stack = [{ rowIdx, colIdx }]
    while (stack.length > 0) {
        const currPos = stack.pop()
        const currCell = gBoard[currPos.rowIdx][currPos.colIdx]
        if (currCell.isShown || currCell.isMine) continue
        currCell.isShown = true
        var pos = { i: currPos.rowIdx, j: currPos.colIdx }
        var elCell = document.querySelector(`#${getClassName(pos)}`)
        revealCell(elCell, currPos.rowIdx, currPos.colIdx)
        updateMarkCount()
        if (currCell.minesAroundCount === 0) {
            for (let i = currPos.rowIdx - 1; i <= currPos.rowIdx + 1; i++) {
                if (i < 0 || i >= gBoard.length) continue
                for (let j = currPos.colIdx - 1; j <= currPos.colIdx + 1; j++) {
                    if (j < 0 || j >= gBoard[i].length) continue
                    if (i === currPos.rowIdx && j === currPos.colIdx) continue
                    stack.push({ rowIdx: i, colIdx: j })
                }
            }
        }
    }
}

function startTimer() {
    if (!gGameTimerInterval) {
        var elTimer = document.querySelector('.timer')
        gGameTimerInterval = setInterval(updateTimer, 1000, elTimer)
    }
}

function updateTimer(elTimer) {
    gGame.secsPassed++
    elTimer.innerText = formatTime(gGame.secsPassed)
}

function checkVictory() {
    var markedMinesCount = 0
    var shownCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (
                (gBoard[i][j].isMarked && gBoard[i][j].isMine) ||
                (gBoard[i][j].isMine && gBoard[i][j].isShown)
            ) {
                markedMinesCount++
            } else if (gBoard[i][j].isShown) {
                shownCount++
            } else return
        }
    }
    if (
        markedMinesCount === countMines() &&
        shownCount === gLevel.SIZE ** 2 - countMines()
    ) {
        revealAllMines()
        gGame.isOn = false
        var score = gGame.secsPassed
        compareBestScore(score, gLevel.DIFFICULTY)
        var elSmiley = document.querySelector('.smiley-btn')
        elSmiley.innerHTML = VICTORY_IMG
        clearInterval(gGameTimerInterval)
        openModal('Victory!!')
    }
}

function checkGameLost(elCell, i, j) {
    loseLifeAndUpdate()
    var elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerHTML = EXPLODING_IMG
    if (!gGame.lives) {
        gameLost()
        return
    } else {
        revealCell(elCell, i, j)
        elCell.classList.add('cell-mine')
        gGame.markedCount++ //This is a bit of an odd way of taking care that the number of hidden mines is updated, another option would be to keep another global var
        updateMarkCount()
    }
}

function loseLifeAndUpdate() {
    gGame.lives--
    var elLives = document.querySelector('.lives')
    renderLives(elLives)
}

function renderLives(elLives) {
    elLives.innerHTML = ''
    for (var i = 0; i < gGame.lives; i++) {
        elLives.innerHTML += LIFE_IMG
    }
}

function gameLost() {
    revealAllMines()
    gGame.isOn = false
    clearInterval(gGameTimerInterval)
    openModal('You Died..')
}

function revealAllMines() {
    var pos = {}
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                pos = { i, j }
                var elMineCell = document.querySelector(`#${getClassName(pos)}`)
                elMineCell.classList.add('cell-mine')
                elMineCell.classList.add('cell-shown')
            }
        }
    }
}

function revealCell(elCell, i, j) {
    gGame.shownCount++
    gBoard[i][j].isShown = true
    elCell.classList.add('cell-shown')
    elCell.classList.remove('cell-hidden')
    if (gBoard[i][j].isMarked) {
        removeMark(elCell, i, j)
    }
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount
    }
}

function removeMark(elCell, i, j) {
    gBoard[i][j].isMarked = false
    elCell.classList.remove('cell-marked')
    gGame.markedCount--
}

function countMines() {
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) count++
        }
    }
    return count
}

function updateMarkCount() {
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = countMines() - gGame.markedCount
}

function openModal(msg) {
    const elModal = document.querySelector('.modal')
    const elSpan = elModal.querySelector('.msg')
    elSpan.innerText = msg
    elModal.style.display = 'block'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function onToggleDisplayMode() {
    gGame.isDarkMode = !gGame.isDarkMode
    var elDarkModeTxt = document.querySelector('.dark-mode-txt')
    elDarkModeTxt.innerText = gGame.isDarkMode ? 'Day Mode' : 'Dark Mode'
    var elBody = document.querySelector('body')
    var elButtons = document.querySelectorAll('button')
    var elImgs = document.querySelectorAll('img')
    var elSmiley = document.querySelector('.smiley-btn')
    var elRestartBtn = document.querySelector('.restart-btn')
    var elModal = document.querySelector('.modal')
    var elHints = document.querySelectorAll('.hint-btn img')
    var elDarkModeButton = document.querySelector('.dark-mode-btn')
    if (gGame.isDarkMode) {
        elBody.classList.add('dark-mode-filter')
        elModal.style.color = 'white'
        elModal.style.backgroundColor = 'transparent'
        elBody.style.color = 'white'
        elSmiley.style.backgroundImage = 'url("../img/moon.png")'
        elSmiley.style.backgroundSize = 'contain'
        elButtons.forEach((elButton) => {
            elButton.style.color = 'white'
            elButton.classList.add('dark-mode-filter')
        })
        elImgs.forEach((elImg) => {
            elImg.classList.add('dark-mode-filter')
        })
        elHints.forEach((elHint) => {
            elHint.style.filter = 'invert(100%)'
        })
        elDarkModeButton.style.color = 'black'
        elDarkModeButton.style.backgroundColor = 'gold'
    } else {
        elBody.classList.remove('dark-mode-filter')
        elModal.style.color = 'black'
        elBody.style.color = 'black'
        elSmiley.style.backgroundImage = 'url("../img/sun.png")'
        elSmiley.style.backgroundSize = 'cover'
        elButtons.forEach((elButton) => {
            elButton.style.color = 'black'
            elButton.classList.remove('dark-mode-filter')
        })
        elImgs.forEach((elImg) => {
            elImg.classList.remove('dark-mode-filter')
        })
        elHints.forEach((elHint) => {
            elHint.style.filter = 'invert(0%)'
        })
        elDarkModeButton.style.color = 'white'
        elDarkModeButton.style.backgroundColor = 'rgb(54, 0, 80)'
        elRestartBtn.style.color = 'whitesmoke'
    }
}
