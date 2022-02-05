var SVG_NS = 'http://www.w3.org/2000/svg';
var GRAVITY = 2.0;
var PIXELS_PER_METER = 10;
var MOTOR_EFFECT = 3.0 * GRAVITY;
var MOTOR_VARIATION = 0.2;
var FUEL_USE_SPEED = 5.0;
var MAX_LANDING_SPEED = 5.0; // m/s

var running = false, crashing = false;
var posY, speedY, fuelLeft, motorPower;
var rocketSize;

var rocketElem, shadowElem, rocketSizeElem;
var dispH, dispV, dispF, dispP;
var motorEffectsElem;

function init() {
    rocketElem = document.getElementById("rocketPos");
    rocketSizeElem = document.getElementById("rocketSize");
    shadowElem = document.getElementById("shadowPos");
    dispH = document.getElementById("dispH");
    dispV = document.getElementById("dispV");
    dispF = document.getElementById("dispF");
    dispP = document.getElementById("dispP");
    motorEffectsElem = document.getElementById("motorEffects");
    resetPhysics();
    updateDisplay();
}

function resetPhysics() {
    posY = 40;
    speedY = 1.0;
    fuelLeft = 50;
    motorPower = 0;
    rocketSize = 1.0;
    running = true;
    crashing = false;
}

// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}
function gaussian(mean, sigma) {return mean + sigma * randn_bm();}

var stdlib = {
    "motorKraft": function (x) {motorPower = Math.max(0, Math.min(100, Sk.ffi.remapToJs(x)));},
    "hoejde": function () {return Sk.ffi.remapToPy(posY);},
    "fart": function () {return Sk.ffi.remapToPy(speedY);},
    "braendstof": function () {return Sk.ffi.remapToPy(fuelLeft);},

    // Make time.sleep alias:
    "vent": pythonWait
}

var physicsTimer = null;
function start() {
    resetPhysics();
    if (physicsTimer != null) stopPython();
    if (physicsTimer != null) clearTimeout(physicsTimer);
    physicsTimer = setTimeout(loop, 0);
    runPython("yourcode", "output", stdlib);
}
function loop() {
    updateModel(0.025);
    updateDisplay();
    updateEffects();
    physicsTimer = (running || particles.length>0) ? setTimeout(loop, 25) : null;
}

function updateModel(dt) {
    if (running) {
        speedY += dt * GRAVITY;
        posY -= dt * speedY;
    }
    if (crashing) {
        rocketSize = Math.max(0, rocketSize - 3.0*dt);
    }
    var motorEfficiency = Math.max(0, gaussian(1.0, MOTOR_VARIATION));
    var motorFraction = motorPower/100.0;

    var fuelSpending = dt * motorFraction * FUEL_USE_SPEED * motorEfficiency;
    var oldFuel = fuelLeft;
    fuelLeft = Math.max(0, fuelLeft - fuelSpending);
    var motorImpulse = (oldFuel-fuelLeft) / FUEL_USE_SPEED * MOTOR_EFFECT;
    speedY -= motorImpulse;

    if (motorImpulse > 0) {
        var vy = -100.0 + 2.0 * (Math.random()-0.5);
        var vx = Math.random()-0.5;
        var vz = Math.random()-0.5;
        var sz = Math.sqrt(motorFraction);
        addParticle(0, 29 + posY * PIXELS_PER_METER, 0, 7.0*vx, vy - speedY * PIXELS_PER_METER, 7.0*vz, 3*sz, 1.5,
                    275,275,240,255, 0.8, 0.65, 0.5, 0.4, true);
    }
    
    if (posY < 0) {
        posY = 0;
        running = false;
        // Check speed; handle any crash
        if (Math.abs(speedY) < MAX_LANDING_SPEED) {
            console.log("Win!");
            //TODO: winning actions - check and report records
        } else {
            crashed();
        }
    }
}

