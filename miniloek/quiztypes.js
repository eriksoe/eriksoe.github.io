var who_qas = [
    {q: "Hvem kan godt lide honning?", a: "Peter Plys"},
    {q: "Hvem hopper på sin hale?", a: "Tigerdyret"},
    {q: "Hvem taber sin hale?", a: "Æslet"},
    {q: "Hvem bor nede i havet?", a: "Ponyo"},
    {q: "Hvem kan godt lide skinke?", a: "Ponyo"},
    {q: "Hvem er sjov og fuld af spjæt?", a: "Bing-Bong"},
    {q: "Hvem kan flyve på en kost?", a: "Kiki"},
    //{q: "Hvem kan flyve en flyvemaskine?", a: "Sus"},

    {q: "Hvem bygger et fyrtårn?", a: "Mimbo Jimbo"},
    {q: "Hvem har en frugt-butik?", a: "Frede"},
    {q: "Hvem har en dobbelt-zeppeliner?", a: "Baron von Rumpel-Stumpel"},
    {q: "Hvem læser en bog om Baron von Rumpel-Stumpel?", a: "Post-geparden"},

    {q: "Hvem spiser spaghetti med kødboller?", a: "Lady og Vagabonden"},
    {q: "Hvem bor i en paddehat?", a: "Smølf"},
    {q: "Hvem sover på Totoros mave?", a: "Mei"},
    {q: "Hvem kan flyve med sine ører?", a: "Dumbo"},
    {q: "Hvem sår korn?", a: "Den lille røde høne"},

    {q: "Hvem har en grøn hat og kan flyve?", a: "Peter Pan"},
    {q: "Hvem er lille og lyser og kan flyve?", a: "Klokkeblomst"},
    {q: "Hvem har et sort skæg?", a: "Kaptajn Klo"},

    {q: "Hvem har et sort skæg?", a: "Hr. Skæg"},

    {q: "Hvem er Theodors storesøster?", a: "Johanne"},
    {q: "Hvem er Theodors lillebror?", a: "Alfred"},
    {q: "Hvem har røde briller?", a: "Johanne"},

    {q: "Hvem bor i Ry?", a: "Farfar"},
    {q: "Hvem bor i Ry?", a: "Farmor"},
    {q: "Hvem bor i Hammel?", a: "Milo"},
    {q: "Hvem bor i Hammel?", a: "Frej"},
    {q: "Hvem bor i Odder?", a: "Jacob"},
    {q: "Hvem bor i Odder?", a: "Sarah"},
    /*
    {q: "Hvem bor i Skanderborg?", a: "Johanne"},
    {q: "Hvem bor i Skanderborg?", a: "Theodor"},
    */
];

var who_says_qas = [
    {q: "Vildt nok", a: "Giraffen"},
    {q: "", a: ""},
];

var where_qas = [
    {q: "Hvor bor Totoro?", a: "I et træ"},
    {q: "Hvor bor Peter Plys?", a: "I et træ"},
    {q: "Hvor skal den store pære være?", a: "I toppen af fyrtårnet"},
    {q: "Hvor bor Ninka Ninus?", a: "I et hul i jorden"},
    {q: "Hvor bor Farfar og Farmor?", a: "I Ry"},
    {q: "Hvor bor Karina og Niels?", a: "I Hurup"},
    {q: "Hvor bor Jacob og Sarah?", a: "I Odder"},
    {q: "Hvor bor Milo og Frej?", a: "I Hammel"},
    {q: "Hvor er smørret?", a: "I køleskabet"},
    {q: "Hvor er havregrynene?", a: "I skabet"},
    {q: "Hvor er tallerkenerne?", a: "I skabet"},
    {q: "Hvor er gaflerne?", a: "I skuffen"},
    {q: "Hvor er skeerne?", a: "I skuffen"},
    {q: "Hvor er din mund?", a: "Under min næse"},
    {q: "Hvor bor en fugl?", a: "I en rede"},
    {q: "Hvor kommer mælken fra?", a: "Fra en ko"},
    {q: "Hvor kommer æggene fra?", a: "Fra en høne"},
];

