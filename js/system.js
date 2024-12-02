addLayer("sys", {
    symbol: "Sys",
    position: 2,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        best: decimalZero,
        total: decimalZero,
        resetCount: 0,
        autoEduBuyable: false,
        autoPennyUpg: false,
        everWNBP: false,
        lockWNBP: false,
        autoWNBP: false,
        autoPennyExpUpg: false,
        bestPenniesInReset: decimalZero,
        businesses: {
            apples: {
                points: decimalZero,
                best: decimalZero,
                timer: 0
            },
            land: {
                points: decimalOne,
                best: decimalOne,
                timer: -1,
            },
            acceleratorPower: {
                points: decimalZero
            },
        },
        departments: {
            11: decimalZero,
            12: decimalZero,
            13: decimalZero,
            21: decimalZero,
            22: decimalZero,
            23: decimalZero,
            31: decimalZero,
            32: decimalZero,
            33: decimalZero
        },
        deptInpPercent: 10,
        bestEducation1InReset: decimalZero
    }},
    color: "gray",
    requires:() => {
        return new Decimal("3.33e33")
    },
    type: "custom",
    resource: "dollars",
    row: 1,
    branches: ["p", "s", "e", "bills", "factory"],
    hotkeys: [
        {
            key: "d", 
            description: "D: Reset for dollars", 
            onPress(){ if (canReset(this.layer)) doReset(this.layer) }
        },
    ],
    layerShown:() => player.sys.unlocked,
    baseResource() { return !hasMilestone("sys", 5) ? "pennies" : "best pennies in this System reset" },
    baseAmount() { return !hasMilestone("sys", 5) ? player.p.best : player.sys.bestPenniesInReset },
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && hasUpgrade("p", 55) },
    gainMult() { 
        return conversionRate()
    },
    getResetGain() {
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        if (tmp[this.layer].baseAmount.lt(1)) return decimalZero
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
        return `${player[layer].points.lt(1e3) ? (tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for ") : ""}+<b>${format(tmp[layer].resetGain)}</b> ${tmp[layer].resource} ${tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3) ? `<br><br>Next at ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAt) : format(tmp[layer].nextAt))} ${tmp[layer].baseResource}` : ""}`
    },
    onPrestige() {
        // IF MODIFIED, GO TO STORAGE --> tmp.s.clickables[13].onClick()
        player.highestPointsEver = decimalZero
        player.sys.everWNBP = false
        player.subtabs.s.mainTabs = "Main"
        player.subtabs.e.mainTabs = "Info"

        player.sys.resetCount++

        updateMilestones("sys")

        if (tmp.a.achievements[93].unlocked && player.a.achievements.indexOf("93") == -1 && challengeCompletions("s", 11) == 0) {
            player.a.achievements.push("93")
            doPopup("achievement", tmp.a.achievements[93].name, "Achievement Gotten!", 3, tmp.a.color)
        }

        if (tmp.a.achievements[112].unlocked && player.a.achievements.indexOf("112") == -1 && player.sys.bestEducation1InReset.lte(10)) {
            player.a.achievements.push("112")
            doPopup("achievement", tmp.a.achievements[112].name, "Achievement Gotten!", 3, tmp.a.color)
        }

        let keptApples = decimalZero
        let keptLand = decimalOne

        if (hasMilestone("sys", 3)) {
            let gain = tmp.sys.businesses.acceleratorPower.dollarResetGain
            player.sys.businesses.acceleratorPower.points = player.sys.businesses.acceleratorPower.points.add(gain)
            keptApples = (player.sys.milestones.length - 2) ** 2
        }
        if (hasMilestone("sys", 8)) {
            keptLand = (player.sys.milestones.length - 7) ** 2
        }

        player.sys.businesses.apples.points = player.sys.businesses.apples.points.min(keptApples)
        player.sys.businesses.land.points = player.sys.businesses.land.points.min(keptLand)
        player.sys.businesses.apples.timer = 0
        player.sys.bestPenniesInReset = decimalZero
        player.sys.bestEducation1InReset = decimalZero

        if (hasUpgrade("sys", 124)) {
            let usedCharges = getBuyableAmount("sys", 21)
            if (usedCharges.gt(0)) setBuyableAmount("sys", 21, usedCharges.sub(1))
        }
    },
    effect() {
        let ret = player.sys.total.mul(2).add(1).pow(.5)
        if (ret.gte(100)) ret = softcap(ret, new Decimal(100), 0.2)
        return ret
    },
    effectDescription:() => `which currently multiplies 
            penny gain, investment gain, and stored investment/expansion gain by 
            ${format(tmp.sys.effect)} (based on total)`,
    milestones: {
        0: {
            requirementDescription: "1 System Reset",
            effectDescription:() => `Unlock Education III, Businesses, and Quests, keep the QOL 1/2 autobuyers (toggles),
                and multiply Expansion/Penny Expansion gain by 1.25x per milestone up to 5<br>Currently: 
                ${format(1.25**Math.min(5, player.sys.milestones.length))}x`,
            done() { return player.sys.resetCount >= 1 },
            toggles: [
                ["sys", "autoEduBuyable"],
                ["sys", "autoPennyUpg"]
            ]
        },
        1: {
            requirementDescription: "2 System Resets",
            effectDescription: "Unlock Stored Dollars and more Storage Upgrades, keep one row of achievements "
                + "per milestone (up to 7), and autobuy Education buyables 2x faster",
            done() { return player.sys.resetCount >= 2 }
        },
        2: {
            requirementDescription: "3 System Resets",
            effectDescription: `The 6th Storage milestone no longer requires Expansion challenge completions, and
                It's Only Reasonable also uses System Upgrades<sup>2</sup>`,
            done() { return player.sys.resetCount >= 3 }
        },
        3: {
            requirementDescription: "4 System Resets and 0.5 Stored Dollars",
            effectDescription:() => `Unlock the Accelerator, Accelerator Power, & Business Upgrades,
                and keep (milestones - 2)<sup>2</sup> Apples/Expansion Investment on System resets
                <br>Currently: ${formatWhole(Math.max(player.sys.milestones.length - 2, 0) ** 2)}`,
            done() { return player.sys.resetCount >= 4 && player.s.stored_dollars.points.gte(.5) }
        },
        4: {
            requirementDescription: "5 System Resets and 42 Achievements",
            effectDescription: `It's Expandin' Time! does not force WNBP,
                unlock a toggle (left) to prevent buying or autobuying WNBP when ON, 
                unlock a toggle (right) to autobuy it when ON,
                highest points ever always updates, and autobuy buyables 2x faster`,
            done() { return player.sys.resetCount >= 5 && player.a.achievements.length >= 42 },
            toggles: [
                ["sys", "lockWNBP"],
                ["sys", "autoWNBP"]
            ]
        },
        // IF THIS MILESTONE IS CHANGED, FIX CONDITION IN penny --> automate() AND functions --> investmentReset()
        // Dont forget to implement changes to QOL 2 and QOL 4
        5: {
            requirementDescription: "7 System Resets",
            effectDescription: `Autobuy penny upgrades up to row 5 instantly, QOL 4 has new (better) effects,
                dollar gain based on best Pennies over System reset, and unlock Bills and 2 more achievements`,
            done() { return player.sys.resetCount >= 7 }
        },
        6: {
            requirementDescription: "10 System Resets and 46 Achievements",
            effectDescription:() => player.shiftDown ? "Challenge effect applies when challenge is unlocked"
                : `Unlock another Business upgrade, 2 kept Storage Milestones,
                and even more achievements,
                and keep Expansion Challenge completions on reset<sup>*</sup>`,
            done() { return player.sys.resetCount >= 10 && player.a.achievements.length >= 46 }
        },
        7: {
            requirementDescription: "Zone 10 Completed and 1 Apple Visionary",
            effectDescription:() => player.shiftDown ? "Challenge effect applies when challenge is unlocked"
                : `Keep Investment Challenge score<sup>*</sup> on reset and autobuy Penny Expansion upgrades (toggle)`,
            done() { return tmp.bills.highestZoneCompleted >= 10 && getBuyableAmount("sys", 41).gte(1) },
            toggles: [
                ["sys", "autoPennyExpUpg"]
            ]
        },
        8: {
            requirementDescription: "Zone 20 Completed and 36 Land",
            effectDescription:() => `Keep (milestones - 7)<sup>2</sup> Land on reset
                <br>Currently: ${formatWhole(Math.max(player.sys.milestones.length - 7, 1) ** 2)}`,
            done() { return tmp.bills.highestZoneCompleted >= 20 && player.sys.businesses.land.points.gte(36) }
        }
    },
    getMainUpgCount() {
        return player.sys.upgrades.filter((index) => index < 100).length
    },
    upgrades: {
        11: {
            title: "Where'd All My Money Go?!?",
            description:() => {
                if (!player.shiftDown) return "Multiply the point gain exponent by 1.02<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.02 ** Math.min(tmp.sys.getMainUpgCount, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 11), 4)}x`
        },
        12: {
            title: "There's Always More Space",
            description: "Multiply stored investment & stored expansion gain by 1.25<sup>upgrades</sup>",
            cost:() => systemUpgradeCost(1),
            effect:() => 1.25 ** tmp.sys.getMainUpgCount,
            effectDisplay:() => `${format(upgradeEffect("sys", 12))}x`
        },
        13: {
            title: "Higher Level Education",
            description:() => {
                if (!player.shiftDown) return "All Education levels multiply investment gain by 1.02<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 5 upgrades and stays active in challenges<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => {
                let base = 1.02
                let buyablePow = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22)).add(getBuyableAmount("p", 23))
                let upgPow = Math.min(tmp.sys.getMainUpgCount, 5)
                return Math.pow(base, buyablePow.mul(upgPow))
            },
            effectDisplay:() => `${format(upgradeEffect("sys", 13))}x`
        },
        14: {
            title: "Dollars = More Dollars",
            description: "Multiply the conversion rate by 1.05<sup>upgrades</sup>",
            cost:() => systemUpgradeCost(1),
            effect:() => 1.05 ** tmp.sys.getMainUpgCount,
            effectDisplay:() => `${format(upgradeEffect("sys", 14))}x`
        },
        15: {
            title: "Go Easy On Me",
            description:() => {
                if (!player.shiftDown) return "The Education II softcap starts 1.03<sup>upgrades<sup>*</sup></sup>x later"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.03 ** Math.min(tmp.sys.getMainUpgCount, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 15))}x`
        },
        // *** fullDisplay USED TO SHOW DECIMALS IN COST *** 
        21: {
            fullDisplay() {
                let title = "A Whole Dollar"
                let desc = "Multiply the expansion investment hardcap by 2"
                let cost = `Cost: ${format(this.cost())} dollars`
                return `<h3>${title}</h3><br>${desc}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect: 2
        },
        22: {
            fullDisplay() {
                let title = "Witchcraft"
                let desc = "Multiply the WNBP effect exponent by (1 + .3log10(1 + Best Dollars))<sup>.5</sup>"
                let eff = `Currently: ${format(this.effect())}x`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.best.add(1).log10().mul(.3).add(1).pow(.5),
        },
        23: {
            fullDisplay() {
                let title = "Adventure Time"
                let desc = "Increase base point gain by 5 per Quest completion"
                let eff = `Currently: +${formatWhole(this.effect())}`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.quests.points * 5,
        },
        24: {
            fullDisplay() {
                let title = "Rapid Expansion"
                let desc = "Multiply Penny Expansion gain by log10(10 + Total Dollars<sup>upgrades</sup>) and its loss rate by 10x"
                let eff = `Currently: ${format(this.effect())}x`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.total.pow(tmp.sys.getMainUpgCount).add(10).log(10),
        },
        25: {
            fullDisplay() {
                let title = "Efficient Education"
                let desc = "Increase the coefficients used for Education III by .01 * upgrades<sup>*</sup>"
                if (player.shiftDown) desc = "Maxes at 10 upgrades<br>"
                let eff = `Currently: +${format(this.effect())}`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => .01  * Math.min(tmp.sys.getMainUpgCount, 10),
        },
        111: {
            title: "Workplace Morale",
            description() { 
                return `Each Apple Business bought multiplies its effective level by ${format(this.baseEffect(), 3)}`
            },
            cost: 8,
            baseEffect:() => {
                let ret = new Decimal("1.02")
                if (hasUpgrade("sys", 121)) ret = ret.add(upgradeEffect("sys", 121))

                return ret
            },
            effect() {
                let treeEff = getBuyableAmount("sys", 11).pow_base(this.baseEffect())
                let pickEff = getBuyableAmount("sys", 12).pow_base(this.baseEffect())
                let vendEff = getBuyableAmount("sys", 13).pow_base(this.baseEffect())
                return [treeEff, pickEff, vendEff]
            },
            effectDisplay() { return `${format(this.effect()[0])}x/${format(this.effect()[1])}x/${format(this.effect()[2])}x` },
            currencyDisplayName: "Apple Pickers",
            currencyInternalName: "12",
            currencyLocation:() => player.sys.buyables
        },
        112: {
            title: "Succulent Sphericals",
            description: "Gain 0.2 effective Apple Pickers and Vendors per bought Apple Tree",
            cost: 1000,
            effect:() => player.sys.buyables[11].div(5),
            effectDisplay() { return `+${format(this.effect())}` },
            currencyDisplayName: "Apples",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.apples
        },
        113: {
            title: "Efficient Watering",
            description:() => player.shiftDown ? "Q is the product of bought Businesses (plus 1)"
                : "Multiply Accelerator Power gain from all sources by (Q<sup>*</sup>)<sup>.1</sup>",
            cost: 10000,
            unlocked:() => hasMilestone("sys", 3),
            effect() {
                let ret = decimalOne
                for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
                    let amt = getBuyableAmount("sys", id)
                    if (typeof amt == "undefined") continue
                    ret = ret.mul(amt.add(1))
                }
                return ret.pow(.1)
            },
                // getBuyableAmount("sys", 11).mul(getBuyableAmount("sys", 12)).mul(getBuyableAmount("sys", 13))
                // .add(1).pow(.1),
            effectDisplay() { return `${format(this.effect())}x`},
            currencyDisplayName: "Accelerator Power",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.acceleratorPower
        },
        114: {
            title: "Multitasking",
            description: "Accelerator Power effect boosts the conversion rate at a reduced rate",
            cost: 13,
            unlocked:() => hasMilestone("sys", 3),
            effect:() => Number(tmp.sys.businesses.acceleratorPower.effect.pow(.5)),
            effectDisplay() { return `${format(this.effect())}x` },
            currencyDisplayName: "Apple Vendors",
            currencyInternalName: "13",
            currencyLocation:() => player.sys.buyables
        },
        115: {
            fullDisplay() {
                let title = "Green Apple"
                let description = "Unlock a new Business in the Apple industry"
                let req = "Requires: 100,000 Apples"

                return `<h3>${title}</h3><br>${description}<br><br>${req}`
            },
            canAfford:() => player.sys.businesses.apples.points.gte(100000),
            unlocked:() => hasMilestone("sys", 6)
        },
        121: {
            title: "Free Donuts",
            description: "Workplace Morale base effect is increased by .002 per bought Apple Tree up to 10",
            cost: 5,
            effect:() => getBuyableAmount("sys", 11).min(10).mul(.002),
            effectDisplay() { return `+${this.effect().toStringWithDecimalPlaces(3)}` },
            unlocked:() => getBuyableAmount("sys", 41).gte(1),
            currencyDisplayName: "Apple Pickers",
            currencyInternalName: "12",
            currencyLocation:() => player.sys.buyables
        },
        122: {
            fullDisplay() {
                let title = "Expansion Division"
                let desc = "Unlock a new Industry"
                let req = "Requires: 10,000 Apples"
                return basicUpgradeFormat(title, desc, req)
            },
            canAfford:() => player.sys.businesses.apples.points.gte(10000),
            unlocked:() => hasUpgrade("sys", 121)
        },
        123: {
            title: "Oiled Up",
            description: "Multiply Land Cultivator Strength by 1 + [% of Charges used]",
            cost: 10,
            effect:() => 1 + (tmp.sys.buyables[21].maxCharges - tmp.sys.buyables[21].remainingCharges) / tmp.sys.buyables[21].maxCharges,
            effectDisplay() { return `${format(this.effect())}x`},
            unlocked:() => getBuyableAmount("sys", 22).gte(1),
            currencyDisplayName: "Land",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.land
        },
        124: {
            title: "Battery Pack",
            description: "Recharge 1 Used Charge every time you perform a System Reset",
            cost: 30,
            unlocked:() => hasUpgrade("sys", 123),
            currencyDisplayName: "Land",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.land
        },
        125: {
            title: "Supercharged",
            description: "Time Flux<sup>.25</sup> multiplies Eff. Str. and Loot, but divide Charge active time by 1.2",
            cost: 250,
            effect:() => timeFlux() ** .25,
            effectDisplay() { return `${format(this.effect())}x`},
            unlocked:() => hasUpgrade("sys", 124),
            currencyDisplayName: "Land",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.land
        },
        131: { // if change id, then also change id for tabFormat and microtabs
            title: "The Big One",
            description() { 
                return !hasUpgrade("sys", 131) ? (
                    player.shiftDown ? "See Info for more detail"
                    : "Businesses buffed permanently based on Department levels<sup>*</sup>"
                ) : "Unlock Departments" 
            },
            cost: Number.POSITIVE_INFINITY,//1000,
            effect() {
                return {
                    11: 0,
                    12: 0,
                    13: 0,
                    21: 0,
                    22: 0,
                    23: 0,
                    31: 0,
                    32: 0,
                    33: 0
                }
            },
            unlocked:() => hasUpgrade("sys", 125) && getBuyableAmount("sys", 23).gt(0),
            currencyDisplayName: "Land",
            currencyInternalName: "points",
            currencyLocation:() => player.sys.businesses.land
        }
    },
    buyables: {
        11: {
            title: "Apple Tree",
            baseCost() {
                let ret = new Decimal(".1")
                ret = ret.mul(getBuyableAmount("sys", 41).pow(2).pow_base(10))
                ret = ret.div(tmp.sys.businesses.land.effectCost)
                return ret
            },
            cost(x) { 
                let ret = this.baseCost().mul(x.add(1))
                return ret
                //return new Decimal(0.1).mul(amt.pow_base(1.1))
            },
            display() { 
                let perTree = format(tmp.sys.businesses.apples.gain.div(tmp.sys.buyables[11].effectiveLevels.clampMin(1)))
                if (!player.shiftDown) {
                    let levels = `<h3><b>Levels:</h3></b> ${formatWhole(getBuyableAmount("sys", 11))}/${this.maxLevels()}`
                    let effectiveLevels = `<h3><b>Effective:</h3></b> ${format(tmp.sys.buyables[11].effectiveLevels)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Produce ${perTree} ${coloredApples}
                        per tree every ${format(tmp.sys.businesses.apples.maxTimer)} seconds`
                    let eff = `Producing ${format(tmp.sys.businesses.apples.gain)} ${coloredApples} in ${format(tmp.sys.businesses.apples.maxTimer- player.sys.businesses.apples.timer, 2)} seconds`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} dollars`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                //let effFormula = `<h3><b>Effect Formula:</h3></b><br>${format(perTree)} * [Effective x]`
                return `<h3><b>Cost Formula:</h3></b><br>${format(this.baseCost())} * (x + 1)`
                //return `${effFormula}\n\n${costFormula}`

            },
            effectiveLevels() {
                let ret = getBuyableAmount("sys", 11)
                if (hasAchievement("a", 92)) ret = ret.add(1)

                if (hasUpgrade("sys", 111)) ret = ret.mul(upgradeEffect("sys", 111)[0])
                ret = ret.mul(shopEffect(101))

                ret = ret.mul(buyableEffect("sys", 111))

                return ret
            },
            maxLevels() { 
                let ret = 5
                ret += tmp.sys.businesses.land.effectTrees
                return ret
            },
            effect() { 
                let ret = tmp.sys.buyables[11].effectiveLevels
                ret = ret.mul(tmp.s.stored_dollars.effects[3])
                
                if (hasMilestone("s", 1) && hasUpgrade("s", 14)) ret = ret.mul(tmp.s.stored_expansion.effects[3][0])
                    ret = ret.mul(getBuyableAmount("sys", 41).pow_base(5))
                
                return ret
            },
            canAfford() { 
                return player.sys.points.gte(this.cost()) 
                && getBuyableAmount(this.layer, this.id).lt(this.maxLevels()) 
            },
            buy() {
                player.sys.points = player.sys.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            }
        },
        12: {
            title: "Apple Picker",
            baseCost() {
                let ret = new Decimal(10)
                ret = ret.mul(getBuyableAmount("sys", 41).pow_base(10))
                return ret
            },
            cost(x) { 
                return this.baseCost().mul(x.pow_base(1.3)).mul(x.pow(2).pow_base(1.01))
            },
            display() {
                if (!player.shiftDown) {
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 12)}/${this.maxLevels()}`
                    let effectiveLevels = `<h3><b>Effective:</h3></b> ${format(tmp.sys.buyables[12].effectiveLevels)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce +${format(this.baseEffect())} `
                        + `more base ${coloredApples} per picker`
                    let eff = `Trees produce +${format(this.effect())} more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                return `<h3><b>Cost Formula:</h3></b><br>${format(this.baseCost())} * 1.3<sup>x</sup> * 1.01<sup>x<sup>2</sup></sup>`
            },
            effectiveLevels() {
                let ret = getBuyableAmount("sys", 12)
                if (ret.eq(0)) return ret
                if (hasUpgrade("sys", 112)) ret = ret.add(upgradeEffect("sys", 112))
                ret = ret.add(getBuyableAmount("sys", 41))
                
                ret = ret.mul(tmp.quests.bars.applesBar.reward)
                if (hasUpgrade("sys", 111)) ret = ret.mul(upgradeEffect("sys", 111)[1])

                ret = ret.mul(buyableEffect("sys", 112))
                return ret
            },
            maxLevels() {
                let ret = 20
                ret += Number(getBuyableAmount("sys", 41).mul(16))

                return ret
            },
            baseEffect() {
                let ret = new Decimal(.2)
                ret = ret.add(getBuyableAmount("sys", 41).mul(.04))
                return ret
            },
            effect() {
                return tmp.sys.buyables[12].effectiveLevels.mul(this.baseEffect())
            },
            canAfford() { 
                return player.sys.businesses.apples.points.gte(this.cost()) 
                    && getBuyableAmount(this.layer, this.id).lt(this.maxLevels()) 
            },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables(this.layer, this.id, 1)
            }
        },
        13: {
            title: "Apple Vendor",
            baseCost() { 
                let ret = new Decimal(100)
                ret = ret.mul(getBuyableAmount("sys", 41).pow_base(10))

                return ret
            },
            cost(x) { 
                return this.baseCost().mul(x.pow_base(1.4)).mul(x.pow(2).pow_base(1.01))
            },
            display() {
                if (!player.shiftDown) {
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 13)}/${this.maxLevels()}`
                    let effectiveLevels = `<h3><b>Effective:</h3></b> ${format(tmp.sys.buyables[13].effectiveLevels)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce ${format(this.baseEffect())}x `
                        + `more ${coloredApples} per vendor`
                    let eff = `Trees produce ${format(this.effect())}x more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                return `<h3><b>Cost Formula:</h3></b><br>${format(this.baseCost())} * 1.4<sup>x</sup> * 1.01<sup>x<sup>2</sup></sup>`
            },
            effectiveLevels() {
                let ret = getBuyableAmount("sys", 13)
                if (ret.eq(0)) return ret
                if (hasUpgrade("sys", 112)) ret = ret.add(upgradeEffect("sys", 112))
                ret = ret.add(getBuyableAmount("sys", 41))

                if (hasUpgrade("sys", 111)) ret = ret.mul(upgradeEffect("sys", 111)[2])

                ret = ret.mul(buyableEffect("sys", 111))
                
                return ret
            },
            maxLevels() {
                let ret = 15
                ret += Number(getBuyableAmount("sys", 41).mul(17))

                return ret
            },
            baseEffect() {
                let ret = new Decimal(1.1)
                ret = ret.add(getBuyableAmount("sys", 41).mul(.01))
                return ret
            },
            effect() { 
                return tmp.sys.buyables[13].effectiveLevels.pow_base(this.baseEffect()) 
            },
            canAfford() { 
                return player.sys.businesses.apples.points.gte(this.cost()) 
                    && getBuyableAmount(this.layer, this.id).lt(this.maxLevels()) 
            },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables(this.layer, this.id, 1)
            }
        },
        41: {
            title: "Apple Visionaries",
            cost(x) {
                x = Number(x)
                switch (x) {
                    case 0: return new Decimal("1e5")
                    case 1: return new Decimal("1e13")
                    case 2: return new Decimal("1e24")
                    case 3: return new Decimal("2e38")
                    case 4:
                    case 5: return new Decimal("1e53")
                    default: throw Error(`Invalid number of Apple Visionaries: ${x}`)
                }
            },
            canAfford() {
                return getBuyableAmount(this.layer, this.id).eq(5) && 
                    getBuyableAmount(this.layer, 11).gte(5) &&
                    getBuyableAmount(this.layer, 12).eq(tmp.sys.buyables[12].maxLevels) &&
                    getBuyableAmount(this.layer, 13).eq(tmp.sys.buyables[13].maxLevels)
            },
            display() {
                if (player.shiftDown) return "See Info tab for more information on what purchasing a visionary does"
                // Change max levels in this line to 5 when making this buyable purchasable in the next update
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 41)}/5`
                let effDesc = "Reset the entire Apple industry for 1 visionary<sup>*</sup>"
                let ret = `${levels}\n\n${effDesc}\n\n`
                // ret += `<h3>PURCHASABLE NEXT UPDATE</h3>`
                // return ret
                if (getBuyableAmount("sys", 41).lt(5)) {
                    ret += `<h3><b>Requires:</h3></b> ${format(this.cost())} ${coloredApples}, 5 Trees, maxed Pickers/Vendors`
                } else {
                    ret += `<h3><b>MAXED</h3></b>`
                }
                return ret
            },
            buy() {
                let confirmText = "Are you sure you want to buy an Apple Visionary? All previous bought Apple Businesses, "
                    + "including Apple Trees, will be reset to 0, and you will not be able to produce Apples until you can "
                    + "afford and purchase an Apple Tree."
                if (!confirm(confirmText)) return
                player.sys.businesses.apples.points = decimalZero
                player.sys.businesses.apples.best = decimalZero
                //player.sys.businesses.apples.points.sub(this.cost()) 
                setBuyableAmount(this.layer, 11, decimalZero)
                setBuyableAmount(this.layer, 12, decimalZero)
                setBuyableAmount(this.layer, 13, decimalZero)
                player.sys.businesses.apples.timer = 0
                addBuyables(this.layer, this.id, 1)
            },
            unlocked:() => hasUpgrade("sys", 115),
            style() { 
                return {
                    "width":"150px",
                    "height":"150px",
                }
            }
        },
        21: {
            title: "Land Cultivator",
            baseCost() {
                let ret = new Decimal(10000)
                ret = ret.mul(getBuyableAmount("sys", 23).pow_base(250))
                return ret
            },
            cost(x) { 
                return x.pow_base(1.3).mul(x.pow(2).pow_base(1.001)).mul(this.baseCost())
            },
            display() { 
                if (!player.shiftDown) {
                    let levels = `<h3><b>Used Charges:</h3></b> ${formatWhole(getBuyableAmount("sys", this.id))}/${this.maxCharges()}`
                    let effectiveLevels = `<h3><b>Effective Strength:</h3></b> ${format(tmp.sys.buyables[this.id].effectiveStr)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Prepare ${format(tmp.sys.businesses.land.gain)} Land for every second activated`
                    let eff = "<h3>Currently:</h3> " + (this.active() ? `Deactivated in ${timeDisplay(this.remainingSeconds())}` : "inactive")
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} apples`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effFormula = `<h3><b>Effect Formula:</h3></b><br>0.1 * [Effective Strength] * [Accelerator Power Effect]`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>${format(this.baseCost())} * 1.3<sup>x</sup> * 1.001^x<sup>2</sup>`
                return `${effFormula}<br><br>${costFormula}`

            },
            active() {
                return player.sys.businesses.land.timer >= 0
            },
            remainingSeconds() {
                return tmp.sys.businesses.land.maxTimer - player.sys.businesses.land.timer
            },
            remainingCharges() {
                return this.maxCharges() - getBuyableAmount("sys", this.id).toNumber()
            },
            effectiveStr() {
                let ret = decimalOne
                if (hasUpgrade(this.layer, 123)) ret = ret.mul(upgradeEffect(this.layer, 123))
                ret = ret.mul(buyableEffect("sys", 22)[0])

                //ret = ret.mul(buyableEffect("sys", 121))

                return ret
            },
            maxCharges() { 
                let ret = 25
                ret += buyableEffect("sys", 23)[0]
                return ret
            },
            canAfford() { 
                return player.sys.businesses.apples.points.gte(this.cost()) 
                    && this.remainingCharges() > 0 && !this.active()
            },
            buy() {
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost())
                player.sys.businesses.land.timer = 0
            },
            unlocked:() => hasUpgrade("sys", 122)
        },
        22: {
            title: "Land Surveyor",
            baseCost() {
                let ret = new Decimal(10)
                return ret
            },
            cost(x) { 
                return x.pow_base(4).mul(x.pow(2).pow_base(1.02)).mul(this.baseCost())
            },
            display() { 
                if (!player.shiftDown) {
                    let levels = `<h3><b>Levels:</h3></b> ${formatWhole(getBuyableAmount("sys", this.id))}/${this.maxLevels()}`
                    let effectiveLevels = `<h3><b>Effective Levels:</h3></b> ${format(tmp.sys.buyables[this.id].effectiveLevels)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Raise Land to ^.25, but double Effective Strength and Charges last 1.25x longer`
                    let eff = `<h3>Currently:</h3> ${formatWhole(this.effect()[0])}x Effective Strength, ${format(this.effect()[1])}x Charge duration`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} Land`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                return `<h3><b>Cost Formula:</h3></b><br>${format(this.baseCost())} * 4<sup>x</sup> * 1.02^x<sup>2</sup>`

            },
            effectiveLevels() {
                let ret = getBuyableAmount(this.layer, this.id)
                //ret = ret.mul(buyableEffect(this.layer, 122))
                return ret
            },
            effect() {
                let effLvl = this.effectiveLevels()
                return [effLvl.pow_base(2), effLvl.pow_base(1.25).toNumber()]
            },
            maxLevels() { return 10 },
            canAfford() { 
                return player.sys.businesses.land.points.gte(this.cost())
            },
            buy() {
                player.sys.businesses.land.points = player.sys.businesses.land.points.pow(.25)
                addBuyables(this.layer, this.id, 1)
            },
            unlocked:() => hasUpgrade("sys", 122)
        },
        23: {
            title: "Land Revitalizer",
            cost() { 
                return tmp.sys.buyables[21].maxCharges
            },
            display() { 
                if (!player.shiftDown) {
                    let levels = `<h3><b>Levels:</h3></b> ${formatWhole(getBuyableAmount("sys", this.id))}/${this.maxLevels()}`
                    let effectiveLevels = `<h3><b>Effective Levels:</h3></b> ${format(tmp.sys.buyables[this.id].effectiveLevels)}`
                    let effDesc = `<h3><b>Effect:</h3></b> Reset Used Charges, increase max Charges by 5, multiply cost base by 250x, and Charges last 1.5x longer`
                    let eff = `<h3>Currently:</h3> +${this.effect()[0]} max Charges, ${format(this.effect()[1])}x Charge duration`
                    let cost = `<h3><b>Requires:</h3></b> ${format(this.cost())} Used Charges`

                    return `${levels}\n${effectiveLevels}\n\n${effDesc}\n${eff}\n\n${cost}`
                }

                return `<h3><b>Cost Formula:</h3></b><br>Max Charges Available`
            },
            effectiveLevels() {
                let ret = getBuyableAmount(this.layer, this.id)
                //ret = ret.mul(buyableEffect(this.layer, 123))
                return ret
            },
            effect() {
                let effLvl = this.effectiveLevels()
                return [effLvl.mul(5).toNumber(), effLvl.pow_base(1.5).toNumber()]
            },
            maxLevels() { return 5 },
            canAfford() { 
                return getBuyableAmount(this.layer, 21).eq(this.cost())
            },
            buy() {
                setBuyableAmount(this.layer, 21, decimalZero)
                addBuyables(this.layer, this.id, 1)
            },
            unlocked:() => hasUpgrade("sys", 122)
        },

        // when add all businesses, remove continue statement from upg 113
        111: {
            title: "Farmland Organization",
            resource: "apples",
            resourceInternal:() => player.sys.businesses.apples,
            display() {
                return `<h3>Levels: ${format(this.level())}</h3><br>
                <h3>Effect: ${format(this.effect())}x</h3> eff. apple trees<br>
                You have invested <h3>${format(getBuyableAmount(this.layer, this.id))}</h3> ${this.resource}
                Next full level at <h3>${format(this.nextLevel())}</h3> ${this.resource}`
            },
            canAfford: true,
            effect() {
                return this.level().mul(10).sqrt().div(10).add(1)
            },
            level() {
                return getBuyableAmount(this.layer, this.id).max(1).log10().div(6)
            },
            nextLevel() {
                return this.level().floor().add(1).mul(6).pow_base(10)
            },
            buy() {
                let pts = this.resourceInternal().points
                let spent = pts.mul(player.sys.deptInpPercent / 100)
                addBuyables(this.layer, this.id, spent)
                this.resourceInternal().points = pts.sub(spent)
            },
            unlocked() { return tmp.sys.buyables[this.id - 100].unlocked }
        },
        112: {
            title: "Farmland Organization",
            resource: "apples",
            resourceInternal:() => player.sys.businesses.apples,
            display() {
                return `<h3>Levels: ${format(this.level())}</h3><br>
                You have invested <h3>${format(getBuyableAmount(this.layer, this.id))}</h3> ${this.resource}<br>
                Next full level at <h3>${format(this.nextLevel())}</h3> ${this.resource}`
            },
            canAfford: true,
            effect() {
                return this.level().add(1)
            },
            level() {
                return getBuyableAmount(this.layer, this.id).max(1).log10().div(10)
            },
            nextLevel() {
                return this.level().floor().add(1).mul(10).pow(10)
            },
            buy() {
                let pts = this.resourceInternal().points
                let spent = pts.mul(player.sys.deptInpPercent / 100)
                addBuyables(this.layer, this.id, spent)
                this.resourceInternal().points = pts.sub(spent)
            },
            unlocked() { return tmp.sys.buyables[this.id - 100].unlocked }
        },
        113: {
            title: "Farmland Organization",
            resource: "apples",
            resourceInternal:() => player.sys.businesses.apples,
            display() {
                return `<h3>Levels: ${format(this.level())}</h3><br>
                You have invested <h3>${format(getBuyableAmount(this.layer, this.id))}</h3> ${this.resource}<br>
                Next full level at <h3>${format(this.nextLevel())}</h3> ${this.resource}`
            },
            canAfford: true,
            effect() {
                return this.level().add(1)
            },
            level() {
                return getBuyableAmount(this.layer, this.id).max(1).log10().div(10)
            },
            nextLevel() {
                return this.level().floor().add(1).mul(10).pow(10)
            },
            buy() {
                let pts = this.resourceInternal().points
                let spent = pts.mul(player.sys.deptInpPercent / 100)
                addBuyables(this.layer, this.id, spent)
                this.resourceInternal().points = pts.sub(spent)
            },
            unlocked() { return tmp.sys.buyables[this.id - 100].unlocked }
        },
    },
    clickables: {
        11: {
            title: "Accelerator",
            display() {
                if (player.shiftDown) return "You can hold this button to click 20 times/s!"
                if (player.sys.businesses.acceleratorPower.points.eq(69)) return "nice."
                return `Accelerating business production by
                    ${format(tmp.sys.businesses.acceleratorPower.effect)}x`
            },
            onClick() { 
                let gain = tmp.sys.businesses.acceleratorPower.clickGain
                let acceleratorPower = player.sys.businesses.acceleratorPower
                acceleratorPower.points = acceleratorPower.points.add(gain)
            },
            onHold() { this.onClick() },
            canClick: true,
            effect() {
                return player.sys.businesses.acceleratorPower.points.div(100).add(1).pow(1/50)
            },
            unlocked:() => hasMilestone("sys", 3)
        },
        21: {
            title: "1%",
            style() {
                return {'min-height':'50px', 'width':'50px'}
            }
        },
        22: {
            title: "10%",
            style() {
                return {'min-height':'50px', 'width':'50px'}
            }
        },
        23: {
            title: "100%",
            style() {
                return {'min-height':'50px', 'width':'50px'}
            }
        }
    },
    businesses: {
        apples: {
            gain() {
                let ret = decimalOne
                ret = ret.add(tmp.sys.buyables[12].effect)
                ret = ret.mul(tmp.sys.buyables[13].effect)

                ret = ret.mul(tmp.sys.buyables[11].effect).clampMin(1)

                ret = ret.mul(tmp.sys.businesses.land.effectGain)
                return ret
            },
            effect() {
                let base = player.sys.businesses.apples.points.add(1)
                let exp = getBuyableAmount("sys", 41).mul(.01).add(.15)

                return base.pow(exp)
            },
            maxTimer() {
                let ret = 60
                ret = ret / tmp.sys.businesses.acceleratorPower.effect
                return ret
            }
        },
        land: {
            unlocked:() => hasUpgrade("sys", 122),
            gain() {
                let ret = new Decimal(0.1)
                ret = ret.mul(tmp.sys.buyables[21].effectiveStr)
                ret = ret.mul(tmp.sys.businesses.acceleratorPower.effect)
                if (hasUpgrade("sys", 125)) ret = ret.mul(upgradeEffect("sys", 125))
                
                return ret
            },
            effectGain() {
                let ret = player.sys.businesses.land.points.add(Math.E - 1).ln()
                return ret
            },
            effectTrees() {
                let ret = player.sys.businesses.land.best.add(1).log2().div(2).ceil().sub(1)
                return ret.floor().toNumber()
            },
            effectCost() {
                let ret = this.effectTrees() / 5 + 1
                return ret
            },
            maxTimer() {
                let ret = 10
                ret *= buyableEffect("sys", 22)[1]
                ret *= buyableEffect("sys", 23)[1]
                if (hasUpgrade("sys", 125)) ret /= 1.5
                return ret
            }
        },
        acceleratorPower: {
            clickGain() {
                let ret = decimalOne
                ret = ret.mul(this.allGainMult())
                return ret
            },
            investmentResetGain() {
                let ret = new Decimal(25)
                ret = ret.mul(this.allGainMult())
                return ret
            },
            dollarResetGain() {
                let ret = new Decimal(500)
                ret = ret.mul(this.allGainMult())
                return ret
            },
            allGainMult() {
                let ret = decimalOne 
                ret = ret.mul(tmp.quests.bars.acceleratorBar.reward)
                if (hasUpgrade("sys", 113)) ret = ret.mul(upgradeEffect("sys", 113))
                ret = ret.mul(getBuyableAmount("sys", 41).pow_base(2))
                if (hasUpgrade("bills", 15)) ret = ret.mul(upgradeEffect("bills", 15))
                return ret
            },
            effect() {
                return player.sys.businesses.acceleratorPower.points.div(100).add(1).pow(.05)
            }
        }
    },
    update(diff) {
        //throw Error("Justify the existence of denominations by locking buyables(?)")
        if (getBuyableAmount("sys", 11).gt(0)) {
            player.sys.businesses.apples.timer += diff
            let maxTimer = tmp.sys.businesses.apples.maxTimer
            if (player.sys.businesses.apples.timer > maxTimer) {
                let gain = tmp.sys.businesses.apples.gain
                let timeMultiplier = Math.floor(player.sys.businesses.apples.timer / maxTimer)
                gain = gain.mul(timeMultiplier)
                player.sys.businesses.apples.timer -= maxTimer * timeMultiplier
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.add(gain)
                player.sys.businesses.apples.best = player.sys.businesses.apples.points.max(player.sys.businesses.apples.best)
            }
        }

        if (player.sys.businesses.land.timer >= 0) {
            player.sys.businesses.land.timer += diff
            let maxTimer = tmp.sys.businesses.land.maxTimer

            let secondsPassed = Math.min(diff, maxTimer) // cannot produce more than time available
            let gain = tmp.sys.businesses.land.gain.mul(secondsPassed)
            player.sys.businesses.land.points = player.sys.businesses.land.points.add(gain)
            player.sys.businesses.land.best = player.sys.businesses.land.best.max(player.sys.businesses.land.points)

            if (player.sys.businesses.land.timer >= maxTimer) {
                player.sys.businesses.land.timer = -1
                addBuyables(this.layer, 21, 1)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["main-display", 2],
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
                ["main-display", 2],
                ["display-text", function() { 
                    return `You have done a total of ${player.sys.resetCount} System resets` 
                }],
                "milestones"
            ]
        },
        "Businesses": {
            content: [
                //["main-display", 2],
                ["display-text", () => {
                    let ret = `You have <h2 style="color: maroon; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.sys.businesses.apples.points)}</h2> apples, 
                    which currently multiplies post-nerf penny gain by ${format(tmp.sys.businesses.apples.effect)}x`
                    if (tmp.sys.businesses.land.unlocked) ret += `, <h2 style="color: #784212; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.sys.businesses.land.points)}</h2> land, which currently multiplies Apple gain by ${format(tmp.sys.businesses.land.effectGain)}x,
                    increases maximum Apple Trees by +${tmp.sys.businesses.land.effectTrees} and divides
                    base Apple Tree cost by ${format(tmp.sys.businesses.land.effectCost)}`
                    return ret + "<br>"
                }], "blank",
                ["display-text", "Press shift to see cost formulas and other available information for each buyable"], 
                ["buyables", [1, 2, 3, 4]], "blank",
                ["upgrades", [11, 12, 13, 14, 15]], 
                ["display-text", "Produced currencies (such as Apples) <b>will reset</b> when performing a system reset"],
                "blank",
                ["clickables", [1]], "blank",
                () => hasMilestone("sys", 3) ? ["display-text", `You have ${formatWhole(player.sys.businesses.acceleratorPower.points)} Accelerator Power
                    <br>You gain ${format(tmp.sys.businesses.acceleratorPower.clickGain)} Accelerator Power from clicking<sup>*</sup> on the Accelerator,
                    ${format(tmp.sys.businesses.acceleratorPower.investmentResetGain)} from investment resets,
                    and ${format(tmp.sys.businesses.acceleratorPower.dollarResetGain)} from system resets`
                ] : "", "blank"
            ],
            unlocked:() => hasMilestone("sys", 0)
        },
        "Departments": {
            content: [
                ["main-display", 2],
                ["row", [
                    ["display-text", () => `Spending <b>${player.sys.deptInpPercent}%</b> of resources` ], "blank",
                    ["slider", ["deptInpPercent", 1, 100]]
                ]], "blank",
                ["display-text", function() { return `You have <span style="color: maroon; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.businesses.apples.points)}</span> apples, 
                    which multiply post-nerf penny gain by ${format(tmp.sys.businesses.apples.effect)}x<br>`
                }], "blank",
                ["buyables", [11, 12, 13]]
            ],
            unlocked:() => hasUpgrade("sys", 131)
        },
        "Info": {
            content: [
                ["main-display", 2],
                ["microtabs", "info"]
            ]
        }
    },
    microtabs: {
        info: {
            "Conversion Rate": {
                content: [
                    "blank",
                    ["display-text", function() { return `The "conversion rate" tells you how many dollars you will earn on 
                        reset given your current penny amount. It is given as a ratio between dollars and 
                        100 orders of magnitude of pennies. This ratio is initially 1 : 100 OoM, which means that
                        you will gain 1 dollar for every 100 orders of magnitude of pennies. <br><br>
                        For example, assuming a conversion rate of 1 : 100 OoM, if you had 1e100 pennies, 
                        you would gain 1 dollar on reset. Or, if you had 1e40 pennies, you would gain 0.4 dollars on reset.
                        <br><br>The base conversion rate is currently: ${format(baseConversionRate(), 4)} : 100 OoM
                        <br>The conversion rate after other boosts is currently: ${format(conversionRate() * 100, 4)} : 100 OoM`
                    }],
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
                        <br>Row 2: .5 Dollars per upgrade
                        <br><br>Business upgrades do not follow this convention, and are not used in the calculation for upgrade count`
                    ],
                    "blank"
                ]
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
                        <h3>IMPORTANT</h3><br>
                        <b>Keep in mind</b> that industry currencies (such as Apples) <b>will reset</b> when performing a system reset. <b>Make sure 
                        to spend</b> all of your resources before clicking that big gray button.`
                    ],
                    "blank"
                ], unlocked:() => hasMilestone("sys", 0)
            },
            "Visionaries": {
                content: [
                    "blank",
                    ["display-text", function() { let amt = Number(getBuyableAmount("sys", 41))
                        return `Visionaries are the prestige/ascension mechanic of Businesses that open the door to
                        massive Business numbers. There is one Visionary dedicated to each industry, and they have unique buffs/nerfs.
                        However, they share the same mechanic when bought: reset their industry's currency and
                        each buyable from their industry to 0. Visionaries are limited to five levels regardless of industry.
                        <br><br><h3>Effects</h3>:<br><br>
                        Apple Visionary (${amt}/5)<br><br>
                        <ul style="list-style-type:disc; display:flex; flex-direction:column; padding-inline-start:0">
                            <li style="margin-left:20%">+${16*amt} max Apple Pickers, +${17*amt} max Apple Vendors</li>
                            <li style="margin-left:20%">+${amt} effective Apple Pickers/Vendors</li>
                            <li style="margin-left:20%">Apple Picker effect +${amt * .04}</li>
                            <li style="margin-left:20%">Apple Vendor effect +${amt * .01}</li>
                            <li style="margin-left:20%">Apple effect exponent +${amt * .01} (^0.15 -> ^${format(.15 + amt * .01)})</li>
                            <li style="margin-left:20%">${5 ** amt}x apples from trees</li>
                            <li style="margin-left:20%">${10 ** amt}x base Apple Picker/Vendor costs</li>
                            <li style="margin-left:20%">${10 ** (amt ** 2)}x base Apple Tree cost</li>
                            <li style="margin-left:20%">${2 ** amt}x to Accelerator Power from all sources</li>
                        </ul>`
                        // <br>For each Apple Visionary, Apple Picker/Vendor have 16/17 more max levels, gain 1 effective Apple Picker/Vendor, Apple Picker's
                        // effect is increased by .04, Apple Vendor's effect is increased by .02, quintuple apples from trees, multiply base costs by 10,
                        // and double accelerator power gain from all sources.`
                    }], "blank"
                ],
                unlocked:() => hasUpgrade("sys", 115)
            },
            "Departments": {
                content: [
                    "blank",
                    ["display-text", ``
                    ], "blank", "blank"
                ],
                unlocked:() => hasUpgrade("sys", 131)
            }
        }
    },
})

let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`