function crashed() {
    crashing = true;
    for (var i=0; i<150; i++) {
        var vx = gaussian(0, 80.0);
        var vy = gaussian(0, 150.0);
        var v = Math.sqrt(vx*vx + vy*vy);
        var sz = 20 * Math.random();
        var r = 250 + 250 * Math.random() - 0.5*v;
        var g = 250 + 100 * Math.random() - 0.5*v;
        var b = 200 + 100 * Math.random() - 0.5*v;
        addParticle(0.1*vx, 80 + 0.1*vy, 0, vx, vy, 0.0, sz, 0.2 * sz,
                    r,g,b,192.0, 0.7, 0.5, 0.2, 0.1, false);

    }
}

function updateDisplay() {
    var posYPixels = posY * PIXELS_PER_METER;
    rocketElem.setAttribute("transform", "translate(0," + posYPixels + ")");
    shadowElem.setAttribute("transform", "translate(0," + posYPixels + ")");
    rocketSizeElem.setAttribute("transform", rocketSize==1.0 ? "" : "scale(" + rocketSize + "," + rocketSize + ")");
    shadowElem.setAttribute("visibility", crashing ? "hidden" : "");
    dispH.textContent = posY.toFixed(1);
    dispV.textContent = speedY.toFixed(1);
    dispF.textContent = fuelLeft.toFixed(1);
    dispP.textContent = motorPower.toFixed(1);
}

var particles = [];
function updateEffects() {
    for (var i=0; i<particles.length; i++) {
        updateParticle(particles[i], 0.025);
        if (particles[i].done) {
            particles[i] = particles[particles.length-1]; particles.pop();
            i--;
        }
    }
}

function addParticle(x,y,z, vx,vy,vz, size, fsize, r,g,b,a, fr,fg,fb,fa, adjust) {
    var p = {x:x, y:y, z:z, vx:vx, vy:vy, vz:vz,
             size:size, fsize: fsize,
             r:r, g:g, b:b, a:a,
             fr:fr, fg:fg, fb:fb, fa:fa, adjust:adjust};
    var elem = document.createElementNS(SVG_NS, "circle");
    motorEffects.appendChild(elem);
    p.elem = elem;
    p.done = false;
    updateParticleUI(p);
    particles.push(p);
}

function updateParticle(p, dt) {
    var elem = p.elem;

    // Spread near the ground:
    if (p.adjust) {
        if (p.y < 0) p.y = 0.01;
        if (p.y < 1000 && p.vy < 0) {
            var k1 = 0.03;
            var k2 = 0.1;
            var r = Math.sqrt(0.0001 + p.x*p.x + p.z*p.z);
            var d = (10*p.y);// + 1.0*r);
            var dv = k1 * Math.sqrt(-p.vy) / Math.max(0.01, p.y);
            p.vy += dv;//k1/d;
            var factor = (r + k2 * dv)/r;
            p.vx *= factor; //(1 + Math.sqrt(k2/d));
            p.vz *= factor; //(1 + Math.sqrt(k2/d));
        }
    }

    p.x += dt * p.vx;
    p.y += dt * p.vy;
    p.z += dt * p.vz;
    
    p.size += dt * p.fsize; //*= Math.exp(p.fsize, dt)
    p.r *= Math.pow(p.fr, dt)
    p.g *= Math.pow(p.fg, dt)
    p.b *= Math.pow(p.fb, dt)
    p.a *= Math.pow(p.fa, dt)
    p.done = p.a < 1/255.0;

    updateParticleUI(p);
}

function updateParticleUI(p) {
    var elem = p.elem;
    elem.setAttribute("cx", ""+(p.x + 0.2 * p.z));
    elem.setAttribute("cy", ""+p.y);
    elem.setAttribute("r", ""+p.size);
    var r = Math.max(0, Math.min(255, p.r));
    var g = Math.max(0, Math.min(255, p.g));
    var b = Math.max(0, Math.min(255, p.b));
    var a = Math.max(0, Math.min(255, p.a)) / 255.0;
    elem.setAttribute("style", "stroke:none; fill:rgba("+r+","+g+","+b+","+a+");");
}
