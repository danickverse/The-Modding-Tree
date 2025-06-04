function resetSluggish(on) {
    player.subtabs.tm.mainTabs = "Challenges"

    player.tm.sluggish.points = decimalZero
    player.tm.sluggish.best = decimalZero
    player.tm.sluggish.total = decimalZero
    player.tm.sluggish.inChallenge = on

    for (let clock in player.tm.sluggish.clocks) {
        player.tm.sluggish.clocks[clock] = tmp.tm.startData().sluggish.clocks[clock]
    }
}

function updateClock(clock, diff) {
    let pclocks = player.tm.sluggish.clocks
    let tclocks = tmp.tm.sluggish.clocks
    pclocks[clock].timer += diff * tclocks[clock].speed
    if (pclocks[clock].timer >= 12) {
        if (clock == "clock1") {
            let x = tmp.tm.sluggish.gain.mul(Math.trunc(pclocks[clock].timer / 12))
            player.tm.sluggish.points = player.tm.sluggish.points.add(x)
            player.tm.sluggish.total = player.tm.sluggish.total.add(x)
            player.tm.sluggish.best = player.tm.sluggish.best.max(player.tm.sluggish.points)
        } else {
            let prevClock = "clock" + (clock.charAt(5) - 1)
            let x = pclocks[clock].clockPower.mul(Math.trunc(pclocks[clock].timer / 12))
            pclocks[prevClock].clockPower = pclocks[prevClock].clockPower.add(x)
        }
        pclocks[clock].timer %= 12
    }
}

function setupDropdowns(clock) {
    var clockSel = document.getElementById(clock + "Menu");
    changeDropdowns()

    clockSel.onchange = changeDropdowns

    function changeDropdowns() {
        let x = clockSel.value
        let prodText = document.getElementById(clock + "Prod")
        let speedText = document.getElementById(clock + "Speed")
        let bonusText = document.getElementById(clock + "Bonus")
        if (x == "production") {
            // set focus to production
            player.tm.sluggish.clocks[clock].focus = "p"
            prodText.style.fontWeight = "bold"
            prodText.style.color = "purple"
            speedText.style.fontWeight = "normal"
            speedText.style.color = "#dfdfdf"
            bonusText.style.fontWeight = "normal"
            bonusText.style.color = "#dfdfdf"
        } else if (x == "speed") {
            // set focus to speed
            prodText.style.fontWeight = "normal"
            player.tm.sluggish.clocks[clock].focus = "s"
            prodText.style.color = "#dfdfdf"
            speedText.style.fontWeight = "bold"
            speedText.style.color = "purple"
            bonusText.style.fontWeight = "normal"
            bonusText.style.color = "#dfdfdf"
        } else if (x == "bonus") {
            // set focus to bonus
            player.tm.sluggish.clocks[clock].focus = "b"
            prodText.style.fontWeight = "normal"
            prodText.style.color = "#dfdfdf"
            speedText.style.fontWeight = "normal"
            speedText.style.color = "#dfdfdf"
            bonusText.style.fontWeight = "bold"
            bonusText.style.color = "purple"
        }
    }
}

function updateClockStatDisplay(clock) {
    document.getElementById(clock + "ProdEff").textContent = "peffect"
    document.getElementById(clock + "ProdVal").textContent = format(player.tm.sluggish.clocks[clock].prod, 1)
    document.getElementById(clock + "SpeedEff").textContent = "seffect"
    document.getElementById(clock + "SpeedVal").textContent = format(player.tm.sluggish.clocks[clock].speed, 1)
    document.getElementById(clock + "BonusEff").textContent = "beffect"
    document.getElementById(clock + "BonusVal").textContent = format(player.tm.sluggish.clocks[clock].bonus, 1)
}

