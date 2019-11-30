//==================== Initialization
function init_page() {
    gen_type_menu();
    set_options_from_URL();
    on_type_change();
}

function gen_type_menu() {
    var type_selector = $("#type")[0];
    remove_all_children(type_selector);
    for (var type in QUIZ_TYPES) {
        var descr = QUIZ_TYPES[type];
        console.log("descr #"+type+": "+descr);
        var option = document.createElement("option");
        option.value = type;
        option.appendChild(document.createTextNode(descr.descr));
        type_selector.appendChild(option);
    }
}
//====================

function set_options_from_URL() {
    var url = document.URL;
    var key_RE = /^[A-Za-z0-9_]+$/;

    var opt_inputs = $("#optional_inputs");
    var inputs = opt_inputs.find("input,label,textarea,select");
    var inputs_by_name = {};
    for (var i in inputs) {
        var input = inputs[i];
        if (!input.id) continue;
        console.log("Input id: "+input.id);
        inputs_by_name[input.id] = input;
    }
    inputs_by_name["type"] = $("#type")[0];

    var qpos = url.indexOf("?");
    if (qpos < 0) return;

    var s = url.substring(qpos+1);
    var kvs = s.split("&");
    for (var i in kvs) {
        var kv = kvs[i];
        var eqpos = kv.indexOf("=");
        var k,v;
        if (eqpos < 0) {
            k=kv; v="true";
        } else {
            k=kv.substring(0,eqpos);
            v = kv.substring(eqpos+1);
        }
        console.log("- KV "+k+" / "+v);
        if (! key_RE.test(k)) {
            console.log("Bad option name: "+k);
            continue;
        }
        if (k in inputs_by_name) {
            var input = inputs_by_name[k];
            input.value = v;
        } else {
            console.log("Unknown option: "+k);
        }
        //var node = opt_inputs.find("input,label,textarea,select").hide();
    }
}

function on_type_change() {
    var type = $("#type")[0].value;
    descriptor = QUIZ_TYPES[type];
    //...input field updates here...
}

//========== Quiz generation: ====================

function generate_quizzes() {
    clear_results();

    var type = $("#type")[0].value;
    console.log("type = "+type);
    descriptor = QUIZ_TYPES[type];
    console.log("descriptor = "+descriptor);

    options = {
        count: $("#count")[0].value,
    };

    var count = options.count;
    for (var i=0; i<count; i++) {
        var pattern = generate_pattern();
        options.state = (descriptor.prepare_state !== undefined) ? descriptor.prepare_state() : null;
        var quiz = generate_quiz(descriptor, options);
        quiz.pattern = pattern;
        show_quiz(quiz, descriptor, options);
    }
}

function clear_results() {
    var parent = $("#results")[0];
    remove_all_children(parent);
}

var QUIZ_ROWS = 2, QUIZ_COLS = 6;
var QUIZ_SIZE = QUIZ_ROWS * QUIZ_COLS;

var RED=0<<2, GREEN=1<<2, BLUE=2<<2;
var FLATLEFT = 1<<1, FLATRIGHT = 0<<1;
var WTOP = 1, WBOT = 0;
// Shapes: |\  /|  \|  |/
var TILE_SPEC0 = [
    {c:GREEN, sh:"\\|"},
    {c:BLUE,  sh:"\\|"},
    {c:RED,   sh:"|/"},
    {c:GREEN, sh:"|/"},
    {c:RED,   sh:"|\\"},
    {c:BLUE,  sh:"|/"},

    {c:GREEN, sh:"|\\"},
    {c:BLUE,  sh:"/|"},
    {c:RED,   sh:"\\|"},
    {c:GREEN, sh:"/|"},
    {c:RED,   sh:"/|"},
    {c:BLUE,  sh:"|\\"},
];
var TILE_SPEC = [ // 1-based.
    GREEN | FLATRIGHT | WTOP,
    BLUE  | FLATRIGHT | WTOP,
    RED   | FLATLEFT  | WTOP,
    GREEN | FLATLEFT  | WTOP,
    RED   | FLATLEFT  | WBOT,
    BLUE  | FLATLEFT  | WTOP,

    GREEN | FLATLEFT  | WBOT,
    BLUE  | FLATRIGHT | WBOT,
    RED   | FLATRIGHT | WTOP,
    GREEN | FLATRIGHT | WBOT,
    RED   | FLATRIGHT | WBOT,
    BLUE  | FLATLEFT  | WBOT,
];

