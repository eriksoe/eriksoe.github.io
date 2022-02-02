var N_LETTERS = 26;
var WORDLENGTH = 5;
var N_GUESSES = 6;

// Links to DOM nodes.
var letterCells; // [guessNr][letterNr]
var mapCells; // [letter][letterNr]

var theWord = null;
var guesses; // [guessNr] -> String
var guessNr; // 0-based

// Derived:
var guessMap; // [letter][letterNr] -> Boolean

function initModel(_theWord) {
    theWord = _theWord;
    guessNr = 0;
    guesses = [];

    guessMap = make2DArray(N_LETTERS, WORDLENGTH, false);

    //TEMP:
    makeGuess();
}

function makeGuess() {
    //TEMP:
    var theGuess = "ABCDE";
    guesses[guessNr] = theGuess;
    for (x=0; x<WORDLENGTH; x++) guessMap[letterCode(theGuess,x)][x] = true;
    guessNr++;
    update();
}

function letterCode(s,i) {return s.charCodeAt(i) - 65;}

function update() {
    //updateGuesses();
    updateMap();
}

function updateMap() {
    for (var y=0; y<N_LETTERS; y++) {
        for (var x=0; x<WORDLENGTH; x++) {
            updateMapCell(x, y);
        }
    }
}
function updateMapCell(x, y) {
    var cell = mapCells[y][x];
    var style;
    if (guessMap[y][x]) {
        style = "guess";
    } else {
        style = "none";
    }
    $(cell).removeClass().addClass(style);
}

function make2DArray(n, m, data) {
    var r = new Array(n);
    for (var i=0; i<n; i++) {
        r[i] = new Array(m).fill(data);
    }
    return r;
}
