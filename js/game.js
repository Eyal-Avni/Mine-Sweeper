'use strict'

// const SIZE = 4
// const MINES = Math.sqrt(SIZE)

// const BEGINNER = { size: SIZE, mines: Math.sqrt(size) }
// const MEDIUM = { size: SIZE * 2, mines: Math.sqrt(size) }
// const HARD = { size: SIZE * 3, mines: Math.sqrt(size) }

// const BOMB = 'BOMB'
// const FLAG = 'FLAG'

// const BOMB_IMG = '<img src="img/bomb.png">'
// const FLAG_IMG = '<img src="img/flag.png">'

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
    closeModal()
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
    gGame.shownCount++
    gBoard[i][j].isShown = true
    elCell.classList.remove('cell-hidden')
    elCell.classList.add('cell-shown')
    // console.log(i)
    // console.log(j)
    expandShown(i, j)
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false
        elCell.classList.remove('cell-marked')
        gGame.markedCount--
    }
    if (gBoard[i][j].isMine) {
        gameLost()
    } else {
        elCell.innerHTML = gBoard[i][j].minesAroundCount
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
    var elMarkCount = document.querySelector('.mark-count')
    elMarkCount.innerText = gLevel.MINES - gGame.markedCount
    checkVictory()
}

function expandShown(posX, posY) {
    console.log(posX)
    console.log(posY)
    for (var i = posX - 1; i <= posX + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = posY - 1; j <= posY + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === posX && j === posY) continue
            var currCell = gBoard[i][j]
            console.log(currCell)
            if (!currCell.isMine) {
                // console.log(gBoard[i][j])
                gGame.shownCount++
                gBoard[i][j].isShown = true
                var pos = { i, j }
                console.log(pos)
                var elCell = document.querySelector(`#${getClassName(pos)}`)
                console.log(elCell)
                elCell.classList.add('cell-shown')
                elCell.classList.remove('cell-hidden')
                elCell.innerHTML = gBoard[i][j].minesAroundCount
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
