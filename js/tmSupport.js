let interpolatedClockButtonColors = 
    ['rgb(51, 51, 51)', 'rgb(62, 48, 48)', 'rgb(72, 46, 46)', 
    'rgb(83, 43, 43)', 'rgb(94, 40, 40)', 'rgb(105, 38, 38)', 
    'rgb(115, 35, 35)', 'rgb(126, 32, 32)', 'rgb(137, 30, 30)', 
    'rgb(148, 27, 27)', 'rgb(158, 24, 24)', 'rgb(169, 21, 21)', 
    'rgb(180, 19, 19)', 'rgb(191, 16, 16)', 'rgb(201, 13, 13)', 
    'rgb(212, 11, 11)', 'rgb(223, 8, 8)', 'rgb(234, 5, 5)', 
    'rgb(244, 3, 3)', 'rgb(255, 0, 0)',
    'rgba(145, 116, 116, 1)'] // final step --> broken down, designated with distinct color

/* Array was given by the following code 
    with the call interpolateColors("rgb(51, 51, 51)", "rgb(255, 0, 0)", 20):
    
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

function interpolateColors(color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++) {
        let arr = interpolateColor(color1, color2, stepFactor * i);
        interpolatedColorArray.push(`rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`);
    }

    return interpolatedColorArray;
}
*/

function resetSluggish(on, layer, max) {
    player.subtabs.tm.mainTabs = "Challenges"

    // Reset sluggish data regardless of "on"
    player.tm.sluggish.points = decimalZero
    player.tm.sluggish.best = decimalZero
    player.tm.sluggish.total = decimalZero
    player.tm.upgrades = []
    player.tm.upgradeMenu = "Temporal Energy"

    // If on, then enter challenge and set sluggish layer. Else, exit
    player.tm.sluggish.inChallenge = on
    player.tm.sluggish.layer = on ? layer : 0

    player.tm.sluggish.clocks = tmp.tm.startData().sluggish.clocks

    if (on) {
        player.tm.sluggish.maxPoints = max
        doPopup("tm", "Sluggish Entered", "A clock has appeared...", 3, tmp.tm.color)
        switch (layer) {
            // higher layers come at the top to ensure that lower layers are also on
            case 2:
            case 1:
                investmentReset(true, true)
                respecExpansionUpgrades(["PE", "SE"])
                let keptEUpgrades = player.e.upgrades
                player.highestPointsEver = decimalZero
                layerDataReset("e")
                player.e.upgrades = keptEUpgrades
                player.p.upgrades = [25]
                updateTempData(layers.e, tmp.e, funcs.e)
                break
            default: throw Error(`Invalid sluggish layer: ${layer}`)
        }
    } else {
        player.tm.sluggish.maxPoints = decimalZero
        doPopup("tm", "The clocks have disappeared...", "Sluggish Exited", 3, tmp.tm.color)
    }
}

/*

BREAKDOWN:
RED BUTTON ON CENTER OF CLOCK --> CLICK 5 TIMES TO TURN BACK ON
WHEN FIXED, GAIN 1 BREAKDOWN POINT AND THEN RANDOM BONUS TO 1 OF THE FOLLOWING: 
    1. STAT POINT GAIN
    2. ADDITIONAL BONUS (I.E CLOCK BONUS)
    3. GLOBAL CLOCK SPEED (I.E BOOST ALL CLOCKS BY SAME VALUE)


*/


function updateClock(clock, diff) {
    let pclocks = player.tm.sluggish.clocks
    let tclocks = tmp.tm.sluggish.clocks
    let prevTime = pclocks[clock].timer
    pclocks[clock].timer += diff * tclocks[clock].speed

    if (prevTime < Math.trunc(pclocks[clock].timer)) {
        let statsGenerated = Math.trunc(pclocks[clock].timer) - Math.trunc(prevTime)
        let focus = pclocks[clock].focus
        pclocks[clock][focus] = pclocks[clock][focus].add(statsGenerated)
    }

    if (pclocks[clock].timer >= 12) {
        if (clock == "clock1") {
            let x = tmp.tm.sluggish.gain.mul(Math.trunc(pclocks[clock].timer / 12))
            player.tm.sluggish.points = player.tm.sluggish.points.add(x)
            player.tm.sluggish.total = player.tm.sluggish.total.add(x)
            player.tm.sluggish.best = player.tm.sluggish.best.max(player.tm.sluggish.points)
        } else {
            let x = tmp.tm.sluggish.clocks[clock].prod.mul(pclocks[clock].cenergy).mul(Math.trunc(pclocks[clock].timer / 12))
            
            let prevClock = "clock" + (clock.charAt(5) - 1)
            pclocks[prevClock].cenergy = pclocks[prevClock].cenergy.add(x)
        }
        pclocks[clock].timer %= 12
    }
}

