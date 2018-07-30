//========== Random stuff:

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
function apply_permutation(perm, list) {
    var res = [];
    for (var i=0; i<perm.length; i++) {
        res.push(list[perm[i]]);
    }
    return res;
}
function apply_rev_permutation(perm, list) {
    var res = [];
    for (var i=0; i<perm.length; i++) {
        res[perm[i]] = list[i];
    }
    return res;
}

//========== DOM stuff:

function remove_all_children(node) {
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

