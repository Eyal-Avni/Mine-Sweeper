'use strict'

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function getCellCoord(strCellId) {
    var coord = {}
    var parts = strCellId.split('-')
    coord.i = +parts[1]
    coord.j = +parts[2]
    return coord
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
