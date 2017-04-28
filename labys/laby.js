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
        dims: [15,14],
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
        dims: [15,15],
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

    times: {
        descr: "Gange",
        title: "Gange-opgaver",
        tags: ["Matematik", "Regning", "Gange"],
        deps: ["maxNum", "maxLeast"],
        dims: [15,15],
        cell_gen: function(config) {
            var min = config_range_min(config);
            var max = config_range_max(config);
            var leastMax = config_range_least_max(config);
            var a = rand_int(min,max);
            var b = rand_int(min,max);
            var c = rand_bool() ? a*b : rand_int(1,max*leastMax); //TODO: handle zero and negatives
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
        useNone: $("#useNone")[0].checked,
        useAll: $("#useAll")[0].checked,
        count: $("#count")[0].value,
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

    options.state = (descriptor.prepare_state !== undefined) ? descriptor.prepare_state() : null;

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
    // Best (longest) of 7:
    var path_length = 0;
    var grid;
    for (var i=0; i<7; i++) {
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
