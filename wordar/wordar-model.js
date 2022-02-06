var N_LETTERS = 26;
var WORDLENGTH = 5;
var VISIBILITY = 4;
var N_GUESSES = 6;
var INFINITY = 1000000;

// Links to DOM nodes.
var guessCells; // [guessNr][letterNr]
var guessTextCells; // [guessNr][letterNr]
var mapCells; // [letter][letterNr]

var theWord = null;
var guesses; // [guessNr] -> String
var guessNr; // 0-based

// Derived:
var correctLetters; // [letterNr] -> Int
var guessMap; // [letter][letterNr] -> Boolean
var guessDistMap; // [guessNr][letterNr] -> Int

function initModel(_theWord) {
    theWord = _theWord.toUpperCase();
    guessNr = 0;
    guesses = [];

    correctLetters = stringToCodes(theWord);

    guessMap = make2DArray(N_LETTERS, WORDLENGTH, false);
    guessDistMap = [];

    //TEMP:
    makeGuess();
}

function makeGuess() {
    //TEMP:
    var theGuess = "TRAIN";
    guesses[guessNr] = theGuess;
    var guessCodes = stringToCodes(theGuess);
    for (x=0; x<WORDLENGTH; x++) guessMap[guessCodes[x]][x] = true;
    var guessDist = calcDistances(guessCodes, correctLetters);
    guessDistMap.push(guessDist);
    guessNr++;
    update();
}

function calcDistances(guess, answer) {
    var res = new Array(5);
    for (var i=0; i<WORDLENGTH; i++) {
        res[i] = calcLetterDistance(i, guess[i], answer);
    }
    return res;
}

function calcLetterDistance(x1, y1, answer) {
    var minDist = INFINITY;
    for (var x2=0; x2<WORDLENGTH; x2++) {
        var y2 = answer[x2];
        var d = rawDistance(x1, y1, x2, y2);
        minDist = Math.min(minDist, d);
    }
    if (minDist == INFINITY || minDist > VISIBILITY) minDist = -1;
    return minDist;
}

function rawDistance(x1, y1, x2, y2) {
    var yDist = Math.abs(y1 - y2);
    yDist = Math.min(yDist, N_LETTERS - yDist);
    var xDist = Math.abs(x1 - x2);
    return xDist + yDist;
}

function stringToCodes(s) {
    var res = new Array(WORDLENGTH);
    for (var i=0; i<WORDLENGTH; i++) res[i] = letterCode(s, i);
    return res;
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
        var correct = false;
        for (var i=0; i<guessNr; i++) {
            if (guessDistMap[i][x] == 0) correct = true;
        }
        style = correct ? "correct" : "guess";
    } else {
        var ruledOut = false;
        var frontier = false;
        for (var i=0; i<guessNr; i++) {
            var guessCodes = stringToCodes(guesses[i]);
            for (var x2=0; x2<WORDLENGTH; x2++) {
                var d = rawDistance(x, y, x2, guessCodes[x2]);
                if (d > VISIBILITY) d = INFINITY;
                var d2 = guessDistMap[i][x2];
                if (d2 == -1) d2 = VISIBILITY+1;
                if (d>=0 && d2>=0) {
                    if (d < d2) { ruledOut = true; }
                    else if (d == d2) { frontier = true; }
                }
            }
        }
        style = ruledOut ? "ruled-out" : frontier ? "frontier" : "none";
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
