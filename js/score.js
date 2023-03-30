'use strict'

// gScore = { BEGINNER: null, MEDIUM: null, EXPERT: null }

function renderBestScore() {
    var elBeginnerScore = document.querySelector('.score-beginner')
    var elMediumScore = document.querySelector('.score-medium')
    var elExpertScore = document.querySelector('.score-expert')
    gScore.BEGINNER = localStorage.getItem('BEGINNER')
    gScore.MEDIUM = localStorage.getItem('MEDIUM')
    gScore.EXPERT = localStorage.getItem('EXPERT')
    if (!gScore.BEGINNER) elBeginnerScore.innerText = 'Non yet'
    else elBeginnerScore.innerText = localStorage.getItem('BEGINNER')
    if (!gScore.MEDIUM) elMediumScore.innerText = 'Non yet'
    else elMediumScore.innerText = localStorage.getItem('MEDIUM')
    if (!gScore.EXPERT) elExpertScore.innerText = 'Non yet'
    else elExpertScore.innerText = localStorage.getItem('EXPERT')
}

function compareBestScore(score, difficulty) {
    // debugger
    if (score < gScore[difficulty] || !gScore[difficulty]) {
        gScore[difficulty] = score
        // console.log(score)
        localStorage.setItem(`${difficulty}`, score)
        console.log(localStorage.getItem(difficulty))
    }
    var elScore = document.querySelector(`.score-${difficulty.toLowerCase()}`)
    elScore.innerText = localStorage.getItem(difficulty)
}
