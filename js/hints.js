'use strict'

function initHints() {
    var hints = []
    // var strHTML = ''
    for (var i = 0; i < 3; i++) {
        hints.push({ id: i, isUsed: false, isSelected: false })
        //     strHTML += `<button class="hint-btn hint-${i}" onclick="onHintChoose(this)">
        //     <img src="img/hint.png" />
        // </button>`
    }
    // var hintContainer = document.querySelector('.hints')
    // hintContainer.innerHTML = strHTML
    return hints
}

function renderHints() {
    var strHTML = ''
    for (var i = 0; i < 3; i++) {
        if (!gHints[i].isUsed) {
            strHTML += `<button class="hint-btn hint-${i}" onclick="onHintChoose(this)">
            <img src="img/hint.png" />
        </button>`
        }
    }
    var hintContainer = document.querySelector('.hints')
    hintContainer.innerHTML = strHTML
}

function onHintChoose(elHint) {
    var currHintId = +elHint.classList[1].charAt(elHint.classList[1].length - 1)
    gHints[currHintId].isSelected = !gHints[currHintId].isSelected
    elHint.innerHTML = gHints[currHintId].isSelected ? HINT_READY_IMG : HINT_IMG
    if (gGame.isDarkMode) elHint.style.filter = 'invert(100%)'
    else elHint.style.filter = 'invert(0%)'
}

function isHintSelected() {
    for (var i = 0; i < gHints.length; i++) {
        if (gHints[i].isSelected) {
            return true
        }
    }
    return false
}

function useSelectedHint(elCell) {
    for (var i = 0; i < gHints.length; i++) {
        if (gHints[i].isSelected) {
            gHints[i].isUsed = true
            gHints[i].isSelected = false
            var elHint = document.querySelector(`.hint-${i}`)
            elHint.remove()
        }
    }
    activateHintEffect(elCell)
}

function activateHintEffect(elCell) {
    var currCellCoords = getCellCoord(elCell.id)
    hintRevealCell(elCell, currCellCoords.i, currCellCoords.j)
    for (var k = currCellCoords.i - 1; k <= currCellCoords.i + 1; k++) {
        if (k < 0 || k >= gBoard.length) continue
        for (var l = currCellCoords.j - 1; l <= currCellCoords.j + 1; l++) {
            if (l < 0 || l >= gBoard[currCellCoords.i].length) continue
            if (k === currCellCoords.i && l === currCellCoords.j) continue
            if (gBoard[k][l].isShown) continue
            var negCellCoor = { i: k, j: l }
            var negCell = document.querySelector(
                `#${getClassName(negCellCoor)}`
            )
            hintRevealCell(negCell, k, l)
        }
    }
}

function hintRevealCell(elCell, i, j) {
    gBoard[i][j].isShown = true
    elCell.classList.add('cell-shown')
    elCell.classList.remove('cell-hidden')
    if (gBoard[i][j].isMine) {
        elCell.classList.add('cell-mine')
    }
    if (gBoard[i][j].isMarked) {
        removeMark(elCell, i, j)
    }
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount > 0) {
        elCell.innerHTML = gBoard[i][j].minesAroundCount
    }
    setTimeout(hintHideCell, 1000, elCell, i, j)
}

function hintHideCell(elCell, i, j) {
    gBoard[i][j].isShown = false
    elCell.classList.remove('cell-shown')
    elCell.classList.remove('cell-mine')
    elCell.classList.add('cell-hidden')
    elCell.innerHTML = ''
}

function updateSafeClickButton() {
    var elSafeClickRemains = document.querySelector('.safe-click-remain')
    elSafeClickRemains.innerText = gSafeClickCount
    var elSafeClickBtn = document.querySelector('.safe-click')
    elSafeClickBtn.disabled = false
}

function onSafeClick(elButton) {
    gSafeClickCount--
    updateSafeClickButton()
    if (gSafeClickCount <= 0) elButton.setAttribute('disabled', '')
    markRandomSafe()
}

function markRandomSafe() {
    var opts = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                var pos = { i, j }
                opts.push(pos)
            }
        }
    }
    var randSafeCell = opts[getRandomInt(0, opts.length)]
    var elMarkedSafeCell = document.querySelector(
        `#${getClassName(randSafeCell)}`
    )
    gBoard[randSafeCell.i][randSafeCell.j].isMarked = true
    elMarkedSafeCell.classList.add('cell-marked')
    setTimeout(
        removeMark,
        3000,
        elMarkedSafeCell,
        randSafeCell.i,
        randSafeCell.j
    )
}

function saveAction() {
    var savedBoard = []
    var savedGame = []
    savedBoard = JSON.parse(JSON.stringify(gBoard)) //Deep copy of gBoard
    savedGame = JSON.parse(JSON.stringify(gGame)) //Deep copy of gGame
    gUndoBoardStack.push(savedBoard)
    gUndoGameStack.push(savedGame)
}

function onUndo() {
    if (gGame.isOn) {
        if (!gUndoBoardStack.length) return
        gBoard = JSON.parse(JSON.stringify(gUndoBoardStack.pop()))
        gGame = JSON.parse(JSON.stringify(gUndoGameStack.pop()))
        renderBoard(gBoard, '.board-container')
        renderHUD()
        if (gUndoBoardStack.length === 1) onInit()
    }
}

function onMegaClick() {
    gMega.isOn = true
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.hidden = true
    openModal('Choose top-left and bottom-right cells')
}

function megaChooseSubBoard(elCell) {
    var pos = getCellCoord(elCell.id)
    if (!gMega.topLeftIdx) {
        gMega.topLeftIdx = pos
    } else {
        gMega.bottomRightIdx = pos
        megaRevealSubBoard()
    }
}

function megaRevealSubBoard() {
    for (var i = gMega.topLeftIdx.i; i <= gMega.bottomRightIdx.i; i++) {
        for (var j = gMega.topLeftIdx.j; j <= gMega.bottomRightIdx.j; j++) {
            gBoard[i][j].isShown = true
            var pos = { i, j }
            var elCell = document.querySelector(`#${getClassName(pos)}`)
            elCell.classList.add('cell-shown')
            elCell.classList.remove('cell-hidden')
            if (gBoard[i][j].isMine) {
                elCell.classList.add('cell-mine')
            }
        }
    }
    setTimeout(() => {
        for (var i = gMega.topLeftIdx.i; i <= gMega.bottomRightIdx.i; i++) {
            for (var j = gMega.topLeftIdx.j; j <= gMega.bottomRightIdx.j; j++) {
                gBoard[i][j].isShown = false
                var pos = { i, j }
                var elCell = document.querySelector(`#${getClassName(pos)}`)
                elCell.classList.add('cell-hidden')
                elCell.classList.remove('cell-shown')
                elCell.classList.remove('cell-mine')
            }
        }
    }, 2000)
    gMega.isOn = false
    closeModal()
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.hidden = false
    var elMegaHintBtn = document.querySelector('.mega-hint-btn')
    elMegaHintBtn.disabled = true
    gMega.isUsed = true
}
