'use strict'

// function renderCell(location, value) {
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }

// function getClassName(location) {
//     const cellClass = 'cell-' + location.i + '-' + location.j
//     return cellClass
// }

// function getRandomIntInclusive(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min
// }

// function getRandomColor() {
//     var letters = '0123456789ABCDEF'
//     var color = '#'
//     for (var i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)]
//     }
//     return color
// }

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
