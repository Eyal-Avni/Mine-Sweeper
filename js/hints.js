'use strict'

function initHints() {
    var hints = []
    var strHTML = ''
    for (var i = 0; i < 3; i++) {
        hints.push({ id: i, isUsed: false, isSelected: false })
        strHTML += `<button class="hint-btn hint-${i}" onclick="onHintChoose(this)">
        <img src="img/hint.png" />
    </button>`
    }
    var hintContainer = document.querySelector('.hints')
    hintContainer.innerHTML = strHTML
    return hints
}

function onHintChoose(elHint) {
    var currHintId = +elHint.classList[1].charAt(elHint.classList[1].length - 1)
    console.log(gHints)
    gHints[currHintId].isSelected = !gHints[currHintId].isSelected
    elHint.innerHTML = gHints[currHintId].isSelected ? HINT_READY_IMG : HINT_IMG
    console.log(gHints)
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
}

function onSafeClick(elButton) {
    gSafeClickCount--
    updateSafeClickButton()
    if (!gSafeClickCount) elButton.setAttribute('disabled', '')
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
