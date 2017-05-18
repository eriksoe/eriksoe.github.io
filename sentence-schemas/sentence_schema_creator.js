var SVG_NS = 'http://www.w3.org/2000/svg';

var LINE_COLOR = "rgb(192,192,192)";
var LINE_WIDTH = 0.75;

var BOX_LINE_COLOR = "black";
var BOX_LINE_WIDTH = 0.1;

function init_page() {
    set_options_from_URL();
    reparse();
}

on_spec_changed_timer = null;
function on_spec_changed(now) {
    if (on_spec_changed_timer !== null) clearTimeout(on_spec_changed_timer);
    var delay = now ? 0 : 500;
    on_spec_changed_timer = setTimeout(function() {
        on_spec_changed_timer = null;
        reparse();
    }, delay);
}

function reparse() {
    var spec = $("#spec")[0].value;
    var tree = parse(spec);
    console.log("Tree: "+tree);
    tree = tree.simplify();
    console.log("Simplified tree: "+tree);
    show_diagram(tree);

    set_document_URL_parameters({spec:spec});
}

function show_diagram(tree) {
    var parent = $("#results")[0];
    remove_all_children(parent);

    var svgNode = document.createElementNS(SVG_NS, 'svg');
    $(svgNode).attr("width", "17cm");
    $(svgNode).attr("height", "12cm");
    svgNode.setAttribute("style", 'padding: 0px; margin: 0px');
    svgNode.setAttribute("viewBox", "0 0 17 12");
    parent.appendChild(svgNode);
    //svgNode.setAttribute("preserveAspectRatio", "meet");
    //var groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    tree.calculateSize(svgNode);//tree_to_svg_pass1(tree, svgNode);
    var MARGIN = 5;
    var x1 = - MARGIN;
    var y1 = -(tree.upheight+MARGIN);
    var w = tree.width + 2*MARGIN;
    var h = (tree.upheight+tree.downheight) + 2*MARGIN;
    svgNode.setAttribute("viewBox", x1+" "+y1+" "+Math.max(170,w)+" "+Math.max(120,h));
    tree.render(svgNode, 0,0);

    console.log("tree size: "+tree.width+" x "+tree.upheight+"+"+tree.downheight);
    //tree_to_svg_pass2(tree, svgNode, size)

}

