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
            best: decimalZero,
            minTickLength: 0,
            upgradeMenu: "Temporal Energy",
            sluggish: {
                points: decimalZero,
                best: decimalZero,
                total: decimalZero,
                maxPoints: decimalZero,
                inChallenge: false,
                inSluggishTab: false,
                clockMade: false,
                clocks: {
                    "clock1": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock2": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock3": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock4": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock5": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock6": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                    "clock7": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                },
                windup: {
                    points:decimalZero,
                    cursorInside: false,
                    position: 0
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
        return `which converts to ${timeDisplay(this.effect())}, and are gaining ${format(tmp.tm.perSecond)} temporal power per second`
    },
    efficiency() {
        let ret = decimalZero

        ret += buyableEffect("tm", 11)

        return ret
    },
    perSecond() {
        let ret = new Decimal(0.01)
        ret = ret.mul(buyableEffect("tm", 13))
        ret = ret.add(buyableEffect("tm", 22))

        return ret.min(.2)
    },
    stoTimeLimit() {
        let ret = new Decimal(500)
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
            globalClockSpeedMult() {
                let ret = decimalOne
                if (hasUpg("tm", 212)) ret = ret.mul(upgEff("tm", 212))
                return ret
            },
            clock1: {
                unlocked() { return true },
                prod() { 
                    return player.tm.sluggish.clocks["clock1"].prod.div(12).add(1).root(1/2) 
                },
                speed() { 
                    let base = 1/10
                    let pointEff = player.tm.sluggish.clocks["clock1"].speed.div(24).add(2).log(2)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock1"].bonus.add(1).log2().div(10).add(1)
                }
            },
            clock2: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock2"].prod.div(12).add(1).root(1/3).div(10**2)
                },
                speed() { 
                    let base = 1/22
                    let pointEff = player.tm.sluggish.clocks["clock2"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock2"].bonus.add(1).log2().div(9).add(1)
                }
            },
            clock3: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock3"].prod.div(12).add(1).root(1/4).div(10**4)
                },
                speed() { 
                    let base = 1/48
                    let pointEff = player.tm.sluggish.clocks["clock3"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock3"].bonus.add(1).log2().div(8).add(1)
                }
            },
            clock4: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock4"].prod.div(12).add(1).root(1/5).div(10**6)
                },
                speed() { 
                    let base = 1/111
                    let pointEff = player.tm.sluggish.clocks["clock4"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock4"].bonus.add(1).log2().div(7).add(1)
                }
            },
            clock5: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock5"].prod.div(12).add(1).root(1/6).div(10**8)
                },
                speed() { 
                    let base = 1/250
                    let pointEff = player.tm.sluggish.clocks["clock5"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock5"].bonus.add(1).log2().div(6).add(1)
                }
            },
            clock6: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock6"].prod.div(12).add(1).root(1/7).div(10**10)
                },
                speed() { 
                    let base = 1/666
                    let pointEff = player.tm.sluggish.clocks["clock6"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock6"].bonus.add(1).log2().div(5).add(1)
                }
            },
            clock7: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock7"].prod.div(12).add(1).root(1/8).div(10**12)
                },
                speed() { 
                    let base = 1/1000
                    let pointEff = player.tm.sluggish.clocks["clock7"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock7"].bonus.add(1).log2().div(4).add(1)
                }
            }
        },
        windup: {
            unlocked() {
                return hasUpg("tm", 214)
            },
            gain() {
                let ret = new Decimal(0.01)
                return ret
            },
            cap() {
                let ret = decimalZero
                if (hasUpg("tm", 214)) ret = ret.add(upgEff("tm", 214))

                return ret
            }
        },
        breakdown: {
            unlocked() {
                return inSluggishLayer(2)
            }
        }
    },
    update(diff) {
        if (player.tm.isWarping || !player.tm.unlocked) return

        if (player.offTime !== undefined) {
            let gain = tmp.tm.perSecond.mul(3).mul(diff)
            player.tm.points = player.tm.points.add(gain).min(this.stoTimeLimit())
            player.tm.best = player.tm.best.max(player.tm.points)
            return
        }
        
        player.tm.points = player.tm.points.add(tmp.tm.perSecond.mul(diff)).min(this.stoTimeLimit())
        player.tm.best = player.tm.best.max(player.tm.points)

        if (player.tm.sluggish.inChallenge) {
            player.tm.sluggish.inSluggishTab = player.tab == "tm" 
                && player.subtabs.tm.mainTabs == "Sluggish"
                && player.subtabs.tm.sluggish == "Clocks"
            
            for (let clock in tmp.tm.sluggish.clocks) {
                if (!tmp.tm.sluggish.clocks[clock].unlocked) continue
                updateClock(clock, diff)
                if (!player.tm.sluggish.inSluggishTab) continue

                if (tmp.tm.sluggish.windup.unlocked) {
                    setupWindup()
                        if (player.tm.sluggish.windup.cursorInside) {
                            player.tm.sluggish.windup.position += 2*Math.PI/500
                            player.tm.sluggish.windup.position %= 2*Math.PI
                            let windupGain = tmp.tm.sluggish.windup.gain.mul(diff)
                            player.tm.sluggish.windup.points = player.tm.sluggish.windup.points.add(windupGain)
                        } else {
                            player.tm.sluggish.windup.points = getLogisticAmount(player.tm.sluggish.windup.points, decimalZero, .05, diff)
                        }
                    updateWindupStatDisplay()
                }
                updateClockStatDisplay(clock)
                setupClock(clock)
            }
            player.tm.sluggish.clockMade = player.tm.sluggish.inSluggishTab
        }
    },
    buyables: {
        11: {
            title: "Time Machine A",
            cost(x) {
                if (x.eq(0)) return 1e8
                else if (x.eq(1)) return 1e13
                else return x.pow(1.5).add(1).pow_base(1e4)
            },
            maxLevels() { return 25 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        x / 100`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        If x >= 2, 1e4<sup>x^1.5 + 1</sup> `
                    return effForm + "<br><br>" + costForm
                }

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
                return x.pow(.8).div(100).toNumber()
            },
            canAfford() {
                return player.p.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        12: {
            title: "Time Machine B",
            cost(x) {
                return x.pow_base(1.03).mul(300)
            },
            maxLevels() { return 100 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        x<sup>1.02</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        300 * 1.03<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

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
                return player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        13: {
            title: "Time Machine C",
            cost(x) {
                return x.pow_base(1.1).mul(20)
            },
            maxLevels() { return 25 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Completions / 100)<sup>x</sup>
                        (Caps at 12 Completions)`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        20 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Temporal Power gain by ${format(this.effect())}x (based on Sluggish Challenge completions)` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow_base(sumValues(player.tm.challenges).div(100).add(1))
            },
            canAfford() {
                return player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        21: {
            title: "Temporal Powers A",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            maxLevels() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Temporal Power / 1000)<sup>.03x</sup>
                        ${format(player.tm.points.div(1000).add(1))}<sup>.03x</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x (based on Temporal Power)`
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                let exp = x.mul(.03)
                return player.tm.points.div(1000).add(1).pow(exp)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) && player.tm.challenges[12] == 0
        },
        22: {
            title: "Temporal Powers B",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            maxLevels() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        .001x`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Increase Temporal Power gain (after boosts) by ${this.effect().toFixed(3)}`
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.mul(.001)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) && player.tm.challenges[12] == 0
        },
        23: {
            title: "Temporal Powers C",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            maxLevels() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        1 + .04x`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply offline Temporal Power gain by ${format(this.effect())}x`
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.mul(.04).add(1)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) && player.tm.challenges[12] == 0
        },
        31: {
            title: "Flux Capacitor A",
            cost(x) {
                return x.add(1).pow(3).mul(x.pow_base(5))
            },
            maxLevels() { return 10 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        Time Flux<sup>x/100</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        5<sup>x</sup> * (x + 1)<sup>3</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply the exponent for each Sluggish challenge reward by ${format(this.effect())}x` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.div(100).pow_base(timeFlux())
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => shopEffect(106) >= 1 || true
        },
        32: {
            title: "Flux Capacitor B",
            cost(x) {
                return x.pow_base(1.1).mul(x.add(1))
            },
            maxLevels() { return 100 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        [Time Played]<sup>x/1000</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        (x + 1) * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.div(1000).pow_base(player.timePlayed)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => shopEffect(106) >= 1 || true
        },
        33: {
            title: "Flux Capacitor C",
            cost(x) {
                return x.pow_base(1.1).mul(x)
            },
            maxLevels() { return 120 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        1 + x * (.01 * [Temporal Power]<sup>.2</sup>)
                        1 + x * ${format(player.tm.points.pow(.2).div(100))}`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        x * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Speck gain by ${format(this.effect())}x (based on Temporal Power)` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                let factor = player.tm.points.pow(.2).div(100)
                return x.mul(factor).add(1)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => shopEffect(106) >= 1 || true
        },
        // 33: {
        //     title: "Flux Capacitor C",
        //     display: "Specks that are auto-collected while offline are worth ",
        //     unlocked:() => shopEffect(106) >= 1
        // }
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
    upgrades: {
        11: {
            title: "Work = More Power",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            branches: [21, 22]
        },
        12: {
            title: "Work = Work",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            branches: [22, 23, 24]
        },
        13: {
            title: "Nerfed Nerfs",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            branches: [24, 25]
        },
        21: {
            title: "A",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 11) }
        },
        22: {
            title: "B",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 11) && hasUpg("tm", 12) }
        },
        23: {
            title: "C",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 12)}
        },
        24: {
            title: "D",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 12) && hasUpg("tm", 13) }
        },
        25: {
            title: "E",
            description: "Placeholder",
            unlocked:() => tmp.tm.sluggish.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 13) }
        },
        111: {
            title: "Unsluggify",
            description: "Multiply penny gain by log10(Temporal Energy + 10)",
            cost: 10,
            effect:() => player.tm.sluggish.points.add(10).log10(),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        112: {
            title: "Lightspeed",
            description: "Multiply point gain by log10(Temporal Energy + 10)<sup>2</sup>",
            cost: 10,
            effect:() => player.tm.sluggish.points.add(10).log10().pow(2),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        113: {
            title: "Back Up to Speed",
            description: "Raise point gain to the power of 1 + log10(log10(Temporal Energy + 10))",
            cost: 50,
            effect:() => player.tm.sluggish.points.add(10).log10().log10().add(1),
            effectDisplay() { return `^${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        211: {
            title: "Lightspeed",
            description: "Increase point/penny gain by 25%/50% per Sluggish upgrade",
            cost: 10,
            effect:() => [1 + player.tm.upgrades.length / 4, 1 + player.tm.upgrades.length / 2],
            effectDisplay() { 
                let eff = upgEff(this.layer, this.id)
                return `${format(eff[0])}x, ${format(eff[1])}x` 
            },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
        },
        212: {
            title: "Elite Traveler",
            description: "Clocks are 1% faster per Sluggish upgrade",
            cost: 1337,
            effect:() => 1 + player.tm.upgrades.length / 100,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "points",
            currencyInternalName: "points",
            currencyLocation:() => player
        },
        213: {
            title: "Synergy, my Beloved",
            description: "Multiply point gain by log10(Pennies + 10)",
            cost: 42,
            effect:() => player.p.points.add(10).log10(),
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
        },
        214: {
            title: "Rise and Grind",
            description:() => !hasUpg("tm", 214) ? "Purchase this upgrade to unlock the Windup mechanic" 
                : "Increase the Windup cap by log1000(Best Points)<sup>.25</sup>",
            cost: 100000,
            effect:() => player.best.max(1000).log(1000).pow(.25),
            effectDisplay() { return !hasUpg("tm", 214) ? "Does nothing" : `+${format(this.effect())}` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "points",
            currencyInternalName: "points",
            currencyLocation:() => player
        },
        311: {
            title: "Temporal Expansion",
            description: "Unlock the 2nd Clock!",
            cost: 1,
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e
        }
    },
    challenges: {
        11: {
            name: "Sluggish 1",
            id: 1,
            challengeDescription:() => `Raise all row 1 point/penny boosts ^0.5,
                investment rate exponent is 5x less, Tax starts 5x earlier per SL, perform a penny buyable respec, and reset Penny/Expansion`,
            goalDescription() { return format(this.requirement) + " temporal energy" },
            rewardDescription:() => `Multiply penny gain based on total time played,
                and double offline time limit (7.5m --> 15m)`,
            rewardEffect() { 
                let ret = (player.timePlayed ** 0.03) * Math.log10(player.timePlayed + 1) ** .25
                let exp = buyableEffect("tm", 31)
                return exp.pow_base(ret)
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", 11), 2) + "x"
            },
            canComplete() {
                return player.tm.sluggish.points.gte(this.requirement)
            },
            onComplete() {
                resetSluggish(on=false)
            },
            onEnter() {
                resetSluggish(on=true, layer=1, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=false)
            },
            completionLimit: 100,
            requirement: new Decimal(1e6)
        },
        12: {
            name: "Sluggish 2",
            challengeDescription:() => `Reset Storage, Time Flux is square rooted, and then divided by 1.5 per SL,
                and raise point/penny gain ^0.9 per SL after 1`,
            goalDescription() { return format(this.requirement) + " temporal energy" },
            rewardDescription:() => `Multiply Expansion gain by 1.25, unlock more Time Machine buyables
                and double offline time limit (15m --> 30m)`,
            rewardEffect() {
                return challengeCompletions("tm", this.id) == 0 ? 1 : 1.25
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", this.id), 2) + "x"
            },
            canComplete() {
                return player.tm.sluggish.points.gte(this.requirement)
            },
            onComplete() {
                resetSluggish(on=False)
            },
            onEnter() {
                resetSluggish(on=True, layer=2, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=False)
            },
            completionLimit: 100,
            requirement: new Decimal(1e9),
            unlocked:() => player.tm.challenges[11] != 0 && hasMilestone("s", 1)
        }
        // 13: `Perform a Dollar reset, and Global Speed is divided by 2 per Sluggish challenge layer`
        // `Increase the base conversion rate by 1% per Sluggish challenge completed,
        //      and double offline time limit (30 --> 60m)`
        // 14: Unlocked in specks shop
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
                "blank",
                ["buyables", [1, 2, 3]]
            ]
        },
        "Challenges": {
            content: [
                ["display-text", () => 
                    `You are currently in Sluggish Layer (SL) <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${formatWhole(player.tm.sluggish.layer)}</h2>`
                ], 
                "blank",
                ["display-text", function() { 
                    let x = Object.values(player.tm.challenges).reduce((a,b)=>a+b)
                    return `Each completed challenge increases Time Flux by 5%<br>
                        ${x} challenge completions = ${1 + 5 * x/100}x Time Flux` }
                ], "blank",
                ["display-text", "Entering a challenge grants access to the Sluggish tab, but activates nerfs from all previous challenges; Sluggish progress is reset when exiting a challenge"],
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
                ["microtabs", "sluggish"]
            ],
            unlocked:() => player.tm.sluggish.inChallenge
        },
        "Info": {
            content: [
                ["microtabs", "information"]
            ]
        }
    },
    microtabs: {
        information: {
            "TM": {
                content: [
                    "blank",
                    ["display-text",   
                        `<b>NOTHING</b> in this node will update during warp calculation. <B>MOST</b> things in this node will update during
                        offline time. So, features of the Time Machine will only update while the game is open and running normally, except
                        for Temporal Power generation. Temporal Power generates 3x faster during offline time calculations.
                        <br><br>Temporal Power passively generates based on real time scaled down by a factor. Initially, this factor is
                        0.01, so for every 1 real time second, 0.01 Temporal Power are generated. Temporal Power can then be used to purchase
                        buyables for assorted boosts OR to perform a time warp, essentially running the game for an amount of time based on two
                        variables: Temporal Power and Temporal Converter efficiency.
                        <br><br>Temporal Converter efficiency <i>further</i> scales down Temporal
                        Power, then uses the resulting value to determine how long your time warp is. So, if you have 360 Temporal Power and a 
                        Temporal Converter efficiency of 10%, then your time warp would last for 36 seconds.`
                    ],
                    "blank"
                ]
            },
            "Sluggish": {
                content: [
                    "blank",
                    ["display-text", 
                        `Each clock's hand runs clockwise from 0 --> 12 (which loops back around to 0). 
                        Once a clock's hand reaches the 12th hour, it produces a certain currency.
                        The 6th Clock produces 5th Clock Clock Energy, the 5th produces 4th Clock Clock Energy, etc. down to the 1st Clock, which produces Temporal Energy.
                        The amount of currency (CE or TE) that a clock produces is directly based on its Clock Power.
                        <br><br>Everytime a clock's hand reaches another hour (1, 2, 3, etc.), 1 point is allocated to 1 of the clock's stats.
                        Each clock has exactly 3 stats: Speed, Production, and Bonus. Speed boosts the rate at which a clock's hand moves.
                        Production multiplies the currency produced by the clock.
                        Bonus provides an overall boost to Temporal Energy gain.
                        <br><br>Therefore, the total Temporal Energy gained when the 1st Clock reaches 12 is equal to:
                        <br><br>(<b>Clock Power</b> of <b>Clock 1</b>) * (<b>Production</b> of <b>Clock 1</b>) * (Product of all <b>Bonus</b>)
                        <br><br>When a Clock reaches its max speed (12 hours on the clock / second), you can perform a Clock Ascension.
                        Clock Ascensions reset the Clock's Production/Speed stats (Bonus is kept) and divide the Clock's base speed by 5,
                        but triple the stat points accumulated by the Clock and generate Ascension Points`
                    ],
                    "blank"
                ]
            }
        },
        sluggish: {
            "Clocks": {
                content: [
                    "blank",
                    ["display-text", 
                        () => sluggishClocksDisplay()
                    ],
                    "blank"
                ]
            },
            "Upgrades": {
                content: [
                    "blank",
                    ["drop-down", ["upgradeMenu", () => availableTMUpgrades()]],
                    "blank",
                    () => displayTMUpgrades(),
                    //["upgrades", () => displayTMUpgrades()],
                    "blank"
                ],
                style() {
                    return {
                        "padding-left":"20px",
                        "padding-right":"20px"
                    }
                }
            }
        }
    }
})