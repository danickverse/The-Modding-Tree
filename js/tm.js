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
            minTickLength: 10,
            upgradeMenu: "Temporal Energy",
            achievementMenu: "Achievements",
            sluggish: {
                points: decimalZero,
                best: decimalZero,
                total: decimalZero,
                maxPoints: decimalZero,
                inChallenge: false,
                inSluggishTab: false,
                clockMade: false,
                shopDisplay: "Hover over a shop item for more information",
                layer: 0,
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
                    points: decimalZero,
                    cursorInside: false,
                    energy: decimalZero,
                    passiveStep: 0
                },
                achievements: {
                    points: decimalZero
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
            let ret = player.tm.sluggish.clocks["clock1"].cenergy
            ret = ret.mul(tmp.tm.sluggish.clocks["clock1"].prod)
            ret = ret.mul(tmp.tm.sluggish.bonus)
        
            return ret
        },
        bonus() {
            let ret = decimalOne
            for (let clock in player.tm.sluggish.clocks) {
                ret = ret.mul(tmp.tm.sluggish.clocks[clock].bonus)
            }
            if (hasAchievement("tm", 12)) ret = ret.mul(achievementEffect("tm", 12))
            return ret
        },
        perSecond() {
            let tSlug = tmp.tm.sluggish
            return tSlug.clocks["clock1"].speed.div(12).mul(tSlug.gain)
        },
        completions() {
            return Object.values(player.tm.challenges).reduce((a,b)=>a+b)
        },
        clocks: {
            globalClockSpeedMult() {
                let ret = decimalOne
                if (hasUpg("tm", 212)) ret = ret.mul(upgEff("tm", 212))
                if (hasUpg("tm", 114)) ret = ret.mul(upgEff("tm", 114))
                if (tmp.tm.sluggish.windup.unlocked) ret = ret.mul(tmp.tm.sluggish.windup.effects.clockSpeed)
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
                },
                breakdownRate() {
                    let rate = 1/60
                    return rate
                }
            },
            clock2: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock2"].prod.div(12).add(1).root(1/3).div(10**2)
                },
                speed() { 
                    let base = 1/50
                    let pointEff = player.tm.sluggish.clocks["clock2"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock2"].bonus.add(1).log2().div(9).add(1)
                },
                breakdownRate() {
                    let rate = 1/72
                    return rate
                }
            },
            clock3: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock3"].prod.div(12).add(1).root(1/4).div(10**4)
                },
                speed() { 
                    let base = 1/144
                    let pointEff = player.tm.sluggish.clocks["clock3"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock3"].bonus.add(1).log2().div(8).add(1)
                },
                breakdownRate() {
                    let rate = 1/90
                    return rate
                }
            },
            clock4: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock4"].prod.div(12).add(1).root(1/5).div(10**6)
                },
                speed() { 
                    let base = 1/350
                    let pointEff = player.tm.sluggish.clocks["clock4"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock4"].bonus.add(1).log2().div(7).add(1)
                },
                breakdownRate() {
                    let rate = 1/120
                    return rate
                }
            },
            clock5: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock5"].prod.div(12).add(1).root(1/6).div(10**8)
                },
                speed() { 
                    let base = 1/666
                    let pointEff = player.tm.sluggish.clocks["clock5"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock5"].bonus.add(1).log2().div(6).add(1)
                },
                breakdownRate() {
                    let rate = 1/180
                    return rate
                }
            },
            clock6: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock6"].prod.div(12).add(1).root(1/7).div(10**10)
                },
                speed() { 
                    let base = 1/1500
                    let pointEff = player.tm.sluggish.clocks["clock6"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock6"].bonus.add(1).log2().div(5).add(1)
                },
                breakdownRate() {
                    let rate = 1/270
                    return rate
                }
            },
            clock7: {
                unlocked() { return false },
                prod() { 
                    return player.tm.sluggish.clocks["clock7"].prod.div(12).add(1).root(1/8).div(10**12)
                },
                speed() { 
                    let base = 1/7500
                    let pointEff = player.tm.sluggish.clocks["clock7"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.tm.sluggish.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.tm.sluggish.clocks["clock7"].bonus.add(1).log2().div(4).add(1)
                },
                breakdownRate() {
                    let rate = 1/600
                    return rate
                }
            }
        },
        windup: {
            unlocked() {
                return hasUpg("tm", 214)
            },
            gain() {
                let ret = new Decimal(0.01)
                ret = ret.mul(player.tm.sluggish.windup.energy)
                return ret
            },
            cap() {
                let ret = decimalZero
                if (hasUpg("tm", 214)) ret = ret.add(upgEff("tm", 214))
                if (hasUpg("tm", 215)) ret = ret.add(upgEff("tm", 215))
                if (hasUpg("tm", 221)) ret = ret.add(upgEff("tm", 221))

                return ret
            },
            pointLossRate() {
                let ret = 0.04
                return ret
            },
            energyGain() {
                let ret = new Decimal(.1)
                
                //if (hasUpg("tm", 215)) ret = ret.mul(upgEff("tm", 215)[1])
                return ret
            },
            energyLoss() {
                let loss = tmp.tm.sluggish.windup.energyGain
                let passiveGain = loss.mul(player.tm.sluggish.windup.passiveStep / 20).neg()
                let ret = loss.add(passiveGain)
                return ret
            },
            energyCap() {
                let ret = decimalOne
                if (hasUpg("tm", 115)) ret = ret.add(upgEff("tm", 115))
                
                return ret
            },
            energyMin() {
                let ret = tmp.tm.sluggish.windup.energyCap.neg().mul(2)
                if (hasUpg("tm", 115)) ret = ret.add(upgEff("tm", 115))

                return ret
            },
            effects: {
                points() {
                    return player.tm.sluggish.windup.points.div(20).add(1)
                },
                clockSpeed() {
                    return player.tm.sluggish.windup.points.add(1).root(5)
                }
            }
        },
        breakdown: {
            unlocked() {
                return inSluggishLayer(2) && hasAchievement("tm", 13)
            }
        }
    },
    update(diff) {
        if (player.tm.isWarping || !player.tm.unlocked) return

        if (player.offTime !== undefined) {
            let gain = tmp.tm.perSecond.mul(buyableEffect("tm", 23)).mul(diff)
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
                if (tmp.tm.sluggish.windup.unlocked) updateWindupPoints(diff)
                if (!player.tm.sluggish.inSluggishTab) continue

                if (tmp.tm.sluggish.windup.unlocked) {
                    setupWindup()
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
            maxLevels() { return 20 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        x / 100
                        &#8658; x %`
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
                return x.div(100).toNumber()
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
                return x.pow_base(1.1).mul(x.pow(2).pow_base(1.004)).mul(20)
            },
            maxLevels() { return 25 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Completions / 100)<sup>x</sup>
                        &#8658; ${1 + tmp.tm.sluggish.completions / 100}<sup>x</sup>
                        (Caps at 12 Completions)`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        20 * 1.1<sup>x</sup> * 1.004<sup>x^2</sup>`
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
                return x.pow_base(1 + tmp.tm.sluggish.completions / 100)
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
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Temporal Power / 1000)<sup>.04x</sup>
                        ${format(player.tm.points.div(1000).add(1))}<sup>.04x</sup>`
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
                let exp = x.mul(.04)
                return player.tm.points.div(1000).add(1).pow(exp)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
        },
        22: {
            title: "Temporal Powers B",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            maxLevels() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
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
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
        },
        23: {
            title: "Temporal Powers C",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            maxLevels() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        1 + .02x + .05 * floor(x / 5)`
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
                x = x.toNumber()
                return 1 + .02 * x + .05 * Math.floor(x / 5)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost()) && getBuyableAmount("tm", this.id).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
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
            unlocked:() => gridEffect("quests", 106) >= 1
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
            unlocked:() => gridEffect("quests", 106) >= 1
        },
        33: {
            title: "Flux Capacitor C",
            cost(x) {
                return x.pow_base(1.1).mul(x.add(1))
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
            unlocked:() => gridEffect("quests", 106) >= 1
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
    grid: {
        resource: "AP",
        rows:() => shopRowsAvailable(this.layer), // If these are dynamic make sure to have a max value as well!
        maxRows: 5,
        cols: 6,
        getStartData(id) {
            if (id === undefined) return 
            return 0
        },
        // getUnlocked(id) { // Default
        //     return true
        // },
        getCanClick(data, id) {
            return player.tm.sluggish.achievements.points.gte(this.getCost(data, id)) && data < getShopData(this.layer, id).maxLevels
        },
        onClick(data, id) {
            player.tm.sluggish.achievements.points = player.tm.sluggish.achievements.points.sub(this.getCost(data, id))
            player.quests.grid[id]++
            updateShopDisplay(this.layer, id)
        },
        getEffect(data, id) {
            if (data === undefined) return
            return getShopItemEffect(this.layer, id, data)
        },
        getTitle(data, id) {
            return getShopData(this.layer, id).title
        },
        getDisplay(data, id) {
            return getShopItemDisplay(this.layer, id, data)
        },
        getCost(data, id) {
            if (data === undefined) return
            return getShopItemCost(this.layer, id, data)
        },
        getUnlocked(id) {
            switch (id) {
                case 101: return true
                case 102: case 103: case 104: case 105: case 106: return false
                default: throw Error("Invalid shop ")
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
            description: "Raise point gain to the power of (1 + log10(log10(Temporal Energy + 10)))<sup>.5</sup>",
            cost: 50,
            effect:() => player.tm.sluggish.points.add(10).log10().log10().add(1).pow(.5),
            effectDisplay() { return `^${format(upgEff(this.layer, this.id))}` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        114: {
            title: "Back Up to Speed",
            description: "Multiply clock speed by 1 + log10(1 + Points) / 100",
            cost: 1000,
            effect:() => player.points.add(10).log10().div(100).add(1),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        115: {
            title: "Back Up to Speed",
            description: "Increase the Energy max and min values by 0.05 per TM achievement up to 20",
            cost: 2500,
            effect:() => Math.min(20, player.tm.achievements.length) * 0.05,
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        121: {
            title: "The Power Within",
            description: "Sluggish Time<sup>Time Flux</sup> multiplies point/penny gain at a rate of ln(X)",
            cost: 100,
            effect:() => Math.log1p(player.tm.resetTime ** timeFlux()),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.tm.sluggish.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        122: {
            title: "I Feel Badly That You Feel Badly",
            description:() => player.shiftDown ? "Caps at 100%"
                : "Every OoM of Temporal Energy adds 2% Penny generation<sup>*</sup>",
            cost: 5000,
            effect:() => player.tm.sluggish.points.add(1).log10().floor().mul(.02).toNumber(),
            effectDisplay() { return `${upgEff(this.layer, this.id) * 100}%` },
            unlocked:() => tmp.tm.upgrades[121].unlocked,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.tm.sluggish
        },
        123: {
            title: "This Is Fine.",
            description: "Increase Investment Rate Exponent by log2(SL) / 30",
            cost: 150000,
            effect:() => Math.log2(player.tm.sluggish.layer)/30,
            effectDisplay() { return `+${format(upgEff(this.layer, this.id))}` },
            unlocked:() => tmp.tm.upgrades[122].unlocked,
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
        215: {
            title: "Early Worm Gets the Bird",
            description: "Increase Windup cap by .02 per Sluggish upgrade",
            cost: 5,
            effect:() => player.tm.upgrades.length / 50,
            effectDisplay:() => `+${format(upgEff("tm", 215))}`,
            unlocked:() => hasUpg("tm", 214) || player.tm.sluggish.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "investment",
            currencyInternalName: "points",
            currencyLocation:() => player.p.investment
        },
        221: {
            title: "Prime Time",
            description:() => player.shiftDown ? "Softcap at 50 levels<br>Excess &#8658; Excess<sup>.5</sup>"
                : "Every Education I/II level<sup>*</sup> increases Windup Cap by .023",
            cost: 2005001,
            effect() {
                let x = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22))
                if (x.gt(50)) x = x.sub(50).pow(.5).add(50)
                return x.mul(.023)
            },
            effectDisplay:() => `+${format(upgEff("tm", 221))}`,
            unlocked:() => tmp.tm.upgrades[215].unlocked,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
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
    achievements: {
        11: {
            name: "1",
            done() {
                return player.tm.sluggish.clocks["clock1"].prod.gte(12)
                    && player.tm.sluggish.clocks["clock1"].speed.gte(12)
                    && player.tm.sluggish.clocks["clock1"].bonus.gte(12)
            },
            tooltip: `Gain 12 stat points in each of Production, Speed, and Bonus for the first clock
                <br><br>Multiply Point/Penny gain by 1.2x`,
            style: achTMStyle,
            effect() {
                return player.tm.sluggish.inChallenge ? 1.2 : 1
            }
        },
        12: {
            name: "2",
            done() {
                return tmp.tm.sluggish.windup.unlocked
            },
            tooltip: `Unlock the Windup feature
                <br><br>Gain 2x Temporal Energy`,
            style: achTMStyle,
            effect() {
                return player.tm.sluggish.inChallenge ? 2 : 1
            }
        },
        13: {
            name: "3",
            done() {
                return player.tm.sluggish.clocks.clock1.cenergy.gte(2)
            },
            tooltip: `Reach 2 or more Clock 1 Energy
                <br><br>Unlock the Breakdown feature if SL >= 2`,
            style: achTMStyle
        }
    },
    challenges: {
        11: {
            name: "Sluggish 1",
            id: 1,
            challengeDescription:() => `Raise all row 1 point/penny boosts ^0.5,
                investment rate exponent is 5x less, Tax starts 5x earlier per SL<sup>0.5</sup>, perform a penny buyable respec, and reset Penny/Expansion`,
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
            onEnter() {
                resetSluggish(on=true, layer=1, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=false, layer=1)
            },
            requirement: new Decimal(1e5)
        },
        12: {
            name: "Sluggish 2",
            challengeDescription:() => `Reset Storage, Time Flux is square rooted, and then divided by 1.5 per SL,
                and raise point/penny gain ^0.9 per SL after 1`,
            goalDescription() { return format(this.requirement) + " temporal energy" },
            rewardDescription:() => `Multiply Expansion gain by 1.25, unlock more Time Machine buyables
                and double offline time limit (15m --> 30m)`,
            rewardEffect() {
                // return challengeCompletions("tm", this.id) == 0 ? 1 : 1.25
                return 1.25
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", this.id), 2) + "x"
            },
            canComplete() {
                return player.tm.sluggish.points.gte(this.requirement)
            },
            onEnter() {
                resetSluggish(on=true, layer=2, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=false, layer=2)
            },
            requirement: new Decimal(1e9),
            unlocked:() => player.tm.challenges[11] != 0 && hasAchievement("a", 51)
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
                ["clickable", 11], "blank", 
                ["row", [
                    ["display-text", "Set minimum simulated tick length (250 = 250ms):&ensp;"],
                    ["slider", ["minTickLength", 10, 250]]
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
                    let x = tmp.tm.sluggish.completions
                    return `Each completed challenge increases Time Flux by 5%<br>
                        ${x} challenge completions = ${1 + 5 * x/100}x Time Flux` }
                ], "blank",
                ["display-text", "Entering a challenge grants access to the Sluggish tab, but activates nerfs including those from all previous challenges; Sluggish progress is reset when exiting a challenge"],
                "blank",
                "challenges"
            ]
        },
        "Sluggish" : {
            content: [
                ["display-text", () => 
                    `You have <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.tm.sluggish.points)}</h2> temporal energy (+${format(tmp.tm.sluggish.perSecond)}/s)<br>`
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
                    ["display-text", () => 
                        `Each clock's hand runs clockwise from 0 --> 12 (which loops back around to 0). 
                        Once a clock's hand reaches the 12th hour, it produces a certain currency.
                        The 6th Clock produces 5th Clock Clock Energy, the 5th produces 4th Clock Clock Energy, etc. down to the 1st Clock, which produces Temporal Energy.
                        The amount of currency (CE or TE) that a clock produces is directly based on its Clock Power.
                        <br><br>Everytime a clock's hand reaches another hour (1, 2, 3, etc.), 1 point is allocated to 1 of the clock's stats.
                        Each clock has exactly 3 stats: Speed, Production, and Bonus. Speed boosts the rate at which a clock's hand moves.
                        Production multiplies the currency produced by the clock.
                        Bonus provides an overall boost to Temporal Energy gain.
                        <br><br>Therefore, the total Temporal Energy gained when the 1st Clock reaches the 12th hour is based on:
                        <br><br>(<b>Clock Power</b> of <b>Clock 1</b>) * (<b>Production</b> of <b>Clock 1</b>) * (Product of all <b>Bonus</b>),
                        <br><br>which is then modified by any other factors that may be applied later on.
                        <br><br>When a Clock reaches its max speed (12 hours on the clock / second), you can perform a Clock Ascension.
                        Clock Ascensions reset the Clock's Production/Speed stats (Bonus is kept) and divide the Clock's base speed by 5,
                        but triple the stat points accumulated by the Clock and generate Ascension Points<br><br>
                        Temporal Energy per second:
                        <br><br>C1 Energy * C1 Prod * C1 Revolutions/s * Bonuses
                        <br>&#8658; ${format(player.tm.sluggish.clocks["clock1"].cenergy)} * ${format(tmp.tm.sluggish.clocks.clock1.prod)} * ${format(tmp.tm.sluggish.clocks.clock1.speed.div(12))} * ${format(tmp.tm.sluggish.bonus)}
                        <br>&#8658; +${format(tmp.tm.sluggish.perSecond)}/s`
                    ],
                    "blank"
                ]
            },
            "Windup": {
                content: [
                    "blank",
                    ["display-text", 
                        `The Windup feature is used to buff various stats across the game`
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
            },
            "Achievements": {
                content: [
                    "blank",
                    ["display-text", "TM (Sluggish) achievements/achievement upgrades (AUs) are permanently kept, but their effects only apply inside of the Sluggish challenge"],
                    "blank",
                    ["drop-down", ["achievementMenu", ["Achievements", "Achievement Upgrades"]]],
                    "blank",
                    () => displayAchTab(),
                    "blank"
                ]
            }
        }
    }
})