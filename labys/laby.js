//========== Random/config stuff:

function rand_bool() {
  return Math.random() < 0.5;
}

function rand_int(min,max) {
  return min + Math.floor(Math.random() * (max-min+1));
}

function rand_float(min,max) {
  return min + Math.random() * (max-min);
}

function rand_letter() {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";
    var pos = rand_int(0,letters.length-1);
    return letters.substring(pos, pos+1);
}

function rand_from_list(list) {
    var i = rand_int(0, list.length-1);
    return list[i];
}

color_codes = ["#ff3333", "#4444ff", "#44ff22", "black", "orange"];
color_names_sing = ["r&oslash;d", "bl&aring;", "gr&oslash;n", "sort", "orange"];
color_names_plur = ["r&oslash;de", "bl&aring;", "gr&oslash;nne", "sorte", "orange"];

pcolor_codes = ["#ff3333", "#4444ff", "#44ff22", "#dddd00"];
pcolor_names_sing = ["r&oslash;d", "bl&aring;", "gr&oslash;n", "gul"];
pcolor_names_plur = ["r&oslash;de", "bl&aring;", "gr&oslash;nne", "gule"];

function rand_color() {
    var i = rand_int(0,color_codes.length-1);
    return {
        nr: i,
        code: color_codes[i],
        sing: color_names_sing[i],
        plur: color_names_plur[i]
    };
}

function rand_primary_color() {
    var i = rand_int(0,pcolor_codes.length-1);
    return {
        nr: i,
        code: pcolor_codes[i],
        sing: pcolor_names_sing[i],
        plur: pcolor_names_plur[i]
    };
}


function config_range_min(config) {
    // TODO: Handle zero/negative & divisor
    return 1;
}

function config_range_max(config) {
    // TODO: Handle zero/negative & divisor
    return config.maxNum;
}

function config_range_least_max(config) {
    // TODO: Handle zero/negative & divisor
    return rand_int(1, config.maxLeast);
}

function config_is_small(x, config) {
    // TODO: Handle zero/negative & divisor
    return x>0 && x<= config.maxLeast;
}

function config_is_num(x, config) {
    // TODO: Handle zero/negative & divisor
    return x>0 && x<= config.maxNum;
}

function in_range(min,v,max) {return min<=v && v<=max;}


//========== Point set generation: ====================

function generate_point_set(w,h,maxdist, n) {
    var points = [];
    var nr = 0;
    var gen_label = function() {
        nr++;
        return String.fromCharCode(64+nr);
    };

    // First two points:
    var x1 = rand_float(0,w);
    var y1 = rand_float(0,h);
    points.push({x:x1, y:y1, label:gen_label()});
    while (points.length < 2) {
        var d = rand_int(Math.floor(maxdist/2), maxdist);
        var angle = rand_float(0, 2*Math.PI);
        var x2 = x1 + d * Math.sin(angle);
        var y2 = y1 + d * Math.cos(angle);
        if (in_range(0,x2,w) && in_range(0,y2,h)) {
            points.push({x:x2, y:y2, label:gen_label()});
        }
    }

    // Add more points:
    console.log("E1 "+points[0].x+","+points[0].y);
    console.log("E2 "+points[1].x+","+points[1].y);
    var attempts = 0;
    invent_point: while (points.length < n && attempts<1000*n) {
        attempts++;
        // Choose two points:
        var i=rand_int(0, points.length-1);
        var j=rand_int(0, points.length-1);
        if (i===j) continue;
        var p1 = points[i];
        var p2 = points[j];

        // Choose distances:
        var d1 = rand_int(1, maxdist);
        var d2 = rand_int(1, maxdist);

        // Calculate new point:
        var dx = p2.x-p1.x, dy=p2.y-p1.y;
        var R = Math.sqrt(dx*dx + dy*dy);
        var dd = (d1*d1 - d2*d2)/(R*R);
        var disc = 2*((d1*d1 + d2*d2)/(R*R)) - (dd*dd) - 1;
        console.log("F1 d1="+d1+" d2="+d2);
        console.log("F2 d=("+dx+","+dy+")");
        console.log("F3 R="+R+" dd="+dd);
        console.log("F "+disc);
        if (disc < 0) continue;

        var midway = {x: 0.5*(p1.x+p2.x),
                      y: 0.5*(p1.y+p2.y)};
        var w2 = dd/2;
        var sign = rand_bool() ? 1 : -1;
        var w3 = sign * Math.sqrt(disc)/2;

        var x = midway.x + w2*dx + w3*dy;
        var y = midway.y + w2*dy - w3*dx;
        console.log("G mw="+midway.x+","+midway.y+"  w2="+w2+" w3="+w3);
        if (!(in_range(0,x,w) && in_range(0,y,h))) {
            x = midway.x + w2*dx - w3*dy;
            y = midway.y + w2*dy + w3*dx;
            if (!(in_range(0,x,w) && in_range(0,y,h)))
                continue;
        }

        // Check for too close points:
        for (var j in points) {
            var p = points[j];
            if (Math.abs(x-p.x) <= 0.25 &&
                Math.abs(y-p.y) <= 0.75)
                continue invent_point;
        }

        console.log("New point: "+x+","+y);
        points.push({x:x, y:y, label:gen_label()});
        console.log("Points: "+points);
    }
    return points;
}

function add_point_set_to_SVG(svgNode, points) {
    var s = "";
    for (var i in points) {
        var p = points[i];

        s += '<circle cx="'+p.x+'" cy="'+p.y+'" r="0.1" stroke-width="0" fill="black"></circle>';
        s += '<text x="'+p.x+'" y="'+(p.y-0.2)+'" text-anchor="middle" stroke-width="0" fill="black" font-size="0.75">'+p.label+'</text>';
    }

    var groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupNode.innerHTML = s;
    svgNode.appendChild(groupNode);
}



//========== Input configuration: ====================

