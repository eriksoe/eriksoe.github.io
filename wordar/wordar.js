
var wordlist = null;

function init() {
  fetch('wordlist-en')
  .then(response => wordListFetched(response))
  // Bind stuff:
  $(".keyboard .letter").on("click", letterKeyPressed);
}

function letterKeyPressed(evt) {
  var target = evt.target;
  var key = target.getAttribute("data-key");
  if (key === null) return;
  console.log("Letter key:", key);
  //TODO: handle input
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
