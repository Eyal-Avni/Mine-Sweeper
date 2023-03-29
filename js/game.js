'use strict'

// const SIZE = 4
// const MINES = Math.sqrt(SIZE)

// const BEGINNER = { size: SIZE, mines: Math.sqrt(size) }
// const MEDIUM = { size: SIZE * 2, mines: Math.sqrt(size) }
// const HARD = { size: SIZE * 3, mines: Math.sqrt(size) }

const BOMB = 'BOMB'
const FLAG = 'FLAG'

const BOMB_IMG = '<img src="img/bomb.png">'
const FLAG_IMG = '<img src="img/flag.png">'

var gBoard
var gLevel
var gGame
var gGameTimerInterval = null

function onInit() {
    gLevel = { SIZE: 4, MINES: 2 }
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = gLevel.MINES - gGame.markedCount
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
    board[1][1].isMine = true
    board[0][3].isMine = true

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

function onCellClicked(elCell, i, j) {
    startTimer()
    if (gBoard[i][j].isShown) return
    gGame.shownCount++
    gBoard[i][j].isShown = true
    elCell.classList.remove('cell-hidden')
    elCell.classList.add('cell-shown')
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.classList.remove('cell-marked')
        gGame.markedCount--
    }
    if (gBoard[i][j].isMine) {
        elCell.classList.add('cell-mine')
    } else {
        elCell.innerHTML = gBoard[i][j].minesAroundCount
    }
    // checkGameOver()
}

function onCellMarked(elCell) {
    var coords = getCellCoord(elCell.id)
    if (gBoard[coords.i][coords.j].isShown) return
    gBoard[coords.i][coords.j].isMarked = !gBoard[coords.i][coords.j].isMarked
    elCell.classList.toggle('cell-marked')
    if (gBoard[coords.i][coords.j].isMarked) gGame.markedCount++
    else gGame.markedCount--
    startTimer()
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = gLevel.MINES - gGame.markedCount
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

function checkGameOver() {
    // clearInterval(gGameTimerInterval)
}

function expandShown(board, elCell, i, j) {}
