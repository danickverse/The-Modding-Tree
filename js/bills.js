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
            automation: {
                autosmackTimer: 0
            }
        }
    },
    tooltip() { return `${format(player.bills.points)} spent dollars`},
    resource: "spent dollars",
    layerShown() {
        let visible = false
        if (player.bills.unlocked || hasMilestone("sys", 5)) {
            player.bills.unlocked = true
            visible = true
        }
        return visible
    },
    shouldNotify() { return player.bills.highestZone != tmp.bills.highestZoneAvailable },
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
                : "Increase ELO from each bill by 5 * X<sup>*</sup> * [Eff. Zone] %",
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
            interval() { return 10 },
            max() { return 1.25 },
            effectDisplay() { return `${format(this.effect(), 3)}x` },
            unlocked:() => player.bills.highestZone >= 5
        },
        14: {
            title: "From Nothing, Monies",
            description: "Unlock Spells",
            cost: 500,
            unlocked:() => player.bills.highestZone >= 10
        },
        15: {
            title: "Hyperbolic Time Chamber",
            description: "Time Flux multiplies Spell duration and ELO/Acc. Power gain",
            cost: 1000,
            effect:() => timeFlux(),
            unlocked:() => player.bills.highestZone >= 10,
        },
        21: {
            title: "Impatience",
            description: "Multiply Time Flux by 1.005x per completed zone",
            cost: 10000,
            effect:() => 1.005 ** (tmp.bills.highestZoneCompleted),
            effectDisplay() { return `${format(this.effect(), 3)}x` }
        },
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
            title: "Autosmack A",
            display() {
                let ret = `<h3>Effect:</h3> Autosmack ${format(buyableEffect("bills", 41), 1)} more times per second<br><br>`
                if (this.maxed()) return ret + "<h3>MAXED</h3>"
                return ret + `<h3>Cost:</h3> ${formatWhole(this.cost())} spent dollars`
            },
            effect(x) { return Number(x.mul(.5)) },
            cost(x) { return x.pow_base(5).mul(5000) },
            buy() { 
                player.bills.points = player.bills.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1) 
            },
            maxed() { return getBuyableAmount(this.layer, this.id).gte(14) },
            canAfford() { return !this.maxed() && player.bills.points.gte(this.cost()) },
        },
        42: {
            title: "Autosmack B",
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
        }
    },
    clickables: {
        11: {
            title: `<span style="font-size:40px">←</span>`,
            //display: `<span style="font-size:12px">Previous zone</span>`,
            onClick() { 
                updateZone(-1)
            },
            canClick() { return isZoneAvailable(player.bills.zone - 1) },
            style() { return { "min-height":"50px" } }
        },
        12: {
            title: `<span style="font-size:40px">→</span>`,
            //display: `<span style="font-size:12px">Next zone</span>`,
            onClick() { 
                updateZone(1)
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
                let eff = `1.5x dmg for ${format(tmp.bills.maxSkillTimer)} seconds`
                let req = player.bills.skillTimers[0] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[0])}`
                return `${eff}<br><br>${req}`
            },
            effect() { return 1.5 },
            cost() { return player.bills.best.div(10) },
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[0] < 0 },
            onClick() {
                updateBills(this.cost())
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
                let eff = `1.25x loot for ${format(tmp.bills.maxSkillTimer)} seconds`
                let req = player.bills.skillTimers[1] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[1])}`
                return `${eff}<br><br>${req}`
            },
            effect() { return 1.25 },
            cost() { return player.bills.best.div(10) },
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[1] < 0 },
            onClick() {
                updateBills(this.cost())
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
                let eff = `+1 effective zones<sup>*</sup> for ${format(tmp.bills.maxSkillTimer)} seconds`
                let req = player.bills.skillTimers[2] == -1 ?
                    `Cost: ${format(this.cost())} spent dollars`
                    : `Time remaining: ${timeDisplay(tmp.bills.maxSkillTimer - player.bills.skillTimers[2])}`
                return `${eff}<br><br>${req}`
            },
            effect() { return 1 },
            cost() { return player.bills.best.div(10) },
            canClick() { return player.bills.points.gte(this.cost()) && player.bills.skillTimers[2] < 0 },
            onClick() {
                updateBills(this.cost())
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
            canClick: true,
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
        let ret = 15
        if (hasUpgrade("bills", 15)) ret = ret * upgradeEffect("bills", 15)
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
                let levelTwos = Math.floor(level / 2)
                let levelTens = Math.floor(level / 10)

                if (level == 0) return new Decimal(10)

                let base = new Decimal(10)

                let linearAddScaling = 20 * level + 200 * levelTens 

                let multScaling = (1.1 ** level) * (1.25 ** levelTwos) * (2 ** (levelTens ** 1.25))

                let expScaling = 1

                let bossScaling = tmp.bills.isEnemyBoss ? 2 : 1

                return base.add(linearAddScaling).mul(multScaling).pow(expScaling).mul(bossScaling)
            },
            loot() {
                let base = new Decimal(.025)
                let lvl = tmp.bills.effLvl
                let lvlScaling = (lvl + 1) * (1.5 ** lvl)

                let ret = base.mul(lvlScaling)

                if (hasAchievement("a", 95)) ret = ret.mul(1.05)

                //if (player.bills.zone == 0) ret = new Decimal(.01)
                if (hasUpgrade("bills", 13)) ret = ret.mul(upgradeEffect("bills", 13))
                ret = ret.mul(tmp.quests.bars.enemyKillsBar.reward)
                if (hasMilestone("a", 10)) ret = ret.mul(player.a.achievements.length/40)
                if (hasMilestone("s", 7)) ret = ret.mul(tmp.s.stored_dollars.effects[6])
                ret = ret.mul(getBuyableAmount("sys", 14).pow_base(2))
                
                let exp = 1
                ret = ret.pow(exp)

                // direct scaling after this point

                let bossScaling = tmp.bills.isEnemyBoss ? 2 : 1
                ret = ret.mul(bossScaling)

                if (player.bills.skillTimers[1] >= 0) ret *= tmp.bills.clickables[22].effect

                if (tmp.bills.inEasyZone)
                    ret = ret.div(tmp.bills.lootPenalty)
                
                return ret
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
        let ret = 1
        if (hasUpgrade("bills", 15)) ret *= upgradeEffect("bills", 15)
        ret *= getBuyableAmount("sys", 14).pow_base(2).toNumber()
        return ret
    },
    lootPenalty() {
        let ret = tmp.bills.dps.div(tmp.bills.bars.enemyBar.maxHealth).add(1).pow(2)
        if (Math.floor(player.bills.zone / 10) < Math.floor(tmp.bills.highestZoneAvailable / 10))
            ret = ret.mul(3)
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
        let effectiveElo = tmp.bills.elo
        let i = 0
        while (i <= 10) {
            let softcapStart = Decimal.pow(10, i * 2)
            if (effectiveElo.lte(softcapStart)) break
            effectiveElo = softcap(effectiveElo, softcapStart, .95 - i/100)
            i += 1
        }
        let ret = effectiveElo.div(3)

        if (player.bills.skillTimers[0] > 0) ret = ret.mul(tmp.bills.clickables[21].effect)

        return ret
    },
    inEasyZone() {
        return Math.floor(player.bills.zone / 10) < Math.floor(tmp.bills.highestZoneAvailable / 10)
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
        let highestZone = player.bills.highestZone
        if (tmp.bills.highestZoneAvailable == highestZone) return highestZone - 1
        return highestZone
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
                if (player.bills.skillTimers[id-21] >= tmp.bills.maxSkillTimer)
                    player.bills.skillTimers[id-21] = -1
            }
        }

        attackEnemy(tmp.bills.dps.times(diff))

        if (tmp.bills.automation.unlocked) {
            // Autosmacker 9001
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

            // Implement other automation here

        }

        // if (player.highestZoneKills >= 10 && player.zone == player.highestZone && player.autoStage)
        //     updateZone(1) 
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
                    ["display-text", (tmp.bills.highestZoneAvailable == player.bills.highestZone) ?
                        `Zone ${tmp.bills.highestZoneAvailable+1} will be unlocked at 10 kills in zone ${tmp.bills.highestZoneAvailable} 
                            (${Math.min(player.bills.highestZoneKills, tmp.bills.totalKillsNeeded)}/${tmp.bills.totalKillsNeeded})` 
                        : `Zone ${tmp.bills.highestZoneAvailable} is unlocked`
                    ],
                    "blank",
                    ["bar", "enemyBar"],
                    "blank",
                    tmp.bills.inEasyZone ? ["display-text", `Because you are in an easy zone, loot drops are divided by ${format(tmp.bills.lootPenalty)}`] 
                        : "",
                    ["display-text", `The level 
                        ${player.bills.zone == tmp.bills.effLvl ? player.bills.zone : `${player.bills.zone} (${tmp.bills.effLvl})`} 
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
                ["display-text", () => `The Autosmacker 9001 automatically smacks the current enemy 
                    ${format(tmp.bills.automation.autosmackPerSecond, 1)} times per second`], "blank",
                ["buyables", [4]], "blank",
                ["display-text", () => `You have done a total of ${format(player.bills.totalSmackDamage)} damage
                    from smack attacks`], "blank",
            ],
            unlocked:() => hasAchievement("a", 101)
        },
        "Info": {
            content: [
                ["main-display", 2],
                ["microtabs", "info"]
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