function lootGain(lvl, forSpellCost = false) {
    let base = new Decimal(.025)
    let lvlScaling = (lvl + 1) * (1.5 ** lvl)

    let ret = base.mul(lvlScaling)

    if (hasAchievement("a", 95)) ret = ret.mul(1.05)

    //if (player.bills.zone == 0) ret = new Decimal(.01)
    if (hasMilestone("bills", 0)) ret = ret.mul(milestoneEffect("bills", 0)[0])
    if (hasMilestone("bills", 1)) ret = ret.mul(1.1)

    if (((forSpellCost && player.bills.zone == player.bills.highestZone) || !forSpellCost) && hasUpgrade("bills", 13))
        ret = ret.mul(upgradeEffect("bills", 13))
    ret = ret.mul(tmp.quests.bars.enemyKillsBar.reward)
    if (hasMilestone("a", 10)) ret = ret.mul(player.a.achievements.length/40)
    if (hasMilestone("s", 7)) ret = ret.mul(tmp.s.stored_dollars.effects[6])

    let bossScaling = !forSpellCost && tmp.bills.isEnemyBoss ? 2.5 : 1
    ret = ret.mul(bossScaling)

    if (!forSpellCost && player.bills.skillTimers[1] >= 0) ret = ret.mul(tmp.bills.clickables[22].effect)
    if (hasUpgrade("e", 114)) ret = ret.mul(upgradeEffect("e", 114))
    if (hasMilestone("bills", 2)) ret = ret.mul(2.5)
    ret = ret.mul(tmp.banks.bars.tierBar.effect[0])
    if (hasUpgrade("banks", 12)) ret = ret.mul(upgradeEffect("banks", 12)[1])
    if (hasUpgrade("banks", 13)) ret = ret.mul(upgradeEffect("banks", 13)[1])
    if (hasUpgrade("sys", 125)) ret = ret.mul(upgradeEffect("sys", 125))

    let exp = 1
    ret = ret.pow(exp)

    // direct scaling after this point

    if (!forSpellCost && tmp.bills.inEasyZone) ret = ret.div(tmp.bills.lootPenalty)

    return ret
}

