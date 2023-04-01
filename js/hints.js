'use strict'

function initHints() {
    var hints = []
    for (var i = 0; i < 3; i++) {
        hints.push({ id: i, isUsed: false, isSelected: false })
    }
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
    if (gSafeClickCount <= 0) {
        elButton.setAttribute('disabled', '')
        elButton.color = 'gray'
    }
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
        if (!gUndoBoardStack.length) onInit()
    }
}

function onMegaClick() {
    saveAction()
    gMega.isOn = true
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.hidden = true
    openModal('Choose top-left and bottom-right cells')
}

function megaChooseSubBoard(elCell) {
    elCell.classList.add('mega-mark')
    var pos = getCellCoord(elCell.id)
    if (!gMega.topLeftIdx) {
        gMega.topLeftIdx = pos
    } else {
        var elTopLeftCell = document.querySelector(
            `#${getClassName(gMega.topLeftIdx)}`
        )
        elTopLeftCell.classList.remove('mega-mark')
        elCell.classList.remove('mega-mark')
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
    setTimeout(() => onUndo(), 2000)
    gMega.isOn = false
    closeModal()
    var elRestartBtn = document.querySelector('.restart-btn')
    elRestartBtn.hidden = false
    var elMegaHintBtn = document.querySelector('.mega-hint-btn')
    elMegaHintBtn.color = 'gray'
    elMegaHintBtn.disabled = true
    gMega.isUsed = true
}

function onExterminator() {
    var chosenMinesPos = locateThreeRandomMines()
    if (!chosenMinesPos.length) return
    else {
        for (var i = 0; i < chosenMinesPos.length; i++) {
            gBoard[chosenMinesPos[i].i][chosenMinesPos[i].j].isMine = false
        }
        var elRestartBtn = document.querySelector('.restart-btn')
        openModal('removed 3 mines, wont remove last one')
        elRestartBtn.hidden = true
        setTimeout(() => {
            closeModal()
            elRestartBtn.hidden = false
        }, 1000)
    }
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board-container')
    updateMarkCount()
}

function locateThreeRandomMines() {
    var allMinesPos = []
    var chosenMinesPos = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var pos = { i, j }
                allMinesPos.push(pos)
            }
        }
    }
    for (var i = 0; i < 3; i++) {
        if (allMinesPos.length <= 1) continue
        var chosenMine = allMinesPos.splice(
            [getRandomInt(0, allMinesPos.length)],
            1
        )
        chosenMine = chosenMine[0]
        chosenMinesPos.push(chosenMine)
    }
    return chosenMinesPos
}
