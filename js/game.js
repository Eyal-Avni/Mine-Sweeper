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
var gGameTimerInterval

function onInit() {
    gLevel = { SIZE: 4, MINES: 2 }
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0 }
    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    console.log(gBoard)
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
            var className = `cell cell-${i}-${j}`
            className += mat[i][j].isShown ? ' cell-shown' : ' cell-hidden'
            strHTML += `<td class="${className}" onclick="onCellClicked(this,${i},${j})" >`
            if (cell.isShown) {
                if (cell.isMine) {
                    strHTML += BOMB_IMG
                } else {
                    strHTML += cell.minesAroundCount
                }
            }
            strHTML += '</td>'
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
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        var elTimer = document.querySelector('.timer')
        var gGameTimerInterval = setInterval(updateTimer, 1000, elTimer)
    }
    gGame.shownCount++
    // console.log('click')
    gBoard[i][j].isShown = true
    renderBoard(gBoard, '.board-container')
    checkGameOver()
}

function onCellMarked(elCell) {
    console.log(elCell)
}

function updateTimer(elTimer) {
    gGame.secsPassed++
    // console.log(elTimer)
    elTimer.innerText = gGame.secsPassed
}

function checkGameOver() {
    // clearInterval(gGameTimerInterval)
}

function expandShown(board, elCell, i, j) {}
