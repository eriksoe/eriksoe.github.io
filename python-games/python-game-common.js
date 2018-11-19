var EXEC_LIMIT = 500000; // Max time total: 500s
var YIELD_LIMIT = 3; // Max time between yields: 3ms

var outputElem;
var consoleText;
function outf(text) {
    setConsoleText(appendButTruncate(consoleText, text, 1000));
}
function setConsoleText(v) {
    consoleText = v;
    outputElem.innerText = consoleText;
}


// Don't allow the output to grow so large that appending gets slow.
function appendButTruncate(content, toAdd, limit) {
    if (content.length + toAdd.length > limit) {
        var cutPos0 = content.length + toAdd.length - limit/*Math.round(limit*3/4)*/;
        if (cutPos0 > 0) {
            var cutPos = content.indexOf("\n", cutPos0);
            if (cutPos < 0) cutPos = cutPos0;
            return "..." + content.substring(cutPos) + toAdd;
        }
    }
    return content + toAdd;
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function pythonWait(delay) {
    return Sk.misceval.callsimOrSuspend(Sk.importModule("time").$d.sleep, delay);
};

function stopPython() {
    Sk.hardInterrupt = true;
}

function runPython(inElem, outElem, stdlib) {
    var prog = document.getElementById(inElem).value;
    var mypre = document.getElementById(outElem);
    outputElem = mypre;
    setConsoleText("");
    Sk.configure({output:outf, read:builtinRead, yieldLimit: YIELD_LIMIT, execLimit: EXEC_LIMIT});

    Sk.onAfterImport = function(library) {
        switch(library) {
        }
    }

    if (stdlib != null) {
        for (var k in stdlib) Sk.builtins[k] = stdlib[k];
    }

    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
    },
                   function(err) {
                       alert("err: "+err);
                       console.log(err.toString());
                   });
}
