var SVG_NS = 'http://www.w3.org/2000/svg';

function init_page() {
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
}

function show_diagram(tree) {
    var parent = $("#results")[0];
    remove_all_children(parent);

    var svgNode = document.createElementNS(SVG_NS, 'svg');
    $(svgNode).attr("width", "10cm");
    $(svgNode).attr("height", "5cm");
    svgNode.setAttribute("style", 'padding: 0px; margin: 0px');
    svgNode.setAttribute("viewBox", "0 0 5 10");
    parent.appendChild(svgNode);
    //svgNode.setAttribute("preserveAspectRatio", "meet");
    //var groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    tree.calculateSize(svgNode);//tree_to_svg_pass1(tree, svgNode);
    var MARGIN = 5;
    var x1 = - MARGIN;
    var y1 = -(tree.upheight+MARGIN);
    var w = tree.width + 2*MARGIN;
    var h = (tree.upheight+tree.downheight) + 2*MARGIN;
    svgNode.setAttribute("viewBox", x1+" "+y1+" "+w+" "+h);
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
        console.log("Match: "+m);
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
            stack.pop();
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
        var w=0, h_up=0, h_dn=0;
        var base = Math.floor(this.items.length/2);
        for (var i in this.items) {
            var item = this.items[i];
            item.calculateSize(ctx);
            w = Math.max(w, item.width);
            if (i<=base)
                h_up += item.upheight;
            else
                h_dn += item.upheight;
            if (i>=base)
                h_dn += item.downheight;
            else
                h_up += item.downheight;
        }
        this.width = w + 4 * this.TURN_SIZE;
        this.upheight = h_up;
        this.downheight = h_dn;
    },

    render: function(ctx, x0,y0) {
        //TODO: Do this properly.
        var y = y0-this.upheight;
        for (var i in this.items) {
            var item = this.items[i];
            var x = x0;
            y += item.upheight;
            item.render(ctx, x,y);
            y += item.downheight;
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
    OUTER_PADDING: 1,

    simplify: function() {return this;},

    calculateSize: function(ctx) {
        var textNode = document.createTextNode(this.value);
        var node = document.createElementNS( SVG_NS, "text" );
        node.appendChild(textNode);
        ctx.appendChild(node);
        this.node = node;

        var bbox = node.getBBox();
        var padx = 2*(this.INNER_PADDING_X + this.OUTER_PADDING);
        var pady = 2*(this.INNER_PADDING_Y + this.OUTER_PADDING);
        console.log("Atom bbox: "+bbox.x+","+bbox.y+"+"+bbox.width+"x"+bbox.height);
        this.width = bbox.width + padx;
        this.upheight = (-bbox.y) + pady;
        this.downheight = bbox.height + bbox.y + pady;
    },

    render: function(ctx, x,y) {
        console.log("Atom render: "+this.node);

        // Position the text node:
        var padx = this.INNER_PADDING_X + this.OUTER_PADDING;
        var pady = this.INNER_PADDING_Y + this.OUTER_PADDING;
        this.node.setAttribute("x", x + padx);
        this.node.setAttribute("y", y);

        // Add border:
        var border = document.createElementNS( SVG_NS, "rect" );
        border.setAttribute("fill", "none");
        border.setAttribute("stroke", "green");
        border.setAttribute("stroke-width", "0.1");
        border.setAttribute("x", x + this.OUTER_PADDING);
        border.setAttribute("y", y - this.upheight + this.OUTER_PADDING);
        border.setAttribute("width", this.width - 2*this.OUTER_PADDING);
        border.setAttribute("height", this.upheight + this.downheight - 2*this.OUTER_PADDING);
        ctx.appendChild(border);

        var dot = document.createElementNS( SVG_NS, "rect" );
        dot.setAttribute("fill", "rgb(255,0,0)");
        dot.setAttribute("x", x-0.5);
        dot.setAttribute("y", y-0.5);
        dot.setAttribute("width", 1);
        dot.setAttribute("height", 1);
        ctx.appendChild(dot);
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
        this.upheight = 0.5;
        this.downheight = 0.5;
    },

    render: function(ctx, x,y) {}
};
