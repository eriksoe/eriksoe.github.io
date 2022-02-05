function initMetronome() {
    console.log("Initing");
    connectToUI();
    resetModel();
    setTimeout(update, 0);
}

// UI elements:
var dotElem;

function connectToUI() {
    dotElem = document.getElementById("dot");
}


// Position and speed:
var pX, pY, vX, vY;
var curTime;
var curDampen;

// Target:
var beatInterval = 1.0;
var tX, tY, tTime;
var tIndex;
var waypoints4 = [
    {x: 0, y: 80, vx: -0.3, vy: 0.5, dampen: 1.0},
    {x: 0, y: -80, vx: -0, vy: -1, dampen: 1.0},
    {x: -40, y: -40, vx: -0.0, vy: 1.0, dampen: 0.5},
    {x: 40, y: -30, vx: 0.5, vy: 1.0, dampen: 0.5}
];

function resetModel() {
    pX = waypoints4[0].x; pY = waypoints4[0].y;
    vX = 0; vY = 0;

    curTime = 1e-3 * Date.now();
    tTime = curTime;
    tIndex = 1;
    setWaypoint(waypoints4[1]);
}

function setWaypoint(wp) {
    tX = wp.x;
    tY = wp.y;
    vX += wp.vx * 100; // TODO: Scale by beatInterval.
    vY += wp.vy * 100; // TODO: Scale by beatInterval.
    curDampen = wp.dampen;
    tTime = tTime + beatInterval;
}

function update() {
    var lastTime = curTime;
    curTime = 1e-3 * Date.now();
    var dt = (curTime - lastTime);
    updateModel(dt);
    updateView();
    setTimeout(update, 10);
}

var factorP = 20, factorD = 5;
function updateModel(dt) {
    if (curTime >= tTime) {
        tIndex++; tIndex %= waypoints4.length;
        setWaypoint(waypoints4[tIndex]);
    }
    
    // PD control:
    var eX = tX - pX, eY = tY - pY;
    //console.log("E=(" + eX + "," + eY + ")  dt=" + dt);
    var fX = factorP * eX - curDampen * factorD * vX;
    var fY = factorP * eY - curDampen * factorD * vY;
    //console.log("F=(" + fX + "," + fY + ")");
    vX += dt * fX; vY += dt * fY;
    pX += dt * vX; pY += dt * vY;
    //console.log("P=(" + pX + "," + pY + ")");
    //console.log("V=(" + vX + "," + vY + ")");
}

function updateView() {
    dotElem.setAttribute("cx", pX);
    dotElem.setAttribute("cy", pY);
}
