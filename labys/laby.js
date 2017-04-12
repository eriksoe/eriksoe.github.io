
//========== Input configuration: ====================

LABY_TYPES = {
    plus: {
        descr: "Plus",
        tags: ["Matematik", "Regning", "Plus"],
        deps: ["maxNum", "maxLeast"],
        cell_gen: function(options) {
            var x = rand_bool();
            return {text:x?"+":"-", value:x}
        }
    },
    minus: {
        descr: "Minus",
        tags: ["Matematik", "Regning", "Minus"],
        deps: ["maxNum", "maxLeast"],
        cell_gen: function(options) {
            var x = rand_bool();
            return {text:x?"*":" ", value:x}
        }
    },
    same_letter: {
        descr: "Ens bogstaver",
        tags: ["Bogstaver", "Ens/forskellige"],
        cell_gen: function(options) {
            var x = rand_bool();
            return {text:x?"*":" ", value:x}
        }
    },
    same_or_different_letters: {
        descr: "Ens/forskellige bogstaver",
        tags: ["Bogstaver", "Ens/forskellige"],
        cell_gen: function(options) {
            var x = rand_bool();
            return {text:x?"*":" ", value:x}
        }
    },
    two_kinds_letters: {
        descr: "To slags bogstaver",
        tags: ["Bogstaver", "Ens/forskellige"],
        cell_gen: function(options) {
            var x = rand_bool();
            return {text:x?"*":" ", value:x}
        }
    }
}

function rand_bool() {
  return Math.random() < 0.5;
}

function rand_int(min,max) {
  return min + int(Math.random() * (max-min+1));
}

function rand_letter() {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";
    return letters.substring(rand_int(0,letter.length-1), 1);
}

//==================== Initialization
function init_page() {
    gen_type_menu();
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
        maxLeast: $("#maxLeast").value,
    };

    var count = 3;
    var w=15, h=10;
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
    var table = $(document.createElement("table"))[0];

    //var row_template = document.createElement("tr");
    //var cell_template = document.createElement("td");

    var trues = []; var falses = [];
    var w = laby.length, h=laby[0].length;
    for (var y=0; y<h; y++) {
        var row = document.createElement("tr");
        for (var x=0; x<w; x++) {
            var onpath = laby[x][y];
            var cell = document.createElement("td");
            //var text = onpath ? "*" : " ";
            var text = gen_cell_content(onpath, descriptor, options, trues, falses);
            cell.appendChild(document.createTextNode(text));
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    parent.append(table);
}

function gen_cell_content(onpath, descriptor, options, trues, falses) {
    var src = onpath ? trues : falses;
    while (src.length === 0) {
        var item = descriptor.cell_gen(options);
        if (item === null) continue;
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