// Returns a Q->A permutation which gives a nice visual pattern.
function generate_pattern() {
    // Constraints:
    // - Symmetric in horizontal axis.
    // - Symmetric in vertical axis, with color remapping.
    // - No common surface between different colors.

    // Encoding:
    // Bit 0: Top is widest (not bottom).
    // Bit 1: "|" is to the left (not the right).
    // Bits 2-3: 00=red, 01=green, 10=blue.
    // => How to flip horizontally: x^2.
    // => How to flip vertically: x^1.
    // => Row 2 is a function of row 1. Bit 0 can be assigned independently.

    // Algorithm:

    // Generate bits 1-3 of top row, by random permutation, and check
    // validity (720 permutations).
    // Then assign bit 0 randomly (but symmetrically).
    var row;
    do {
        row = shuffle([0,1,2,3,4,5]);
    } while (!is_valid_pattern_row(row));

    var res = [];
    // First row:
    for (var i=0; i<QUIZ_COLS; i++) {
        res.push(row[i] << 1);
    }
    // First row, V-flip part:
    for (var i=0, j=QUIZ_COLS-1; i<j; i++, j--) {
        var vflip = rand_bool() ? 1 : 0;
        res[i] ^= vflip;
        res[j] ^= vflip;
    }
    // Log:
    var s = "";
    for (var i=0; i<res.length; i++) {
        var x = res[i];
        var color = x>>2;
        s += (color==0 ? "R" : color==1 ? "G" : "B");
        var slant = (x&1)^((x>>1)&1);
        slant = slant!=0 ? "\\" : "/";
        s += (x&2)!=0 ? "|"+slant : slant+"|";
        s += "  ";
    }
    console.log("Pattern: "+s);

    // Second row:
    for (var i=0; i<QUIZ_COLS; i++) {
        res.push(res[i] ^ 1);
    }


    return res;
}

function is_valid_pattern_row(row) {
    // Check H symmetry and color consistency:
    var colormap = [];
    for (var i=0, j=QUIZ_COLS-1; i<QUIZ_COLS; i++, j--) {
        if ((row[i] & 1) == (row[j] & 1))
            return false; // H shape symmetry

        var color1 = row[i] >> 1;
        var color2 = row[j] >> 1;
        if (color1 in colormap) {
            if (colormap[color1] != color2)
                return false; // Color consistency.
        } else {
            colormap[color1] = color2;
        }
    }

    // Check common surface criterion:
    for (var i=0; i<QUIZ_COLS-1; i++) {
        var j = i+1;
        if ((row[i] & 1) == 0 && (row[j] & 1) > 0) {
            // Common surface.
            var color1 = row[i] >> 1;
            var color2 = row[j] >> 1;
            if (color1 != color2)
                return false;
        }
    }

    return true;
}

function generate_quiz(descriptor, options) {
    var failuresLeft = 3000;
    // 1. Generate Q/A pairs:
    var q_set = new Set(), a_set = new Set();
    var qs = [], as = [];

    while (qs.length < QUIZ_SIZE) {
        if (failuresLeft < 0) {
            console.log("Out of attempts - quiz generation failed.");
            console.log({qs: qs, as: as});
            return null;
        }

        qa = descriptor.qa_gen(options);
        if (qa==null) continue;

        var q = qa.q;
        var a = qa.a;
        var alt_qs = qa.alt_qs || {};
        var alt_as = qa.alt_as || {};
        var bad = (q_set.has(q)) || (a_set.has(a))
        for (var x in alt_qs) if (q_set.has(alt_qs[x])) bad=true;
        for (var x in alt_as) if (a_set.has(alt_as[x])) bad=true;
        
        if (bad) {
	    console.log("Rejected: q="+q+" a="+a, [alt_qs, alt_as, q_set, a_set]);
            failuresLeft--;
            continue;
        }
        q_set.add(q);
	a_set.add(a);
        for (var x in alt_qs) q_set.add(alt_qs[x]);
	for (var x in alt_as) a_set.add(alt_as[x]);

        for (var x in alt_qs) q_set[x] = 1;
        for (var x in alt_as) a_set[x] = 1;
        qs.push(q);
        as.push(a);
    }
    return {qs: qs, as: as};
}