function remove_all_children(node) {
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

// Node types:
// - Word: 'word'
// - Sequence (n-ary): 'items'
// - Choice (n-ary): 'items'
// Algorithm:
// - Have a stack; at each level a Choice of Sequences.
// - Start with a stack containing an empty sequence.
// - Iterate through the spec text:
//   - Whitespace: skip
//   - Word: Add to top sequence
//   - '(': Push group.

function parse(spec) {
    console.log("Parsing spec: "+spec);

    var createLevel = function() {
        var seq = new Sequence();
        var choice = new Choice();
        choice.add(seq);
        return {c:choice, s:seq};
    };

    var stack = [];
    stack.push(createLevel());
    var root = stack[0].c;

    var len = spec.length;
    var regex = /(\s+)|(\()|(\))|(\/)|([^()/\s]+)/g;
    var m;
    //TODO: Error handling - unbalanced grouping.
    while ((m = regex.exec(spec))) {
        //console.log("Match: "+m);
        var top = stack[stack.length-1];
        if (m[1] !== undefined) {
            // Whitespace
            continue;
        } else if (m[2] !== undefined) {
            // '('
            var newLevel = createLevel();
            top.s.add(newLevel.c);
            stack.push(newLevel);
        } else if (m[3] !== undefined) {
            // ')'
            if (stack.length>1) // Stop parsing if causing underflow.
                stack.pop();
            else
                break;
            // var node = stack.pop().c;
            // top.s.add(node);
        } else if (m[4] !== undefined) {
            // '/'
            //var seq = top.s;
            var choice = top.c;
            var newSeq = new Sequence();
            choice.add(newSeq);
            top.s = newSeq;
        } else if (m[5] !== undefined) {
            var word = m[5];
            top.s.add(new Atom(word));
        } else {
            break; // Done.
        }
    }

    return root;
}

function isWhiteSpace(c) {
    return (c == ' ' || c == '\t' || c == '\r' || c == '\n');
}

//========== Nodes ==================================================
function Sequence() {
    this.items = [];
}
Sequence.prototype = {
    add: function(item) {this.items.push(item);},
    toString: function() {
        var s = "Seq(";
        for (var i in this.items) {
            if (i>0) s += ", ";
            s += this.items[i].toString();
        }
        return s+")";
    },

    simplify: function() {
        var items2 = [];
        for (var i in this.items) {
            var item = this.items[i].simplify();
            if (item.isEmpty !== true)
                items2.push(item);
        }
        this.items = items2;

        var cnt = this.items.length;
        if (cnt == 1) return this.items[0];
        else if (cnt == 0) return new Empty();
        else return this;
    },

    calculateSize: function(ctx) {
        var w=0, h_up=0, h_dn=0;
        for (var i in this.items) {
            var item = this.items[i];
            item.calculateSize(ctx);
            w += item.width;
            h_up = Math.max(h_up, item.upheight);
            h_dn = Math.max(h_dn, item.downheight);
        }
        this.width = w;
        this.upheight = h_up;
        this.downheight = h_dn;
    },

    render: function(ctx, x,y) {
        for (var i in this.items) {
            var item = this.items[i];
            item.render(ctx, x,y);
            x += item.width;
        }
    }
};

function Choice() {
    this.items = [];
}
Choice.prototype = {
    add: function(item) {this.items.push(item);},
    toString: function() {
        var s = "Choice(";
        for (var i in this.items) {
            if (i>0) s += ", ";
            s += this.items[i].toString();
        }
        return s+")";
    },

    simplify: function() {
        for (var i in this.items) {
            var item = this.items[i].simplify();
            this.items[i] = item;
        }

        var cnt = this.items.length;
        if (cnt == 1) return this.items[0];
        else if (cnt == 0) return new Empty();
        else return this;
    },

    TURN_SIZE: 5,

    calculateSize: function(ctx) {
        this.neutral = Math.floor((this.items.length-1)/2);

        var w=0, h_up=0, h_dn=0;
        for (var i in this.items) {
            var item = this.items[i];
            item.calculateSize(ctx);
            w = Math.max(w, item.width);
            if (i<=this.neutral)
                h_up += item.upheight;
            else
                h_dn += item.upheight;
            if (i>=this.neutral)
                h_dn += item.downheight;
            else
                h_up += item.downheight;
        }
        this.maxItemWidth = w;
        this.width = w + 4 * this.TURN_SIZE;
        this.upheight = h_up;
        this.downheight = h_dn;
    },

    render: function(ctx, x0,y0) {
        //TODO: Do this properly.
        var y = y0-this.upheight;
        var R = this.TURN_SIZE;
        var x1 = x0 + R;
        var x2 = x0 + 2*R;
        var x10 = x0 + this.width;
        var x9 = x10 - R;
        var x8 = x10 - 2*R;
        for (var i in this.items) {
            var item = this.items[i];
            var padW = (this.maxItemWidth - item.width)/2;
            var x3 = x2 + padW;
            var x7 = x8 - padW;
            var x = x3;
            y += item.upheight;
            var itemY = y;
            item.render(ctx, x,y);
            y += item.downheight;

            // Add padding line and inner turn:
            var path1, path2;
            path1 = "M "+x3+","+itemY;
            path2 = "M "+x7+","+itemY;
            path1 += " L "+x2+","+itemY;
            path2 += " L "+x8+","+itemY;
            if (i == this.neutral) {
                //path1 += " L "+x2+","+itemY;
                //path2 += " L "+x8+","+itemY;
            } else {
                //TODO: Turns.
                var dY = (i > this.neutral ? -R : R);
                var LSa = (i > this.neutral ? 1 : 0);
                var LSb = (i > this.neutral ? 0 : 1);
                path1 += " A "+R+","+R+" 0 0 "+LSa+" "+x1+","+(itemY+dY);
                path1 += " L "+x1+","+(y0-dY);
                path1 += " A "+R+","+R+" 0 0 "+LSb+" "+x0+","+y0;

                path2 += " A "+R+","+R+" 0 0 "+LSb+" "+x9+","+(itemY+dY);
                path2 += " L "+x9+","+(y0-dY);
                path2 += " A "+R+","+R+" 0 0 "+LSa+" "+x10+","+y0;
            }
            path1 += " L "+x0+","+y0;
            path2 += " L "+x10+","+y0;

            var turn1 = document.createElementNS(SVG_NS, "path");
            turn1.setAttribute("fill", "none");
            turn1.setAttribute("stroke", LINE_COLOR);
            turn1.setAttribute("stroke-width", LINE_WIDTH);
            turn1.setAttribute("d", path1);
            ctx.appendChild(turn1);

            var turn2 = document.createElementNS(SVG_NS, "path");
            turn2.setAttribute("fill", "none");
            turn2.setAttribute("stroke", LINE_COLOR);
            turn2.setAttribute("stroke-width", LINE_WIDTH);
            turn2.setAttribute("d", path2);
            ctx.appendChild(turn2);

        }
    }

};

function Atom(value) {
    this.value = value;
}
Atom.prototype = {
    toString: function() {
        return "'"+this.value+"'";
    },

    INNER_PADDING_X: 2,
    INNER_PADDING_Y: 0,
    OUTER_PADDING: 3,

    simplify: function() {return this;},

    calculateSize: function(ctx) {
        var textNode = document.createTextNode(this.value);
        var node = document.createElementNS( SVG_NS, "text" );
        node.setAttribute("alignment-baseline", "middle");
        node.appendChild(textNode);
        ctx.appendChild(node);
        this.node = node;

        var bbox = node.getBBox();
        var padx = 2*(this.INNER_PADDING_X + this.OUTER_PADDING);
        var pady = 2*(this.INNER_PADDING_Y + this.OUTER_PADDING);
        this.width = bbox.width + padx;
        this.upheight = (-bbox.y) + pady;
        this.downheight = bbox.height + bbox.y + pady;
    },

    render: function(ctx, x,y) {
        // Position the text node:
        var padx = this.INNER_PADDING_X + this.OUTER_PADDING;
        var pady = this.INNER_PADDING_Y + this.OUTER_PADDING;
        this.node.setAttribute("x", x + padx);
        this.node.setAttribute("y", y);

        // Add border:
        var border = document.createElementNS( SVG_NS, "rect" );
        border.setAttribute("fill", "none");
        border.setAttribute("stroke", BOX_LINE_COLOR);
        border.setAttribute("stroke-width", BOX_LINE_WIDTH);
        border.setAttribute("x", x + this.OUTER_PADDING);
        border.setAttribute("y", y - this.upheight + this.OUTER_PADDING);
        border.setAttribute("width", this.width - 2*this.OUTER_PADDING);
        border.setAttribute("height", this.upheight + this.downheight - 2*this.OUTER_PADDING);
        ctx.appendChild(border);

        /*
        var dot = document.createElementNS( SVG_NS, "rect" );
        dot.setAttribute("fill", "rgb(255,0,0)");
        dot.setAttribute("x", x-0.5);
        dot.setAttribute("y", y-0.5);
        dot.setAttribute("width", 1);
        dot.setAttribute("height", 1);
        ctx.appendChild(dot);
        */

        // Add connecting lines:
        {
            var path = "M "+x+","+y+" L "+(x+this.OUTER_PADDING)+","+y;
            var line = document.createElementNS(SVG_NS, "path");
            line.setAttribute("stroke", LINE_COLOR);
            line.setAttribute("stroke-width", LINE_WIDTH);
            line.setAttribute("d", path);
            ctx.appendChild(line);
        }
        {
            var x10 = (x+this.width);
            var path = "M "+x10+","+y+" L "+(x10-this.OUTER_PADDING)+","+y;
            var line = document.createElementNS(SVG_NS, "path");
            line.setAttribute("stroke", LINE_COLOR);
            line.setAttribute("stroke-width", LINE_WIDTH);
            line.setAttribute("d", path);
            ctx.appendChild(line);
        }
    }

};

function Empty() {
    this.isEmpty = true;
}
Empty.prototype = {
    toString: function() {
        return "<empty>";
    },

    simplify: function() {return this;},

    calculateSize: function(ctx) {
        this.width = 0;
        this.upheight = 2.5;
        this.downheight = 2.5;
    },

    render: function(ctx, x,y) {}
};

//==================================================

function set_document_URL_parameters(kvs) {
    var oldURL = document.URL;
    var qpos = oldURL.indexOf("#");
    var urlBase = (qpos<0) ? oldURL : oldURL.substring(0,qpos);
    var newURL = urlBase + "#text=" + encodeURIComponent(kvs.spec);
    if (newURL != oldURL)
        location.replace(newURL);
}

function set_options_from_URL() {
    var url = document.URL;
    var key_RE = /^[A-Za-z0-9_]+$/;

    var qpos = url.indexOf("#");
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

        if (k=="text"){
            $("#spec")[0].value = decodeURIComponent(v);
        }
    }
}
