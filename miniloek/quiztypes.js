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
    }
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