function setupDropdowns(clock) {
    var clockSel = document.getElementById(clock + "Menu");
    clockSel.value = player.tm.sluggish.clocks[clock].focus
    changeDropdowns()

    clockSel.onchange = changeDropdowns

    function changeDropdowns() {
        let x = clockSel.value
        let prodText = document.getElementById(clock + "Prod")
        let speedText = document.getElementById(clock + "Speed")
        let bonusText = document.getElementById(clock + "Bonus")
        if (x == "prod") {
            // set focus to production
            player.tm.sluggish.clocks[clock].focus = "prod"
            prodText.style.fontWeight = "bold"
            prodText.style.color = "purple"
            speedText.style.fontWeight = "normal"
            speedText.style.color = "#dfdfdf"
            bonusText.style.fontWeight = "normal"
            bonusText.style.color = "#dfdfdf"
        } else if (x == "speed") {
            // set focus to speed
            prodText.style.fontWeight = "normal"
            player.tm.sluggish.clocks[clock].focus = "speed"
            prodText.style.color = "#dfdfdf"
            speedText.style.fontWeight = "bold"
            speedText.style.color = "purple"
            bonusText.style.fontWeight = "normal"
            bonusText.style.color = "#dfdfdf"
        } else if (x == "bonus") {
            // set focus to bonus
            player.tm.sluggish.clocks[clock].focus = "bonus"
            prodText.style.fontWeight = "normal"
            prodText.style.color = "#dfdfdf"
            speedText.style.fontWeight = "normal"
            speedText.style.color = "#dfdfdf"
            bonusText.style.fontWeight = "bold"
            bonusText.style.color = "purple"
        }
    }
}

function setupClockButton(clock, radius, canvas) {
    function getMousePos(event) {
        var bound = canvas.getBoundingClientRect();
        return {
            x: event.clientX - bound.left,
            y: event.clientY - bound.top,
        };
    }
    
    function isInside(pos, button) {
        return ((pos.x - button.x) ** 2 + (pos.y - button.y) ** 2) <= button.r ** 2
    }

    var button = {
        x: radius,
        y: radius,
        r: radius * .9 * .1
    };

    // Binding the click event on the canvas
    canvas.addEventListener('click', function(event) {
        var mousePos = getMousePos(event);

        if (isInside(mousePos, button)) {
            console.log('clicked inside button');
            player.tm.sluggish.clocks[clock].breakdownStep += 1
            player.tm.sluggish.clocks[clock].breakdownStep %= 21
        } else {
            console.log('clicked outside button');
        }
    }, false);
}

function setupWindupButton(radius, canvas, ctx) {
    function getMousePos(event) {
        var bound = canvas.getBoundingClientRect();
        return {
            x: event.clientX - bound.left,
            y: event.clientY - bound.top,
        };
    }
    
    function isInside(pos, button) {
        return ((pos.x - button.x) ** 2 + (pos.y - button.y) ** 2) <= button.r ** 2
    }

    var button = {
        x: radius,
        y: radius,
        r: radius * .9 * .55
    };

    // Binding the click event on the canvas
    // click, mousedown
    canvas.addEventListener('mousemove', function(event) {
        var mousePos = getMousePos(event);
        player.tm.sluggish.windup.cursorInside = isInside(mousePos, button)
    }, false);

    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault(); // disables right-click menu on canvas
    });
}

function updateClockStatDisplay(clock) {
    let pclock = player.tm.sluggish.clocks[clock]
    let tclock = tmp.tm.sluggish.clocks[clock]
    document.getElementById(clock + "Energy").textContent = format(pclock.cenergy)
    document.getElementById(clock + "ProdEff").textContent = format(tclock.prod)
    document.getElementById(clock + "ProdVal").textContent = format(pclock.prod, 1)
    document.getElementById(clock + "SpeedEff").textContent = format(tclock.speed)
    document.getElementById(clock + "SpeedVal").textContent = format(pclock.speed, 1)
    document.getElementById(clock + "BonusEff").textContent = format(tclock.bonus)
    document.getElementById(clock + "BonusVal").textContent = format(pclock.bonus, 1)
}

function updateWindupStatDisplay() {
    document.getElementById("windupEnergy").textContent = `${format(player.tm.sluggish.windup.energy, 3)} => ${format(tmp.tm.sluggish.windup.gain, 3)} WP/s`
    document.getElementById("windupPoints").textContent = `${format(player.tm.sluggish.windup.points)}/${format(tmp.tm.sluggish.windup.cap)}`
    document.getElementById("windupEffPoints").textContent = format(tmp.tm.sluggish.windup.effects.points, 3)
    document.getElementById("windupEffClockSpeed").textContent = format(tmp.tm.sluggish.windup.effects.clockSpeed, 3)
}


