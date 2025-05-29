function resetBanksMini() {

}

function banksRowUpgCount(row) {
    let maxCol
    switch (row) {
        case 1: maxCol = 3; break
        case 2: maxCol = 3; break
        case 3: maxCol = 5;
    }

    let ret = 0
    for (i = row * 10 + 1; i <= row * 10 + maxCol; i++) {
        ret += hasUpg("banks", i)
    }
    return ret
}

addLayer("banks", {
    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            capital: {
                points: decimalZero,
                best: decimalZero,
                total: decimalZero
            },
            debt: decimalZero,
            timer: -1,
            tier: 0,
            tierPoints: decimalZero
        }
    },
    row: 1,
    position: 0,
    color: "#977875",
    symbol: "BA",
    resource: "banks",
    type: "static",
    layerShown() {
        let visible = false
        if (player.banks.unlocked || hasMilestone("bills", 2)) {
            player.banks.unlocked = true
            visible = true
        }
        return visible
    },
    resetsNothing: true,
    requires: 25,
    roundUpCost: true,
    canBuyMax: false,
    canReset() { return player.banks.points.lt(2) && this.baseAmount().gte(getNextAt("banks")) && tmp.sys.canReset },
    baseResource: "HZC",
    baseAmount() { return new Decimal(tmp.bills.highestZoneCompleted) },
    exponent: 1.05,
    base: 1.2,
    // gainMult() {
    //     // for static layer, multiplies baseAmount --> want to be *lower*
    //     return decimalOne
    // },
    // gainExp() {
    //     // for static layer, roots cost --> normal
    //     return decimalOne
    // },
    onPrestige() {
        console.log(player.banks.milestones.length)
        let skillTime = [...player.bills.skillActiveTime]
        let autoSmacker = player.bills.autosmackOn
        let keptUpgrades = [11]
        if (hasUpg("bills", 22)) keptUpgrades.push(22)
        layerDataReset("bills")
        player.bills.autosmackOn = autoSmacker
        player.bills.skillActiveTime = skillTime
        for (const id of keptUpgrades) {
            player.bills.upgrades.push(id)
        }
        updateBills(2)
        if (hasMilestone("banks", 1)) player.bills.milestones.push('2')
        player.quests.points = player.quests.points.sub(player.quests.completions.enemyKillsBar)
        player.quests.completions.enemyKillsBar = 0
        doReset("sys")
        resetBanksMini()
    },
    milestones: {
        0: {
            requirementDescription: "Open 1 Bank",
            effectDescription: "Multiply Global ELO by 1.5, unlock Capital and Tiers, unlock a new Quest, and keep Scientific Exploration",
            done() { return player.banks.points.gte(1) }
        },
        1: {
            requirementDescription: "Open 2 Banks",
            effectDescription: "Unlock Bank Upgrades and more Capital Upgrades, and keep the 3rd Bills milestone",
            done() { return player.banks.points.gte(2) },
            unlocked: () => hasMilestone("banks", 0)
        }
    },
    bars: {
        tierBar: {
            direction: RIGHT,
            width: 600,
            height: 50,
            title: "Points Quest",
            display() {
                return `Tier ${player.banks.tier} (${format(player.banks.tierPoints)}/${format(this.goal())})`
                    + `: ${format(this.effect()[0])}x Capital/Loot, ^${format(this.effect()[1])} Global ELO`
            },
            progress() {
                let goal = this.goal()
                if (goal.lt(1e10))
                    return player.banks.tierPoints.div(goal)
                return player.banks.tierPoints.add(1).log10().div(goal.log10())
            },
            goal() {
                let scaling = new Decimal(3).pow(player.banks.tier)
                let base = 25
                return scaling.mul(base)
            },
            effect() {
                let baseEff1 = 1.05
                let baseEff2 = .01
                let tier = player.banks.tier

                return [baseEff1 ** tier, 1 + baseEff2 * Math.floor(tier / 2)]
            },
            textStyle: { 'color': '#977875' }
        },
    },
    upgrades: {
        11: {
            title() { return this.id },
            description: "Best Capital boosts itself and Tier Points at reduced rates",
            cost: 5,
            effect() {
                let amt = player.banks.capital.best
                return [amt.clampMin(Math.E).ln().pow(.2), amt.add(10).log10().pow(.25)]
            },
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x` },
            unlocked: () => getBuyableAmount("banks", 11).gte(8) || hasUpg("banks", 11),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            branches: [12, 21, 22, 23]
        },
        12: {
            title() { return this.id },
            description: "Multiply Capital/Tier Points by 1.01<sup>upgrades</sup> and Global ELO/Loot by 1.2<sup>log2(upgrades)</sup>",
            cost: 5,
            effect: () => [1.01 ** player.banks.upgrades.length, 1.2 ** Math.log2(Math.max(2, player.banks.upgrades.length))],
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x` },
            unlocked: () => hasMilestone("banks", 1) || hasUpg("banks", 11),
            canAfford: () => hasUpg("banks", 11),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            branches: [13]
        },
        13: {
            title() { return this.id },
            description: "Best Capital and Spent Dollars multiply each other's gain at heavily reduced rates",
            cost: 5000,
            effect: () => [player.bills.best.div(5000).add(10).log10().pow(.25), player.banks.capital.best.add(10).log10().pow(.5)],
            effectDisplay() { return `${format(this.effect()[0])}x Capital, ${format(this.effect()[1])}x Loot` },
            unlocked: () => hasMilestone("banks", 1) || hasUpg("banks", 12),
            canAfford: () => hasUpg("banks", 12),
            currencyDisplayName: "Loot",
            currencyInternalName: "points",
            currencyLocation: () => player.bills,
            branches: [14]
        },
        14: {
            title() { return this.id },
            description: "Best Capital boosts the WNBP effect exponent at a heavily reduced rate",
            cost: 50,
            effect: () => player.banks.capital.best.max(Math.E).ln().ln(),
            effectDisplay() { return `${format(this.effect()[0])}x Capital, ${format(this.effect()[1])}x Loot` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 13),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            branches: [15, 24]
        },
        15: {
            title() { return this.id },
            description: "Sector A/B now only raise Capital ^.9 when bought",
            cost: 50,
            effect: () => player.banks.capital.best.max(Math.E).ln().ln(),
            effectDisplay() { return `${format(this.effect()[0])}x Capital, ${format(this.effect()[1])}x Loot` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 14),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            branches: [25]
        },
        21: {
            title() { return this.id },
            description: "Multiply Tier Point gain by 1.05<sup>HZC</sup>, but raise the cost of row 2 upgrades",
            cost() {
                let ret = 10
                let upgs = banksRowUpgCount(2)
                return ret * 25 ** upgs
            },
            effect: () => 1.05 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => getBuyableAmount("banks", 11).gte(12),
            unlocked: () => hasMilestone("banks", 1) || getBuyableAmount("banks", 11).gte(12),
            canAfford: () => hasUpg("banks", 11),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            tooltip: "Purchasing this upgrade will unlock Sector C",
            branches: [31, 32, 33]
        },
        22: {
            title() { return this.id },
            description: "Multiply Capital by 1.4 and Tier Points by 2.2, but raise the cost of row 2 upgrades",
            cost() {
                let ret = 25
                let upgs = banksRowUpgCount(2)
                return ret * 25 ** upgs
            },
            effect: () => [1.4, 2.2],
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x` },
            unlocked: () => hasMilestone("banks", 1) || getBuyableAmount("banks", 11).gte(12),
            canAfford: () => hasUpg("banks", 11),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            branches: [32, 33, 34]
        },
        23: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of row 2 upgrades",
            cost() {
                let ret = 10
                let upgs = banksRowUpgCount(2)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1) || getBuyableAmount("banks", 11).gte(12),
            canAfford: () => hasUpg("banks", 11),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            tooltip: "Purchasing this upgrade will unlock Sector D",
            branches: [33, 34, 35]
        },
        24: {
            title() { return this.id },
            description: "Multiply Tier Points by log10(Q)<sup>.8</sup>, where Q is the product of Sector A-D bought amounts",
            cost() {
                let ret = 50
                let upgs = banksRowUpgCount(2)
                return ret * 10 ** upgs
            },
            effect: () => getBuyableAmount("banks", 11).max(1).mul(getBuyableAmount("banks", 12).max(1))
            .mul(getBuyableAmount("banks", 13).max(1)).mul(getBuyableAmount("banks", 14).max(1)).max(10).log10().pow(.8),
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 14),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        25: {
            title() { return this.id },
            description: "Multiply Capital by log10(Q)<sup>.4</sup>, where Q is the product of Sector A-D bought amounts",
            cost() {
                let ret = 50
                let upgs = banksRowUpgCount(2)
                return ret * 5 ** upgs
            },
            effect: () => getBuyableAmount("banks", 11).max(1).mul(getBuyableAmount("banks", 12).max(1))
                .mul(getBuyableAmount("banks", 13).max(1)).mul(getBuyableAmount("banks", 14).max(1)).max(10).log10().pow(.4),
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 14),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            tooltip: "Purchasing this upgrade will unlock Sector D"
        },
        31: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 500
                let upgs = banksRowUpgCount(3)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 21),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        32: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 500
                let upgs = banksRowUpgCount(3)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 21) && hasUpg("banks", 22),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        33: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 500
                let upgs = banksRowUpgCount(3)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 21) && hasUpg("banks", 22) && hasUpg("banks", 23),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        34: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 500
                let upgs = banksRowUpgCount(3)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 22) && hasUpg("banks", 23),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        35: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 500
                let upgs = banksRowUpgCount(3)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => hasMilestone("banks", 1),
            canAfford: () => hasUpg("banks", 23),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },

        // main Banks upgrades
        101: {
            fullDisplay() {
                let title = "Inflation"
                let des = "Raise effective 1 Dollar Bill level by 1 + .25log2(1 + Banks)"
                //"1 + .25log2(Banks) / 4 raises effective 1 Dollar Bill level"
                let req = `Requires: ${this.req} Banks`

                return `<h3>${title}</h3><br>${des}<br><br>${req}`
            },
            req: 2,
            canAfford() { return player.banks.points.gte(this.req) },
            buy() { tmp.banks.onPrestige(); player.banks.points = player.banks.points.sub(1) },
            unlocked:() => true || hasMilestone("banks", 1),
            effect: () => player.banks.points.add(1).log2().div(4).add(1),
            effectDisplay() { return `^${format(this.effect())}` }
        },
        102: {
            fullDisplay() {
                let title = "Gotta Kill 'Em All"
                let des = "Increase max completions for enemy kills Quest by 1 per upgrade in this row"
                let req = `Requires: ${this.req} Banks`

                return `<h3>${title}</h3><br>${des}<br><br>${req}`
            },
            req: 2,
            canAfford() { return player.banks.points.gte(this.req) },
            buy() { tmp.banks.onPrestige(); player.banks.points = player.banks.points.sub(1) },
            unlocked:() => true || hasMilestone("banks", 1),
            effect:() => 1 + hasUpg("banks", 101) + hasUpg("banks", 103) + hasUpg("banks", 104) + hasUpg("banks", 105)
        },
        103: {
            fullDisplay() {
                let title = "Plus Interest"
                let des = !player.shiftDown ? "Increase loot scaling based on Banks (press shift for formula)"
                    : `(1 + Banks / 100)<sup>x</sup> applied to formula => ${format(player.banks.points.div(100).add(1))}x more loot per effective level`
                let req = `Requires: ${this.req} Banks`

                return `<h3>${title}</h3><br>${des}<br><br>${req}`
            },
            req: 2,
            canAfford() { return player.banks.points.gte(this.req) },
            buy() { tmp.banks.onPrestige(); player.banks.points = player.banks.points.sub(1) },
            unlocked:() => true || hasMilestone("banks", 1)
        },
        104: {
            fullDisplay() {
                let title = "Moar Monie!"
                let des = "Unlock the System challenge (Storage)"
                let req = `Requires: ${this.req} Banks`

                return `<h3>${title}</h3><br>${des}<br><br>${req}`
            },
            req: 3,
            canAfford() { return player.banks.points.gte(this.req) },
            buy() { tmp.banks.onPrestige(); player.banks.points = player.banks.points.sub(1) },
            unlocked:() => true || hasMilestone("banks", 1)
        },
        105: {
            fullDisplay() {
                let title = ""
                let des = "Multiply Capital gain by 1.01<sup>Achievements - 50</sup>"
                let req = `Requires: ${this.req} Banks`

                return `<h3>${title}</h3><br>${des}<br><br>${req}`
            },
            req: 3,
            canAfford() { return player.banks.points.gte(this.req) },
            buy() { tmp.banks.onPrestige(); player.banks.points = player.banks.points.sub(1) },
            unlocked:() => true || hasMilestone("banks", 1),
            effect:() => 0
        }
    },
    buyables: {
        showRespec:() => tmp.banks.upgrades[12].unlocked,
        respecText: "Reset Capital upgrades and Sector buyables",
        respecMessage: "Are you sure you want to respec? This will reset ALL Capital upgrades after the first, reset Capital, and reset ALL Sector amounts (Sector A is set to at maximum a value of 12).",
        respec() {
            player.banks.upgrades = player.banks.upgrades.filter(index => index == 11)
            for (id in player.banks.buyables) {
                if (id == "11") setBuyableAmount("banks", id, getBuyableAmount("banks", id).min(12))
                else setBuyableAmount("banks", id, decimalZero)
            }
            player.banks.capital.points=decimalZero
        },
        11: {
            title: "Sector A",
            cost(x) {
                let effX = x
                if (tmp.banks.buyables[13].unlocked) effX = effX.div(buyableEffect(this.layer, 13))
                return effX.pow_base(1.2)
            },
            effectiveXEff() {
                let x = getBuyableAmount(this.layer, this.id)
                let addLevels = decimalZero
                if (tmp.banks.buyables[14].unlocked) addLevels = addLevels.add(buyableEffect(this.layer, 14))

                let subLevels = decimalZero

                return x.add(addLevels).sub(subLevels)
            },
            effect(x) {
                let effX = this.effectiveXEff()
                // (1/5 * (x/3 + x^.5/2 * sin(x/10)))^.9
                return effX.div(3)
                    .add(effX.pow(.5).div(2))//.mul(effX.div(10).sin()))
                    .div(5)
                    .pow(.9)
                    .add(1)
            },
            // display() {
            //     return `Levels: ${getBuyableAmount(this.layer, this.id)}
            //     Effect: Multiply Capital gain by ${format(this.effect())}x
            //     Cost: ${format(this.cost())} Capital`
            // },
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)} (${format(this.effectiveXEff())})`
                let effect = `<h3><b>Effect:</h3></b> ${format(this.effect())}x Capital Gain`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} Capital`

                return `${levels}\n${effect}\n${cost}`
            },
            canAfford() { return player.banks.capital.points.gte(this.cost()) },
            buy() {
                player.banks.capital.points = player.banks.capital.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            }
        },
        12: {
            title: "Sector B",
            cost(x) {
                let effX = x
                if (tmp.banks.buyables[13].unlocked) effX = effX.div(buyableEffect(this.layer, 13))
                return effX.pow(1.25).pow_base(1.05).mul(5)
            },
            effectiveXEff() {
                let x = getBuyableAmount(this.layer, this.id)
                let addLevels = decimalZero
                if (tmp.banks.buyables[14].unlocked) addLevels = addLevels.add(buyableEffect(this.layer, 14))
                    
                let subLevels = decimalZero

                return x.add(addLevels).sub(subLevels)
            },
            effect(x) {
                let effX = this.effectiveXEff()
                // 1 + .05x^1.25
                return effX.pow(1.25).div(20).add(1)
            },
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)} (${format(this.effectiveXEff())})`
                let effect = `<h3><b>Effect:</h3></b> ${format(this.effect())}x Capital Gain`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} Capital`

                return `${levels}\n${effect}\n${cost}`
            },
            canAfford() { return player.banks.capital.points.gte(this.cost()) },
            buy() {
                player.banks.capital.points = player.banks.capital.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return getBuyableAmount(this.layer, 11).gte(8) }
        },
        13: {
            title: "Sector C",
            cost(x) {
                return x.pow(.5).pow_base(5).mul(10)
            },
            effect(x) {
                let addLevels = 0
                let subLevels = 0
                let effX = x.add(addLevels).sub(subLevels)
                // 1 + .1x^.125

                // log2(2 + x)^.25
                return effX.add(2).log2().pow(.25)
            },
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `<h3><b>Effect:</h3></b> /${format(this.effect())} eff. Sector A/B for cost formula`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} Capital`

                return `${levels}\n${effect}\n${cost}`
            },
            canAfford() { return player.banks.capital.points.gte(this.cost()) },
            buy() {
                player.banks.capital.points = player.banks.capital.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return hasUpg(this.layer, 21) }
        },
        14: {
            title: "Sector D",
            cost(x) {
                return x.pow_base(1.5).mul(10)
            },
            effect(x) {
                let addLevels = 0
                let subLevels = 0
                let effX = x.add(addLevels).sub(subLevels)
                // .25x
                return effX.div(2)
            },
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount(this.layer, this.id)}`
                let effect = `<h3><b>Effect:</h3></b> +${format(this.effect())} eff. Sector A/B`
                let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} Capital`

                return `${levels}\n${effect}\n${cost}`
            },
            canAfford() { return player.banks.capital.points.gte(this.cost()) },
            buy() {
                player.banks.capital.points = player.banks.capital.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            },
            unlocked() { return hasUpg(this.layer, 23) }
        }
    },
    mini: {
        capitalGain() {
            let ret = new Decimal(0.1)
            ret = ret.mul(buyableEffect("banks", 11))
            ret = ret.mul(buyableEffect("banks", 12))
            //ret = ret.mul(buyableEffect("banks", 13))
            ret = ret.mul(tmp.banks.bars.tierBar.effect[0])
            if (hasUpg("banks", 11)) ret = ret.mul(upgEff("banks", 11)[0])
            if (hasUpg("banks", 12)) ret = ret.mul(upgEff("banks", 12)[0])
            if (hasUpg("banks", 13)) ret = ret.mul(upgEff("banks", 13)[0])
            if (hasUpg("banks", 22)) ret = ret.mul(upgEff("banks", 22)[0])
            if (hasUpg("banks", 23)) ret = ret.mul(upgEff("banks", 23))
            if (hasUpg("banks", 25)) ret = ret.mul(upgEff("banks", 25))
            ret = ret.mul(tmp.quests.bars.capitalBar.reward)
            return ret
        },
        lossRate() {
            let ret = .03
            ret += player.banks.points.sub(1).min(48).toNumber() * 2
            return ret
        },
        tierPointGain() {
            let ret = new Decimal(0.005)
            if (hasUpg("banks", 11)) ret = ret.mul(upgEff("banks", 11)[1])
            if (hasUpg("banks", 12)) ret = ret.mul(upgEff("banks", 12)[0])
            if (hasUpg("banks", 21)) ret = ret.mul(upgEff("banks", 21))
            if (hasUpg("banks", 22)) ret = ret.mul(upgEff("banks", 22)[1])
            if (hasUpg("banks", 24)) ret = ret.mul(upgEff("banks", 24))
            ret = ret.mul(tmp.quests.bars.capitalBar.reward)
            return ret
        }
    },
    update(diff) {
        // LIMIT --> HIGHER LIMIT = ^.99 LESS GAIN BUT PASSIVE GEN OF ADDITIONAL CURRENCY
        if (player.banks.points.eq(0)) return

        let mini = player.banks
        let tmpMini = tmp.banks.mini

        let nextCapitalVal = getLogisticAmount(mini.capital.points, tmpMini.capitalGain, tmpMini.lossRate, diff)
        let change = nextCapitalVal.sub(mini.capital.points)
        mini.capital.points = nextCapitalVal
        mini.capital.best = mini.capital.best.max(mini.capital.points)
        if (change.gt(0)) mini.capital.total = mini.capital.total.add(change)

        mini.tierPoints = mini.tierPoints.add(tmpMini.tierPointGain.mul(diff))
        if (mini.tierPoints.gt(tmp.banks.bars.tierBar.goal)) {
            mini.tierPoints = mini.tierPoints.sub(tmp.banks.bars.tierBar.goal)
            mini.tier += 1
        }
    },

    // minigame: debt starts at 0.5, increases at rate of 1.1x per second, if debt surpasses points then you lose
    // more banks = easier minigame, eventually QoL
    // when debt reaches points, reset points --> currency for boosts
    // when not in minigame, generated 1 point per second

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button",
                ["upgrades", [10, 11]]
            ]
        },
        "Capital": {
            content: [
                "main-display",
                ["bar", "tierBar"], "blank",
                ["display-text", () => `You have ${format(player.banks.capital.points)} Capital<br>
                    You are netting ${format(tmp.banks.mini.capitalGain.sub(player.banks.capital.points.mul(tmp.banks.mini.lossRate)).max(0))}
                    Capital per second<br>Loss rate: ${tmp.banks.mini.lossRate * 100}% per second`
                ], "blank",
                "buyables",
                "blank",
                ["upgrade-tree", [[11, 12, 13], [21, 22, 23], [31, 32, 33, 34, 35]]]
            ],
            unlocked:() => player.banks.points.gte(1)
        },
        "Milestones": {
            content: [
                "milestones"
            ]
        },
        "Info": {
            content: [
                "main-display",
                ["display-text", "Performing a Bank reset will reset the Bills feature and force a System reset"]
            ]
        }
    },
    componentStyles: {
        "buyable"() { return { 'height': '100px', 'width': '175px' } }
    }
})