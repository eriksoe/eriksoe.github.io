
var wordlist;
var mapCells;
var N = 5;

function init() {
  fetch('wordlist-en')
  .then(response => wordListFetched(response))
  // Bind stuff:
  $(".keyboard .key").on("click", letterKeyPressed);
  $(".keyboard .action").on("click", actionKeyPressed);

  // Prepare map:
  mapCells = [];
  var mapRoot = $(".map")[0];
  console.log("mapRoot:", mapRoot);
  for (var y=0; y<26; y++) {
     var letter = String.fromCharCode(65 + y);
     var row = document.createElement("tr");
     $(row).addClass("map-row");
     var rowMem = [];
     mapCells.push(rowMem);
     for (var x=0; x<N; x++) {
         var cell = document.createElement("td");
         $(cell).addClass("map-cell");
         var textNode = document.createTextNode(letter);
         cell.appendChild(textNode);
         row.appendChild(cell);
         rowMem.push(cell);
     }
     mapRoot.appendChild(row);

  }
}

function letterKeyPressed(evt) {
  var key = evt.target.getAttribute("data-key");
  if (key === null) return;
  console.log("Letter key:", key);
  //TODO: handle input
}

function actionKeyPressed(evt) {
  var action = evt.target.getAttribute("data-action");
  if (action === null) return;
  if (action == "backspace") {
      console.log("BACKSPACE"); // TODO: Handle
  } else if (action == "enter") {
      console.log("ENTER"); // TODO: Handle
  } else {
      console.log("Unhandled action:", action);
  }
}

function wordListFetched(resp) {
  if (resp.status != 200) {
    console.log("Loading wordlist failed :-(");
  } else {
    resp.text().then(txt => {
      var lines = txt.split("\n");
      //for (i in lines) if (lines[i].length != 5) console.log("Non-5-letters:", i, lines[i], lines[i].length);
      wordlist = lines.filter(x => x.length > 0);
      console.log("Words loaded: "+wordlist.length);
      ready();
    });
  }
}


function ready() {
  console.log("All ready.");
  startGame();
}

var theWord = null;
function startGame() {
  var r = Math.floor(wordlist.length * Math.random());
  theWord = wordlist[r];
  console.log("Selected word: "+theWord); //TEMP
}