QUIZ_TYPES = {
    hvem: {
        descr: "Hvem...?",
        title: "Opgaver med “hvem”",
        tags: ["Dansk", "Spørgsmål", "Hvem"],
        qa_gen: function(config) {
            return rand_from_list(who_qas);
        }
    },
    hvor: {
        descr: "Hvor...?",
        title: "Opgaver med “hvor”",
        tags: ["Dansk", "Spørgsmål", "Hvor"],
        qa_gen: function(config) {
            return rand_from_list(where_qas);
        }
    },

    plus: {
        descr: "Plus-opgaver",
        title: "Plus-opgaver",
        tags: ["Matematik", "Plus"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 1, max = 50;
            var a = rand_int(min, max);
            var b = rand_int(min, max);
            var r = a + b;
            if (r>max) return null;
            return {q: a+" + " + b, a: ""+r};
        }
    },

    gange: {
        descr: "Gange-opgaver",
        title: "Gange-opgaver",
        tags: ["Matematik", "Gange"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 0, max = 10;
            var a = rand_int(min, max);
            var b = rand_int(min, max);
            var r = a * b;
            return {q: a + "&nbsp;&middot;&nbsp;" + b, a: ""+r};
        }
    },

    number_positions_all: {
        descr: "Enere og tiere",
        title: "Enere og tiere",
        tags: ["Matematik", "Positionssystem"],
        qa_gen: function(config) {
            // Fixed range for now.
            var i = rand_int(0, 9);
            var x = rand_int(0, 9);
            var r = i + 10*x;

            var names_sing = ["ener", "tier"];
            var names_plur = ["enere", "tiere"];
            var a = [i, x];
            var parts = [];
            for (var k=0; k<2; k++) parts[k] = a[k]+" " + (a[k]==1 ? names_sing : names_plur)[k];
            var ans = function() {return "Der er " + parts.join(" og ");};
            var canonAnswer = ans();
            shuffle(parts);
            var answer = ans();
            return {q: '<span style="font-size: 5mm;">' + r + "</span>",
                    a: answer,
                    alt_as: [canonAnswer]};
        }
    },

    number_positions: {
        descr: "Enere, tiere og hundreder",
        title: "Enere, tiere og hundreder",
        tags: ["Matematik", "Positionssystem"],
        qa_gen: function(config) {
            // Fixed range for now.
            var i = rand_int(0, 9);
            var x = rand_int(0, 9);
            var c = rand_int(0, 9);
            var r = i + 10*x + 100*c;

            var names_sing = ["ener", "tier", "hundrede"];
            var names_plur = ["enere", "tiere", "hundreder"];
            var a = [i, x, c];
            function a_for_k(k) {return "Der er "+a[k]+" " + (a[k]==1 ? names_sing : names_plur)[k];}
            var k = rand_int(0, 2);
            var alt_as = {};
            for (var kk=0; kk<3; kk++) alt_as[a_for_k(kk)] = 1;
            return {q: '<span style="font-size: 5mm;">' + r + "</span>",
                    a: a_for_k(k),
                    alt_as: alt_as};
        }
    },

    number_positions_count_coins: {
        descr: "Enere og tiere — tæl mønter",
        prepare_state: function() {return {position: rand_from_list([1, 10])};},
        title: function (options) {return "Hvor mange " + (options.state.position==1 ? "enere" : "tiere") + " er der?"},
        tags: ["Matematik", "Positionssystem"],
        qa_gen: function(config) {
            var position = config.state.position;
            var others = rand_bool();
            var n1=0, n2=0, n5=0, n10=0, n20=0;
            if (others) {
                n1 = rand_int(0, 5);
                n2 = rand_int(0, 5);
                n5 = rand_int(0, 5);
                n10 = rand_int(0, 5);
                n20 = rand_int(0, 5);
            }
            var count = rand_int(0, 9);
            var index;
            switch (position) {
            case 1: n1 = count; index = 0; break;
            case 10: n10 = count; index = 1; break;
            }
            var totalCount = n1 + n2 + n5 + n10 + n20;

            if (totalCount > 15) return null;
            if (totalCount > 0 && count == 0) return null;

            var names_sing = ["ener", "tier"];
            var names_plur = ["enere", "tiere"];
            var answer = "Der er " + count + " " + (count==1 ? names_sing : names_plur)[index];

            var scale = 175;
            var centers = placeCircles(4.0*scale, 2.0*scale, 67.5, totalCount);
            if (centers == null) return null;
            var q = coinsSvg(centers, scale, n1, n2, n5, n10, n20);

            if (totalCount > count) answer += "<br>og nogle andre mønter";
            return {q: q,
                    a: answer};
        }
    },

    equations0: {
        descr: "Ligninger for begyndere - Plus og minus",
        title: "Hvilket tal skal der stå?",
        tags: ["Matematik", "Ligninger"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 0, max = 20;
            var b = rand_int(-max, max);
            var x = rand_int(min, max);
            var r = x + b;
            if (r<0 || r>100) return null;
            var term = (b==0) ? "" : (b>0) ? "&nbsp;+&nbsp"+b : "&nbsp;&minus;&nbsp;"+(-b);
            var boxStyle1 = "border: thin solid black; padding: 0.25em; margin: 0.5em 0em;";
            var boxStyle2 = "border: thin solid black; padding: 0.5em; margin: 0.5em 0em;";
            var eq = '<span style="'+boxStyle1+'">&nbsp;<b>?</b>&nbsp;</span>' + term + "&nbsp;=&nbsp;" + r;
            return {q: eq, a: '<span style="'+boxStyle2+'">'+x+'</span>'};
        }
    },

    equations0b: {
        descr: "Ligninger for begyndere - gange",
        title: "Hvilket tal skal der stå?",
        tags: ["Matematik", "Ligninger"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 0, max = 20;
            var a = rand_int(1, max);
            var x = rand_int(min, max);
            var r = a * x;
            if (a>10 && x>10) return null;
            if ((a>10 || x>10) && r>50) return null;
            if (r<0 || r>100) return null;
            var boxStyle1 = "border: thin solid black; padding: 0.25em; margin: 0.5em 0em;";
            var boxStyle2 = "border: thin solid black; padding: 0.5em; margin: 0.5em 0em;";
            var eq = a + '&nbsp;&times;&nbsp;' + '<span style="'+boxStyle1+'">&nbsp;<b>?</b>&nbsp;</span>' + "&nbsp;=&nbsp;" + r;
            return {q: eq, a: '<span style="'+boxStyle2+'">'+x+'</span>'};
        }
    },

    equations1: {
        descr: "Simple ligninger",
        title: "Løs ligningen",
        tags: ["Matematik", "Ligninger"],
        qa_gen: function(config) {
            // Fixed range for now.
            var min = 0, max = 10;
            var a = rand_int(min, max);
            var b = rand_int(-max, max);
            var x = rand_int(min, max);
            var r = a * x + b;
            if (a==0) return null;
            if (a > 6 && x > 6) return null; // Too complicated.
            if (r<0 || r>100) return null;
            var v = rand_from_list(["a", "x", "y"]);
            var term = (b==0) ? "" : (b>0) ? "&nbsp;+&nbsp"+b : "&nbsp;&minus;&nbsp;"+(-b);
            var eq = a + "&middot; <em>"+v+"</em>" + term + "&nbsp;=&nbsp;" + r;
            return {q: eq, a: "<em>"+v+"</em>&nbsp;=&nbsp;"+x};
        }
    },

    coins1: {
        descr: "Mønter",
        title: "Mønter",
        tags: ["Matematik", "Penge"],
        qa_gen: function(config) {
            var n1 = rand_int(0, 10);
            var n2 = rand_int(0, 10);
            var n5 = rand_int(0, 10);
            var n10 = rand_int(0, 5);
            var n20 = rand_int(0, 5);
            var totalCount = n1 + n2 + n5 + n10 + n20;
            var totalValue = n1 + 2*n2 + 5*n5 + 10*n10 + 20*n20;

            if (totalCount > 8) return null;
            if (totalValue > 100) return null;

            var a = "Der er " + totalValue + " kroner.";
            var scale = 175;
            var centers = placeCircles(4.0*scale, 2.0*scale, 67.5, totalCount);
            if (centers == null) return null;
            var q = coinsSvg(centers, scale, n1, n2, n5, n10, n20);
            return {q: q, a: a};
        }
    },

    coins2: {
        descr: "Mønter 2",
        title: "Mønter",
        tags: ["Matematik", "Penge"],
        qa_gen: function(config) {
            var n1 = rand_int(0, 10);
            var n2 = rand_int(0, 10);
            var n5 = rand_int(0, 10);
            var n10 = rand_int(0, 5);
            var n20 = rand_int(0, 5);
            var totalCount = n1 + n2 + n5 + n10 + n20;
            var totalValue = n1 + 2*n2 + 5*n5 + 10*n10 + 20*n20;

            if (totalCount > 8) return null;
            if (totalValue > 100) return null;

            var a = "Der er " + totalValue + " kroner.";
            var scale = 175;
            var centers = placeCircles(4.0*scale, 2.0*scale, 67.5, totalCount);
            if (centers == null) return null;
            var q = coinsSvg(centers, scale, n1, n2, n5, n10, n20);

            var alt_as = [a];
            if (rand_int(0,1) > 0) { // Swap Q and A.
                var tmp=q; q=a; a=tmp;
            }
            return {q: q, a: a, alt_as: alt_as};
        }
    },

    fractions1: {
        descr: "Brøker - lagkager vs notation",
        title: "Brøker",
        tags: ["Matematik", "Brøker"],
        qa_gen: function(config) {
            // Fixed range for now.
            var max = 10;
            var b = rand_int(2, max);
            var a = rand_int(1, b-1);
	    var fraction = "<div style=\"margin: 0.1cm; font-size: 0.5cm;\"><span style=\"border-bottom: 0.1em solid black; padding: 0em 0.5em;\">" + a + "</span><br><span style=\"padding: 0em;\">" + b + "</span></div>";
	    var pie = fractionPie(a,b);
	    var question, answer;
	    if (rand_bool()) {
		question = fraction; answer = pie;
	    } else {
		question = pie; answer = fraction;
	    }
	    var promille = 1000*a/b; //TODO: prefix with form dependent character.
            return {q: question, a: answer, alt_qs: [promille], alt_as: [promille]};
        }
    },
    fractions2: {
        descr: "Brøker - ækvivalens",
        title: "Brøker - samme størrelse",
        tags: ["Matematik", "Brøker"],
        qa_gen: function(config) {
            // Fixed range for now.
            var max = 12;
            var b = rand_int(2, max);
            var a = rand_int(1, b);
            var d = rand_int(2, max);
            var c = Math.round(a*d/b); // Aim: a/b=c/d or ad=bc
	    if (a*d != b*c) return null; // Out of bounds, or inexact.
	    if (b==d && Math.random() < 0.99) return null; // Reject same denominator -- most of the time.

	    function notation_or_pie(x,y, usePie) {
		if (usePie) {
		    return fractionPie(x,y);
		} else {
		    return "<div style=\"margin: 0.1cm; font-size: 0.5cm;\"><span style=\"border-bottom: 0.1em solid black; padding: 0em 0.5em;\">" + x + "</span><br><span style=\"padding: 0em;\">" + y + "</span></div>";
		}
	    }
	    var question = notation_or_pie(a,b, Math.random() < 0.75);
	    var answer   = notation_or_pie(c,d, Math.random() < 0.75);
	    var promille = 1000*a/b;
            return {q: question, a: answer, alt_qs: [promille], alt_as: [promille]};
        }
    },

    regneregler: {
        descr: "Regneregler - sæt parenteserne",
        title: "Hvor skal parenteserne stå?",
        tags: ["Matematik", "Regneregler"],
        qa_gen: function(config) {
	    var n = 5;
	    var OPERATORS = [["+",1], ["-",1], ["·",2], [":",2]];
	    var symbols = ["a", "b", "c", "d", "e"];

	    function makeTree(leaves, nodeFun) {
		if (leaves.length == 1) return leaves[0];
		if (leaves.leaves < 1) throw "Bad!";
		var x = rand_int(1,leaves.length-1);
		var op = nodeFun();
		var leaves1 = leaves.slice(0,x);
		var leaves2 = leaves.slice(x);
		return {"left": makeTree(leaves1, nodeFun),
			"op": op,
			"right": makeTree(leaves2, nodeFun)}
	    }
	    var tree = makeTree(symbols, function() {return rand_from_list(OPERATORS)});

	    function treeToString(tree, precLevel, parensOnEqual, forceParens) {
		if (typeof(tree) == "string") return tree; // A leaf.
		var left = tree["left"];
		var opInfo = tree["op"];
		var right = tree["right"];
		var opStr = opInfo[0];
		var opLevel = opInfo[1];

		var leftStr = treeToString(left, opLevel, false, forceParens);
		var rightStr = treeToString(right, opLevel, true, forceParens);
		var nodeStr = leftStr + opStr + rightStr;

		var useParens =
		    (forceParens && precLevel>0) // Force: all parens except outermost
		    || precLevel > opLevel // Hierarchy rule
		    || ((precLevel == opLevel) && parensOnEqual); // Left-to-right rule

		if (useParens) {
		    return "(" + nodeStr + ")";
		} else {
		    return nodeStr;
		}
	    }
	    //console.log("Tree", tree)
	    var id = rand_int(0,1000);
	    var treeStr = treeToString(tree, 0, false, false);
	    var allParensStr = treeToString(tree, 0, false, true);
	    return {"q": "Q"+id+": "+ treeStr,
		    "a": "A"+id+": "+ allParensStr};

	    return null;
	}
    },

atoms_and_molecyles: {
        descr: "Atomer og molekyler",
        title: "Atomer og molekyler”",
        tags: ["Kemi"],
        qa_gen: function(config) {
	    var ATOMS = {
		1: {symbol: "H", name: "Hydrogen", name2: "Brint"},
		2: {symbol: "He", name: "Helium"},
		3: {symbol: "Li", name: "Lithium"},
		4: {symbol: "Be", name: "Beryllium"},
		5: {symbol: "B", name: "Bor"},
		6: {symbol: "C", name: "Carbon", name2: "Kulstof"},
		7: {symbol: "N", name: "Nitrogen", name2: "Kvælstof"},
		8: {symbol: "O", name: "Oxygen", name2: "Ilt"},
		9: {symbol: "F", name: "Flour"},
		10: {symbol: "Ne", name: "Neon"},
	    };
	    if (rand_bool()) {
		var a = rand_int(0,2);
		var b = rand_int(0,2);
		if (a==b) return;
		var nr = rand_int(1, 8);
		var atom = ATOMS[nr];
		var stuff = ["Atomnummer "+nr, '<span style="font-family: sans-serif, helvetica, arial">'+atom["symbol"]+'</span>',
			     ("name2" in atom && rand_bool())? atom["name2"] : atom["name"]];
		return {q: stuff[a], a: stuff[b], alt_as: ["atom-"+nr]}
	    } else {
		var MOLECYLES = [
		    {formula: "H<sub>2</sub>", name: "Brint-molekyle"},
		    {formula: "O<sub>2</sub>", name: "Ilt-molekyle"},
		    {formula: "N<sub>2</sub>", name: "Kvælstof-molekyle"},
		    {formula: "H<sub>2</sub>O", name: "Vand"},
		    {formula: "CO<sub>2</sub>", name: "Kuldioxid"},
		];
		var m = rand_from_list(MOLECYLES);
		var a = rand_int(0, 1);
		var b = 1-a;
		var stuff = [m["formula"], m["name"]];
		return {q: stuff[a], a: stuff[b], alt_as: ["molecyle-"+m["formula"]]};
	    }
        }
    },
}