LABY_TYPES = {
    plus: {
        descr: "Plus",
        title: "Plus-opgaver",
        tags: ["Matematik", "Regning", "Plus"],
        deps: ["maxNum", "maxLeast"],
        dims: [12,14],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            var c = rand_bool() ? a+b : rand_int(min,max);
            if (! config_is_num(c, config))
                return null;
            if (! (config_is_small(a, config) || config_is_small(b, config)))
                return null;
            return {
                text: a+"&nbsp;+&nbsp;"+b+"<br>=&nbsp;"+c,
                value: a+b===c
            }
        }
    },
    minus: {
        descr: "Minus",
        title: "Minus-opgaver",
        tags: ["Matematik", "Regning", "Minus"],
        deps: ["maxNum", "maxLeast"],
        dims: [11,15],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            var c = rand_int(min,max);
            if (! (config_is_small(b, config))) return;
            if (! (config_is_num(c, config))) return;
            return {
                text: a+"&nbsp;&ndash;&nbsp;"+b+"<br>=&nbsp;"+c,
                value: a-b===c
            }
        }
    },

    plus_3_numbers: {
        descr: "Plus (3 tal)",
        title: "Plus-opgaver",
        tags: ["Matematik", "Regning", "Plus"],
        deps: ["maxNum", "maxLeast"],
        dims: [11,16],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            var c = rand_int(min,max);
            var sum = rand_bool() ? a+b+c : rand_int(min,max);
            if (! config_is_num(sum, config))
                return null;
            var small = 0;
            if (config_is_small(a, config)) small++;
            if (config_is_small(b, config)) small++;
            if (config_is_small(c, config)) small++;

            if (small < 2)
                return null;
            return {
                text: a+"&nbsp;+&nbsp;"+b+"&nbsp;+&nbsp;"+c+"<br>=&nbsp;"+sum,
                value: a+b+c===sum
            }
        }
    },

    times: {
        descr: "Gange",
        title: "Gange-opgaver",
        tags: ["Matematik", "Regning", "Gange"],
        deps: ["maxNum", "maxLeast"],
        dims: [15,15],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var maxLeast = config.maxLeast;
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            var c = rand_bool() ? a*b : rand_int(1,max*maxLeast); //TODO: handle zero and negatives
            if (! (config_is_small(a, config) || config_is_small(b, config)))
                return null;
            return {
                text: a+"&nbsp;&middot;&nbsp;"+b+"<br>=&nbsp;"+c,
                value: a*b===c
            }
        }
    },

    greater_or_less: {
        descr: "Større/mindre (tal)",
        title: "Større og mindre",
        tags: ["Tal", "Større/mindre"],
        deps: ["maxNum"],
        dims: [8,14],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            if (a===b) return;
            var gt_txt = rand_bool();
            return {
                text: a+" er "+(gt_txt?"st&oslash;rre" : "mindre")+" end "+b,
                value: gt_txt === (a>b)
            }
        }
    },

    multiplication_table: {
        descr: "Tabeller",
        title: function(config) {return config.number+"-tabellen";},
        explanation: function(config) {return "Følg de felter, hvor tallet er med i "+config.number+"-tabellen.";},
        tags: ["Tal", "Multiplikation", "Tabeller"],
        deps: ["number"],
        dims: [20,15],
        cell_gen: function(config) {
            var n = config.number;
            var x = rand_bool() ? n*rand_int(1,10) : rand_int(1, 10*n);
            return {
                text: ""+x,
                value: x % n == 0
            }
        }
    },

    multiplication_light: {
        descr: "Multiplikation light",
        title: "Plus plus plus...",
        tags: ["Tal", "Multiplikation"],
        deps: ["maxNum", "maxLeast"],
        dims: [8,12],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var maxLeast = config.maxLeast;
            var a = rand_int(min,max);
            var b = rand_int(1,maxLeast);
            var expected_eq = rand_bool();
            console.log("AB: "+a+"/"+b);
            if (b<2 && rand_float() < 0.8)
                return;
            var text_res = rand_bool() ? a*b : rand_int(min*maxLeast, max*maxLeast);
            var actual_eq = text_res == a*b;
            console.log("EQ: "+expected_eq+"/"+actual_eq);
            if (actual_eq != expected_eq)
                return;

            var s = a+"";
            for (var i=1; i<b; i++) s += " + "+a;
            return {
                text: s+"<br>= "+text_res,
                value: actual_eq
            }
        }
    },

    count_colors: {
        descr: "Tælle farver",
        title: "Tælle farver",
        tags: ["Tal", "Tælle"],
        deps: ["useNone", "useAll"],
        explanation: function (config) {
            var s = "";
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            for (var n=0; n<=4; n++) {
                s += "<td>";
                for (var i=0; i<4; i++) {
                    if (i==2) s += "<br>"; else if (i>0) s+= ' ';
                    var color = i<n ? color_codes[0] : color_codes[1];
                    s += '<span style="font-size: 150%; color: '+color+' !important;">&oast;</span>';
                }
                var nr = (n===0 && config.useNone) ? "ingen" :
                    (n===4 && config.useAll) ? "alle" : ""+n;
                s += "<br>"+nr+" er "+(n===1 ? color_names_sing[0] : color_names_plur[0]);
                s += "</td>";
            }
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        },
        dims: [7,8],
        cell_gen: function(config) {
            var ref_color = rand_color();
            var total_cnt = rand_int(3,4);
            var expected_cnt = rand_int(0,total_cnt);
            var figs, eq_count;
            for (var k=0; k<100; k++) { // Retries.
                figs = []; eq_count = 0;
                for (var i=0; i<total_cnt; i++) {
                    var c = rand_color();
                    figs.push(c);
                    if (c.nr == ref_color.nr) eq_count++;
                }
                if (eq_count === expected_cnt) break;
            }
            if (eq_count !== expected_cnt) return;
            var txt_cnt = rand_int(0,4);
            var s = '<div style="line-height: 120%;">';
            for (var i in figs) {
                if (i==figs.length-2) s += "<br>"; else if (i>0) s+= ' ';
                s += '<span style="font-size: 150%; color: '+figs[i].code+' !important;">&oast;</span>';
            }
            s += "</div>";
            var txt_cnt_str = (txt_cnt===0 && config.useNone) ? "ingen" :
                (txt_cnt===total_cnt && config.useAll) ? "alle" : ""+txt_cnt;
            return {
                text: s+txt_cnt_str+" er "+(txt_cnt===1 ? ref_color.sing : ref_color.plur),
                value: eq_count === txt_cnt
            }
        }
    },

    missing_color: {
        descr: "Hvilken mangler? (farve)",
        title: "Hvilken farve mangler?",
        tags: ["Begreber", "Farver", "Mangler"],
        explanation: function (config) {
            var s = '<p>Der skal være en blå, en rød, en grøn og en gul. Hvad for en farve mangler?</p>\n';
                s += '<table class="explanation"><tr>';
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            for (var r=-1; r<4; r++) {
                var l = [0,1,2,3];
                if (r>=0) l.splice(r,1);
                shuffle(l);
                var which_txt = r<0 ? "Ingen" : "Den "+pcolor_names_plur[r];

                s += '<td>';
                for (var i in l) {
                    var c = l[i];
                    s += '<span style="font-size: 170%; color: '+pcolor_codes[c]+' !important;">&oast;</span>';
                }
                s += "<br>"+which_txt+" mangler";
            }
            s += '</td>';

            s += "</tr></table>";
            return s;
        },
        dims: [7,8],
        cell_gen: function(config) {
            var l = [0,1,2,3];
            var r = rand_int(0,4);
            var r_txt = rand_int(0,4);
            if (r!==4) l.splice(r,1);
            var which_txt = r_txt===4 ? "Ingen" : "Den "+pcolor_names_plur[r_txt];
            shuffle(l);

            var s = "";
            for (var i in l) {
                var c = l[i];
                s += '<span style="font-size: 170%; color: '+pcolor_codes[c]+' !important;">&oast;</span>';
            }
            return {
                text: s+"<br>"+which_txt+" mangler",
                value: r_txt === r
            }
        }
    },
    all_some_none: {
        descr: "Alle/nogle/ingen (figurer)",
        title: "Alle, nogle og ingen",
        tags: ["Begreber", "Alle, ingen, nogle"],
        explanation: function (config) {
            var s = "";
            for (var n=0; n<=4; n++) {
                s += "<td>";
                for (var i=0; i<4; i++) {
                    if (i==2) s += "<br>"; else if (i>0) s+= ' ';
                    var color = i<n ? color_codes[0] : color_codes[1];
                    s += '<span style="font-size: 150%; color: '+color+' !important;">&oast;</span>';
                }
                var d = n==0 ? "ingen" : n==4 ? "alle" : "nogle"
                s += "<br>"+d+" er "+color_names_plur[0];
                s += "</td>";
            }
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        },
        dims: [7,8],
        cell_gen: function(config) {
            var figs = [];
            var expected = rand_int(0,2);
            var ref_color = rand_color();
            var eq_count = 0;
            var total_cnt = rand_int(3,4);
            for (var i=0; i<total_cnt; i++) {
                var c = rand_color();
                figs.push(c);
                if (c.nr == ref_color.nr) eq_count++;
            }
            var actual = eq_count===0 ? 0 : eq_count===total_cnt ? 2 : 1;
            var actual_txt = rand_int(0,2);
            if (actual !== expected) return;
            var s = '<div style="line-height: 120%;">';
            for (var i in figs) {
                if (i==figs.length-2) s += "<br>"; else if (i>0) s+= ' ';
                s += '<span style="font-size: 150%; color: '+figs[i].code+' !important;">&oast;</span>';
            }
            s += "</div>";
            var d = ["ingen", "nogle", "alle"];
            return {
                text: s+d[actual_txt]+" er "+ref_color.plur,
                value: actual_txt === actual
            }
        }
    },

    same_letter: {
        descr: "Ens bogstaver",
        title: "Ens bogstaver",
        tags: ["Bogstaver", "Ens/forskellige"],
        dims: [15,20],
        cell_gen: function(options) {
            var a = rand_letter();
            var b = rand_letter();
            return {text: a+"&nbsp;"+b, value:a===b}
        }
    },
    same_or_different_letters: {
        descr: "Ens/forskellige bogstaver",
        title: "Ens og forskellig",
        tags: ["Bogstaver", "Ens/forskellige"],
        dims: [9,10],
        cell_gen: function(options) {
            var same_txt = rand_bool();
            var a = rand_letter();
            var b = rand_bool() ? a : rand_letter();
            return {
                text: a+" og "+b+"<br>er<br>"+(same_txt?"ens":"forskellige"),
                value: same_txt === (a===b)
            }
        }
    },
    two_kinds_letters: {
        descr: "To slags bogstaver",
        title: "To forskellige bogstaver",
        tags: ["Bogstaver", "Ens/forskellige"],
        dims: [12,20],
        cell_gen: function(options) {
            var a = rand_letter();
            var b = rand_letter();
            var c = rand_letter();
            if (rand_int(1,5) == 1) b=c=a;
            var eqs = (a===b ?1:0) + (a===c ?1:0) + (b===c ?1:0);
            return {
                text: a+"&nbsp;"+b+"&nbsp;"+c,
                value: eqs === 1
            }
        }
    },

    n_ord_og_t_ord: (function() {
	var WORDS = [
	    // Indef. - Def. - n/t
	    ["arm", "arme", "n"],
	    ["ben", "bene", "t"],
	    ["hoved", "hovede", "t"],
	    ["fod", "fode", "n"],

	    ["bord", "borde", "t"],
	    ["stol", "stole", "n"],
	    ["sofa", "sofae", "n"],
	    ["seng", "senge", "n"],
	    ["pude", "pude", "n"],
	    ["dyne", "dyne", "n"],
	    ["gulv", "gulve", "t"],
	    ["loft", "lofte", "t"],
	    ["væg", "vægge", "n"],
	    ["vindue", "vindue", "t"],
	    ["dør", "døre", "n"],
	    ["mur", "mure", "n"],
	    ["tag", "tage", "t"],
	    ["lampe", "lampe", "n"],

	    ["banan", "banane", "n"],
	    ["æble", "æble", "t"],
	    ["pære", "pære", "n"],

	    ["kat", "katte", "n"],
	    ["hund", "hunde", "n"],
	    ["ko", "koe", "n"],
	    ["hest", "heste", "n"],
	    ["får", "fåre", "t"],

	    ["bog", "boge", "n"],
	    ["blyant", "blyante", "n"],

	    ["bus", "busse", "n"],
	    ["bil", "bile", "n"],
	    ["cykel", "cykle", "n"],
	];

	var FORM_COUNT = 5;
	function form(w, nr, suffix) {
	    if (suffix == "") suffix = w[2];
	    var indefi = w[0], defi = w[1];
	    switch (nr) {
	    case 0: return "E" + suffix + " " + indefi;
	    case 1: return upperFirst(defi) + suffix;
	    case 2: return "De" + suffix + " " + indefi;
	    case 3: return "Mi" + suffix + " " + indefi;
	    case 4: return "Di" + suffix + " " + indefi;
	    }
	}

	function upperFirst(s) {
	    return s.charAt(0).toUpperCase() + s.slice(1);
	}
	
	return {
	    descr: "N-ord og t-ord",
	    title: "n-ord og t-ord",
	    tags: ["Dansk", "Navneord" ],
            deps: ["number"],
	    dims: [10,18],
            prepare_state: function(config) {
		var n = Math.max(2, config.number);
		var wordList = [];
		var wordSet = {};
		var suffixSet = {};
		var suffixCount = 0;
		for (var i=0; i<100 && (wordList.length<n || suffixCount<2); i++) {
		    var wordInfo = rand_from_list(WORDS);
		    var word = wordInfo[0];
		    var suffix = wordInfo[2];
		    if (word in wordSet) continue;
		    if (wordList.length==n-1 && suffixCount<2 && suffix in suffixSet) continue; // Find a word with an unused suffix instead.
		    wordSet[word] = wordInfo;
		    wordList.push(wordInfo);
		    if (!(suffix in suffixSet)) suffixCount++;
		    suffixSet[suffix] = 1;
		}
		return wordList;
            },
	    above_matter: function(config) {
		var wordList = config.state;
		return '<table class="explanation" width="80%">' +
		    '<tr><th>Rigtigt:</th><th>Rigtigt:</th><th>Forkert:</th><th>Ord-liste:</th></tr>' +
		    '<tr>' +
		    '<td>En kat<br/>Katten<br/>Den kat<br/>Min kat<br/>Din kat</td>' +
		    '<td>Et bord<br/>Bordet<br/>Det bord<br/>Mit bord<br/>Dit bord</td>' +
		    '<td>En bord<br/>Borden<br/>Den bord<br/>Min bord<br/>Din bord</td>' +
		    //'<td style="padding: 0.25em 2em; text-align: left; font-size: 120%;"><ul>' + wordList.map(function(w) {return '<li>' + form(w, 0, "") + '</li>'}).join("") + '</ul></td>' +
		    '<td style="padding: 0.25em 2em; text-align: left; font-size: 120%;"><ul>' + wordList.map(function(w) {return '<li>E<span style="color: red; text-decoration: underline;">' + w[2] + "</span> " + w[0] + '</li>'}).join("") + '</ul></td>' +
		    '</tr>' +
		    '</table>';
		// TODO
	    },
            cell_gen: function(config) {
		var wordList = config.state;
		var wordInfo = rand_from_list(wordList);
		var formNr = rand_int(0, FORM_COUNT-1);
		var suffix = rand_bool() ? "n" : "t";
		var text = form(wordInfo, formNr, suffix);
		return {
		    text: text,
		    value: suffix == wordInfo[2]
		}
	    },
	}
    }()),

    measure: {
        descr: "Måle afstande",
        title: "Måle afstande",
        tags: ["Matematik", "Måle", "Lineal"],
        dims: [8,9],
        prepare_state: function(config) {
            return generate_point_set(15, 4, 14, 10);
        },
        above_matter: function(config) {
            var points = config.state;
            var points = config.state;
            var svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            $(svgNode).attr("width", "16cm");
            $(svgNode).attr("height", "5cm");
            svgNode.setAttribute("style", 'padding: 0px; margin: 0px');
            svgNode.setAttribute("viewBox", "-0.5 -0.8 16 5");
            svgNode.setAttribute("preserveAspectRatio", "meet");
            //svgNode.innerHTML += '<circle cx="-1" cy="0" r="0.1" stroke-width="0" fill="red"></circle>';
            //svgNode.innerHTML += '<circle cx="-0.5" cy="0.25" r="0.1" stroke-width="0" fill="red"></circle>';
            //svgNode.innerHTML += '<circle cx="0" cy="0" r="0.1" stroke-width="0" fill="red"></circle>';
            //svgNode.innerHTML += '<circle cx="15" cy="0" r="0.1" stroke-width="0" fill="red"></circle>';
            add_point_set_to_SVG(svgNode, points);
            return '<div style="border:thin solid black; width: 15cm; height: 0cm; margin: 0.5cm 0cm;"></div>' + svgNode.outerHTML + '<div style="border:thin solid black; width: 15cm; height: 0cm; margin: 0.5cm 0cm;"></div>';
        },
        cell_gen: function(config) {
            var points = config.state;
            var cnt = points.length;

            // Choose two different points:
            var i = rand_int(0, cnt-1);
            var j = rand_int(0, cnt-1);
            if (i == j) return;
            var p = points[i], q = points[j];

            var dx = p.x-q.x, dy = p.y-q.y;
            var actual_dist = Math.sqrt(dx*dx + dy*dy);

            var txt_dist = rand_bool() ? Math.round(actual_dist) : rand_int(1,15);

            var diff = Math.abs(txt_dist - actual_dist);
            var answer;
            if (diff < 0.1)
                answer = true;
            else if (diff > 0.9)
                answer = false;
            else
                return;

            return {
                text: "Der er "+txt_dist+"cm fra "+p.label+" til "+q.label,
                value: answer
            }
        }
    },

    clock_hours: {
        descr: "Klokken - timer",
        title: "Hvad er klokken?",
        tags: ["Ur", "Klokken"],
        dims: [10,9],
        cell_gen: function(config) {
            var hour = rand_int(1,12);
            var text_hour = rand_int(1,12);
            var v = (Math.PI / 6) * hour;
            var mx1 = 50 + 18 * Math.sin(v);
            var mx2 = 50 + 20 * Math.sin(v);
            var my1 = 50 - 18 * Math.cos(v);
            var my2 = 50 - 20 * Math.cos(v);
            var svg = '<svg width="100" height="100">' +
'      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="none"/>' +
'      <path d="M50,10 L50,15" stroke="black" stroke-width="2"/>' +
'      <path d="M50,90 L50,85" stroke="black" stroke-width="2"/>' +
'      <path d="M10,50 L15,50" stroke="black" stroke-width="2"/>' +
'      <path d="M90,50 L85,50" stroke="black" stroke-width="2"/>' +
'' +
'      <path d="M50,50 L50,16" stroke="black" stroke-width="3.5"/>' +
'      <path d="M50,50 L50,18" stroke="white" stroke-width="1.5"/>' +
'      <path d="M50,50 L'+mx2+','+my2+'" stroke="black" stroke-width="3.5"/>' +
'      <path d="M50,50 L'+mx1+','+my1+'" stroke="white" stroke-width="1.5"/>' +
'      <circle cx="50" cy="50" r="3" stroke="none" fill="black"/>' +
'    </svg>';
            return {
                text: svg+'<br/>Klokken er '+text_hour,
                value: text_hour == hour
            }
        }
    },

    clock_quarters: {
        descr: "Klokken - halve og kvarte timer",
        title: "Hvad er klokken?",
        tags: ["Ur", "Klokken"],
        deps: ["timeHalfHour", "timeQuartHour"],
        dims: [9,7],
        cell_gen: function(config) {
            var hour = rand_int(1,12);
            var text_hour = rand_int(1,12);

            var quarters = rand_int(-2,1);
            var text_quarters = rand_int(-2,1);
            var text_quarters_str = ["halv ", "kvart i ", "", "kvart over "][text_quarters+2];

            if (!config.timeQuartHour && (quarters%2!=0 || text_quarters%2!=0))
                return;
            if (!config.timeHalfHour && (quarters%4==-2 || text_quarters%4==-2))
                return;

            var svg = clockface_svg(hour, quarters*15);
            return {
                text: svg+'<br/>Klokken er<br/>'+text_quarters_str+text_hour,
                value: (text_hour == hour && text_quarters == quarters)
            }
        },
        explanation: function (config) {
            var s = "";
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            var add_row = function(h,m,text) {
                s += "<td>";
                s += clockface_svg(h,m);
                s += '<br/>'+text;
                s += '</td>';
            }
            if (config.timeHalfHour) add_row(2,-30, "Klokken er halv 2");
            if (config.timeQuartHour) add_row(2,-15, "Klokken er kvart i 2");
            add_row(2,0, "Klokken er 2");
            if (config.timeQuartHour) add_row(2,15, "Klokken er kvart over 2");
            if (config.timeHalfHour) add_row(2,30, "Klokken er halv 3");
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        }
    },
    clock_minutes: {
        descr: "Klokken - minutter",
        title: "Hvad er klokken?",
        tags: ["Ur", "Klokken"],
        deps: [],
        dims: [9,6],
        cell_gen: function(config) {
            var hour = rand_int(1,12);
            var text_hour = rand_int(1,12);

            var minutes = 5 * rand_int(-6,5);
            var text_minutes = 5 * rand_int(-6,5);
            var text_minutes_str =
                (text_minutes % 15 == 0) ? ["halv ", "kvart i ", "", "kvart over "][text_minutes/15+2] :
                (text_minutes<0 ? (-text_minutes)+" minutter i " : text_minutes+" minutter over ");

            var svg = clockface_svg(hour, minutes);
            return {
                text: svg+'<br/>Klokken er<br/>'+text_minutes_str+text_hour,
                value: (text_hour == hour && text_minutes == minutes)
            }
        },
        explanation: function (config) {
            var s = "";
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            var add_row = function(h,m,text) {
                s += "<td>";
                s += clockface_svg(h,m);
                s += '<br/>'+text;
                s += '</td>';
            }
            add_row(2,-10, "Klokken er 10 minutter i 2");
            add_row(2,-5, "Klokken er 5 minutter i 2");
            add_row(2,0, "Klokken er 2");
            add_row(2,5, "Klokken er 5 minutter over 2");
            add_row(2,10, "Klokken er 10 minutter over 2");
            add_row(2,15, "Klokken er kvart over 2");
            add_row(2,30, "Klokken er halv 3");
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        }
    },

    note_names: {
        descr: "Nodenavne",
        title: "Hvad hedder noderne?",
        tags: ["Noder", "Nodenavne"],
        deps: ["minNote", "maxNote"],
        dims: [9,9],
        cell_gen: function(config) {
            var notenames = ["c", "d", "e", "f", "g", "a", "h"];
            var notename = function(h) {h+=4; h=h%7; if (h<0) h+=7; return notenames[h];}
            var minh = -config.minNote;
            var maxh = config.maxNote;
            var h = rand_int(minh,maxh);
            var text_h = rand_int(minh,maxh);

            var svg = single_note_svg(h-2);
            return {
                text: svg+'<br/><big>'+notename(text_h)+'</big>',
                value: (text_h == h)
            }
        },
        explanation: function (config) {
            var s = "";
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            var add_row = function(h,text) {
                s += '<td>';
                s += single_note_svg(h-2);
                s += '<br/><big>'+text+'</big>';
                s += '</td>';
            }
            add_row(-4, "c");
            add_row(-2, "e");
            add_row(0, "g");
            add_row(1, "a");
            add_row(2, "h");
            add_row(3, "c");
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        }
    },

    piano_notes: {
        descr: "Noder på klaveret",
        title: "Noder og klaver-tangenter",
        tags: ["Noder", "Piano"],
        deps: ["minNote", "maxNote"],
        dims: [9,8],
        cell_gen: function(config) {
            var minh = -config.minNote;
            var maxh = config.maxNote;
            var h = rand_int(minh,maxh);
            var key_h = rand_int(minh,maxh);

            var svg1 = single_note_svg(h-2);
            var svg2 = single_piano_key(key_h+4);
            return {
                text: svg1+'<br/>'+svg2,
                value: (key_h == h)
            }
        },
        explanation: function (config) {
            var s = "";
            s += '<td style="padding: 0.5em;"><b>Rigtigt:</b></td>';
            var add_row = function(h,text) {
                s += '<td>';
                s += single_note_svg(h-2);
                s += '<br/>';
                s += single_piano_key(h+4);
                s += '</td>';
            }
            add_row(-4, "c");
            add_row(0, "g");
            add_row(3, "c");
            return '<table class="explanation"><tr>'+s+'</tr></table>';
        }
    },

    i_and_you: {
        descr: "'Jeg' og 'du'",
        title: "'Jeg' og 'du'",
        tags: ["Stedord", "Jeg/du"],
        dims: [6,6],
        cell_gen: function(config) {
            var items = [
                {id:"NOTHING", name:""},
                {id:"tog", name:"et tog"},
                {id:"bold", name:"en bold"},
                {id:"bil", name:"en bil"},
                ];
            var characters = [
                 {id:"pindsvin", hand_x:105, hand_y:105},
            ];
            var char1 = rand_from_list(characters);
            var char2 = rand_from_list(characters);

            var item1 = rand_from_list(items);
            var item2 = rand_from_list(items);
            var item_speech = rand_from_list(items);
            if (item_speech.id === 'NOTHING') return;

            // Less of the 'obvious' cases:
            if (item_speech.id !== item1.id &&
                item_speech.id !== item2.id &&
                rand_bool())
                return;
            if (item1.id === item2.id &&
               rand_bool())
                return;

            var speaker = rand_int(0,1);
            var say_i = rand_bool();
            var text = (say_i ? 'Jeg' : 'Du') + ' har\n' + item_speech.name;
            var svg = two_actor_scene_svg(char1, char2, item1, item2, speaker, text);

            var items = [item1.id, item2.id];
            var refered_actor = say_i ? speaker : (speaker^1);
            var is_correct = items[refered_actor] == item_speech.id;
            return {
                text: svg,
                value: is_correct
            }
        }
    },

    q_and_a: {
        descr: "Spørgsmål og svar",
        title: "Spørgsmål og svar",
        tags: ["Spørgsmål"],
        dims: [6,5],
        cell_gen: function(config) {
            var items = [
                {id:"NOTHING", name:"NOTHING"},
                {id:"tog", name:"et tog"},
                {id:"bold", name:"en bold"},
                {id:"bil", name:"en bil"},
                ];
            var characters = [
                 {id:"pindsvin", hand_x:105, hand_y:105},
            ];
            var char1 = rand_from_list(characters);
            var char2 = rand_from_list(characters);

            var item1 = rand_from_list(items);
            var item2 = rand_from_list(items);

            var QAs = [{q:"Hvad hedder\ndu?", a:["Jeg hedder\nPeter.", "Jeg hedder\nRasmus."]},
                       {q:"Hvor bor du?", a:["Jeg bor på\nBlomstervej.", "Jeg bor på\nKirkegade."]},
                       {q:"Hvor gammel\ner du?", a:["Jeg er 7 år.", "Jeg er 8 år."]},
                       {q:"Hvad har\ndu der?", a:["Jeg har\n"+item1.name+".", "Jeg har\n"+item2.name+"."]},
                       {q:"Hvad kan du\nlide at spise?", a:["Jeg kan godt\nlide æbler.", "Jeg kan godt\nlide spaghetti."]}
                      ];

            var q_speaker = rand_int(0,1);
            var q_nr = rand_int(0, QAs.length-1);
            var a_nr = rand_int(0, QAs.length-1);
            var q = QAs[q_nr].q;
            var a = QAs[a_nr].a[1-q_speaker];

            var text1 = q;
            var text2 = a;
            if (text2.indexOf("NOTHING") >= 0)
                return;

            var svg = two_speakers_scene_svg(char1, char2, item1, item2, q_speaker, text1, text2);

            var is_correct = q_nr === a_nr;
            return {
                text: svg,
                value: is_correct
            }
        }
    },
}

