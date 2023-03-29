'use strict'

const BEGINNER = { SIZE: 4, MINES: 2 }
const MEDIUM = { SIZE: 8, MINES: 14 }
const EXPERT = { SIZE: 12, MINES: 32 }

var gBoard
var gLevel
var gGame
var gGameTimerInterval = null

function onInit() {
    gLevel = MEDIUM
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
    }
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    closeModal()
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = gLevel.MINES - gGame.markedCount
    var elLives = document.querySelector('.lives')
    elLives.innerText = gGame.lives
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
            console.log(`mine set to ${randI},${randJ}`)
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

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j]
            var className = `cell`
            className += mat[i][j].isShown ? ' cell-shown' : ' cell-hidden'
            strHTML += `<td id="cell-${i}-${j}" class="${className}" onclick="onCellClicked(this,${i},${j})" ></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    handleRightClicks('.cell')
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    startTimer()
    if (gBoard[i][j].isShown) return
    console.log(gGame.shownCount)
    if (gBoard[i][j].isMine) {
        checkGameLost(elCell, i, j)
        return
    }
    if (!gGame.shownCount) {
        randomizeMines(gBoard, i, j)
    }
    revealCell(elCell, i, j)
    expandShown(i, j)
    if (gBoard[i][j].isMarked) {
        removeMark(elCell, i, j)
    }
    checkVictory()
}

function onCellMarked(elCell) {
    if (!gGame.isOn) return
    var coords = getCellCoord(elCell.id)
    if (gBoard[coords.i][coords.j].isShown) return
    startTimer()
    gBoard[coords.i][coords.j].isMarked = !gBoard[coords.i][coords.j].isMarked
    elCell.classList.toggle('cell-marked')
    if (gBoard[coords.i][coords.j].isMarked) gGame.markedCount++
    else gGame.markedCount--
    updateMarkCount()
    checkVictory()
}

function expandShown(posX, posY) {
    for (var i = posX - 1; i <= posX + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = posY - 1; j <= posY + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === posX && j === posY) continue
            var currCell = gBoard[i][j]
            if (!currCell.isMine) {
                gGame.shownCount++
                gBoard[i][j].isShown = true
                var pos = { i, j }
                var elCell = document.querySelector(`#${getClassName(pos)}`)
                revealCell(elCell, i, j)
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
    elTimer.innerText = gGame.secsPassed
}

function checkVictory() {
    var markedMinesCount = 0
    var shownCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine) {
                markedMinesCount++
            } else if (gBoard[i][j].isShown) {
                shownCount++
            } else return
        }
    }
    if (
        markedMinesCount === gLevel.MINES &&
        shownCount === gLevel.SIZE ** 2 - gLevel.MINES
    ) {
        gGame.isOn = false
        clearInterval(gGameTimerInterval)
        openModal('Victory!!')
    }
}

function checkGameLost(elCell, i, j) {
    loseLifeAndUpdate()
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
    elLives.innerText = gGame.lives
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

function updateMarkCount() {
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = gLevel.MINES - gGame.markedCount
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
