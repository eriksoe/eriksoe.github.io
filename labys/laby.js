
//========== Input configuration: ====================
TYPE_INPUT_DEPS = {
    "plus": ["maxNum"],
    "minus": ["maxNum", "maxSub"],
}

function on_type_change() {
    var type = $("#type")[0].value;
    console.log("type: "+type);
    var deps = TYPE_INPUT_DEPS[type] || [];
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

function generate_laby() {
    // TEST:
    var w=15, h=15;
    var m = generate_pattern(w,h);
    console.log("m = " + m);

    for (var y=0; y<h; y++) {
        var line = "";
        for (var x=0; x<w; x++) {
            line += (m[x][y] == 4 ? "*" : " ");
        }
        console.log(line);
    }
}

function value_for_cell(m,x,y) {
    if (y<0 || x>=m.length) return 1;
    if (x<0 || y>=m[0].length) return 2;
    var v = m[x][y];
    return v==null ? 0 : v;
}

function generate_pattern(w,h) {
    var m = Array(w);
    for (var x=0; x<w; x++) {
        m[x] = Array(h);
        for (var y=0; y<h; y++) m[x][y] = null;
    }


    var q = make_heap();
    for (var i=0; i<w; i++) {
        add_candidate_cell(q,m, i,0,   0);
        add_candidate_cell(q,m, 0,i,   0);
        add_candidate_cell(q,m, i,h-1, 0);
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
        if (mask==3) mask=4;
        if (mask != m[x][y]) {
            m[x][y] = mask;
            for (var dx=-1; dx<=1; dx++) {
                for (var dy=-1; dy<=1; dy++) {
                    if (Math.abs(dx) + Math.abs(dy) == 1)
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
