'use strict'

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function handleRightClicks(selector) {
    var elCells = document.querySelectorAll(selector)
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].oncontextmenu = (ev) => {
            ev.preventDefault()
            onCellMarked(ev.target)
        }
    }
}