// Blessed w3schools, thank you for your gifts
function setupClock(clock) {
    const canvas = document.getElementById(clock);
    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;
    if (!player.tm.sluggish.clockMade) {
        setupDropdowns(clock)
        setupClockButton(clock, radius, canvas)
        ctx.translate(radius, radius);
        radius = radius * 0.90
    }

    drawClock();

    function drawClock() {
        drawFace(ctx, radius);
        drawNumbers(ctx, radius)
        drawHand(ctx, player.tm.sluggish.clocks[clock].timer * Math.PI / 6, radius * 0.6, radius * 0.08)
    }

    function drawFace(ctx, radius) {
        const grad = ctx.createRadialGradient(0,0,radius*0.85, 0,0,radius*0.95);
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#333');
        ctx.beginPath();
        ctx.arc(0, 0, radius*.9, 0, 2*Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius*0.1;
        ctx.stroke();
    }

    function drawNumbers(ctx, radius) {
        ctx.font = radius * 0.15 + "px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = '#333';

        for (let num = 1; num < 13; num++) {
            let ang = num * Math.PI / 6;
            ctx.rotate(ang);
            ctx.translate(0, -radius * 0.75);
            ctx.rotate(-ang);
            ctx.fillText(num.toString(), 0, 0);
            ctx.rotate(ang);
            ctx.translate(0, radius * 0.75);
            ctx.rotate(-ang);
        }
    }

    function drawHand(ctx, pos, length, width) {
        let index = player.tm.sluggish.clocks[clock].breakdownStep
        ctx.fillStyle = interpolatedClockButtonColors[index];
        ctx.strokeStyle = interpolatedClockButtonColors[index];
        
        // Hand
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0,0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);

        // Center
        ctx.beginPath();
        ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
        ctx.fill();
    }
}

