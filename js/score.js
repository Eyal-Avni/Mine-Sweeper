'use strict'

function renderBestScore() {
    var elBeginnerScore = document.querySelector('.score-beginner')
    var elMediumScore = document.querySelector('.score-medium')
    var elExpertScore = document.querySelector('.score-expert')
    gScore.BEGINNER = localStorage.getItem('BEGINNER')
    gScore.MEDIUM = localStorage.getItem('MEDIUM')
    gScore.EXPERT = localStorage.getItem('EXPERT')
    gScore.bFormated = localStorage.getItem('bFormated')
    gScore.mFormated = localStorage.getItem('mFormated')
    gScore.eFormated = localStorage.getItem('eFormated')
    if (!gScore.BEGINNER) elBeginnerScore.innerText = 'None yet'
    else elBeginnerScore.innerText = localStorage.getItem('bFormated')
    if (!gScore.MEDIUM) elMediumScore.innerText = 'None yet'
    else elMediumScore.innerText = localStorage.getItem('mFormated')
    if (!gScore.EXPERT) elExpertScore.innerText = 'None yet'
    else elExpertScore.innerText = localStorage.getItem('eFormated')
}

function compareBestScore(score, formatedScore, difficulty) {
    if (score < gScore[difficulty] || !gScore[difficulty]) {
        gScore[difficulty] = score
        localStorage.setItem(`${difficulty}`, score)
        switch (difficulty) {
            case 'BEGINNER':
                localStorage.setItem('bFormated', formatedScore)
                gScore.bFormated = formatedScore
                console.log(localStorage.getItem('bFormated'))
                break
            case 'MEDIUM':
                localStorage.setItem('mFormated', formatedScore)
                gScore.mFormated = formatedScore
                break
            case 'EXPERT':
                localStorage.setItem('eFormated', formatedScore)
                gScore.eFormated = formatedScore
                break
            default:
                break
        }
    }
}
