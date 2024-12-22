function resetBanksMini() {

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
    canReset() { return player.banks.points.lt(1) && this.baseAmount().gte(getNextAt("banks")) && tmp.sys.canReset },
    baseResource: "highest zone reached",
    baseAmount() { return new Decimal(player.bills.highestZone) },
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
        let skillTime = [...player.bills.skillActiveTime]
        let autoSmacker = player.bills.autosmackOn
        layerDataReset("bills")
        player.bills.autosmackOn = autoSmacker
        player.bills.skillActiveTime = skillTime
        player.bills.upgrades.push(11)
        updateBills(2)
        player.bills.upgrades.push(22)
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
            effectDescription: "Unlock ELO Milestones (Bills) and more Capital Upgrades",
            done() { return player.banks.capital.points.gte(100) },
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
            unlocked: () => getBuyableAmount("banks", 11).gte(8) || hasUpgrade("banks", 11),
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
            unlocked: () => hasUpgrade("banks", 11),
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
            unlocked: () => hasUpgrade("banks", 12),
            currencyDisplayName: "Loot",
            currencyInternalName: "points",
            currencyLocation: () => player.bills,
        },
        21: {
            title() { return this.id },
            description: "Multiply Tier Point gain by 1.05<sup>HZC</sup>, but raise the cost of the adjacent 2 upgrades",
            cost() {
                let ret = 10
                let upgs = hasUpgrade("banks", 22) + hasUpgrade("banks", 23)
                return ret * 25 ** upgs
            },
            effect: () => 1.05 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => getBuyableAmount("banks", 11).gte(12),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            tooltip: "Purchasing this upgrade will unlock Sector C"
        },
        22: {
            title() { return this.id },
            description: "Multiply Capital by 1.6 and Tier Points by 2.2, but raise the cost of the adjacent 2 upgrades",
            cost() {
                let ret = 25
                let upgs = hasUpgrade("banks", 21) + hasUpgrade("banks", 23)
                return ret * 25 ** upgs
            },
            effect: () => [1.6, 2.2],
            effectDisplay() { return `${format(this.effect()[0])}x, ${format(this.effect()[1])}x` },
            unlocked: () => getBuyableAmount("banks", 11).gte(12),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital
        },
        23: {
            title() { return this.id },
            description: "Multiply Capital by 1.02<sup>HZC</sup>, but raise the cost of the previous 2 upgrades",
            cost() {
                let ret = 10
                let upgs = hasUpgrade("banks", 21) + hasUpgrade("banks", 22)
                return ret * 25 ** upgs
            },
            effect: () => 1.02 ** tmp.bills.highestZoneCompleted,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked: () => getBuyableAmount("banks", 11).gte(12),
            currencyDisplayName: "Capital",
            currencyInternalName: "points",
            currencyLocation: () => player.banks.capital,
            tooltip: "Purchasing this upgrade will unlock Sector D"
        },
    },
    buyables: {
        showRespec:() => tmp.banks.upgrades[12].unlocked,
        respecText: "Reset Capital upgrades and Sector buyables",
        respecMessage: "Are you sure you want to respec? This will reset ALL Capital upgrades after the first, reset Capital, and reset ALL Sector amounts to 0.",
        respec() {
            player.banks.upgrades = player.banks.upgrades.filter(index => index == 11)
            for (id in player.banks.buyables) {
                setBuyableAmount("banks", id, decimalZero)
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
            unlocked() { return hasUpgrade(this.layer, 21) }
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
            unlocked() { return hasUpgrade(this.layer, 23) }
        }
    },
    mini: {
        capitalGain() {
            let ret = new Decimal(0.1)
            ret = ret.mul(buyableEffect("banks", 11))
            ret = ret.mul(buyableEffect("banks", 12))
            //ret = ret.mul(buyableEffect("banks", 13))
            ret = ret.mul(tmp.banks.bars.tierBar.effect[0])
            if (hasUpgrade("banks", 11)) ret = ret.mul(upgradeEffect("banks", 11)[0])
            if (hasUpgrade("banks", 12)) ret = ret.mul(upgradeEffect("banks", 12)[0])
            if (hasUpgrade("banks", 13)) ret = ret.mul(upgradeEffect("banks", 13)[0])
            if (hasUpgrade("banks", 22)) ret = ret.mul(upgradeEffect("banks", 22)[0])
            if (hasUpgrade("banks", 23)) ret = ret.mul(upgradeEffect("banks", 23))
            ret = ret.mul(tmp.quests.bars.capitalBar.reward)
            return ret
        },
        lossRate() {
            return .03
        },
        tierPointGain() {
            let ret = new Decimal(0.005)
            if (hasUpgrade("banks", 11)) ret = ret.mul(upgradeEffect("banks", 11)[1])
            if (hasUpgrade("banks", 12)) ret = ret.mul(upgradeEffect("banks", 12)[0])
            if (hasUpgrade("banks", 21)) ret = ret.mul(upgradeEffect("banks", 21))
            if (hasUpgrade("banks", 22)) ret = ret.mul(upgradeEffect("banks", 22)[1])
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
                "prestige-button"
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
                ["upgrade-tree", [[11, 12, 13], [21, 22, 23]]]
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