function placeCircles(w, h, r, count) {
    var centers = [];
    var failedAttempts = 0;
    var placed = 0;
    while (placed < count && failedAttempts < 20) {
        var x = rand_int(r, w-r);
        var y = rand_int(r, h-r);
        var ok = true;
        for (var i=0; i<placed; i++) {
            var dx = x - centers[i].x;
            var dy = y - centers[i].y;
            if (dx*dx + dy*dy < 4*r*r) {
                ok = false;
                break;
            }
        }
        if (ok) {
            centers.push({x:x, y:y});
            placed++;
        } else {
            failedAttempts++;
        }
    }
    console.log("placeCircles result:"); console.log(centers);
    return centers.length == count ? centers : null;
}

function coinsSvg(centers, scale, n1, n2, n5, n10, n20) {
    var placed = 0;
    var tmp = '';
    function place(n, svgDefName) {
        for (var i=0; i<n; i++) {
            var pos=centers[placed++];
            tmp += '<use href="images/moenter.svg#' + svgDefName + '" x="' + (pos.x-67.5) + '" y="' + (pos.y-67.5) + '"/>';
        }
    }
    place(n1, "1kr");
    place(n2, "2kr");
    place(n5, "5kr");
    place(n10, "10kr");
    place(n20, "20kr");
    var svg = '<svg width="4cm" height="2cm" viewBox="0 0 ' + (4*scale) + ' ' + (2*scale) + '" xmlns="http://www.w3.org/2000/svg">' + tmp + '</svg>';
    return svg;
}

function fractionPie(a, b) {
    var tmp = '<circle cx="0" cy="0" r="1" style="fill: none; stroke: black;"/>';
    var v = 2*Math.PI * a/b;
    var dx = Math.sin(v), dy = -Math.cos(v);
    var largeArg = 2*a>b ? 1 : 0;
    tmp += '<path d="M 0 0 L 0 -1 A 1 1 0 '+largeArg+' 1 '+dx+' '+dy+' z" style="stroke: black; fill: rgb(200,200,200);"/>';
    for (var i=1; i<b; i++) {
	if (i==a) continue;
	var v = 2*Math.PI * i/b;
	var dx = Math.sin(v), dy = -Math.cos(v);
	tmp += '<path d="M 0 0 L '+dx+' '+dy+'" style="stroke: black; stroke-width: 0.01; fill: none;"/>';
    }
    var svg = '<svg width="1.5cm" height="1.5cm" viewBox="-1.1 -1.1 2.2 2.2" xmlns="http://www.w3.org/2000/svg"><g style="stroke-width: 0.05;">' + tmp + '</svg>';
    return svg;
}