function setupClock(clock) {
    const canvas = document.getElementById(clock);
    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;
    if (!player.tm.sluggish.clockMade) {
        setupDropdowns(clock)
        ctx.translate(radius, radius);
        radius = radius * 0.90
    }
    drawClock();

    function drawClock() {
        drawFace(ctx, radius);
        drawNumbers(ctx, radius, clock)
        drawTime(ctx, radius, clock)
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
        ctx.beginPath();
        ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
    }

    function drawNumbers(ctx, radius, clock) {
        ctx.font = radius * 0.15 + "px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        // let increment = 1;
        // let max = -1;
        // switch (clock) {
        //     case "secondClock": max = 60; increment = 5; break;
        //     case "minuteClock": max = 60; increment = 5; break;
        //     case "hourClock": max = 24; increment = 2; break;
        //     case "dayClock": max = 30; increment = 3; break;
        //     default: throw Error(`Invalid clock: ${clock}`)
        // }
        // for (let num = increment; num <= max; num += increment){
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

    function drawTime(ctx, radius, clock) {
        // const now = new Date();
        // let second = now.getSeconds() * Math.PI / 30;
        // let minute = now.getMinutes() * Math.PI / 30 + second / 60;
        // let hour = now.getHours() * Math.PI / 12 + minute / 24;
        // let day = 29 * Math.PI / 15 + hour / 24
        // switch (clock) {
        //     case "secondClock": 
        //         //second = (second * Math.PI / 30)
        //         drawHand(ctx, second, radius * 0.6, radius * 0.02)
        //         break;
        //     case "minuteClock":
        //         //minute = (minute * Math.PI/30) + (second*Math.PI/(30*60))
        //         drawHand(ctx, minute, radius * 0.6, radius * 0.04)
        //         break;
        //     case "hourClock":
        //         //hour = (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60));
        //         drawHand(ctx, hour, radius*0.6, radius*0.06);
        //         break;
        //     case "dayClock":
        //         drawHand(ctx, day, radius*0.6, radius * 0.08)
        //         break;
        //     default: throw Error(`Invalid clock: ${clock}`)
        // }
        drawHand(ctx, player.tm.sluggish.clocks[clock].timer * Math.PI / 6, radius * 0.6, radius * 0.08)
    }

    function drawHand(ctx, pos, length, width) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0,0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
    }
}

function sluggishDisplay() {
    let ret = ``
    let rowsOfClocks = 2
    for (let i = 0; i < rowsOfClocks; i++) {
        // let firstClockNum = 3 * i + 1
        // let secondClockNum = 3 * i + 2
        // let thirdClockNum = 3 * i + 3
        // ret += `<div class = "clockCanvasContainer">
        //             <div class="clockDiv">
        //                 1st Clock, A0
        //                 <canvas id="clock${firstClockNum}" width="200" height="200"></canvas>
        //                 <span height="100">
        //                     Selected: <select name="selected" id="clock1Menu">
        //                         <option value="production" selected="selected">Production</option>
        //                         <option value="speed">Speed</option>
        //                         <option value="bonus">Bonus</option>
        //                     </select><br>
        //                     <br><span id="clock${firstClockNum}Prod">Production</span>: ... (...)
        //                     <br><span id="clock${firstClockNum}Speed">Speed</span>: ... (...)
        //                     <br><span id="clock${firstClockNum}Bonus">Bonus</span>: ... (...)
        //                 </span>
        //             </div>
        //             <div class="clockDiv">
        //                 <canvas id="clock2" width="200" height="200"></canvas>
        //             </div>
        //             <div class="clockDiv">
        //                 <canvas id="clock3" width="200" height="200"></canvas>
        //             </div>
        //         </div><br>`
        
        ret += `<div class = "clockCanvasContainer">`
        for (let j = 3 * i + 1; j <= 3 * i + 3; j++) {
            if (!tmp.tm.sluggish.clocks["clock" + j].unlocked) break

            let clockNumText;
            switch (j) {
                case 1: clockNumText = "1st"; break;
                case 2: clockNumText = "2nd"; break;
                case 3: clockNumText = "3rd"; break;
                default: clockNumText = j + "th"
            }
            ret += `<div class="clockDiv">
                        ${clockNumText} Clock, A0
                        <canvas id="clock${j}" width="200" height="200"></canvas>
                        <span height="100">
                            Selected: <select name="selected" id="clock${j}Menu">
                                <option value="production" selected="selected">Production</option>
                                <option value="speed">Speed</option>
                                <option value="bonus">Bonus</option>
                            </select><br>
                            <br><span id="clock${j}Prod">Prod</span>: <span id = "clock${j}ProdEff">...</span> (<span id="clock${j}ProdVal">...</span>)
                            <br><span id="clock${j}Speed">Speed</span>: <span id = "clock${j}SpeedEff">...</span> (<span id="clock${j}SpeedVal">...</span>)
                            <br><span id="clock${j}Bonus">Bonus</span>: <span id = "clock${j}BonusEff">...</span> (<span id="clock${j}BonusVal">...</span>)
                        </span>
                    </div>`
        }
        ret += `</div>`
    }
    return ret
}