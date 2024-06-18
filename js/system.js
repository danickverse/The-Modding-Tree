function systemUpgradeCost(row) {
    let boughtInRow = player.sys.upgrades.filter(
        (index) => Math.floor(index / 10) == row
    ).length

    switch (row) {
        case 1: return .15 + .15 * boughtInRow
        case 2: return 1 + .25 * boughtInRow
        default: throw Error("Invalid row supplied to systemUpgradeCost")
    }
}

function updateBills(spent) {
    let billsData = player.sys.bills
    billsData.spent = billsData.spent.add(spent)
    if (spent > 0) {
        billsData.spentTotal = billsData.spentTotal.add(spent)
        let denominationValues = {
            9: 10000,
            8: 1000,
            7: 100, 
            6: 50, 
            5: 20, 
            4: 10, 
            3: 5, 
            2: 2, 
            1: 1
        }
        for (let i = 9; i >= 1; i--) {
            let value = denominationValues[i]
            if (billsData.spentTotal.gte(value ** 5) && billsData.highestDenominationIndex <= i) {
                billsData.highestDenominationIndex = i
                billsData.highestDenomination = value
                billsData.nextDenominationUnlock = denominationValues[i+1] ** 5
                return
            }
        }

        // spent dollars < 1
        billsData.highestDenominationIndex = 0
        billsData.highestDenomination = 0
        billsData.nextDenominationUnlock = 1
    }
}

function attackEnemy(damage) {
    player.sys.bills.enemyHealth = player.sys.bills.enemyHealth.sub(damage)
    if (player.sys.bills.enemyHealth.lte(0)) {
        // player.sys.points = player.sys.points.add(tmp.sys.bars.enemyBar.loot)
        updateBills(tmp.sys.bars.enemyBar.loot)
        player.sys.bills.totalEnemyKills += 1
        player.sys.bills.currentEnemyKills += 1
        player.sys.bills.enemyLevel += 1
        player.sys.bills.enemyHealth = layers.sys.bars.enemyBar.maxHealth()
    }
}

