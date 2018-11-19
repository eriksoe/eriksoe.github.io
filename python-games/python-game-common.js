// output functions are configurable.  This one just appends some text
// to a pre element.
function outf(text) {
    var mypre = document.getElementById("output");
    mypre.innerHTML = mypre.innerHTML + text;
}
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

function pythonWait(delay) {return Sk.misceval.callsimOrSuspend(Sk.importModule("time").$d.sleep, delay);};

function runPython(inElem, outElem, stdlib) {
    var prog = document.getElementById(inElem).value;
    var mypre = document.getElementById(outElem);
    mypre.innerHTML = '';
    Sk.pre = "output";
    Sk.configure({output:outf, read:builtinRead});

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