function setupWindup() {
    const canvas = document.getElementById("windupCanvas");
    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;
    let ballPosition = player.tm.sluggish.windup.points.div(tmp.tm.sluggish.windup.cap) * 2 * Math.PI
    if (!player.tm.sluggish.clockMade) {
        setupWindupButton(radius, canvas, ctx)
        ctx.translate(radius, radius);
        radius = radius * 0.90
    }

    drawWindupCanvas();

    function drawWindupCanvas() {
        drawActivityRegion(ctx, radius);
        drawBall(ctx, radius, ballPosition)
    }

    function drawActivityRegion(ctx, radius) {
        const gradOuter = ctx.createRadialGradient(0,0,radius*0.85, 0,0,radius*0.95);
        gradOuter.addColorStop(0, '#333');
        gradOuter.addColorStop(0.5, 'magenta');
        gradOuter.addColorStop(1, '#333');
        ctx.beginPath();
        ctx.arc(0, 0, radius*.9, 0, 2*Math.PI);
        ctx.fillStyle = '#b148b1ff';
        ctx.fill();
        ctx.strokeStyle = gradOuter;
        ctx.lineWidth = radius*0.1;
        ctx.stroke();
        const gradInner = ctx.createRadialGradient(0,0,radius*0.55, 0,0,radius*0.65);
        gradInner.addColorStop(0, '#333');
        gradInner.addColorStop(0.5, 'magenta');
        gradInner.addColorStop(1, '#333');
        ctx.beginPath();
        ctx.arc(0, 0, radius*.6, 0, 2*Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = gradInner;
        ctx.lineWidth = radius*0.1;
        ctx.stroke();
    }

    function drawBall(ctx, radius, pos) {
        // pos is a value between 0 and 2*PI
        let pathStart = -radius*.75
        let x = -Math.sin(pos) * pathStart
        let y = Math.cos(pos) * pathStart
        ctx.beginPath();
        ctx.arc(x,y,radius*.1,0,2*Math.PI);
        ctx.fillStyle = '#fa4';
        ctx.fill();
        ctx.strokeStyle = player.tm.sluggish.windup.points.lt(tmp.tm.sluggish.windup.cap) 
            ? "black" : "red";
        ctx.lineWidth = radius*0.01;
        ctx.stroke();
    }
}

function updateWindupPoints(diff) {
    let windup = player.tm.sluggish.windup
    let tWindup = tmp.tm.sluggish.windup

    if (windup.cursorInside) {
        windup.energy = windup.energy.add(tWindup.energyGain * diff).min(1)
    } else {
        windup.energy = windup.energy.sub(tWindup.energyLoss * diff).max(0)
    }

    let windupGain = tWindup.gain.mul(diff)
    windup.points = windup.points.add(windupGain).min(tWindup.cap).max(0)

    // if (windup.energy.eq(0)) {
    //     let lossRate = tWindup.pointLossRate
    //     windup.points = getLogisticAmount(windup.points, decimalZero, lossRate, diff)
    //                         .min(tWindup.cap)
    // } else {
    //     let windupGain = tWindup.gain.mul(diff)
    //     windup.points = windup.points.add(windupGain).min(tWindup.cap).max(0)
    // }

        // if (windup.cursorInside) {
    //     let windupGain = tmp.tm.sluggish.windup.gain.mul(diff)
    //     windup.points = windup.points.add(windupGain).min(tmp.tm.sluggish.windup.cap)
    // } else {
    //     let lossRate = tmp.tm.sluggish.windup.lossRate
    //     windup.points = getLogisticAmount(windup.points, decimalZero, lossRate, diff)
    //                         .min(tmp.tm.sluggish.windup.cap)
    // }
}

function sluggishClocksDisplay() {
    let ret = ``
    let rowsOfClocks = 2

    if (tmp.tm.sluggish.windup.unlocked) {
        ret += `<div class = "windupContainer">
                    <div class = "windupDiv">
                        <canvas id="windupCanvas" width="150" height="150"></canvas>
                    </div>
                    <div>
                        Energy:&ensp;<span id="windupEnergy">...</span><br>
                        Windup Points:&ensp;<span id="windupPoints">...</span><br>
                        ----------------------------<br>
                        Points: ^<span id="windupEffPoints">...</span><br>
                        Clock Speed: x<span id="windupEffClockSpeed">...</span>
                    </div>
                </div><br>`
    }

    for (let i = 0; i < rowsOfClocks; i++) {
        ret += `<div class = "clockCanvasContainer">`
        for (let j = 3 * i + 1; j <= 3 * i + 3; j++) {
            let clock = "clock" + j
            if (!tmp.tm.sluggish.clocks[clock].unlocked) break

            let clockNumText;
            switch (j) {
                case 1: clockNumText = "1st"; break;
                case 2: clockNumText = "2nd"; break;
                case 3: clockNumText = "3rd"; break;
                default: clockNumText = j + "th"
            }

            ret += `<div class="clockDiv" background-color="${colors[options.theme || "default"]["background"]}">
                        ${clockNumText} Clock, A0
                        <br><span id="${clock}Energy">...</span> Clock Energy
                        <canvas id="${clock}" width="200" height="200"></canvas>
                        <span height="100">
                            Selected: <select name="selected" id="${clock}Menu">
                                <option value="prod">Production</option>
                                <option value="speed">Speed</option>
                                <option value="bonus">Bonus</option>
                            </select><br>
                            <br><span id="${clock}Prod">Prod</span>: <span id = "${clock}ProdEff">...</span> (<span id="${clock}ProdVal">...</span>)
                            <br><span id="${clock}Speed">Speed</span>: <span id = "${clock}SpeedEff">...</span> (<span id="${clock}SpeedVal">...</span>)
                            <br><span id="${clock}Bonus">Bonus</span>: <span id = "${clock}BonusEff">...</span> (<span id="${clock}BonusVal">...</span>)
                        </span>
                    </div>`
        }
        ret += `</div>`
    }
    return ret + `</span>`
}

function inSluggishLayer(challNumber) {
    return player.tm.sluggish.layer >= challNumber
}

function availableTMUpgrades() {
    let ret = []
    if (true) ret.push("Breakdown")
    switch (player.tm.sluggish.layer) {
        case 7:
        case 6:
        case 5:
        case 4:
        case 3:
        case 2:
        case 1: ret.push("Expansion", "Point/Penny")
        default: ret.push("Temporal Energy")
    }
    return ret.toReversed()
}

function displayTMUpgrades() {
    if (player.tm.upgradeMenu == "Breakdown") {
        if (!tmp.tm.sluggish.breakdown.unlocked) return ["display-text", "Enter Sluggish at layer 2 or higher to unlock the Breakdown feature!"]
        
        let upgrades = [
            ["11", "12", "13"],
            ["21", "22", "23", "24", "25"],

        ]
        return ["column", 
            [
                ["display-text", `You have ${0} Breakdown points`],
                "blank",
                ["upgrade-tree", upgrades]
            ]
        ]
    }

    let hundreds;
    switch (player.tm.upgradeMenu) {
        case "Temporal Energy": hundreds = 1; break;
        case "Point/Penny": hundreds = 2; break;
        case "Expansion": hundreds = 3; break;
    }
    hundreds *= 10
    return ["upgrades", [hundreds + 1, hundreds + 2, hundreds + 3, hundreds + 4, hundreds + 5]]
}