function clockface_svg(hours, minutes) {
    var v_h = 30 * (hours + minutes/60.0);
    var v_m = 6 * minutes;
    var svg = '<svg width="100" height="100" viewbox="-50 -50 100 100">'+
'      <circle cx="0" cy="0" r="40" stroke="black" stroke-width="2" fill="none"/>'+
''+
'      <path d="M0,40 L0,35" stroke="black" stroke-width="2" transform="rotate(0 0 0)"/>'+
'      <path d="M0,40 L0,35" stroke="black" stroke-width="2" transform="rotate(90 0 0)"/>'+
'      <path d="M0,40 L0,35" stroke="black" stroke-width="2" transform="rotate(180 0 0)"/>'+
'      <path d="M0,40 L0,35" stroke="black" stroke-width="2" transform="rotate(270 0 0)"/>'+
''+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(30 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(60 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(120 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(150 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(210 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(240 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(300 0 0)"/>'+
'      <path d="M0,40 L0,37" stroke="black" stroke-width="1.5" transform="rotate(330 0 0)"/>'+
'      <g transform="rotate('+v_m+' 0 0)">'+
'        <path d="M0,0 L0,-34" stroke="black" stroke-width="3.5"/>'+
'        <path d="M0,0 L0,-32" stroke="white" stroke-width="1.5"/>'+
'      </g>'+
'      <g transform="rotate('+v_h+' 0 0)">'+
'        <path d="M0,0 L0,-20" stroke="black" stroke-width="3.5"/>'+
'        <path d="M0,0 L0,-18" stroke="white" stroke-width="1.5"/>'+
'      </g>'+
'      <circle cx="0" cy="0" r="3" stroke="none" fill="black"/>'+
'    </svg>';
    return svg;
}


function single_note_svg(h) { // middle-based.
    var dir = (h>=0) ? "high" : "low";
    var body = '<use xlink:href="#note-'+dir+'" x="0" y="'+(5*h)+'"/>';
    for (var hh=6; hh<=h; hh+=2)
        body += '<use xlink:href="#system-ext" x="0" y="'+(5*hh)+'"/>';
    for (var hh=-6; hh>=h; hh-=2)
        body += '<use xlink:href="#system-ext" x="0" y="'+(5*hh)+'"/>';

    var svg =
'    <svg width="90" height="60" viewBox="0 0 40 60" preserveAspectRatio="xMidYMid meet">'+
'      <defs>'+
'          <g id="system">'+
'            <path d="M-12,0 l24,0" stroke="black" stroke-width="1"/>'+
'            <path d="M-12,10 l24,0" stroke="black" stroke-width="1"/>'+
'            <path d="M-12,-10 l24,0" stroke="black" stroke-width="1"/>'+
'            <path d="M-12,20 l24,0" stroke="black" stroke-width="1"/>'+
'            <path d="M-12,-20 l24,0" stroke="black" stroke-width="1"/>'+
'          </g>'+
''+
'          <g id="system-ext">'+
'            <path d="M-8,0 l16,0" stroke="black" stroke-width="1"/>'+
'          </g>'+
''+
'          <g id="note-low">'+
'            <circle cx="0" cy="0" r="5" fill="black" transform="translate(-5 0) skewX(25) translate(5 0)"/>'+
'            <path d="M4.9,1.0 l0,30" stroke="black" stroke-width="1"/>'+
'          </g>'+
'          <g id="note-high">'+
'            <circle cx="0" cy="0" r="5" fill="black" transform="translate(-5 0) skewX(25) translate(5 0)"/>'+
'            <path d="M-4.9,-1.0 l0,-30" stroke="black" stroke-width="1"/>'+
'          </g>'+
'      </defs>'+
'      <g transform="translate(20,25) scale(1 -1)">'+
'        <use xlink:href="#system" x="0" y="0"/>'+
        body+
'      </g>'+
'    </svg>';
    return svg;
}

function single_piano_key(h) { // C-based.
    var svg =
    '<svg width="100" height="50" viewBox="-5 0 110 50" preserveAspectRatio="xMidYMid meet">'+
'      <defs>'+
'          <g id="whiteKey">'+
'            <path d="M0,40 L0,0 L10,0 L10,40" stroke="black" stroke-width="1" fill="none"/>'+
'          </g>'+
'          <g id="blackKey">'+
'            <path d="M-3,40 L-3,15 L3,15 L3,40" fill="#444"/>'+
'          </g>'+
'          <g id="halfBlackKey">'+
'            <path d="M-3,40 L-3,15 L0,15 L0,40" fill="#444"/>'+
'          </g>'+
''+
'          <g id="highlightWhite">'+
'            <circle cx="5" cy="10" r="3" fill="#444">'+
'          </g>'+
''+
'          <g id="highlightBlack">'+
'            <circle cx="0" cy="20" r="2" fill="white">'+
'          </g>'+
''+
'          <g id="keys">'+
'            <use xlink:href="#whiteKey" x="0" y="0"/>'+
'            <use xlink:href="#whiteKey" x="10" y="0"/>'+
'            <use xlink:href="#whiteKey" x="20" y="0"/>'+
'            <use xlink:href="#whiteKey" x="30" y="0"/>'+
'            <use xlink:href="#whiteKey" x="40" y="0"/>'+
'            <use xlink:href="#whiteKey" x="50" y="0"/>'+
'            <use xlink:href="#whiteKey" x="60" y="0"/>'+
'            <use xlink:href="#whiteKey" x="70" y="0"/>'+
'            <use xlink:href="#whiteKey" x="80" y="0"/>'+
'            <use xlink:href="#whiteKey" x="90" y="0"/>'+
''+
'            <use xlink:href="#blackKey" x="10" y="0"/>'+
'            <use xlink:href="#blackKey" x="20" y="0"/>'+
'            <use xlink:href="#blackKey" x="40" y="0"/>'+
'            <use xlink:href="#blackKey" x="50" y="0"/>'+
'            <use xlink:href="#blackKey" x="60" y="0"/>'+
'            <use xlink:href="#blackKey" x="80" y="0"/>'+
'            <use xlink:href="#blackKey" x="90" y="0"/>'+
//'            <use xlink:href="#halfBlackKey" x="80" y="0"/>'+
'          </g>'+
'      </defs>'+
'      <g transform="translate(0,50) scale(1 -1)">'+
'        <use xlink:href="#keys" x="0" y="0"/>'+
'        <use xlink:href="#highlightWhite" x="'+(h*10)+'" y="0"/>'+
'      </g>'+
'    </svg>';
    return svg;
}

function two_actor_scene_svg(actor1, actor2, item1, item2, speaker/*0 or 1*/, text) {
    var lines = text.split("\n");
    var tspans = "";
    for (var i in lines) {
        var line = lines[i];
            tspans += '<tspan x="0.5" dy="'+(i==0 ? '0.4em' : '1.2em')+'">'+line+'</tspan>';
    }
    var speech_transform = speaker==0 ? 'translate(75 0) scale(200 100)' : 'translate(25 0) scale(-200 100) translate(-1 0)';
    var text_x = speaker==0 ? 75 : 25;
    var svg =
        '    <svg width="100" height="120" viewBox="0 0 300 350" preserveAspectRatio="xMidYMid meet">' +
        '      <!-- <path fill="blue" d="M 0,0 L300,0 L300,200 L0,200 L0,0"/> -->' +
        '      <g transform="translate(0 100)">' +
        '        <use xlink:href="images/characters.svg#'+actor1.id+'" x="0" y="0"/>' +
        '        <use xlink:href="images/items.svg#'+item1.id+'" x="0" y="0" transform="translate('+actor2.hand_x+' '+actor2.hand_y+') rotate(15) scale(0.5) translate(-50 -50)"/>' +
        (speaker==0?'        <use xlink:href="images/characters.svg#'+actor1.id+'-open-mouth" x="0" y="0"/>' : '')+
        '        <use xlink:href="images/characters.svg#'+actor1.id+'-above" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="translate(300 100) scale(-1 1)">' +
        '        <use xlink:href="images/characters.svg#'+actor2.id+'" x="0" y="0"/>' +
        '        <use xlink:href="images/items.svg#'+item2.id+'" x="0" y="0" transform="translate('+actor2.hand_x+' '+actor2.hand_y+') rotate(15) scale(0.5) translate(-50 -50)"/>' +
        (speaker==1?'        <use xlink:href="images/characters.svg#'+actor2.id+'-open-mouth" x="0" y="0"/>' : '')+
        '        <use xlink:href="images/characters.svg#'+actor2.id+'-above" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="'+speech_transform+'">' +
        '        <use xlink:href="images/characters.svg#speech-bubble2" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="translate('+text_x+' -37.5) scale(200)">' +
        '        <text y="0.35" dy="-0.4em" font-family="Verdana" font-size="0.14" text-anchor="middle" fill="black">'+tspans+'</text>' +
        '      </g>' +
        '    </svg>';
    return svg;
}

function two_speakers_scene_svg(actor1, actor2, item1, item2, first_speaker/*0 or 1*/, text1, text2) {
    var tspans1 = text_to_tspans(text1);
    var tspans2 = text_to_tspans(text2);
    var speech1_transform = first_speaker==0 ? 'translate(5 0) scale(240 100)' : 'translate(55 0) scale(-240 100) translate(-1 0)';
    var speech2_transform = first_speaker!=0 ? 'translate(-10 100) scale(240 100)' : 'translate(70 100) scale(-240 100) translate(-1 0)';
    var text1_x = first_speaker==0 ? 25 : 75;
    var text2_x = first_speaker!=0 ? 10 : 90;
    var svg =
        '    <svg width="110" height="150" viewBox="-10 0 320 450" preserveAspectRatio="xMidYMid meet">' +
        '      <!-- <path fill="blue" d="M 0,0 L300,0 L300,200 L0,200 L0,0"/> -->' +
        '      <g transform="translate(0 200)">' +
        '        <use xlink:href="images/characters.svg#'+actor1.id+'" x="0" y="0"/>' +
        '        <use xlink:href="images/items.svg#'+item1.id+'" x="0" y="0" transform="translate('+actor2.hand_x+' '+actor2.hand_y+') rotate(15) scale(0.5) translate(-50 -50)"/>' +
        '        <use xlink:href="images/characters.svg#'+actor1.id+'-open-mouth" x="0" y="0"/>' +
        '        <use xlink:href="images/characters.svg#'+actor1.id+'-above" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="translate(300 200) scale(-1 1)">' +
        '        <use xlink:href="images/characters.svg#'+actor2.id+'" x="0" y="0"/>' +
        '        <use xlink:href="images/items.svg#'+item2.id+'" x="0" y="0" transform="translate('+actor2.hand_x+' '+actor2.hand_y+') rotate(15) scale(0.5) translate(-50 -50)"/>' +
        '        <use xlink:href="images/characters.svg#'+actor2.id+'-open-mouth" x="0" y="0"/>' +
        '        <use xlink:href="images/characters.svg#'+actor2.id+'-above" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="'+speech1_transform+'">' +
        '        <use xlink:href="images/characters.svg#speech-bubble-high" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="translate('+text1_x+' -37.5) scale(200)">' +
        '        <text y="0.35" dy="-0.4em" font-family="Verdana" font-size="0.14" text-anchor="middle" fill="black">'+tspans1+'</text>' +
        '      </g>' +
        '      <g transform="'+speech2_transform+'">' +
        '        <use xlink:href="images/characters.svg#speech-bubble-low" x="0" y="0"/>' +
        '      </g>' +
        '      <g transform="translate('+text2_x+' 60) scale(200)">' +
        '        <text y="0.35" dy="-0.4em" font-family="Verdana" font-size="0.14" text-anchor="middle" fill="black">'+tspans2+'</text>' +
        '      </g>' +
        '    </svg>';
    return svg;
}

function text_to_tspans(text) {
    var lines = text.split("\n");
    var tspans = "";
    var dy0 = (1.6-lines.length*0.6)+"em";
    for (var i in lines) {
        var line = lines[i];
            tspans += '<tspan x="0.5" dy="'+(i==0 ? dy0 : '1.2em')+'">'+line+'</tspan>';
    }
    return tspans;
}

//==================== Initialization
function init_page() {
    gen_type_menu();
    set_options_from_URL();
    on_type_change();
}

function gen_type_menu() {
    var type_selector = $("#type")[0];
    remove_all_children(type_selector);
    for (var type in LABY_TYPES) {
        var descr = LABY_TYPES[type];
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
    descriptor = LABY_TYPES[type];
    var deps = descriptor.deps || [];
    console.log("input deps: "+deps);
    var opt_inputs = $("#optional_inputs");
    opt_inputs.find("input,label,textarea,select").hide();
    for (var di in deps) {
        var d = deps[di];
        opt_inputs.find("#"+d).show();
        opt_inputs.find("label[for='"+d+"']").show();
    }
}

//========== Labyrinth generation: ====================

function generate_labys() {
    clear_results();

    var type = $("#type")[0].value;
    console.log("type = "+type);
    descriptor = LABY_TYPES[type];
    console.log("descriptor = "+descriptor);

    options = {
        maxNum: $("#maxNum")[0].value,
        maxLeast: $("#maxLeast")[0].value,
        number: $("#number")[0].value,
        useNone: $("#useNone")[0].checked,
        useAll: $("#useAll")[0].checked,
        timeHalfHour: $("#timeHalfHour")[0].checked,
        timeQuartHour: $("#timeQuartHour")[0].checked,
        count: $("#count")[0].value,
        minNote: 1 * $("#minNote")[0].value,
        maxNote: 1 * $("#maxNote")[0].value,
    };
    console.log("options.useNone: "+options.useNone);

    var count = options.count;
    var w=descriptor.dims[0], h=descriptor.dims[1];
    for (var i=0; i<count; i++) {
        var laby = generate_laby(w, h);
        show_laby(laby, descriptor, options);
    }
}

function clear_results() {
    console.log("In clear_results");
    var parent = $("#results")[0];
    remove_all_children(parent);
}

function remove_all_children(node) {
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

function show_laby(laby, descriptor, options) {
    var parent = $("#results");
    var div = $(document.createElement("div"));
    var table = $(document.createElement("table"));
    table.addClass("laby-grid");
    table = table[0];

    //var row_template = document.createElement("tr");
    //var cell_template = document.createElement("td");

    options.state = (descriptor.prepare_state !== undefined) ? descriptor.prepare_state(options) : null;

    var trues = []; var falses = [];
    var w = laby.length, h=laby[0].length;
    for (var y=0; y<h; y++) {
        var row = document.createElement("tr");
        for (var x=0; x<w; x++) {
            var onpath = laby[x][y];
            var cell = document.createElement("td");
            //var text = onpath ? "*" : " ";
            var text = gen_cell_content(onpath, descriptor, options, trues, falses);
            //cell.appendChild(document.createTextNode(text));
            cell.innerHTML = text;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

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

    div.append(table);
    div.addClass("on-same-page");
    parent.append(div);
}

function gen_cell_content(onpath, descriptor, options, trues, falses) {
    var src = onpath ? trues : falses;
    while (src.length === 0) {
        var item = descriptor.cell_gen(options);
        if (item === null || item === undefined) continue;
        var dest = (item.value ? trues : falses);
        dest.push(item.text);
    }
    return src.pop();
}

function generate_laby(w, h) {
    var ATTEMPTS = 20; // 7
    // Best (longest) of ATTEMPTS:
    var path_length = 0;
    var grid;
    for (var i=0; i<ATTEMPTS; i++) {
        var path = generate_pattern3(w,h);
        if (path.path_length > path_length) {
            path_length = path.path_length;
            grid = path.path_grid;
        }
    }

    for (var y=0; y<h; y++) {
        var line = "";
        for (var x=0; x<w; x++) {
            var onpath = grid[x][y];
            line += (onpath ? "*" : "-");
        }
        console.log(line);
    }
    console.log("Path length: "+path_length);

    return grid;
}


function value_for_cell(m,x,y) {
    if (y<0 || x>=m.length) return 1;
    if (x<0 || y>=m[0].length) return 2;
    var v = m[x][y];
    return v===null ? 0 : v;
}

function generate_pattern(w,h) {
    var m = make_2d_array(w,h, null);

    var q = make_heap();
    for (var i=0; i<w; i++) {
        add_candidate_cell(q,m, i,0,   0);
        add_candidate_cell(q,m, i,h-1, 0);
    }
    for (var i=0; i<h; i++) {
        add_candidate_cell(q,m, 0,i,   0);
        add_candidate_cell(q,m, w-1,i, 0);
    }

    while (q.count() > 0) {
        var item = q.removeFirst();
        var x = item.value.x;
        var y = item.value.y;

        var mask = 0;
        for (var dx=-1; dx<=1; dx++) {
            for (var dy=-1; dy<=1; dy++) {
                mask |= value_for_cell(m, x+dx, y+dy);
            }
        }
        mask &= 3;
        if (mask===3) mask=4;
        if (mask != m[x][y]) {
            m[x][y] = mask;
            for (var dx=-1; dx<=1; dx++) {
                for (var dy=-1; dy<=1; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) === 1)
                        add_candidate_cell(q,m, x+dx, y+dy, 0);
                }
            }
        }
    }
    return m;
}

function add_candidate_cell(q,m, x,y, base) {
    //console.log("Adding candidate? ("+x+","+y+")...");
    if (x<0 || x>=m.length) return;
    if (y<0 || y>=m[0].length) return;

    if (m[x][y] != null) return; // Already added.
    m[x][y] = 0;
    q.add(base + Math.random(), {x:x, y:y})
}

// Some constants:
var UP = 1, LEFT = 2, DOWN = 4, RIGHT = 8;
var DIRX = [0, -1, 0, 1];
var DIRY = [-1, 0, 1, 0];

function generate_pattern3(w,h) {
    var parts = make_2d_array(w, h, null);

    var u = make_union_find();

    // Make a list of all cell neighbourships, in random order:
    var q = [];
    for (var x=0; x<w; x++) {
        for (var y=0; y<h; y++) {
            if (x>0) q.push({x1:x-1, y1:y, x2:x, y2:y, horizontal:true});
            if (y>0) q.push({x1:x, y1:y-1, x2:x, y2:y, horizontal:false});
        }
    }
    shuffle(q);

    // Populate m:
    for (var x=0; x<w; x++) {
        for (var y=0; y<h; y++) {
            parts[x][y] = u.singleton();
        }
    }

    // Process the neighbourships in random order:
    var nonwalls = make_2d_array(w, h, 0);
    for (var i=0; i<q.length; i++) {
        var item = q[i];
        var a = parts[item.x1][item.y1];
        var b = parts[item.x2][item.y2];

        if (u.connected(a,b))
            continue;

        // Remove a wall:
        nonwalls[item.x1][item.y1] |= (item.horizontal ? RIGHT : DOWN);
        nonwalls[item.x2][item.y2] |= (item.horizontal ? LEFT  : UP);
        u.connect(a,b);
    }

    // Translate into distance-from-origin:
    var dists1 = calculate_distances_from_point(nonwalls, 0,0);
    var dists2 = calculate_distances_from_point(nonwalls, w-1,h-1);
    //console.log("Dists1: "+dists1);
    //console.log("Dists2: "+dists2);

    // Translate into on-path/off-path info:
    var m = make_2d_array(w, h, false);
    var posx = w-1, posy = h-1;
    m[posx][posy] = true;
    var sum_on_path = dists1[0][0] + dists2[0][0];
    var path_length = 0;
    while (dists1[posx][posy] > 0) {
        //console.log("Finding path: "+posx+","+posy+"; dist="+dists[posx][posy]);
        var nextx=null, nexty=null;
        var bestdist = 1e9;
        for (var dir=0; dir<4; dir++) {
            var xx = posx + DIRX[dir];
            var yy = posy + DIRY[dir];
            // Check bounds:
            if (xx<0 || xx>=w) continue;
            if (yy<0 || yy>=h) continue;
            // Check on-path-ness:
            if (dists1[xx][yy] + dists2[xx][yy] != sum_on_path) continue;
            // Don't take walls into account here - shortcutting is OK.
            if (dists1[xx][yy] < bestdist) {
                bestdist = dists1[xx][yy];
                nextx = xx; nexty = yy;
            }
        }
        posx = nextx;
        posy = nexty;
        m[posx][posy] = true;
        path_length++;
    }
    return {path_grid:m, path_length:path_length};
}

function calculate_distances_from_point(nonwalls, destx, desty) {
    var w = nonwalls.length;
    var h = nonwalls[0].length;
    var dists = make_2d_array(w, h, 1e9);
    {
        dists[destx][desty] = 0;
        var q = [{x:destx, y:desty, dist:0}];

        for (var i=0; i<q.length; i++) {
            var srcx = q[i].x, srcy = q[i].y;
            var nonw = nonwalls[srcx][srcy];
            var dist = dists[srcx][srcy];
            for (var dir=0; dir<4; dir++) {
                if ((nonw & (1<<dir)) == 0) continue; // Wall check.
                var tox = srcx + DIRX[dir];
                var toy = srcy + DIRY[dir];
                if (dists[tox][toy] > dist) {
                    dists[tox][toy] = dist+1;
                    q.push({x: tox, y: toy});
                }
            }
        }
    }
    return dists;
}

//==================== Array utilities ==============================

function make_2d_array(w,h, value) {
    var a = Array(w);
    for (var x=0; x<w; x++) {
        a[x] = Array(h);
        for (var y=0; y<h; y++)
            a[x][y] = value;
    }
    return a;
}

function shuffle(a) {
    var n = a.length;
    for (var i=n-1; i>=0; i--) {
        var j = Math.floor((i+1)*Math.random());
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}

//==================== Priority Heap class ==============================

heap_methods = {
    ctor: function() {
        this.items=Array();
    },

    count: function() {return this.items.length;},

    add: function(key,value) {
        var n = this.items.length;
        this.items[n] = {key:key, value:value};
        this.bubble_up(n);
    },

    removeFirst: function() {
        var item = this.items[0];
        var last = this.count()-1;
        this.items[0] = this.items[last];
        this.items.length--;  //delete this.items[last];
        this.bubble_down(0);
        return item;
    },

    bubble_up: function(n) {
        while (n>1) {
            var n2 = (n-1)>>1;
            if (this.items[n2].key > this.items[n].key) {
                this.swap_items(n, n2);
                n = n2;
            } else {
                break;
            }
        }
    },


    bubble_down: function(n) {
        //console.log("bubble_down: items="+this.items+" / "+this.items.length);
        while (true) {
            var n2 = (n<<1)+1;
            if (n2 < this.items.length &&
                this.items[n2].key < this.items[n].key)
            {
                this.swap_items(n, n2);
                n = n2;
                continue;
            }
            n2 = (n<<1)+2;
            if (n2 < this.items.length &&
                this.items[n2].key < this.items[n].key)
            {
                this.swap_items(n, n2);
                n = n2;
                continue;
            }

            break;
        }
    },

    swap_items: function(i,j) {
        var tmp = this.items[i];
        this.items[i] = this.items[j];
        this.items[j] = tmp;
    }
}
heap_methods.ctor.prototype = heap_methods;

function make_heap() {
    return new heap_methods.ctor();
}

//==================== Union-Find Heap class ==============================
union_find_methods = {
    ctor: function() {},

    singleton: function() {
        return {link: null, size: 1}
    },

    connected: function(a, b) {
        return this.canonical(a)===this.canonical(b);
    },

    canonical: function(a) {
        while (a.link != null) a = a.link;
        return a;
    },

    connect: function(a,b) {
        var c1 = this.canonical(a);
        var c2 = this.canonical(b);
        if (c1 === c2) return;

        if (c1.size < c2.size) {var tmp=c1; c1=c2; c2=tmp;}
        // INVARIANT: c1.size >= c2.size
        c2.link = c1;
        c1.size += c2.size;

        // Shorten paths:
        while (a.link != null) {
            var next = a.link;
            a.link = c1;
            a = next;
        }
        while (b.link != null) {
            var next = b.link;
            b.link = c1;
            b = next;
        }
    }
}

union_find_methods.ctor.prototype = union_find_methods;


function make_union_find() {
    return new union_find_methods.ctor();
}
