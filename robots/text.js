const algorithmia = require("algorithmia")
const algorithmiaApiKey = require('../credentials/autentication.json').apiKey
const sbd = require('sbd')

async function robot(content) {
   await fetchContentFromWikipedia(content)
   sanitizaContent(content)
//    breakContentIntoSentences(content)
}

async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
    const wikipediaContent = wikipediaResponde.get()
    content.sourceContentOriginal = wikipediaContent.content
}

function sanitizaContent(content) {
    const withoutBlankLinesMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const witoutDatesInParateses = removeDatesInParetenses(withoutBlankLinesMarkdown)
    content.sourceContentSanitized = witoutDatesInParateses
    sentenceBoundaryDetection(content)
    console.log(content)
}

function removeBlankLinesAndMarkdown(text) {
    const allLines = text.split('\n')

    const withoutBlankLinesMarkdown =  allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
            return false
        }
        return true
    })
    return withoutBlankLinesMarkdown.join(' ')
}

function removeDatesInParetenses(text) {
    return text.replace(/\((?:\[^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
}

function sentenceBoundaryDetection(content) {
    content.setences = []
    const sentences =  sbd.sentences(content.sourceContentSanitized)
    sentences.forEach(line => {
        content.setences.push({
            text: line,
            leywords: [],
            image: []
        })
    })
}

module.exports = robot