var SVG_NS = 'http://www.w3.org/2000/svg';
var GRAVITY = 2.0;
var PIXELS_PER_METER = 10;
var MOTOR_EFFECT = 3.0 * GRAVITY;
var MOTOR_TURN_EFFECT = 10.0;
var MOTOR_VARIATION = 0.2;
var FUEL_USE_SPEED = 5.0;
var MAX_LANDING_SPEED = 5.0; // m/s
var CENTER_OF_MASS_Y = 80;

var running = false, crashing = false;
// Game state:
var posX, posY, speedX, speedY;
var angle, angularSpeed;
var fuelLeft, motorPowerL, motorPowerR;
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
    posX = 0; posY = 40;
    speedX = 1.0; speedY = 1.0;
    angle = 0; angularSpeed = 0;
    fuelLeft = 50;
    motorPowerL = 0; motorPowerR = 0;
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
    "motorV": function (x) {
        motorPowerL = Math.max(0, Math.min(100, Sk.ffi.remapToJs(x)));
    },
    "motorH": function (x) {
        motorPowerR = Math.max(0, Math.min(100, Sk.ffi.remapToJs(x)));
    },
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
    var rad = angle / 180 * Math.PI;
    var sin = Math.sin(rad), cos = Math.cos(rad);

    if (running) {
        speedY += dt * GRAVITY;
        posX += dt * speedX;
        posY -= dt * speedY;
        angle += dt * angularSpeed;
    }
    if (crashing) {
        rocketSize = Math.max(0, rocketSize - 3.0*dt);
    }
    var motorEfficiencyL = Math.max(0, gaussian(1.0, MOTOR_VARIATION));
    var motorEfficiencyR = Math.max(0, gaussian(1.0, MOTOR_VARIATION));
    var motorFractionL = motorPowerL/100.0;
    var motorFractionR = motorPowerR/100.0;

    var fuelSpendingL = dt * (motorFractionL * motorEfficiencyL) * FUEL_USE_SPEED;
    var fuelSpendingR = dt * (motorFractionR * motorEfficiencyR) * FUEL_USE_SPEED;
    var totalSpending = fuelSpendingL + fuelSpendingR;
    var motorImpulseL=0, motorImpulseR=0;
    if (totalSpending > 0) {
        var oldFuel = fuelLeft;
        fuelLeft = Math.max(0, fuelLeft - totalSpending);
        var spentL = (oldFuel-fuelLeft) * fuelSpendingL / totalSpending;
        var spentR = (oldFuel-fuelLeft) * fuelSpendingR / totalSpending;
        motorImpulseL = spentL / FUEL_USE_SPEED * MOTOR_EFFECT;
        motorImpulseR = spentR / FUEL_USE_SPEED * MOTOR_EFFECT;
    }
    speedX += sin * (motorImpulseL + motorImpulseR);
    speedY -= cos * (motorImpulseL + motorImpulseR);
    angularSpeed += (motorImpulseL - motorImpulseR) * MOTOR_TURN_EFFECT;

    if (motorImpulseL > 0) {
        var vy = -100.0 + 2.0 * (Math.random()-0.5);
        var vx = Math.random()-0.5;
        var vz = Math.random()-0.5;
        var sz = Math.sqrt(motorFractionL);
        var partPos = pointOnRocket(-40, 0);
        var partVelo = pointOnRocket(7.0*vx, vy);
        var px = partPos.x + posX * PIXELS_PER_METER;
        var py = partPos.y + posY * PIXELS_PER_METER;
        addParticle(px, py, 0,
                    speedX*PIXELS_PER_METER+partVelo.x, -speedY*PIXELS_PER_METER+partVelo.y, 7.0*vz,
                    3*sz, 1.5,
                            275,275,240,255, 0.8, 0.65, 0.5, 0.4, true);
    }
    if (motorImpulseR > 0) {
        var vy = -100.0 + 2.0 * (Math.random()-0.5);
        var vx = Math.random()-0.5;
        var vz = Math.random()-0.5;
        var sz = Math.sqrt(motorFractionR);
        var partPos = pointOnRocket(40, 0);
        var partVelo = pointOnRocket(7.0*vx, vy);
        addParticle(partPos.x + posX * PIXELS_PER_METER, partPos.y + posY * PIXELS_PER_METER, 0,
                    speedX*PIXELS_PER_METER+partVelo.x, -speedY*PIXELS_PER_METER+partVelo.y, 7.0*vz,
                    3*sz, 1.5,
                            275,275,240,255, 0.8, 0.65, 0.5, 0.4, true);
        // addParticle(partPos.x, partPos.y + posY * PIXELS_PER_METER, 0, speedX*PIXELS_PER_METER+partVelo.x, -speedY*PIXELS_PER_METER+partVelo.y, 7.0*vz, 3*sz, 1.5,
        //                     275,275,240,255, 0.8, 0.65, 0.5, 0.4, true);
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

function pointOnRocket(x,y) {
    var rad = angle / 180 * Math.PI;
    var s = Math.sin(rad), c = Math.cos(rad);
    y -= CENTER_OF_MASS_Y;
    return {x: c*x + s*y, y: c*y - s*x + CENTER_OF_MASS_Y};
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
        addParticle(posX*PIXELS_PER_METER + 0.1*vx, posY*PIXELS_PER_METER + 80 + 0.1*vy, 0, vx, vy, 0.0, sz, 0.2 * sz,
                    r,g,b,192.0, 0.7, 0.5, 0.2, 0.1, false);

    }
}

function updateDisplay() {
    var posXPixels = posX * PIXELS_PER_METER;
    var posYPixels = posY * PIXELS_PER_METER;
    var rocketTransform = "translate(" + posXPixels + "," + (posYPixels+CENTER_OF_MASS_Y) + ") rotate(" + (-angle) + ") translate(0, " + (-CENTER_OF_MASS_Y) + ")";
    rocketElem.setAttribute("transform", rocketTransform);
    shadowElem.setAttribute("transform", rocketTransform);
    rocketSizeElem.setAttribute("transform", rocketSize==1.0 ? "" : "scale(" + rocketSize + "," + rocketSize + ")");
    shadowElem.setAttribute("visibility", crashing ? "hidden" : "");
    dispH.textContent = posY.toFixed(1);
    dispV.textContent = speedY.toFixed(1);
    dispA.textContent = angle.toFixed(1);
    dispAM.textContent = angularSpeed.toFixed(1);
    dispF.textContent = fuelLeft.toFixed(1);
    dispPL.textContent = motorPowerL.toFixed(1);
    dispPR.textContent = motorPowerR.toFixed(1);
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
    return p;
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
    colorAgeParticle(p, dt);

    updateParticleUI(p);
}
function colorAgeParticle(p, dt) {
    p.r *= Math.pow(p.fr, dt)
    p.g *= Math.pow(p.fg, dt)
    p.b *= Math.pow(p.fb, dt)
    p.a *= Math.pow(p.fa, dt)
    p.done = p.a < 1/255.0;
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