addLayer("sys", {
    symbol: "Sys",
    position: 0,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        best: decimalZero,
        total: decimalZero,
        resetCount: 0,
        everWNBP: false,
        autoWNBP: true,
        businesses: {
            apples: {
                points: decimalZero,
                timer: 0
            }
        },
        acceleratorPower: {
            points: decimalZero
        },
        bills: {
            spent: decimalZero,
            spentTotal: decimalZero,
            highestDenomination: 0,
            highestDenominationIndex: 0,
            nextDenominationUnlock: 1,
            timers: new Array(9).fill(0),
            currentEnemyKills: 0,
            maxEnemyKills: 100,
            totalEnemyKills: 0,
            enemyLevel: 0,
            enemyHealth: new Decimal(100),
            totalSmackDamage: decimalZero
            // denominations: new Array(11).fill(0),
            // change: 0
        }
    }},
    color: "gray",
    requires:() => {
        return new Decimal("3.33e33")
    },
    type: "custom",
    resource: "dollars",
    row: 1,
    branches: ["p", "s", "e"],
    hotkeys: [
        {
            key: "d", 
            description: "D: Reset for dollars", 
            onPress(){ if (canReset(this.layer)) doReset(this.layer) }
        },
    ],
    layerShown:() => player.sys.unlocked,
    baseResource: "pennies",
    baseAmount() { return player.p.points },
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && player.p.upgrades.length >= 25 },
    prestigeNotify() { return player[this.layer].points.lt(1) && tmp[this.layer].canReset },
    gainMult() { 
        return conversionRate()
    },
    getResetGain() {
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        let gain = tmp[this.layer].baseAmount.log10().mul(tmp[this.layer].gainMult)
        return gain
    },
    getNextAt() {
        if (tmp[this.layer].resetGain.add == undefined) return
        let next = tmp[this.layer].resetGain.add(1).floor()
        next = next.div(tmp[this.layer].gainMult).pow_base(10)
        return next
    },
    prestigeButtonText:() => { 
        let layer = "sys"
        if (tmp[layer].resetGain.add == undefined) return
        if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return `You need ${format(tmp[layer].requires)} pennies to reset`
        return `${player[layer].points.lt(1e3) ? (tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for ") : ""}+<b>${formatWhole(tmp[layer].resetGain)}</b> ${tmp[layer].resource} ${tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3) ? `<br><br>Next at ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAt) : format(tmp[layer].nextAt))} ${tmp[layer].baseResource}` : ""}`
    },
    onPrestige() { 
        player.highestPointsEver = decimalZero
        player.sys.everWNBP = false
        player.subtabs.s.mainTabs = "Main"
        player.subtabs.e.mainTabs = "Info"

        player.sys.resetCount++

        // if (tmp.a.achievements[93].unlocked && player.a.achievements.indexOf("93") == -1 && player.s.high_scores[11].points.eq(0)) {
        //     player.a.achievements.push("93")
        //     doPopup("achievement", tmp.a.achievements[93].name, "Achievement Gotten!", 3, tmp.a.color)
        // }

        let keptApples = decimalZero

        if (hasMilestone("sys", 3)) {
            player.sys.acceleratorPower.points = player.sys.acceleratorPower.points.add(500)
            keptApples = player.sys.business.apples.points.min((player.sys.milestones.length - 2) ** 2)
        }

        player.sys.businesses.apples.points = keptApples
        player.sys.businesses.apples.timer = 0
    },
    shouldNotify() {
        return tmp.sys.buyables[12].canAfford || tmp.sys.buyables[13].canAfford
    },
    effect() {
        return player.sys.points.mul(2).add(1).pow(.5)
    },
    milestones: {
        0: {
            requirementDescription: "1 Dollar Reset",
            effectDescription:() => "Unlock Education III, Businesses, and Quests, and multiply Expansion/Penny Expansion gain by 1.25x per milestone<br>Currently: " 
                + 1.25**player.sys.milestones.length + "x",
            done() { return player.sys.resetCount >= 1 }
        },
        1: {
            requirementDescription: "2 Dollar Resets",
            effectDescription: "Unlock Stored Dollars and three Storage Upgrades, keep one row of achievements "
                + "per milestone (up to 7), and It's Only Reasonable also uses System Upgrades<sup>2</sup>",
            done() { return player.sys.resetCount >= 2 }
        },
        2: {
            requirementDescription: "3 Dollar Resets",
            effectDescription: "The 6th Storage milestone only requires 1 Expansion challenge completion",
            done() { return player.sys.resetCount >= 3 }
        },
        3: {
            requirementDescription: "4 Dollar Resets and 0.5 Stored Dollars",
            effectDescription:() => `Unlock the Accelerator & Accelerator Power,
                and keep (milestones - 2)<sup>2</sup> Apples
                <br>Currently: ${formatWhole(Math.max(player.sys.milestones.length - 2, 0) ** 2)}`,
            done() { return player.sys.resetCount >= 4 && player.s.stored_dollars.points.gte(.5) }
        },
        // 4: {
        //     requirementDescription: "6 Dollar Resets and 42 Achievements",
        //     effectDescription: `Unlock the Bills subtab, It's Expandin' Time! no longer force buys WNBP,
        //         unlock a toggle for autobuying it, and unlock a Quest`,
        //     done() { return player.sys.resetCount >= 6 && player.a.achievements.length >= 42 },
        //     toggles: [
        //         ["sys", "autoWNBP"]
        //     ]
        // }
        // IF THIS MILESTONE IS CHANGED, FIX CONDITION IN penny --> automate() AND functions --> investmentReset()
        // Dont forget to implement changes to QOL 2 and QOL 4
        // 5: Always autobuy all penny upgrades instantly but QOL 2 and QOL 4 have new (better) effects,
    },
    upgrades: {
        11: {
            title: "Where'd All My Money Go?!?",
            description:() => {
                if (!player.shiftDown) return "Multiply the point gain exponent by 1.01<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.01 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 11))}x`
        },
        12: {
            title: "There's Always More Space",
            description:() => {
                if (!player.shiftDown) return "Multiply stored investment & stored expansion gain by 1.25<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.25 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 12))}x`
        },
        13: {
            title: "Higher Level Education",
            description:() => {
                if (!player.shiftDown) return "All Education levels multiply investment gain by 1.02<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades and stays active in challenges<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => {
                let base = 1.02
                let buyablePow = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22)).add(getBuyableAmount("p", 23))
                let upgPow = Math.min(player.sys.upgrades.length, 10)
                return Math.pow(base, buyablePow.mul(upgPow))
            },
            effectDisplay:() => `${format(upgradeEffect("sys", 13))}x`
        },
        14: {
            title: "Dollars = More Dollars",
            description:() => {
                if (!player.shiftDown) return "Multiply the conversion rate by 1.05<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.05 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 14))}x`
        },
        15: {
            title: "Go Easy On Me",
            description:() => {
                if (!player.shiftDown) return "The Education II softcap starts 1.1<sup>upgrades<sup>*</sup></sup>x later"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.1 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 15))}x`
        },
        21: {
            title: "A Whole Dollar",
            description: "Multiply the expansion investment hardcap by 2 and its softcap by 4",
            cost:() => systemUpgradeCost(2)
        },
        22: {
            title: "Witchcraft",
            description: "Multiply the WNBP limit exponent by 1 + .3ln(ln(e + Best Dollars))",
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.best.add(Math.E).ln().ln().mul(.3).add(1),
            effectDisplay:() => `${format(upgradeEffect("sys", 22))}x`
        },
        23: {
            title: "Hacking in Extra Points",
            description: "Increase base point gain by 0.5 per Quest completion",
            cost:() => systemUpgradeCost(2),
            effect:() => player.quests.points.div(2),
            effectDisplay:() => `+${format(upgradeEffect("sys", 23), 1)}`
        },
        24: {
            title: "Rapid Expansion",
            description: "Multiply Penny Expansion gain by log2(2 + Best Dollars<sup>3</sup>) and its loss rate by 10x",
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.best.pow(3).add(2).log2(),
            effectDisplay:() => `+${format(upgradeEffect("sys", 24))}`
        },
        25: {
            title: "Efficient Education",
            description:() => {
                if (!player.shiftDown) return "Increase the coefficients used for Education III by .01<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(2),
            effect:() => .01  * Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `+${format(upgradeEffect("sys", 25))}`
        },
        211: {
            title: "Buy-in",
            description: "Unlock the Bills minigame and a new Quest, and gain 1 spent dollar",
            cost:() => decimalOne,
            onPurchase() { 
                updateBills(1)
            }
        }
    },
    buyables: {
        11: {
            title: "Apple Tree",
            cost() { 
                let amt = getBuyableAmount("sys", 11)
                return new Decimal(".1").mul(amt.add(1))
                //return new Decimal(0.1).mul(amt.pow_base(1.1))
            },
            display() { 
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${formatWhole(getBuyableAmount("sys", 11))}/100`
                    let effDesc = `<h3><b>Effect:</h3></b> Produce ${format(tmp.sys.businesses.apples.gain.div(tmp.sys.buyables[11].effect.clampMin(1)))}
                        ${coloredApples} per tree every ${format(tmp.sys.businesses.apples.cooldown)} seconds`
                    let eff = `Producing ${format(tmp.sys.businesses.apples.gain)} ${coloredApples} in ${format(tmp.sys.businesses.apples.cooldown- player.sys.businesses.apples.timer, 2)} seconds`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} dollars`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h2><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[11].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>0.1 * (x + 1)<sup>x</sup>`
                return `${effectiveLevels}\n\n${costFormula}`

            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 11)
                if (hasAchievement("a", 92)) ret = ret.add(1)

                return ret
            },
            effect() { 
                return tmp.sys.buyables[11].effectiveLevels
            },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                player.sys.points = player.sys.points.sub(this.cost())
                addBuyables("sys", 11, 1)
            }
        },
        12: {
            title: "Apple Picker",
            cost() { 
                let amt = getBuyableAmount("sys", 12)
                return new Decimal(10).mul(amt.pow_base(1.25)).mul(amt.pow(2).pow_base(1.01))
            },
            display() {
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 12)}/100`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce +.25 more ${coloredApples} per picker`
                    let eff = `Trees produce +${format(this.effect())} more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h3><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[12].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>10 * 1.25<sup>x</sup> * 1.01<sup>x<sup>2</sup></sup>`
                return `${effectiveLevels}\n\n${costFormula}`
            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 12)
                ret = ret.add(tmp.quests.bars.applesBar.reward) 
                
                return ret
            },
            effect() { return tmp.sys.buyables[12].effectiveLevels.mul(.25) },
            canAfford() { return player.sys.businesses.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables("sys", 12, 1)
            }
        },
        13: {
            title: "Apple Vendor",
            cost() { 
                let amt = getBuyableAmount("sys", 13)
                return new Decimal(100).mul(amt.pow_base(1.25)) 
            },
            display() {
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 13)}/50`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce 1.1x more ${coloredApples} per vendor`
                    let eff = `Trees produce ${format(this.effect())}x more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h3><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[13].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>100 * 1.2<sup>x</sup>`
                return `${effectiveLevels}\n\n${costFormula}`
            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 13)
                
                return ret
            },
            effect() { return tmp.sys.buyables[13].effectiveLevels.pow_base(1.1) },
            canAfford() { return player.sys.businesses.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables("sys", 13, 1)
            }
        },
        111: {
            title: "1 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 111)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[0])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 111)
                
                return ret
            },
            cooldown() {
                let ret = 1

                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.bills.spent.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 111, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 1}
        },
        112: {
            title: "2 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 112)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[1])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 112)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.bills.spent.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 112, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 2}
        },
        113: {
            title: "5 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 113)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[2])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 113)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 113, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 3}
        },
        121: {
            title: "10 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 121)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[3])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 121)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 121, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 4}
        },
        122: {
            title: "20 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 122)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[4])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 122)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 122, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 5}
        },
        123: {
            title: "50 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 123)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[5])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 123)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 123, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 6}
        },
        131: {
            title: "100 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 131)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[6])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 131)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() {return player.sys.points.gte(this.cost())},
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 131, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 7 }
        },
        132: {
            title: "1000 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 132)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[7])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 132)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() {  return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 132, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 8 }
        },
        133: {
            title: "10000 Dollar Bill",
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 133)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.sys.bills.timers[8])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect() {
                let ret = getBuyableAmount("sys", 133)
                
                return ret
            },
            cost() { return decimalOne },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("sys", 133, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.sys.bills.highestDenominationIndex >= 9}
        }
    },
    clickables: {
        11: {
            title: "Accelerator",
            display() {
                if (player.sys.acceleratorPower.points.eq(69)) return "nice."
                return `Accelerating business production speeds by ${format(this.effect())}x`
            },
            onClick() { player.sys.acceleratorPower.points = player.sys.acceleratorPower.points.add(1) },
            canClick: true,
            effect() {
                return Math.pow(1 + player.sys.acceleratorPower.points/100, 1/50)
            },
            unlocked:() => hasMilestone("sys", 3)
        },
        21: {
            title: "Spend Dollars",
            display() {
                return "Contribute some of your current dollars to spent dollars"
            },
            onClick() {
                let inp = prompt(`Enter the amount of dollars you would like to contribute into the field. To enter a percentage, use the % symbol; e.g, 25%.`)
                if (!inp) return
                let isPercent = false

                if (inp.endsWith("%")) {
                    inp = inp.slice(0, inp.length - 1)
                    isPercent = true
                }

                inp = Number(inp)

                if (Number.isNaN(inp)) {
                    alert("Invalid input, nothing has occurred")
                    return
                } else if (inp <= 0) {
                    alert("You must enter a positive non-zero number")
                    return
                } else if ((isPercent && inp > 100) || (!isPercent && player.sys.points.lt(inp))) {
                    alert("You cannot spend more dollars than you have, nothing has occurred")
                    return
                }

                let toSpend
                if (isPercent) toSpend = player.sys.points.mul(inp / 100)
                else toSpend = inp
                player.sys.points = player.sys.points.sub(toSpend)
                updateBills(toSpend)
            },
            canClick() { return player.sys.points.gt(0) }
        },
        22: {
            title: "Smack Attack",
            display() {
                if (player.shiftDown) return "You can hold this button to attack 20 times/s!"
                return `Gather your spent dollars in a leather bag and smack the enemy!<br>
                    ${format(this.effect())} damage per click<sup>*</sup>`
            },
            onClick() { 
                player.sys.bills.totalSmackDamage = player.sys.bills.totalSmackDamage.add(this.effect())
                attackEnemy(this.effect()) 
            },
            onHold() {
                player.sys.bills.totalSmackDamage = player.sys.bills.totalSmackDamage.add(this.effect())
                attackEnemy(this.effect())
            },
            canClick: true,
            effect() {
                let ret = player.sys.bills.spent.mul(.04)
                ret = ret.mul(tmp.quests.bars.smackBar.reward)
                return ret
            },
        }
    },
    bars: {
        enemyBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                return player.sys.bills.enemyHealth.div(this.maxHealth())
            },
            display() {
                return `${format(player.sys.bills.enemyHealth)}/${format(this.maxHealth())} HP`
            },
            name() {
                let names = ["Orphan", "Homeless Man", "Hobo", "Weary Traveler", "Bandit"]
                let index = Math.floor(player.sys.bills.enemyLevel / 10)
                return names[index]
            },
            maxHealth() {
                return new Decimal((1 + player.sys.bills.enemyLevel) * 100)
            },
            loot() {
                let base = .1
                let mul = 1
                let exp = 1

                return (base * mul) ** exp
            },
            textStyle() { return {'color':'gray'} }
        }
    },
    businesses: {
        apples: {
            gain:() => {
                let ret = decimalOne
                ret = ret.add(tmp.sys.buyables[12].effect)
                ret = ret.mul(tmp.sys.buyables[13].effect)
                ret = ret.mul(tmp.sys.buyables[11].effect).clampMin(1)
                return ret
            },
            effect:() => {
                let ret = player.sys.businesses.apples.points
                ret = ret.add(1).pow(.125)
                return ret
            },
            cooldown:() => {
                let ret = 60
                ret = ret / tmp.sys.clickables[11].effect
                return ret
            }
        }
    },
    update(diff) {
        //throw Error("Justify the existence of denominations by locking buyables(?)")
        if (getBuyableAmount("sys", 11).gt(0)) {
            player.sys.businesses.apples.timer += diff
            let cooldown = tmp.sys.businesses.apples.cooldown
            if (player.sys.businesses.apples.timer > cooldown) {
                let gain = tmp.sys.businesses.apples.gain
                let timeMultiplier = Math.floor(player.sys.businesses.apples.timer / cooldown)
                gain = gain.mul(timeMultiplier)
                player.sys.businesses.apples.timer -= cooldown * timeMultiplier
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.add(gain)
            }
        }

        if (hasMilestone("sys", 4)) {
            for (i = 0; i <= 8; i++) {
                // map iteration index to buyable index
                let buyableIndex = 100 + 10 * (1 + Math.floor(i/3)) + (i % 3) + 1
                if (getBuyableAmount("sys", buyableIndex).gt(0)) {
                    player.sys.bills.timers[i] += diff
                    let cooldown = tmp.sys.buyables[buyableIndex].cooldown
                    if (player.sys.bills.timers[i] > cooldown) {
                        let gain = buyableEffect("sys", buyableIndex)
                        let timeMultiplier = Math.floor(player.sys.bills.timers[i] / cooldown)
                        gain = gain.mul(timeMultiplier)
                        player.sys.bills.timers[i] -= cooldown * timeMultiplier
                        attackEnemy(buyableEffect("sys", buyableIndex))
                    }
                }

            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                "prestige-button", "blank",
                "resource-display", "blank",
                ["display-text", function () { return "Current conversion rate is " + format(100*conversionRate(), 4) + " : 100 OoM" }],
                ["display-text", "Purchasing a upgrade increases the cost of other upgrades in the same row (see Info)"],
                "blank", 
                ["upgrades", [1, 2, 3, 4, 5]]
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                "milestones"
            ]
        },
        "Businesses": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by  
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                ["display-text", "Press shift to see effective levels and cost formulas for each buyable"], 
                ["buyables", [1, 2, 3]],
                ["display-text", function() { return `You have <span style="color: maroon; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.businesses.apples.points)}</span> apples, 
                    which multiply post-nerf penny gain by ${format(tmp.sys.businesses.apples.effect)}x<br>`
                }], "blank",
                ["clickables", [1]], "blank",
                () => hasMilestone("sys", 3) ? ["display-text", `You have ${formatWhole(player.sys.acceleratorPower.points)} Accelerator Power
                    <br>You gain 1 Accelerator Power from clicking the Accelerator, 10 from investment resets,
                    and 500 from dollar resets`
                ] : ""
            ],
            unlocked:() => hasMilestone("sys", 0)
        },
        "Bills": {
            content: [
                ["display-text", function() { let ret = `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by  
                    ${format(tmp.sys.effect)}<br><br>
                    You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.bills.spent)}</span></h2> spent dollars, which means you do ${format(tmp.sys.clickables[22].effect)} 
                    damage per smack attack.<br><br>
                    Because you have spent a total of <h3><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.bills.spentTotal)}</h3></span> dollars, the highest denomination available to you is 
                    the <h3>${player.sys.bills.highestDenomination}</h3> dollar bill`
                    
                    if (!Number.isNaN(player.sys.bills.nextDenominationUnlock)) ret += `. Next denomination unlocks at
                    <h3><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                        ${player.sys.bills.nextDenominationUnlock}</span></h3> total spent dollars`
                    return ret + "<br><br>" 
                }],
                () => hasUpgrade("sys", 211) ? ["column", [
                    ["bar", "enemyBar"],
                    "blank",
                    ["display-text", `The level ${player.sys.bills.enemyLevel} ${tmp.sys.bars.enemyBar.name} 
                        will drop ${tmp.sys.bars.enemyBar.loot} Spent Dollars when defeated`],
                    ["display-text", `You have defeated this enemy 
                        ${player.sys.bills.currentEnemyKills}/${player.sys.bills.maxEnemyKills} times`],
                    "blank",
                    ["buyables", [11, 12, 13]], 
                    ["clickables", [2]],
                ]] : "",
                "blank",
                ["upgrades", [21]]
            ],
            unlocked:() => hasMilestone("sys", 4)
        },
        "Info": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                ["microtabs", "info"]
            ]
        }
    },
    microtabs: {
        info: {
            "Conversion Rate": {
                content: [
                    "blank",
                    ["display-text", `The "conversion rate" tells you how many dollars you will earn on 
                        reset given your current penny amount. It is given as a ratio between dollars and 
                        100 orders of magnitude of pennies. This ratio is initially 1 : 100 OoM, which means that
                        you will gain 1 dollar for every 100 orders of magnitude of pennies. <br><br>
                        For example, assuming a conversion rate of 1 : 100 OoM, if you had 1e100 pennies, 
                        you would gain 1 dollar on reset. Or, if you had 1e40 pennies, you would gain 0.4 dollars on reset.`
                    ],
                    "blank"
                ]
            },
            "Upgrades": {
                content: [
                    "blank",
                    ["display-text", `Similarly to Penny Expansion upgrades, upgrades in the System layer increase the cost of 
                        other upgrades in the same row. However, this cost increase is linear, meaning that each upgrade affects costs
                        by a static amount. Upgrades from different rows do not affect each other's costs.
                        
                        <br><br>There is no respec for System upgrades, so it is wise to be careful with how you choose to spend your Dollars. 
                        Still, you will eventually be able to buy every upgrade.
                        <br><br>The cost increases are as follows:
                        <br>Row 1: .15 Dollars per upgrade
                        <br>Row 2: .25 Dollars per upgrade`
                    ],
                    "blank"
                ], unlocked:() => hasMilestone("sys", 0)
            },
            "Businesses": {
                content: [
                    "blank",
                    ["display-text", `Businesses are one of the main features of the System. As you progress through this layer, you unlock
                        more industries/businesses and currencies that are used for various boosts. To gain access to these industries,
                        you will need to spend dollars. But don't worry! Your businesses will slowly make up for the loss.<br><br>
                        At first, you only have access to the Apple industry. For now, you can use your dollars to buy Apple Trees,
                        which passively produce apples. These apples can be used on the other two Apple businesses to gain more apples.
                        However, producing resources does take quite a long time... I wonder if there's a way to speed it up?<br><br>
                        <b>Keep in mind</b> that industry currencies (such as Apples) <b>will reset</b> when performing a dollar reset. <b>Make sure 
                        to spend</b> all of your resources before clicking that big gray button.`
                    ],
                    "blank"
                ], unlocked:() => hasMilestone("sys", 0)
            }
        }
    },
})