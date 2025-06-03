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

function setupClock(clock) {
    const canvas = document.getElementById(clock);
    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;
    if (!player.tm.sluggish.clockMade) {
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

addLayer("tm", {
    symbol: "TM",
    row: "side",
    position: 1,
    type: "none",
    color: "magenta",
    tooltip: "The Time Machine",
    resource: "temporal power",
    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            minTickLength: 0,
            sluggish: {
                points: decimalZero,
                best: decimalZero,
                total: decimalZero,
                inChallenge: false,
                clockMade: false,
                clocks: {
                    "clock1": {times: 0, timer:0, cpower:new Decimal(1), bonus:decimalOne},
                    "clock2": {times: 0, timer:0, cpower:new Decimal(2), bonus:decimalOne},
                    "clock3": {times: 0, timer:0, cpower:new Decimal(3), bonus:decimalOne},
                    "clock4": {times: 0, timer:0, cpower:new Decimal(4), bonus:decimalOne},
                    "clock5": {times: 0, timer:0, cpower:new Decimal(5), bonus:decimalOne},
                    "clock6": {times: 0, timer:0, cpower:new Decimal(6), bonus:decimalOne},
                    "clock7": {times: 0, timer:0, cpower:new Decimal(7), bonus:decimalOne}
                }
            }
        }
    },
    layerShown() {
        let visible = false
        if (player.tm.unlocked || hasAchievement("a", 31)) {
            player.tm.unlocked = true
            visible = true
        }
        return visible
    },
    effect() {
        return player.tm.points.mul(this.efficiency()).toNumber()
    },
    effectDescription() {
        return `which converts to ${timeDisplay(this.effect())}`
    },
    efficiency() {
        let ret = decimalZero

        ret += buyableEffect("tm", 11)

        return ret
    },
    stoTimeLimit() {
        let ret = new Decimal(1200)
        return ret.mul(buyableEffect("tm", 12))
    },
    sluggish: {
        gain() {
            let bonusTotal = decimalOne
            for (let clock in player.tm.sluggish.clocks) {
                bonusTotal = bonusTotal.mul(player.tm.sluggish.clocks[clock].bonus)
            }
            return player.tm.sluggish.clocks["clock1"].cpower.mul(bonusTotal)
        },
        clocks: {
            clock1: {
                unlocked() { return true },
                speed() { return 1/20 }
            },
            clock2: {
                unlocked() { return true },
                speed() { return 1/100 }
            },
            clock3: {
                unlocked() { return true },
                speed() { return 1/1000 }
            },
            clock4: {
                unlocked() { return true },
                speed() { return 1/20000 }
            },
            clock5: {
                unlocked() { return true },
                speed() { return 1/800000 }
            },
            clock6: {
                unlocked() { return true },
                speed() { return 1/64000000 }
            }
        }
    },
    update(diff) {
        if (player.offTime !== undefined || player.tm.isWarping || !player.tm.unlocked) return
        let timeFluxFactor = 1//timeFlux() ** .25
        player.tm.points = player.tm.points.add(.01 * timeFluxFactor * diff).min(this.stoTimeLimit())

        if (player.tm.sluggish.inChallenge) {
            let inSluggishTab = player.tab == "tm" && player.subtabs.tm.mainTabs == "Sluggish"
            
            for (let clock in tmp.tm.sluggish.clocks) {
                if (!tmp.tm.sluggish.clocks[clock].unlocked) continue
                updateClock(clock, diff)
                if (inSluggishTab) setupClock(clock)
            }
            player.tm.sluggish.clockMade = inSluggishTab
        }
    },
    buyables: {
        11: {
            title: "Temporal Powers A",
            cost(x) {
                if (x.eq(0)) return 1e8
                else if (x.eq(1)) return 1e13
                else return x.pow(1.5).add(1).pow_base(1e4)
            },
            maxLevels() { return 25 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Increase the Temporal Converter's efficiency by ${format(this.effect() * 100)}%` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow(.5).div(100).toNumber()
            },
            canAfford() {
                return player.p.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("tm", 11, 1)
            }
        },
        12: {
            title: "Temporal Powers B",
            cost(x) {
                return x.pow_base(1.03).mul(300)
            },
            maxLevels() { return 100 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply max Temporal Power by ${format(this.effect())}x` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow_base(1.02)
            },
            canAfford() {
                return player.tm.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", 12, 1)
            }
        },
        13: {
            title: "Temporal Powers C",
            cost(x) {
                return x.add(1).pow_base(5)
            },
            maxLevels() { return 5 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x (based on Temporal Power)` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                if (!this.unlocked()) return decimalOne
                let effX = x.lte(5) ? x : x.sub(5)
                let exp = effX.mul(.04).add(.4)
                return player.tm.points.div(10000).add(1).pow(exp)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", 13, 1)
            },
            unlocked:() => shopEffect(106) >= 1
        },
        31: {
            title: "Flux Capacitor A",

        }
    },
    clickables: {
        11: {
            title: "Time Warp",
            display() {
                return `Convert your temporal power to warp ahead ${formatTime(tmp.tm.effect)} into the future`
            },
            canClick:() => tmp.tm.effect >= 1,
            onClick() {
                console.log("MAKE MODAL AND PROPER INTERVAL FOR CONTINUOUS CHANGES")
                player.tm.isWarping = true
                let realTime = tmp.tm.effect
                let tickLength = Math.max(player.tm.minTickLength / 1000, realTime / 500)
                while (realTime > tickLength) {
                    realTime -= tickLength
                    updateTemp()
                    gameLoop(tickLength)
                }
                gameLoop(realTime)
                player.tm.points = decimalZero
                player.tm.isWarping = false
            }
        }
    },
    challenges: {
        11: {
            name: "Sluggish 1",
            challengeDescription:() => `Nullify all row 1 point/penny boosts except for Penny upgrades based on achievements,
                investment gain is 1, and perform a penny buyable respec`,
            goalDescription() { return format(this.requirement) + " temporal power" },
            rewardDescription:() => `Increase 
                and double offline time limit (7.5m --> 15m)`,
            rewardEffect() { 
                return challengeCompletions("tm", 12) == 0 ? 1 : Math.pow(timeFlux(), 0.02)
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", 12), 2) + "x"
            },
            canComplete() {
                return player.tm.sluggish.points.gte(this.requirement)
            },
            onComplete() {
                resetSluggish(on=false)
            },
            onEnter() {
                resetSluggish(on=true)
                investmentReset(true, true)
            },
            onExit() {
                resetSluggish(on=false)
            },
            completionLimit: 100,
            requirement: 1e3
        },
        12: {
            name: "Sluggish 2",
            challengeDescription:() => `Time Flux is square rooted, then divided by 2`,
            goalDescription() { return format(this.requirement) + " temporal power" },
            rewardDescription:() => `Time Flux boosts TP gain at a <i>heavily</i> reduced rate,
                and double offline time limit (15m --> 30m)`,
            rewardEffect() {
                return challengeCompletions("tm", 12) == 0 ? 1 : Math.pow(timeFlux(), 0.02)
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", 12), 2) + "x"
            },
            canComplete() {
                return player.tm.sluggish.points.gte(this.requirement)
            },
            onComplete() {
                resetSluggish(on=False)
            },
            onEnter() {
                resetSluggish(on=True)
            },
            onExit() {
                resetSluggish(on=False)
            },
            completionLimit: 100,
            requirement: 1e9,
            unlocked:() => player.tm.challenges[11] != 0 && hasMilestone("s", 1)
        }
    },
    tabFormat: {
        "Time Machine": {
            content: [
                "main-display",
                ["display-text", () => `The Temporal Converter is currently working at ${format(tmp.tm.efficiency * 100)}% efficiency`],
                "blank",
                "clickables", "blank", 
                ["row", [
                    ["display-text", "Set minimum simulated tick length (250 = 250ms):&ensp;"],
                    ["slider", ["minTickLength", 0, 250]]
                ]],
                ["buyables", [1, 2, 3]]
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                ["display-text", () => `Each completed challenge increases TP gain by 1%<br>
                    ${0} challenge completions = ${1}x TP gain`], "blank",
                ["display-text", "Entering a challenge grants access to the Sluggish tab; Sluggish progress is reset when exiting a challenge"],
                "blank",
                "challenges"
            ]
        },
        "Sluggish" : {
            content: [
                ["display-text", () => 
                    `You have <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.tm.sluggish.points)}</h2> temporal energy`
                ], "blank",
                ["display-text", () => 
                    `<div class = "clockCanvasContainer">
                        <div class="clockDiv">
                            <canvas id="clock1" width="200" height="200" style="background-color:#0f0f0f"></canvas>
                        </div>
                        <div class="clockDiv">
                            <canvas id="clock2" width="200" height="200" style="background-color:#0f0f0f"></canvas>
                        </div>
                        <div class="clockDiv">
                            <canvas id="clock3" width="200" height="200" style="background-color:#0f0f0f"></canvas>
                        </div>
                    </div><br>
                    <canvas id="clock4" width="200" height="200" style="background-color:#0f0f0f"></canvas>
                    <canvas id="clock5" width="200" height="200" style="background-color:#0f0f0f"></canvas>
                    <canvas id="clock6" width="200" height="200" style="background-color:#0f0f0f"></canvas>`
                ]
            ],
            unlocked:() => player.tm.sluggish.inChallenge
        },
        "Info": {
            content: [
                ["display-text", `<b>NOTHING</b> in this node will update during offline time or warp calculation. These features
                    only update while the game is open and running normally.
                    Each clock's hand runs clockwise from 0 --> 12 (which loops back around to 0). 
                    Everytime a clock's hand reaches the 12th hour, it produces a certain currency.
                    The 6th Clock produces 5th Clocks, the 5th produces 4th, etc. down to the 1st Clock, which produces Temporal Energy.
                    The amount of currency (clocks or TE) that a clock produces is equivalent to its Clock Power.
                    <br><br>Everytime a clock's hand reaches another hour (1, 2, 3, etc.), 1 point is allocated to 1 of the clock's stats.
                    Each clock has exactly 3 stats: Speed, Production, and Bonus. Speed boosts the rate at which a clock's hand moves.
                    Production boosts the Clock Power gained by the clock.
                    Bonus provides an overall boost to Temporal Power gain.
                    <br><br>Therefore, the total Temporal Power gained when the 1st Clock reaches 12 is equal to:
                    <br><br>(<b>Clock Power</b> of <b>Clock 1</b>) * (Product of all <b>Bonus</b>)`]
            ]
        }
    }
})