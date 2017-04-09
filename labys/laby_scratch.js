
function make_2d_array2(minx, maxx, miny, maxy, value) {
    var a = Array(maxx-minx);
    for (var x=minx; x<=maxx; x++) {
        a[x] = Array(maxy-miny);
        for (var y=miny; y<=maxy; y++)
            a[x][y] = value;
    }
    return a;
}

function generate_pattern2(w,h) {
    var m = make_2d_array2(-1,w, -1,h, null);

    var u = make_union_find();
    var sideA = u.singleton();
    var sideB = u.singleton();

    // Make a list of all cell positions, in random order:
    var q = [];
    for (var x=0; x<w; x++) {
        for (var y=0; y<h; y++) q.push({x:x, y:y});
    }
    shuffle(q);

    // Populate m:
    for (var x=-1; x<=w; x++) {
        for (var y=-1; y<=h; y++) {
            var node;
            if (y<0 || x>=w)
                node = sideA;
            else if (x<0 || y>=h)
                node = sideB;
            else
                node = u.singleton();
            m[x][y] = node;
        }
    }

    // Process the cells in random order:
    for (var i=0; i<q.length; i++) {
        var x = q[i].x;
        var y = q[i].y;

        var centerNode = m[x][y];
        var nodes = [];
        var hasA = false, hasB = false;
        for (var dx=-1; dx<=1; dx++) {
            for (var dy=-1; dy<=1; dy++) {
                var node = m[x+dx][y+dy];
                hasA = hasA || u.connected(node, sideA);
                hasB = hasB || u.connected(node, sideB);
                nodes.push(node);
            }
        }
        if (hasA && hasB) {
            // Can't connect here. Skip this cell.
        } else {
            // Connect all the nodes.
            for (var j in nodes) {
                u.connect(centerNode, nodes[j]);
            }
        }
    }

    // Translate into on-path/off-path info:
     for (var x=-1; x<=w; x++) {
         for (var y=-1; y<=h; y++) {
             var node = m[x][y];
             m[x][y] =
                 u.connected(node, sideA) ? 1 :
                 u.connected(node, sideB) ? 2 :
                 4;
         }
     }
    return m;
}
