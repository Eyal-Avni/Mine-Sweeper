'use strict'

function onSandbox(elSandBoxBtn) {
    gGame.sandboxOn = !gGame.sandboxOn
    if (gGame.sandboxOn) {
        onInit()
        gGame.sandboxOn = true
        gGame.isOn = false
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var pos = { i, j }
                var elCell = document.querySelector(`#${getClassName(pos)}`)
                elCell.addEventListener(`click`, placeMine, false)
            }
        }
        var elRestartBtn = document.querySelector('.restart-btn')
        elRestartBtn.hidden = true
        openModal('Place mines on board, then press "Play!"')
        elSandBoxBtn.innerText = 'Play!'
    } else {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var pos = { i, j }
                var elCell = document.querySelector(`#${getClassName(pos)}`)
                elCell.removeEventListener(`click`, placeMine, false)
                elCell.classList.remove('cell-mine')
            }
        }
        closeModal()
        var elRestartBtn = document.querySelector('.restart-btn')
        elRestartBtn.hidden = false
        setMinesNegsCount(gBoard)
        elSandBoxBtn.innerText = 'SandBox mode!'
        gGame.isOn = true
    }
}

function placeMine(event) {
    event.target.classList.add('cell-mine')
    var pos = getCellCoord(event.target.id)
    gBoard[pos.i][pos.j].isMine = true
}