function show_quiz(quiz, descriptor, options) {
    console.log("show_quiz:");
    console.log(quiz);
    var parent = $("#results");
    var div = $(document.createElement("div"));

    var top = $(document.createElement("table"));
    top.addClass("top-grid");
    top = top[0];

    var bottom = $(document.createElement("table"));
    bottom.addClass("bottom-grid");
    bottom = bottom[0];

    populate_top(top, quiz);
    populate_bottom(bottom, quiz);

    // Title:
    var title = descriptor.title || "";
    if (typeof(title) == "function") title = title(options);
    if (title !== "") {
        var node = document.createElement("h1");
        node.innerHTML = title;
        div.append(node);
    }

    // Explanation:
    var expl_fun = descriptor.explanation;
    var expl = expl_fun ? expl_fun(options) : "";
    if (expl !== "") {
        var explNode = document.createElement("div");
        explNode.innerHTML = expl;
        div.append(explNode);
    }

    // Above-matter:
    var am_fun = descriptor.above_matter;
    var above_matter = am_fun ? am_fun(options) : "";
    if (above_matter !== "") {
        var amNode = document.createElement("div");
        amNode.innerHTML = above_matter;
        div.append(amNode);
    }

    var patternNode = draw_pattern(quiz.pattern);
    patternNode.setAttribute("class", "answer-pattern");
    div.append(top);
    div.append(patternNode);
    div.append(bottom);
    div.addClass("on-same-page");
    parent.append(div);
}

function populate_top(top, quiz) {
    //populate_table(top, quiz.qs);
    var perm = TILE_SPEC;
    var qs = apply_permutation(perm, quiz.qs);
    var contents = qs.map(function(q,index) {return (index+1)+".<br>" + q;});
    populate_table(top, contents);
}
function populate_bottom(bottom, quiz) {
    var perm = quiz.pattern;
    populate_table(bottom, apply_permutation(perm, quiz.as));
}
function populate_table(table, contents) {
    var i=0;
    for (var y=0; y<QUIZ_ROWS; y++) {
        var row = document.createElement("tr");
        for (var x=0; x<QUIZ_COLS; x++) {
            var cell = document.createElement("td");
            var text = contents[i++];
            cell.innerHTML = text;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

function draw_pattern(pattern) {
    var svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svgNode).attr("width", "6cm");
    $(svgNode).attr("height", "2cm");
    svgNode.setAttribute("style", 'padding: 0px; margin: 0px');
    svgNode.setAttribute("viewBox", "0 0 12 4");
    svgNode.setAttribute("preserveAspectRatio", "meet");

    var pos=0;
    for (var y=0; y<QUIZ_ROWS; y++) {
        for (var x=0; x<QUIZ_COLS; x++) {
            var i = pos++;
            var c = pattern[i];
            var colorNr = c &~ 3;
            var color = colorNr==RED ? "red" : colorNr==GREEN ? "green" : "blue";
            var xfactor = (c&2)>0 ? 1 : -1;
            var yfactor = (c&1)>0 ? 1 : -1;
            var poly = "M -1,-1 L0,-1 L1,1 L-1,1 Z";
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute("d", poly);
            path.setAttribute("stroke", color);//"black");
            path.setAttribute("stroke-width", "0.02");
            path.setAttribute("fill", color);
            path.setAttribute("transform", "translate(" + (2*x+1) + "," + (2*y+1) + ") scale(0.95, 0.95) scale("+xfactor+","+yfactor+")");
            svgNode.appendChild(path);
        }
    }

    // Wrap:
    var div = $(document.createElement("div"));
    div.append(svgNode);

    return div[0];
}
