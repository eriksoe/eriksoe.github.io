var N_LETTERS = 26;
var WORDLENGTH = 5;
var N_GUESSES = 6;

// Links to DOM nodes.
var letterCells; // [guessNr][letterNr]
var mapCells; // [letter][letterNr]

var theWord = null;
var guesses; // [guessNr] -> String
var guessNr; // 0-based

function initModel(_theWord) {
    theWord = _theWord;
    guessNr = 0;
    guesses = [];
}