addLayer("bills", {
    symbol: "B",
    row: 1,
    position: 1,
    type: "none",
    color: "#C0C0C0",
    startData() { 
        return {
            unlocked: false,
            points: decimalZero,
            best: decimalZero,
            total: decimalZero,
            highestDenominationIndex: 0,
            //timers: new Array(9).fill(0),
            currentEnemyKills: 0,
            //killsByZone: new Array(),
            totalEnemyKills: 0,
            enemyHealth: new Decimal(10),
            totalSmackDamage: decimalZero,
            highestZone: 0, // highest zone the player has *seen*, not unlocked
            highestZoneKills: 0,
            zone: 0,
            skillTimers: new Array(3).fill(-1),
            skillActiveTime: new Array(3).fill(0),
            automation: {
                autosmackTimer: 0
            },
            autosmackOn: false,
            zoneDoneNodeGlow: true
        }
    },
    tooltip() { return `${format(player.bills.points)} spent dollars`},
    resource: "spent dollars",
    branches: ["banks"],
    layerShown() {
        let visible = false
        if (player.bills.unlocked || hasMilestone("sys", 5)) {
            player.bills.unlocked = true
            visible = true
        }
        return visible
    },
    shouldNotify() { return player.bills.zoneDoneNodeGlow && player.bills.highestZone != tmp.bills.highestZoneAvailable },
    milestones: {
        0: {
            requirementDescription: "Complete Zone 3",
            effectDescription() { 
                if (player.shiftDown) return "Rates increase very slightly every 3 zones completed (increases max at HZC 150)"
                
                return `Time Flux multiplies Loot/Global ELO at heavily scaled rates<sup>*</sup>
                    <br>Currently: ${format(this.effect()[0])}x, ${format(this.effect()[1])}x` 
            },
            effect() {
                let x = Math.min(tmp.bills.highestZoneCompleted, 150)
                return [timeFlux() ** (.1 + .002 * Math.floor(x / 3)), timeFlux() ** (.3 + .006 * Math.floor(150 / 3))]
            },
            done() { return tmp.bills.highestZoneCompleted >= 3 }
        },
        1: {
            requirementDescription: "Reach 100 consecutive kills in Zone 9",
            effectDescription() { return "Spells are 10% cheaper, gain 10% more Loot, and unlock Zones 10+" },
            done() { return player.bills.zone == 9 && player.bills.currentEnemyKills >= 100 }
        },
        2: {
            requirementDescription: "Reach Zone 25",
            effectDescription:() => player.shiftDown ? "Scaling not impacted by Effective Level"
                : `Unlock Banks and multiply loot gain by 2.5x, but enemies at and after Zone 25 are much tougher<sup>*</sup>`,
            done() { return this.unlocked() && player.bills.highestZone >= 25 },
            unlocked() { return hasAchievement("a", 105) }
        }
    },
    upgrades: {
        11: {
            fullDisplay() {
                let title = "Buy-in Freebie"
                let description = "Unlock the Bills feature and three new Quests, and gain 2 spent dollars"
                let req = "Requires: 1 dollar"

                return `<h3><b>${title}</b></h3><br>${description}<br><br>${req}`
            },
            canAfford() { return player.sys.points.gte(1) },
            onPurchase() {
                updateBills(2)
            },
        },
        12: {
            title: "The Flux of Experience",
            description:() => player.shiftDown ? "X = 6 for row 1, 8 for row 2, and 10 for row 3 Bills"
                : "Increase ELO from each bill by 5 * X<sup>*</sup> * [Effective Zone] %",
            cost: 2,
            effect:() => [
                1 + (5 * 6 * tmp.bills.effLvl) / 100,
                1 + (5 * 8 * tmp.bills.effLvl) / 100,
                1 + (5 * 10 * tmp.bills.effLvl) / 100
            ],
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x, ${format(this.effect()[2])}x` },
            unlocked:() => player.bills.highestZone >= 2
        },
        13: {
            title: "Keen Eye",
            description() {
                if (player.shiftDown) 
                    return `Resets whenever you change your zone; maxes at ${format(this.max())}x`
                return `Gain ${format(this.base(), 3)}x more loot for every ${formatWhole(this.interval())} 
                    <i>consecutive</i> kills in the current zone<sup>*</sup>`
            },
            cost: 25,
            effect() {
                let kills = player.bills.currentEnemyKills
                return Decimal.pow(this.base(), Math.floor(kills / this.interval())).min(this.max())
            },
            base() { return 1.015 },
            interval() { 
                let ret = 10
                return ret
            },
            max() { 
                let ret = 1.25
                if (hasUpgrade(this.layer, 24)) ret *= upgradeEffect(this.layer, 24)
                return ret  
            },
            effectDisplay() { return `${format(this.effect(), 3)}x` },
            unlocked:() => player.bills.highestZone >= 5
        },
        14: {
            title: "From Nothing, Monies",
            description() { return `Unlock Spells. For every 10 seconds a spell is activated, 
                its effect is permanently buffed by ${format(this.effect() * 100)}%`},
            effect:() => 0.001,
            cost: 500,
            unlocked:() => player.bills.highestZone >= 7
        },
        15: {
            title: "Hyperbolic Time Chamber",
            description: "Time Flux<sup>.5</sup> multiplies Spell duration, WNBP effect exponent, and Global ELO/Acc. Power gain",
            cost: 1000,
            effect:() => timeFlux() ** .5,
            effectDisplay() { return `${format(this.effect(), 3)}x` },
            unlocked:() => hasMilestone("bills", 1)
        },
        21: {
            title: "Impatience",
            description: "Multiply Time Flux by 1.005<sup>HZC</sup> (HZC refers to the highest zone completed)",
            cost: 10000,
            effect:() => 1.005 ** (tmp.bills.highestZoneCompleted),
            effectDisplay() { return `${format(this.effect(), 3)}x` },
            unlocked:() => tmp.bills.highestZoneCompleted >= 10,
        },
        22: {
            fullDisplay() {
                let title = "<h3>Scientific Exploration</h3>"
                let desc = "Unlock System Expansion, but increase Expansion loss rate to 1%"
                let req = this.canAfford() ? "Cost: 75,000 spent dollars"
                    : "Requires: 1 Apple Visionary and HZC >= 15"
                return `${title}<br>${desc}<br><br>${req}`
            },
            cost: 75000,
            canAfford() { return getBuyableAmount("sys", 41).gte(1) 
                && tmp.bills.highestZoneCompleted >= 15 },
            unlocked:() => player.bills.highestZone >= 13
        },
        23: {
            title: "Manifest Destiny",
            description: "Multiply Expansion gain by sqrt(1 + HZC)",
            cost: 50000,
            effect:() => Math.sqrt(1 + tmp.bills.highestZoneCompleted),
            effectDisplay() { return `${format(this.effect())}x`},
            unlocked:() => hasUpgrade("bills", 22)
        },
        24: {
            title: "A Real Knack",
            description: "Keen Eye maxes out 1.25x later",
            effect: 1.25,
            cost: 300000,
            unlocked:() => hasUpgrade("bills", 23)
        },
        25: {
            title: "Magic Touch",
            description: "Time Flux<sup>.25</sup> divides [From Nothing, Monies] interval, and Spells are 25% cheaper",
            cost: 1e6,
            effect:() => [1 + timeFlux() / 3, 1 + (timeFlux() ** .5) / 2, timeFlux()],
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x, ${format(this.effect()[2])}x`},
            unlocked:() => hasUpgrade("bills", 24) && player.bills.highestZone >= 20
        }
    },
    buyables: {
        11: {
            title: "1 Dollar Bill",
            denomination: 1,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                //let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[0])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.eloMult()) },
            cost(x) { return x.pow(1.5).pow_base(1.1).mul(denominationValues[1]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[0])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                // addBuyables(this.layer, this.id, 1)
                // updateBills(this.cost(getBuyableAmount(this.layer, this.id).sub(1)).neg())
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 1}
        },
        12: {
            title: "2 Dollar Bill",
            denomination: 2,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.45).pow_base(1.2).mul(denominationValues[2]/4) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[0])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 2}
        },
        13: {
            title: "5 Dollar Bill",
            denomination: 5,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.4).pow_base(1.3).mul(denominationValues[3]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[0])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 3}
        },
        21: {
            title: "10 Dollar Bill",
            denomination: 10,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.35).pow_base(1.4).mul(denominationValues[4]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[1])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 4}
        },
        22: {
            title: "20 Dollar Bill",
            denomination: 20,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.3).pow_base(1.5).mul(denominationValues[5]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[1])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 5}
        },
        23: {
            title: "50 Dollar Bill",
            denomination: 50,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.25).pow_base(1.6).mul(denominationValues[6]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[1])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 6}
        },
        31: {
            title: "100 Dollar Bill",
            denomination: 100,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.2).pow_base(1.7).mul(denominationValues[7]) },
            canAfford() {return player.bills.points.gte(this.cost())},
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[2])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 7 }
        },
        32: {
            title: "1000 Dollar Bill",
            denomination: 1000,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.15).pow_base(1.8).mul(denominationValues[8]) },
            canAfford() {  return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[2])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 8 }
        },
        33: {
            title: "10000 Dollar Bill",
            denomination: 10000,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `Increasing ELO by ${format(this.effect())}`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination).mul(this.eloMult()) },
            cost(x) { return x.pow(1.1).pow_base(1.9).mul(denominationValues[9]) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            eloMult() {
                let ret = decimalOne
                if (hasUpgrade("bills", 12)) ret = ret.mul(upgradeEffect("bills", 12)[2])
                ret = ret.mul(tmp.bills.globalEloMult)
                return ret
            },
            buy() {
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return player.bills.highestDenominationIndex >= 9}
        },
        41: {
            title: "AutoSmack A",
            display() {
                let ret = `<h3>Effect:</h3> Autosmack ${format(buyableEffect("bills", 41), 1)} more times per second<br><br>`
                if (this.maxed()) return ret + "<h3>MAXED</h3>"
                return ret + `<h3>Cost:</h3> ${formatWhole(this.cost())} spent dollars`
            },
            effect(x) { return Number(x.mul(.5)) },
            cost(x) { return x.pow_base(5).mul(5000) },
            buy() { 
                updateBills(this.cost().neg())
                addBuyables(this.layer, this.id, 1) 
            },
            maxed() { return getBuyableAmount(this.layer, this.id).gte(14) },
            canAfford() { return !this.maxed() && player.bills.points.gte(this.cost()) },
        },
        42: {
            title: "AutoSmack B",
            display() {
                let ret = `<h3>Effect:</h3> Autosmack ${format(buyableEffect("bills", 42), 1)} more times per second<br><br>`
                if (this.maxed()) return ret + "<h3>MAXED</h3>"
                return ret + `<h3>Requires:</h3> ${formatWhole(this.cost())} total damage from smack attacks`
            },
            effect(x) { return Number(x.mul(1/3)) },
            cost(x) { return x.pow_base(5).mul(10000) },
            buy() { 
                addBuyables(this.layer, this.id, 1) 
            },
            maxed() { return getBuyableAmount(this.layer, this.id).gte(21) },
            canAfford() { return !this.maxed() && player.bills.totalSmackDamage.gte(this.cost()) },
        },
        51: {
            title: "AutoCast A",
            display() {
                if (this.maxed()) {
                    let ret = `<h3>Effect:</h3> Automatically cast the 1st spell instantaneously, for free<br><br>`
                    return ret + "<h3>MAXED</h3>"
                }

                let eff = buyableEffect("bills", 51)
                let ret = `<h3>Effect:</h3> Automatically cast the 1st spell 
                    after ${format(eff[0])} inactive seconds
                    at ${format(eff[1])}% cost<br><br>`
                return ret + `<h3>Requires:</h3> ${formatWhole(this.cost())} total damage from smack attacks`
            },
            effect(x) {
                return Number(x)
            },
            cost(x) { return },
            buy() {

            }
        },
        54: {

        }
    },
    clickables: {
        11: {
            title: `<span style="font-size:40px">←</span>`,
            //display: `<span style="font-size:12px">Previous zone</span>`,
            onClick() { 
                updateZone(player.bills.zone-1)
            },
            canClick() { return isZoneAvailable(player.bills.zone - 1) },
            style() { return { "min-height":"50px" } }
        },
        12: {
            title: `<span style="font-size:40px">→</span>`,
            //display: `<span style="font-size:12px">Next zone</span>`,
            onClick() { 
                updateZone(player.bills.zone+1)
            },
            canClick() { return isZoneAvailable(player.bills.zone + 1) },
            style() { return { "min-height":"50px" } }
        },
        // 21: {
        //     title: "Spend Dollars",
        //     display() {
        //         return "Contribute some of your current dollars to spent dollars"
        //     },
        //     onClick() {
        //         let inp = prompt(`Enter the amount of dollars you would like to contribute into the field. To enter a percentage, use the % symbol; e.g, 25%.`)
        //         if (!inp) return
        //         let isPercent = false

        //         if (inp.endsWith("%")) {
        //             inp = inp.slice(0, inp.length - 1)
        //             isPercent = true
        //         }

        //         inp = Number(inp)

        //         if (Number.isNaN(inp)) {
        //             alert("Invalid input, nothing has occurred")
        //             return
        //         } else if (inp <= 0) {
        //             alert("You must enter a positive non-zero number")
        //             return
        //         } else if ((isPercent && inp > 100) || (!isPercent && player.sys.points.lt(inp))) {
        //             alert("You cannot spend more dollars than you have, nothing has occurred")
        //             return
        //         }

        //         let toSpend
        //         if (isPercent) toSpend = player.sys.points.mul(inp / 100)
        //         else toSpend = inp
        //         player.sys.points = player.sys.points.sub(toSpend)
        //         updateBills(toSpend)
        //     },
        //     canClick() { return player.sys.points.gt(0) }
        // },
        21: {
            display() {
                let eff = `${format(this.effect())}x dmg for ${timeDisplay(tmp.bills.maxSkillTimer)}`
                let req = player.bills.skillTimers[0] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[0])}`
                return `${eff}<br><br>${req}`
            },
            effect() { 
                let ret = 1.5
                if (hasUpgrade("bills", 25)) ret *= upgradeEffect("bills", 25)[0]

                let activeSeconds = Math.floor(player.bills.skillActiveTime[0] / 10)
                ret *= 1 + activeSeconds * upgradeEffect("bills", 14)
                return ret
            },
            cost:() => tmp.bills.spellCost,
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[0] < 0 },
            onClick() {
                updateBills(this.cost().neg())
                player.bills.skillTimers[0] = 0
            },
            style() { 
                let ret = { "min-height":"80px", "border-radius": "0%", "border": "0px" }
                if (!this.canClick() && player.bills.skillTimers[0] == -1) return ret

                let activeColor = "#C0C0C0"
                let activePercent = 100 * (tmp.bills.maxSkillTimer - player.bills.skillTimers[0]) / tmp.bills.maxSkillTimer
                let lockedColor = "#bf8f8f"
                let lockedPercent = 100 - activePercent
                Object.assign(ret, {
                    "background": `linear-gradient(
                                        to top,
                                        ${activeColor} ${activePercent}%,
                                        ${lockedColor} ${activePercent}% ${lockedPercent}%
                                        )`
                    }
                )
                return ret
            },
            unlocked:() => hasUpgrade("bills", 14)
        },
        22: {
            display() {
                let eff = `${format(this.effect())}x loot for ${timeDisplay(tmp.bills.maxSkillTimer)}`
                let req = player.bills.skillTimers[1] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[1])}`
                return `${eff}<br><br>${req}`
            },
            effect() { 
                let ret = 1.25
                if (hasUpgrade("bills", 25)) ret *= upgradeEffect("bills", 25)[1]

                let activeSeconds = Math.floor(player.bills.skillActiveTime[1] / 10)
                ret *= 1 + activeSeconds * upgradeEffect("bills", 14)
                return ret
            },
            cost:() => tmp.bills.spellCost,
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[1] < 0 },
            onClick() {
                updateBills(this.cost().neg())
                player.bills.skillTimers[1] = 0
            },
            style() { 
                let ret = { "min-height":"80px", "border-radius": "0%", "border": "0px" }
                if (!this.canClick() && player.bills.skillTimers[1] == -1) return ret

                let activeColor = "#C0C0C0"
                let activePercent = 100 * (tmp.bills.maxSkillTimer - player.bills.skillTimers[1]) / tmp.bills.maxSkillTimer
                let lockedColor = "#bf8f8f"
                let lockedPercent = 100 - activePercent
                Object.assign(ret, {
                    "background": `linear-gradient(
                                        to top,
                                        ${activeColor} ${activePercent}%,
                                        ${lockedColor} ${activePercent}% ${lockedPercent}%
                                        )`
                    }
                )
                return ret
            },
            unlocked:() => hasUpgrade("bills", 14)
        },
        23: {
            display() {
                if (player.shiftDown) return "Does not affect Keen Eye, does affect enemy HP"
                let eff = `+${format(this.effect())} effective zones<sup>*</sup> for ${timeDisplay(tmp.bills.maxSkillTimer)}`
                let req = player.bills.skillTimers[2] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[2])}`
                return `${eff}<br><br>${req}`
            },
            effect() { 
                let ret = 1
                if (hasUpgrade("bills", 25)) ret *= upgradeEffect("bills", 25)[2]

                let activeSeconds = Math.floor(player.bills.skillActiveTime[2] / 10)
                ret *= 1 + activeSeconds * upgradeEffect("bills", 14)
                return ret
            },
            cost:() => tmp.bills.spellCost,
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[2] < 0 },
            onClick() {
                updateBills(this.cost().neg())
                player.bills.skillTimers[2] = 0
            },
            style() { 
                let ret = { "min-height":"80px", "border-radius": "0%", "border": "0px" }
                if (!this.canClick() && player.bills.skillTimers[2] == -1) return ret

                let activeColor = "#C0C0C0"
                let activePercent = 100 * (tmp.bills.maxSkillTimer - player.bills.skillTimers[2]) / tmp.bills.maxSkillTimer
                let lockedColor = "#bf8f8f"
                let lockedPercent = 100 - activePercent
                Object.assign(ret, {
                    "background": `linear-gradient(
                                        to top,
                                        ${activeColor} ${activePercent}%,
                                        ${lockedColor} ${activePercent}% ${lockedPercent}%
                                        )`
                    }
                )
                return ret
            },
            unlocked:() => hasUpgrade("bills", 14)
        },
        24: {
            title: "Smack Attack",
            display() {
                if (player.shiftDown) return "You can hold this button to attack 20 times/s!"
                return `Gather your spent dollars in a leather bag and smack the enemy!<br>
                    ${format(this.effect())} damage per click<sup>*</sup>`
            },
            onClick() { 
                player.bills.totalSmackDamage = player.bills.totalSmackDamage.add(this.effect())
                attackEnemy(this.effect()) 
            },
            onHold() {
                this.onClick()
            },
            canClick:() => !player.bills.autosmackOn,
            effect() {
                let ret = player.bills.points.mul(.02)
                if (ret.gte(0.1)) ret = ret.div(player.bills.points.pow(.25))
                ret = ret.mul(tmp.quests.bars.smackBar.reward)
                let dpsDiv30 = tmp.bills.dps.div(30)
                if (tmp.bills.dps.gt(0)) {
                    ret = softcap(ret, dpsDiv30, .7)
                    ret = softcap(ret, dpsDiv30.mul(1.25), .4)
                    ret = softcap(ret, dpsDiv30.mul(1.5), .2)
                    ret = ret.min(dpsDiv30.mul(1.75))
                }
                return ret
            }
        },
    },
    maxSkillTimer() {
        let ret = 60
        if (hasUpgrade("bills", 15)) ret = ret * upgradeEffect("bills", 15)
        return ret
    },
    spellCost() { 
        let ret = lootGain(player.bills.highestZone, true).mul(5)
        if (hasMilestone("bills", 1)) ret = ret.mul(.9)
        if (hasUpgrade("bills", 25)) ret = ret.mul(3/4)
        //if (hasAchievement("a", )) ret = ret.mul(2/3)
        return ret
    },
    bars: {
        enemyBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                return player.bills.enemyHealth.div(this.maxHealth())
            },
            display() {
                return `${format(player.bills.enemyHealth)}/${format(this.maxHealth())} HP`
            },
            name() {
                let names = ["Orphan", "Homeless Man", "Hobo", "Weary Traveler", "Bandit"]
                let index = Math.floor(player.bills.zone / 10)
                return (tmp.bills.isEnemyBoss ? "Beefy " : "") + names[index]
            },
            maxHealth() {
                let level = tmp.bills.effLvl
                // let levelTwos = level / 2
                let levelTens = Math.floor(level / 10)

                if (level == 0) return new Decimal(10)

                let base = new Decimal(10)

                let linearAddScaling = 20 * level + 200 * levelTens 

                let multScaling = (1.23 ** level) * (2 ** (levelTens ** 1.25))
                let expScaling = 1
                let bossScaling = tmp.bills.isEnemyBoss ? 2 : 1

                if (hasMilestone("bills", 2) && player.bills.zone >= 25) {
                    multScaling *= 1.3 ** (player.bills.zone - 24)
                    expScaling *= 1.01
                }

                return base.add(linearAddScaling).mul(multScaling).mul(bossScaling).pow(expScaling)
            },
            loot() {
                return lootGain(tmp.bills.effLvl)
            },
            textStyle() { return {'color':'gray'} }
        }
    },
    nextDenominationUnlock() {
        return denominationValues[player.bills.highestDenominationIndex+1]
    },
    highestDenomination() {
        let i = player.bills.highestDenominationIndex
        return denominationValues[i] / 10 ** (i - 1)
    },
    globalEloMult() {
        let ret = decimalOne
        if (hasMilestone("bills", 0)) ret = ret.mul(milestoneEffect("bills", 0)[1])
        if (hasUpgrade("bills", 15)) ret = ret.mul(upgradeEffect("bills", 15))
        if (tmp.e.system_expansion.unlocked) ret = ret.mul(tmp.e.system_expansion.effect)
        if (hasMilestone("banks", 0)) ret = ret.mul(1.5)
        if (hasUpgrade("banks", 12)) ret = ret.mul(upgradeEffect("banks", 12)[1])
        
        ret = ret.mul(shopEffect(101))

        ret = ret.pow(tmp.banks.bars.tierBar.effect[1])
        return ret
    },
    lootPenalty() {
        let ret = tmp.bills.dps.div(tmp.bills.bars.enemyBar.maxHealth).add(1).pow(2)
        if (Math.floor(player.bills.zone / 10) < Math.floor(tmp.bills.highestZoneAvailable / 10))
            ret = ret.mul(2)
        return ret
    },
    elo() {
        let ret = decimalZero
        for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
            ret = ret.add(tmp.bills.buyables[id].effect)
        }
        return ret
    },
    dps() {
        // Every time effectiveElo reaches another power of 100, its softcapped by a diminishing power
        // repeated up to 100 ** 10 (10 ** 20), and then from there it scales normally
            // (even though you need drastic increases in ELO for moderate increase to DPS)
        // EX: effectiveElo = .9 --> result is .9
        // EX: effectiveElo = 1.1 --> result is softcap(1.1, 1, .95)
        // EX: effectiveElo (after first softcap) = 105 --> result is softcap(105, 100, .9)
        
        // let effectiveElo = tmp.bills.elo
        // let i = 0
        // while (i < 11) {
        //     let softcapStart = Decimal.pow(100, i)
        //     if (effectiveElo.lte(softcapStart)) break
        //     effectiveElo = softcap(effectiveElo, softcapStart, .95 - i/100)
        //     i += 1
        // }

        let effectiveElo = logarithmicSoftcap(tmp.bills.elo, 1, 100, 11, .95, 1/100)
        
        

        // after softcapping, normal modifications applied
        let ret = effectiveElo.div(3)

        if (player.bills.skillTimers[0] > 0) ret = ret.mul(tmp.bills.clickables[21].effect)

        return ret
    },
    inEasyZone() {
        return Math.floor(player.bills.zone / 10) < Math.floor(tmp.bills.highestZoneCompleted / 10)
            || tmp.bills.dps.gte(tmp.bills.bars.enemyBar.maxHealth.div(3))
    },
    isEnemyBoss() {
        return player.bills.zone > 0 && player.bills.zone % 10 == 0
    },
    highestZoneAvailable() {
        if (player.bills.highestZoneKills >= tmp.bills.totalKillsNeeded) {
            return player.bills.highestZone + 1
        }
        return player.bills.highestZone
    },
    highestZoneCompleted() {
        let ret = player.bills.highestZone
        if (tmp.bills.highestZoneAvailable == ret) ret -= 1
        return Math.max(ret, 0)
    },
    totalKillsNeeded() {
        return tmp.bills.isEnemyBoss ? 3 : 10
    },
    effLvl() {
        let ret = player.bills.zone
        if (player.bills.skillTimers[2] >= 0) ret = ret + (tmp.bills.clickables[23].effect)
        return ret
    },
    automation: {
        unlocked:() => hasAchievement("a", 101),
        autosmackPerSecond() {
            let ret = 1
            ret += buyableEffect("bills", 41)
            ret += buyableEffect("bills", 42)
            return ret
        },
        autosmackDPS() {
            return clickableEffect("bills", 24).mul(this.autosmackPerSecond())
        },
        autosmackRelativeDPSPercent() {
            let total = tmp.bills.dps.add(tmp.bills.automation.autosmackDPS)
            return tmp.bills.automation.autosmackDPS.div(total).mul(100)
        },
        maxAutosmackTimer() {
            return 1 / tmp.bills.automation.autosmackPerSecond
        }
    },
    update(diff) {
        if (!hasUpgrade("bills", 11)) return

        // let ELO = decimalZero
        // for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
        //     ELO = ELO.add(tmp.bills.buyables[id].effect)
        // }
        // player.bills.elo = ELO

        for (const id of [21, 22, 23]) {
            if (player.bills.skillTimers[id-21] >= 0) {
                player.bills.skillTimers[id-21] += diff
                player.bills.skillActiveTime[id-21] += Math.min(diff, tmp.bills.maxSkillTimer - player.bills.skillTimers[id-21])
                if (player.bills.skillTimers[id-21] >= tmp.bills.maxSkillTimer)
                    player.bills.skillTimers[id-21] = -1            }
        }

        attackEnemy(tmp.bills.dps.times(diff))

        if (tmp.bills.automation.unlocked) {
            // AutoSmacker 9001
            if (player.bills.autosmackOn) {
                player.bills.automation.autosmackTimer += diff
                let maxTimer = tmp.bills.automation.maxAutosmackTimer
                if (player.bills.automation.autosmackTimer >= maxTimer) {
                    let smackAmt = 1
                    let timeMultiplier = Math.floor(player.bills.automation.autosmackTimer / maxTimer)
                    smackAmt *= timeMultiplier
                    player.bills.automation.autosmackTimer -= maxTimer * timeMultiplier
                    let effect = clickableEffect("bills", 24).mul(smackAmt)
                    player.bills.totalSmackDamage = player.bills.totalSmackDamage.add(effect)
                    attackEnemy(effect)
                }
            }

            // AutoCasters
            if (hasAchievement("a", 105)) {

            }

        }

        // if (player.highestZoneKills >= 10 && player.zone == player.highestZone && player.autoStage)
        //     updateZone(player.zone + 1) 
    },
    tabFormat: {
        "Bills": {
            content: [
                ["main-display", 2],
                () => tmp.bills.nextDenominationUnlock <= 1 ? "" :
                    ["display-text",  
                        `Because you have a total of <h3><span style="color: #C0C0C0; text-shadow: 0px 0px 10px #C0C0C0; 
                        font-family: Lucida Console, Courier New, monospace">
                        ${format(player.bills.total)}</h3></span> spent dollars, the highest denomination available to you is 
                        the <h3>${tmp.bills.highestDenomination}</h3> dollar bill. Next denomination unlocks at
                        <h3><span style="color: #C0C0C0; text-shadow: 0px 0px 10px #C0C0C0; font-family: Lucida Console, Courier New, monospace">
                            ${formatWhole(tmp.bills.nextDenominationUnlock)}</span></h3> total spent dollars<br><br>`
                    ],
                () => hasUpgrade("bills", 11) ? ["column", [
                    ["clickables", [1]], "blank",
                    ["display-text", `You are in <h3 style="color: #C0C0C0"><b>Zone ${player.bills.zone}</b></h3>`],
                    ["display-text", nextZoneUnlockDisplay()],
                    "blank",
                    ["bar", "enemyBar"],
                    "blank",
                    tmp.bills.inEasyZone ? ["display-text", `Because you are in an easy zone, loot drops are divided by ${format(tmp.bills.lootPenalty)}`] 
                        : "",
                    ["display-text", `The level 
                        ${player.bills.zone == tmp.bills.effLvl ? player.bills.zone : `${player.bills.zone} (${format(tmp.bills.effLvl)})`} 
                        ${tmp.bills.bars.enemyBar.name} 
                        will drop ${format(tmp.bills.bars.enemyBar.loot)} Spent Dollars when defeated
                        <br>You have defeated this enemy ${player.bills.currentEnemyKills} consecutive times`],
                    "blank", ["clickables", [2]], "blank",
                    ["display-text", `Your current ELO is ${format(tmp.bills.elo)}, so you deal ${format(tmp.bills.dps)} damage per second (DPS)`], 
                    "blank",
                    ["buyables", [1, 2, 3]]
                ]] : "",
                "blank",
                "upgrades"
            ]
        },
        "Automation": {
            content: [
                "main-display",
                ["display-text", () => `The AutoSmacker 9001 automatically smacks the current enemy 
                    ${format(tmp.bills.automation.autosmackPerSecond, 1)} times per second, 
                    but stops manual smacks`],
                ["row", [
                    ["display-text", "The AutoSmacker 9001 is currently&ensp;"], 
                    ["toggle", ["bills", "autosmackOn"]],
                    ["display-text", () => `, and constitutes ${format(tmp.bills.automation.autosmackRelativeDPSPercent)}% of total DPS`]
                ]], "blank",
                ["buyables", [4]], "blank",
                ["display-text", () => `You have done a total of ${format(player.bills.totalSmackDamage)} damage
                    from smack attacks`], "blank",
            ],
            unlocked:() => hasAchievement("a", 101)
        },
        "Milestones": {
            content: [
                "main-display",
                ["display-text", () => `The highest zone reached so far is: 
                    <h3 style="color: #C0C0C0; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    Zone ${player.bills.highestZone}</h3>`],
                "milestones"
            ],
            unlocked:() => tmp.bills.highestZoneCompleted >= 3
        },
        "Info": {
            content: [
                ["main-display", 2],
                ["microtabs", "info"], "blank",
                ["row", [
                    ["display-text", "Toggle node glow for zone completions:&ensp;"], 
                    ["toggle", ["bills", "zoneDoneNodeGlow"]]
                ]], "blank",
            ],
            unlocked:() => hasUpgrade("bills", 11)
        }
    },
    microtabs: {
        info: {
            "Denominations": {
                content: [
                    "blank",
                    ["display-text", `In this game, "Denomination" refers to a specific value bill. For example,
                        the first denomination is the 1 Dollar Bill. After it comes the 2 Dollar Bill, then the 5 Dollar Bill,
                        and so on until the last denomination is unlocked. The unlock requirement for each Bill is directly
                        tied to your total amount of Spent Dollars, and the formula for this requirement is given by:<br><br>
                        Denomination Value * 10<sup>Denomination # - 1</sup><br><br>
                        For example, the 2 Dollar Bill requires 2 * 10<sup>2 - 1</sup> = 20 total spent dollars to unlock. Or, the
                        5 Dollar Bill requires 5 * 10<sup>3 - 1</sup> = 500 total spent dollars to unlock. The unlock requirement for 
                        the next denomination yet to be unlocked is also displayed to you in the Main tab.`], "blank"
                ]
            },
            "ELO": {
                content: [
                    "blank",
                    ["display-text", () => `ELO is your source of damage for the Bills minigame. You can only gain ELO by purchasing bills,
                        and each individual bill purchased increases ELO by a set amount based on its denomination and any multipliers applied.
                        These multipliers can be individual or global to denominations. Each denomination's total effect on ELO is shown inside their
                        display boxes.<br><br>
                        As mentioned before, damage per second, or DPS, is entirely based on ELO. There's a complicated process
                        which determines your DPS value, but its really not so important. The general gist is that DPS is based off 
                        an \"effective\" ELO value. Initial ELO is softcapped multiple times (every 2 OoMs in an iterative process up to 10 times) 
                        with diminishing exponents. All you need to know is that as you purchase more bills and ELO gets larger and larger,
                        the experienced <i>gain</i> in DPS grows smaller and smaller.<br><br>
                        Global ELO multiplier: ${format(tmp.bills.globalEloMult)}x ELO from all bills`], "blank"
                ]
            }
        }
    },
    componentStyles: {
        "buyable"() { return {'height':'100px'} }
    }
})