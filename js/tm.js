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
                    "clock1": {times: 0, timer:0, cenergy:new Decimal(1), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock2": {times: 0, timer:0, cenergy:new Decimal(2), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock3": {times: 0, timer:0, cenergy:new Decimal(3), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock4": {times: 0, timer:0, cenergy:new Decimal(4), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock5": {times: 0, timer:0, cenergy:new Decimal(5), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock6": {times: 0, timer:0, cenergy:new Decimal(6), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock7": {times: 0, timer:0, cenergy:new Decimal(7), focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
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
                bonusTotal = bonusTotal.mul(tmp.tm.sluggish.clocks[clock].bonus)
            }
            return player.tm.sluggish.clocks["clock1"].cenergy.mul(tmp.tm.sluggish.clocks["clock1"].prod).mul(bonusTotal)
        },
        clocks: {
            clock1: {
                unlocked() { return true },
                prod() { 
                    return player.tm.sluggish.clocks["clock1"].prod.div(12).add(1).root(1/2) 
                },
                speed() { 
                    let base = 1/20
                    return player.tm.sluggish.clocks["clock1"].speed.div(24).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock1"].bonus.add(1).log2().div(10).add(1)
                }
            },
            clock2: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock2"].prod.div(12).add(1).root(1/3) 
                },
                speed() { 
                    let base = 1/100
                    return player.tm.sluggish.clocks["clock2"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock2"].bonus.add(1).log2().div(9).add(1)
                }
            },
            clock3: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock3"].prod.div(12).add(1).root(1/4) 
                },
                speed() { 
                    let base = 1/500
                    return player.tm.sluggish.clocks["clock3"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock3"].bonus.add(1).log2().div(8).add(1)
                }
            },
            clock4: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock4"].prod.div(12).add(1).root(1/5) 
                },
                speed() { 
                    let base = 1/5000
                    return player.tm.sluggish.clocks["clock4"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock4"].bonus.add(1).log2().div(7).add(1)
                }
            },
            clock5: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock5"].prod.div(12).add(1).root(1/6) 
                },
                speed() { 
                    let base = 1/60000
                    return player.tm.sluggish.clocks["clock5"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock5"].bonus.add(1).log2().div(6).add(1)
                }
            },
            clock6: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock6"].prod.div(12).add(1).root(1/7) 
                },
                speed() { 
                    let base = 1/720000
                    return player.tm.sluggish.clocks["clock6"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock6"].bonus.add(1).log2().div(5).add(1)
                }
            },
            clock7: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock7"].prod.div(12).add(1).root(1/8) 
                },
                speed() { 
                    let base = 1/100000000
                    return player.tm.sluggish.clocks["clock7"].speed.div(120).add(2).log(2).mul(base)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock7"].bonus.add(1).log2().div(4).add(1)
                }
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
                if (inSluggishTab) {
                    updateClockStatDisplay(clock)
                    setupClock(clock)
                }
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
            id: 1,
            challengeDescription:() => `Nullify all row 1 point/penny boosts except for Penny upgrades based on achievements,
                investment gain is 1, perform a penny buyable respec, and reset Penny/Expansion`,
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
                respecExpansionUpgrades(["PE", "SE"])
                let keptEUpgrades = player.e.upgrades
                player.highestPointsEver = decimalZero
                layerDataReset("e")
                player.e.upgrades = keptEUpgrades
                player.p.upgrades = []
                updateTempData(layers.e, tmp.e, funcs.e)
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
                ["display-text", () => sluggishDisplay() ]
            ],
            unlocked:() => player.tm.sluggish.inChallenge
        },
        "Info": {
            content: [
                ["display-text", `<b>NOTHING</b> in this node will update during offline time or warp calculation. These features
                    only update while the game is open and running normally.
                    Each clock's hand runs clockwise from 0 --> 12 (which loops back around to 0). 
                    Everytime a clock's hand reaches the 12th hour, it produces a certain currency.
                    The 6th Clock produces 5th Clock Clock Energy, the 5th produces 4th Clock Clock Energy, etc. down to the 1st Clock, which produces Temporal Energy.
                    The amount of currency (CE or TE) that a clock produces is multiplied by its Clock Power.
                    <br><br>Everytime a clock's hand reaches another hour (1, 2, 3, etc.), 1 point is allocated to 1 of the clock's stats.
                    Each clock has exactly 3 stats: Speed, Production, and Bonus. Speed boosts the rate at which a clock's hand moves.
                    Production multiplies the currency produced by the clock.
                    Bonus provides an overall boost to Temporal Energy gain.
                    <br><br>Therefore, the total Temporal Energy gained when the 1st Clock reaches 12 is equal to:
                    <br><br>(<b>Clock Power</b> of <b>Clock 1</b>) * (<b>Production</b> of <b>Clock 1</b>) * (Product of all <b>Bonus</b>)
                    <br><br>When a Clock reaches its max speed (12 hours on the clock / second), you can perform a Clock Ascension.
                    Clock Ascensions reset the Clock's Production/Speed stats (Bonus is kept) and divide the Clock's base speed by 5,
                    but triple the stat points accumulated by the Clock and generate Ascension Points`]
            ]
        }
    }
})