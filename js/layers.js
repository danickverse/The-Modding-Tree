function upgrade23Limit() {
    let base = player.p.points.mul(100).pow(upgrade23LimitExp()).add(10)
    if (hasMilestone("a", 0) && base.lt(new Decimal("9.99e9"))) {
        let limit = new Decimal("1e10")
        let newValFactor = limit.sub(base).log10().div(20).add(1) // 1 + log10(L-B)/20
        base = base.mul(newValFactor) // max(limit, base * (1 + log10(limit-base)/20))
    }
    if (getClickableState("e", 21) || getClickableState("e", 22)) base = base.div(5)
    return base
}

function upgrade23LimitExp() {
    let exp = decOne
    if (hasUpgrade("p", 34)) exp = exp.add(upgradeEffect("p", 34))
    if (hasUpgrade("e", 12)) exp = exp.add(upgradeEffect("e", 12))
    if (hasAchievement('a', 35)) exp = exp.add(.01)
    return exp
}

function upgrade23EffExp() {
    let exp = decOne
    if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
    return exp
}

function upgrade14Limit() {
    let limit = new Decimal("1e6")
    if (hasUpgrade("p", 33)) limit = limit.mul(upgradeEffect("p", 33))
    return limit
}

function penniesTaxFactor() {
    if (player.p.points.lt(pennyTaxStart()) && player.p.best.lt(pennyTaxStart())) return decOne//(player.p.points.lt(pennyTaxStart())) return decOne
    let taxFactor = player.p.best.div(2).max(player.p.points).div(pennyTaxStart())//player.p.points.div(pennyTaxStart()) // base tax factor = pennies/1e6
    taxFactor = taxFactor.add(.5).pow(2.5) // returns (.5 + pennies / 1e6)^2.5 initially
    //taxFactor.ln().div(logarithmBase.ln()) // returns log_base(pennies)
    return taxFactor
}

function pennyTaxStart() {
    let baseTaxes = new Decimal("1e6")
    if (hasUpgrade("p", 45)) baseTaxes = baseTaxes.mul(upgradeEffect("p", 45))
    return baseTaxes
}

function investmentGain() {
    let investmentExponent = new Decimal(".5")
    let ret = player.p.points.div(1000000).pow(investmentExponent)
    if (hasAchievement("a", 25)) ret = ret.mul(2)
    if (hasAchievement("a", 34)) ret = ret.mul(1.1)
    if (hasAchievement("a", 44)) ret = ret.mul(1.2)
    if (hasUpgrade("p", 43)) ret = ret.mul(upgradeEffect("p", 43))
    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    return ret
}

function investment2Gain() {
    let investmentExponent = new Decimal(".5")
    let ret = player.p.investment.points.div(10000).pow(investmentExponent)
    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    return ret
}

function investmentReset(resetInvestment, resetInvestment2) {
    player.p.points = decZero
    player.p.best = decZero
    player.p.total = decZero
    
    let keepUpgrades = [21, 25, 35, 41, 42]
    if (player.e.everUpg23) keepUpgrades.push(23)
    function removeUpgrades(index) {
        return keepUpgrades.indexOf(index) != -1 // keeps upgrades with indices gte 25 + achievement upgrades
    }
    player.p.upgrades = player.p.upgrades.filter(removeUpgrades)

    let buyableIndices = [21, 22]
    for (const index of buyableIndices) {
        player.p.buyables[index] = decZero
    }

    player.points = decZero

    if (resetInvestment) player.p.investment.points = decZero
    if (resetInvestment2) player.p.investment2.points = decZero
}

let decZero = new Decimal("0")
let decOne = new Decimal("1")

function logXBaseN(x, n) {
    let ret = new Decimal(Math.log(x) / Math.log(n))
    return ret
}

addLayer("p", {
    // name: "pennies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: decZero,
        best: decZero,
        total: decZero,
        investment: {
            points: decZero,
            best: decZero
        },
        investment2: {
            points: decZero,
            best: decZero
        },
        investmentCooldown: 0,
        autoUpgCooldown: -1,
        autoBuyableCooldown: -1
    }},
    color: "#AD6F69",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "pennies", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: .5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
        if (hasUpgrade("p", 13)) mult = mult.times(upgradeEffect("p", 13))
        if (hasUpgrade("p", 14)) mult = mult.times(upgradeEffect("p", 14))
        if (hasUpgrade("p", 15)) mult = mult.times(upgradeEffect("p", 15))
        if (hasUpgrade("p", 24)) mult = mult.times(upgradeEffect("p", 24))
        if (hasUpgrade("p", 35)) mult = mult.times(upgradeEffect("p", 35))
        if (hasUpgrade("p", 44)) mult = mult.times(upgradeEffect("p", 44))
        if (hasAchievement("a", 34)) mult = mult.times(1.2)
        mult = mult.times(buyableEffect("p", 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    softcap: new Decimal("1e9"),
    softcapPower: new Decimal(.5),
    getResetGain() {
        if (tmp[this.layer].gainExp.eq(0)) return decimalZero
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        let gain = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent).times(tmp[this.layer].gainMult).pow(tmp[this.layer].gainExp)
        gain = gain.div(penniesTaxFactor())
        if (gain.gte(tmp[this.layer].softcap)) gain = gain.pow(tmp[this.layer].softcapPower).times(tmp[this.layer].softcap.pow(decimalOne.sub(tmp[this.layer].softcapPower)))
        gain = gain.times(tmp[this.layer].directMult)
        if (getClickableState("e", 21) || getClickableState("e", 22)) gain = gain.div(5)
        return gain.floor().max(0);
    },
    passiveGeneration() {
        if (hasMilestone("s", 0) && player.s.stored_investment.points.gt(decZero)) {
            let base = new Decimal(".005")
            ret = base.mul(player.s.stored_investment.points.div(100).log2()).max(base)
            return ret
        }
        return decZero
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for pennies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Lucky Penny",
            description: "Multiplies point gain by 1 + ln(1 + [Best Pennies])",
            cost: decOne,
            effect:() => player.p.best.add(1).ln().add(1),
            effectDisplay:() => format(upgradeEffect("p", 11)) + "x"
        },
        12: {
            title: "Wait A Second...",
            description: "Increases base points by (2 + [Penny Upgrades])<sup>.8</sup>",
            cost: new Decimal("5"),
            effect:() => Math.pow(2 + player.p.upgrades.length, .8),
            effectDisplay:() => "+" + format(upgradeEffect("p", 12)),
            unlocked:() => hasUpgrade("p", 11) || hasUpgrade("p", 25)
        },
        13: {
            title: "Wait A Second...?",
            description: "Multiplies penny gain by 1 + ln((1 + Points/100)<sup>.4</sup>)",
            cost: new Decimal("100"),
            currencyDisplayName:() => "points",
            currencyInternalName:() => "points",
            currencyLocation:() => player,
            effect:() => player.points.div(100).add(1).pow(.4).ln().add(1),
            effectDisplay:() => format(upgradeEffect("p", 13)) + "x",
            unlocked:() => hasUpgrade("p", 12) || hasUpgrade("p", 25)
        },
        14: {
            title: "Useless",
            description:() => {
                if (!hasUpgrade("p", 14) && !hasUpgrade("p", 25)) return ""
                if (!hasUpgrade("p", 32)) return "Multiplies penny gain by 1.25 if Points < " + format(upgrade14Limit())
                return "Multiplies penny gain by 1.25<sup>log2(Investment)</sup> if Points < " + format(upgrade14Limit())
            },
            cost: new Decimal("10"),
            effect:() => {
                let base = new Decimal("1.25")

                let exp = 1
                if (hasUpgrade("p", 32)) exp = upgradeEffect("p", 32)

                if (player.points.lt(upgrade14Limit())) return base.pow(exp)
                return 1
            },
            effectDisplay:() => {
                if (!hasUpgrade("p", 14)) return "Does nothing"
                return format(upgradeEffect("p", 14)) + "x"
            },
            unlocked:() => hasUpgrade("p", 13) || hasUpgrade("p", 25)
        },
        15: {
            title: "Biggest Bestest Coin",
            description: "Multiplies point gain and penny gain by 1.25",
            cost: new Decimal("25"),
            effect: 1.25,
            unlocked:() => hasUpgrade("p", 14) || hasUpgrade("p", 25)
        },
        21: {
            cost: new Decimal("50"),
            fullDisplay:() => {
                let title = "<b><h3>There's A Coin For This?</b></h3>"
                let description = "Increases point gain by 50% per achievement."
                let effect = "Currently: " + format(upgradeEffect("p", 21)) + "x<br>"
                let ret = title + "<br>" + description + "<br>" + effect
                if (!hasUpgrade("p", 21)) return ret + "<br>Cost: 50 pennies"
                return ret
            },
            effect:() => 1 + .5 * player.a.achievements.length,
            unlocked:() => hasUpgrade("p", 15) || hasUpgrade("p", 25)
        },
        22: {
            title: "Still Can't Buy Water",
            description: "Multiplies point gain by (1 + Pennies/100)<sup>.9</sup>",
            cost: new Decimal("100"),
            effect:() => player.p.points.div(100).add(1).pow(.9),
            effectDisplay:() => format(upgradeEffect("p", 22)) + "x",
            unlocked:() => hasUpgrade("p", 21) || hasUpgrade("p", 25)
        },
        23: {
            title: "We Need Bigger Pockets",
            description:() => {
                let ret = "Multiplies point gain by "
                if (upgrade23EffExp() > 1) ret = ret + format(10**upgrade23EffExp()) + "</sup>"
                else ret = ret + "10"

                if (upgrade23LimitExp() > 1) return ret + " but limits Points to 10 + Pennies<sup>" + format(upgrade23LimitExp()) + "</sup> * 100"
                return ret + " but limits Points to 10 + Pennies * 100"
            },
            cost: new Decimal(250),
            effect:() => new Decimal("10").pow(upgrade23EffExp()), // upgrade23Limit() handles limit for this upgrade!!! this is for point multiplier
            effectDisplay:() => formatWhole(upgrade23Limit()) + " points",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        24: {
            title: "Where Did These Come From???",
            description:() => {
                let ret = "Multiplies penny gain by (1 + Points)<sup>.0"
                if (hasAchievement("a", 51)) ret = ret + "8</sup>"
                else ret = ret + "6</sup>"
                return ret
            },
            cost: new Decimal("5000"),
            effect:() => player.points.add(1).pow((!hasAchievement("a", 51)) ? .06 : .08),
            effectDisplay:() => format(upgradeEffect("p", 24)) + "x",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        25: {
            cost: new Decimal("1e5"),
            effect:() => player.p.investment.points.add(1).pow(.8),
            fullDisplay:() => {
                let title = "<b><h3>Now We're Getting Somewhere...</b></h3>"
                let description = (!hasUpgrade("p", 25)) ? "Unlock a way to put those pennies to good use and unlock more achievements." : "Multiplies point gain by (1 + Investment)<sup>.8</sup>"
                let effect = (!hasUpgrade("p", 25)) ? "" : "Currently: " + format(upgradeEffect("p", 25)) + "x<br>"
                let ret = title + "<br>" + description + "<br>" + effect
                if (!hasUpgrade("p", 25)) return ret + "<br>Requires: 100,000 pennies (no cost)"
                return ret
            },
            pay:() => 0,
            // keeps unlocked after doing an investment
            unlocked:() => (hasUpgrade("p", 25) || hasUpgrade("p", 24) || player.p.investment.points.gt(decZero)) 
        },
        31: {
            fullDisplay:() => {
                let title = "<b><h3>One Man's Trash</b></h3>"
                let description = () => {
                    if (!hasUpgrade("p", 31)) return "Unlock the ability to take classes in finding pennies!"
                    return "Unlocks the Education I buyable"
                }
                let requirement = "Requires: " + format(new Decimal("2e5")) + " pennies"
                if (!player.p.investment.points.gte(2)) {
                    if (!hasUpgrade("e", 15)) requirement = requirement + " and 2 Investment"
                    else requirement = requirement + " and 1 Investment"
                }
                return title + "<br>" + description() + "<br><br>" + requirement
            },
            canAfford:() => player.p.points.gte(new Decimal("2e5")) && (player.p.investment.points.gte(2) || (hasUpgrade("e", 15) && player.p.investment.points.gte(1))),
            unlocked:() => hasUpgrade("p", 25)
        },
        32: {
            fullDisplay:() => {
                let title = "<b><h3>Slightly Less Useless</b></h3>"
                let description = "Raises Useless Effect to log2(Investment)"
                let requirement = "Cost: " + format(new Decimal("4e6")) + " pennies"
                if (!player.p.investment.points.gte(5)) requirement = "Requires: 5 Investment"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            cost: new Decimal("4e6"),
            effect:() => player.p.investment.points.log2(),
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35)
        },
        33: {
            fullDisplay:() => {
                let title = "<b><h3>Unuselessifier</b></h3>"
                let description = () => {
                    let ret = "Multiplies Useless Limit by Investment<sup>3</sup>"
                    if (!hasUpgrade("p", 33) && !hasUpgrade("p", 34)) ret = ret + "<br>Increases cost of next upgrade"
                    return ret
                }
                let effectDis = "Currently: " + format(upgradeEffect("p", 33))
                let requirement = () => {
                    if (!player.p.investment.points.gte(5)) return "Requires: 5 Investment"
                    let ret = new Decimal("4e6")
                    if (hasUpgrade("p", 34)) ret = ret.mul(1.5)
                    return "Cost: " + format(ret) + " pennies"
                }
                return title + "<br>" + description() + "<br>" + effectDis + "<br><br>" + requirement()
            },
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 34)) ret = ret.mul(1.5)
                return ret
            },
            effect:() => player.p.investment.points.pow(3),
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35)
        },
        34: {
            fullDisplay:() => {
                let title = "<b><h3>Slightly Bigger Pockets</b></h3>"
                let description = () => {
                    let ret = "Increases WNBP limit exponent by log10(1 + Investment)/100"
                    if (!hasUpgrade("p", 33) && !hasUpgrade("p", 34)) ret = ret + "<br>Increases cost of previous upgrade"
                    return ret
                }
                let effectDis = "Currently: " + format(upgradeEffect("p", 34))
                let requirement = () => {
                    if (!player.p.investment.points.gte(5)) return "Requires: 5 Investment"
                    let ret = new Decimal("4e6")
                    if (hasUpgrade("p", 34)) ret = ret.mul(1.5)
                    return "Cost: " + format(ret) + " pennies"
                }
                return title + "<br>" + description() + "<br>" + effectDis + "<br><br>" + requirement()
            },
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 33)) ret = ret.mul(1.5)
                return ret
            },
            effect:() => {
                let ret = player.p.investment.points.add(1).log10().div(50)
                if (hasMilestone("a", 3)) ret = ret.mul(1.5)
                return ret
            },
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35)
        },
        35: {
            fullDisplay:() => {
                let title = "<b><h3>Seriously?</b></h3>"
                let description = () => {
                    if (hasAchievement("a", 21)) {
                        let ret = "Achievements boost pennies at a different rate (^" + format(!hasUpgrade("e", 14) ? .2 : (!hasUpgrade("e", 34) ? upgradeEffect("e", 14) : upgradeEffect("e", 34)), 1) 
                        ret = ret + "). Unlocks a buyable respec<br>Currently: " + format(upgradeEffect("p", 35)) + "x"
                        return ret
                    }
                    return "Requires Achievement 6"
                }
                let cost = "Cost: " + format(tmp.p.upgrades[35].cost) + " pennies"
                return title + "<br>" + description() + "<br><br>" + cost
            },
            cost: new Decimal("2e7"),
            effect:() => new Decimal(1 + .5 * player.a.achievements.length).pow(!hasUpgrade("e", 14) ? .2 : (!hasUpgrade("e", 34) ? upgradeEffect("e", 14) : upgradeEffect("e", 34)), 1),
            effectDisplay:() => format(upgradeEffect("p", 35)) + "x",
            canAfford:() => hasAchievement("a", 21),
            unlocked:() => (player.p.investment.points.gte(5) && hasUpgrade("p", 31)) || hasUpgrade("p", 35) || hasAchievement("a", 51)
        },
        41: {
            title: "Finally...",
            description: "Increases WNBP <b>effect</b> exponent by log2(1 + Penny Expansions)/10",
            cost:() => new Decimal("3e10"),
            effect:() => player.e.penny_expansions.points.add(1).log2().div(10),
            effectDisplay:() => "+" + format(upgradeEffect("p", 41)),
            unlocked:() => hasUpgrade("e", 23) || hasUpgrade("p", 41)
        },
        42: {
            cost:() => new Decimal("1e11"),
            effect:() => player.p.investment2.points.add(1).pow(.5),
            fullDisplay:() => {
                let title = "<b><h3>Invest In The Universe!</b></h3>"
                let description = (!hasUpgrade("p", 42)) ? "Unlock the Expansion Investment buyable." : "Multiplies expansion gain by (1+Expansion Investment)<sup>.5</sup>"
                let effect = (!hasUpgrade("p", 42)) ? "" : "Currently: " + format(upgradeEffect("p", 42)) + "x<br>"
                let ret = title + "<br>" + description + "<br>" + effect
                if (!hasUpgrade("p", 42)) return ret + "<br>Cost: 1e11 pennies"
                return ret
            },
            unlocked:() => hasUpgrade("e", 23) || hasUpgrade("p", 42)
        },
        43: {
            title: "... And Yourself, Too!",
            description:() => { 
                let ret = "Multiplies investment gain by previous upgrade effect"
                if (!hasUpgrade("p", 43) && !hasUpgrade("p", 44)) ret = ret + "<br>Increases cost of next upgrade"
                return ret
            },
            cost:() => {
                let ret = new Decimal("5e10")
                if (hasUpgrade("p", 44)) ret = ret.mul(10)
                return ret
            },
            effect:() => upgradeEffect("p", 42),
            unlocked:() => hasUpgrade("e", 23) && player.p.investment2.points.gte(1)
        },
        44: {
            title: "Recycling",
            description:() => { 
                let ret = "Multiplies penny gain by 1 + log10(1 + Investment)"
                if (!hasUpgrade("p", 43) && !hasUpgrade("p", 44)) ret = ret + "<br>Increases cost of previous upgrade"
                return ret
            },
            cost:() => {
                let ret = new Decimal("5e10")
                if (hasUpgrade("p", 43)) ret = ret.mul(10)
                return ret
            },
            effect:() => player.p.investment.points.add(1).log10().add(1),
            effectDisplay:() => format(upgradeEffect("p", 44)) + "x",
            unlocked:() => hasUpgrade("e", 23) && player.p.investment2.points.gte(1)
        },
        45: {
            title: "I Want To Break Free!",
            cost: new Decimal("1e13"),
            description: "Multiplies base penny value used for Tax by IITU effect",
            effectDisplay:() => "Tax starts at " + format(pennyTaxStart()) + " pennies",
            unlocked:() => hasUpgrade("e", 23) && player.p.investment2.points.gte(1)
        }
    },
    buyables: {
        showRespec:() => hasUpgrade("p", 35) && !player.e.everUpg33,
        respecText: "Resets ALL buyables and forces an investment reset",
        respecMessage: "Are you sure you want to respec? This will force an investment reset!",
        respec() {
            investmentReset(true, true)
        },
        11: {
            title: "Investment",
            cost() {return new Decimal("5e5")}, //new Decimal("1e6")},
            display() {
                if (!player.shiftDown) {
                    let investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies at a rate of (x/1e6)<sup>.5</sup>!<br>"
                    let cooldown = "<b><h3>Cooldown:</h3></b> " + format(player.p.investmentCooldown) + " seconds.<br>"
                    let req = "<b><h3>Requires:</h3></b> " + format(this.cost()) + " pennies"
                    return investmentRate + cooldown + req
                }
                return "Investing your pennies will earn you " + format(investmentGain()) + " investment."
            },
            canAfford() {return player.p.points.gte(this.cost()) & player.p.investmentCooldown == 0},
            buy() {
                player.p.investment.points = player.p.investment.points.add(investmentGain())
                player.p.investmentCooldown = (hasUpgrade("e", 35)) ? 15 : 20

                // reset data, keep investment and investment2
                investmentReset(false, false)
            },
            unlocked:() => hasUpgrade("p", 25)
        },
        12: {
            title: "Expansion Investment",
            cost() {return new Decimal("5e3")},
            display() {
                if (!player.shiftDown) {
                    let investmentRate = "<b><h3>Rate:</h3></b> Invest your current investment at a rate of (x/10000)<sup>.5</sup>!<br>"
                    let cooldown = "<b><h3>Cooldown:</h3></b> " + format(player.p.investmentCooldown) + " seconds.<br>"
                    let req = "<b><h3>Requires:</h3></b> " + format(this.cost()) + " investment"
                    return investmentRate + cooldown + req
                }
                return "Investing your investment will earn you " + format(investment2Gain()) + " expansion investment."
            },
            canAfford() {return player.p.investment.points.gte(this.cost()) & player.p.investmentCooldown == 0},
            buy() {
                player.p.investment2.points = player.p.investment2.points.add(investment2Gain())
                player.p.investmentCooldown = (hasUpgrade("e", 35)) ? 15 : 20

                // reset data, keep investment 2, lose investment
                investmentReset(true, false)
            },
            unlocked:() => hasUpgrade("p", 42)
        },
        21: {
            title: "Education I",
            cost() {
                let baseCost = new Decimal("2e5")
                let base = new Decimal("2")
                let exp = new Decimal(getBuyableAmount("p", 21)).div(buyableEffect("p", 22)).pow(2)
                return baseCost.mul(base.pow(exp))
            },
            display() {
                if (!player.shiftDown) {
                    let levels = "<b><h3>Levels:</h3></b> " + formatWhole(getBuyableAmount("p", 21)) + "<br>"
                    let eff1 = "<b><h3>Effect:</h3></b> Multiplies penny gain by " 
                    if (buyableEffect("p", 21).gte(new Decimal("1e9"))) eff1 = eff1 + "(softcapped) "
                    let eff2 = format(buyableEffect("p", 21)) + "<br>"

                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + eff1 + eff2 + cost
                }
                let effFormulaBase = "<b><h3>Effect Formula (softcap begins at effect of 1e9):</h3></b><br>"
                let effFormula1 = "log2(2*Investment)<sup>x</sup><br>"
                let effFormula2 = format(player.p.investment.points.mul(2).log2()) + "<sup>x</sup><br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>"
                if (hasUpgrade("e", 13)) costFormula = costFormula + "2e5*2^(x/" + format(buyableEffect("p", 22)) + ")<sup>2</sup>"
                else costFormula = costFormula + "2e5*2^x<sup>2</sup>"
                return effFormulaBase + effFormula1 + effFormula2 + "<br>" + costFormula
            },
            effect() {
                if (!this.unlocked()) return decOne
                let base = player.p.investment.points.mul(2).log2()
                let exp = getBuyableAmount("p", 21)
                let effect = base.pow(exp)
                let softcapStart = new Decimal("1e9")
                let softcapPower = new Decimal(".5")
                if (effect.gte(softcapStart))
                effect = effect.pow(softcapPower).times(softcapStart.pow(decimalOne.sub(softcapPower)))
                return effect
            },
            canAfford() {
                return player.p.points.gt(this.cost())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("p", 21, 1)
            },
            unlocked:() => (hasUpgrade("p", 31) && player.p.investment.points.gte(1)) // second condition to make sure cant have less than 1 mult
        },
        22: {
            title: "Education II",
            cost() {
                let baseCost = new Decimal("5e7")
                let base = new Decimal("2.1")
                let exp = new Decimal(getBuyableAmount("p", 22)).pow(1.9)
                return baseCost.mul(base.pow(exp))
            },
            display() {
                if (!player.shiftDown) {
                    let levels = "<b><h3>Levels:</h3></b> " + formatWhole(getBuyableAmount("p", 22)) + "<br>"
                    let eff1 = "<b><h3>Effect:</h3></b> Divides Education 1 cost exponent base by "
                    if (buyableEffect("p", 22).gte(new Decimal("2"))) eff1 = eff1 + "(softcapped) "
                    let eff2 = format(buyableEffect("p", 22)) + "<br>"
                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + eff1 + eff2 + cost
                }
                let effFormulaBase = () => {
                    let ret = "<b><h3>Effect Formula (softcap begins at effect of "
                    ret = ret + format((player.s.stored_investment.points.log10().div(10).add(1.6)).max(new Decimal("2")))
                    ret = ret + "):</h3></b><br>"
                    return ret
                }
                let effFormula1 = "1 + log4(1+Penny Expansions)/8 * x<br>"
                let effFormula2 = "1 + " + format(logXBaseN(player.e.penny_expansions.points.add(1), 4).div(8)) + " * x<br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>5e7*2.1^x<sup>1.9</sup>"
                return effFormulaBase() + effFormula1 + effFormula2 + "<br>" +  costFormula
            },
            effect() {
                if (!this.unlocked()) return decOne
                let base = logXBaseN(player.e.penny_expansions.points.add(1), 4).div(8) // log4(1 + penny expansions) / 8
                let mult = getBuyableAmount("p", 22) // increases Education I exponent by base * thisBuyableAmount
                let effect = base.mul(mult).add(1)
                let softcapStart = (player.s.stored_investment.points.log10().div(10).add(1.6)).max(new Decimal("2"))
                //softcapStart = new Decimal("2")
                let softcapPower = new Decimal(".2")
                if (effect.gte(softcapStart))
                effect = effect.pow(softcapPower).times(softcapStart.pow(decimalOne.sub(softcapPower)))
                return effect
            },
            canAfford() {
                return player.p.points.gt(this.cost())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("p", 22, 1)
            },
            unlocked:() => hasUpgrade("e", 13)
        },
        respecBuyables() {
            return true
        }
    },
    update(diff) {
        if (player.p.investmentCooldown > 0) {
            player.p.investmentCooldown = Math.max(decZero, player.p.investmentCooldown - diff)
        }

        if (player.p.autoUpgCooldown > 0) {
            player.p.autoUpgCooldown = Math.max(decZero, player.p.autoUpgCooldown - diff)
        }

        if (player.p.autoBuyableCooldown > 0) {
            player.p.autoBuyableCooldown = Math.max(decZero, player.p.autoBuyableCooldown - diff)
        }
    },
    automate() {
        if (!hasUpgrade("p", 31) && hasUpgrade("e", 15) && canAffordUpgrade("p", 31)) player.p.upgrades.push(31)

        if (hasUpgrade("e", 15) && player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 21)) {
            addBuyables("p", 21, 1)
            player.p.autoBuyableCooldown = (hasUpgrade("e", 35)) ? 2 : 10
        }

        if (hasUpgrade("e", 15) && player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 22)) {
            addBuyables("p", 22, 1)
            player.p.autoBuyableCooldown = (hasUpgrade("e", 35)) ? 2 : 10
        }

        if (hasUpgrade("e", 25) && player.p.autoUpgCooldown == 0) {
            let upgIndices = [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35]
            function findUpg(index) {
                return !hasUpgrade("p", index)
            }
            upgIndices = upgIndices.filter(findUpg)
            for (i = 0; i < upgIndices.length; i++) {
                let upgIndex = upgIndices[i]
                if (canAffordUpgrade("p", upgIndex)) {
                    player.p.autoUpgCooldown = .5
                    player.p.upgrades.push(upgIndex)
                    break
                }
            }
        }  
    },
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                ["display-text",
                    function() {
                        if (penniesTaxFactor().gt(1)) return "Tax divides penny gain by " + format(penniesTaxFactor()) + "<br><br>"
                        return ""
                    }
                ],
                "prestige-button",
                "blank",
                ["display-text", 
                    function() {
                        return "Your best pennies is " + formatWhole(player.p.best)
                    }
                ],
                "blank",
                "upgrades"
            ]
        },
        "Production": {
            content: [
                "main-display",
                ["display-text",
                    function() {
                        if (penniesTaxFactor().gt(1)) return "Tax divides penny gain by " + format(penniesTaxFactor()) + "<br><br>"
                        return ""
                    }
                ],
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        let ret = `You have 
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment.points)}</span></h2> Investment`
                        if (player.p.investment2.points.gt(0)) ret = ret + ` and 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment2.points)}</span></h2> Expansion Investment`
                        return ret
                    }
                ],
                "blank",
                ["display-text", function() {
                    let ret = "Press shift to see useful formulas and values<br>Investing resets most upgrades (including 3rd row and beyond), current points, current pennies, " 
                    if (hasUpgrade("p", 31)) return ret + "best pennies, and Education buyables"
                    return ret + "and best pennies"
                }],
                "buyables", 
                "blank"
            ],
            unlocked(){
                return hasUpgrade("p", 25)
            },
        },
        "Info": {
            content: [
                "main-display",
                ["display-text", function() {
                    let ret = "\"Tax\" will be applied to your penny gain once your <b>best</b> pennies exceeds " + format(pennyTaxStart()) + ". "
                        + "This nerf will apply to you so long as your <b>best</b> pennies exceeds " + format(pennyTaxStart()) + ". It divides your penny gain on reset by the shown value "
                        + "<br><br>This nerf is calculated using the formula:<br>(.5 + x / pennyTaxStart)<sup>pennyTaxExp</sup>,"
                        + "<br> where x = max([Best Pennies] / 2, [Current Pennies]), pennyTaxStart = " + format(pennyTaxStart()) + ", and pennyTaxExp = 2.5 "
                        + "<br><br>Essentially, the nerf is a minimum of 1, is roughly 2.76 at " + format(pennyTaxStart()) + " pennies, and increases alongside your penny amount. "
                        + "It may slightly decrease and even remain stagnate after spending pennies, if your penny value is lower than [Best Pennies] / 2. "
                        + "That is normal behavior"
                        + "<br><br>A neat trick to circumvent Tax is to avoid purchasing \"We Need Bigger Pockets\" (WNBP) and allow idle gain to accumulate... "
                        + "but you didn't hear that from me... <s>and it's probably slower, just much less tedious, anyways</s>"
                        + "<br><br>Once your pennies on reset after Tax surpasses a value of 1e9, it will be raised to a softcap exponent of .5 "
                        + "to avoid inflation from this trick and general scaling. "
                        + "This softcap will be reducable sometime after this trick stops being useful."
                    return ret
                }],
                "blank"
            ],
            unlocked(){
                return hasUpgrade("p", 25)
            },
        }
    }
})

addLayer("e", {
    symbol: "E",
    position: 2,
    startData() { return {
        unlocked: false,
        points: decZero,
        penny_expansions: {
            points: decZero
        },
        everUpg23: false,
        everUpg33: false
    }},
    color: "#FFFFFF",
    resource: "expansions",
    baseResource: "points",
    type: "custom",
    getResetGain() {
        let base = tmp.e.baseAmount
        let mult = tmp.e.gainMult
        return base.mul(mult)
    },
    prestigeButtonText(){ return "" },
    getNextAt() {return decZero},
    baseAmount() {
        if (player.highestPointsEver.lessThan(new Decimal("1e10"))) return decZero
        return new Decimal(Math.log10(Math.log10(player.highestPointsEver)) - 1)
    },
    gainMult() {
        let ret = decOne
        if (hasUpgrade("e", 24)) ret = ret.mul(upgradeEffect("e", 24))
        if (hasUpgrade("p", 42)) ret = ret.mul(upgradeEffect("p", 42))

        if (hasAchievement("a", 32)) ret = ret.mul(1.1)
        if (hasAchievement("a", 34)) ret = ret.mul(1.1)

        if (getClickableState("e", 21)) ret = ret.mul(1.5)
        if (getClickableState("e", 22)) ret = ret.div(5)

        ret = ret.mul((player.s.stored_expansion.points.add(1).log10().div(2.5)).max(decOne))
        return ret
    },
    doReset(layer) {},
    row: 0,
    layerShown() {
        let visible = false
        if (player.e.unlocked || hasAchievement("a", 31)) {
            player.e.unlocked = true
            visible = true
        }
        return visible
    },
    update(diff) {
        if (!player.e.unlocked) return
        let layerData = player[this.layer]
        let penny_expansions = layerData.penny_expansions
        layerData.points = layerData.points.add(getResetGain(this.layer).times(diff))
        if (getResetGain(this.layer).gt(decZero)) {
            layerData.points = layerData.points.sub(layerData.points.mul(.3).div(100).times(diff))
        }
        penny_expansions.points = penny_expansions.points.add(tmp.e.penny_expansions.getResetGain.times(diff))
        penny_expansions.points = penny_expansions.points.sub(penny_expansions.points.mul(1).div(100).times(diff))
    },
    canReset() {return false},
    penny_expansions: {
        getResetGain() {
            if (player.e.points.lessThan(decOne)) return decZero
            let ret = this.baseGain().times(this.gainMult()) // base gain
            if (getClickableState("e", 21)) ret = ret.div(5)
            if (getClickableState("e", 22)) ret = ret.mul(1.5)
            return ret
        },
        gainMult() {
            let ret = decOne
            if (hasUpgrade("e", 24)) ret = ret.times(upgradeEffect("e", 24))
            if (hasMilestone("a", 1)) ret = ret.times(1.05**player.a.milestones.length)
            return ret
        },
        baseGain() {
            let ret = new Decimal(player.e.points / 200)
            if (hasUpgrade("e", 11)) ret = ret.add(upgradeEffect("e", 11))
            return ret
        }
    },
    upgrades: {
        11: {
            title: "It's Only Reasonable",
            description:() => {
                let ret = "Increases base penny expansion gain by "
                if (!hasUpgrade("e", 21)) ret = ret +  "log4(4 + [Expansion Upgrades]) / 50"
                else if (!hasUpgrade("e", 31)) ret = ret + "ln(4 + [Expansion Upgrades]) / 10"
                else if (!hasUpgrade("e", 41)) ret = ret + "ln(4 + [Expansion Upgrades]) / 4"
                else ret = ret + "log2(4 + [Expansion Upgrades]) * 1.5"
                return ret
            },
            cost:() => decOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                if (!hasUpgrade("e", 21)) return Math.log(4 + player.e.upgrades.length)/Math.log(4)/50
                if (!hasUpgrade("e", 31)) return Math.log(4 + player.e.upgrades.length)/10
                if (!hasUpgrade("e", 41)) return Math.log(4 + player.e.upgrades.length)/4
                return Math.log2(4 + player.e.upgrades.length) * 1.5
            },
            effectDisplay:() => "+" + format(upgradeEffect("e", 11))
        },
        12: {
            title: "Is This Even Worth It?",
            description:() => {
                let ret = "Increases WNBP limit exponent by Expansions<sup>.1</sup>"
                if (!hasUpgrade("e", 22)) return ret + "/100"
                if (!hasUpgrade("e", 32)) return ret + "/10"
                //if (!hasUpgrade("e", 42))
                return ret + "/7.5"
            },
            cost:() => decOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => player.e.points.pow(.1).div(100).mul(hasUpgrade("e", 22) ? 10 : 1).mul(hasUpgrade("e", 32) ? 10/7.5 : 1),
            effectDisplay:() => "+" + format(upgradeEffect("e", 12), 4)
        },
        13: {
            title: "Cheaper Education",
            description: "Unlocks the Education II buyable (Base Cost: 5e7 Pennies)",
            cost:() => decOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions
        },
        14: {
            title: "These Actually Matter?",
            description: "Increases Seriously? exponent from .2 -> .8",
            cost:() => decOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: .8

        },
        15: {
            title: "QOL 1",
            description: "Autobuy One Man's Trash, reduce its investment requirement to 1, autobuy 1 Education buyable every 10 seconds",
            cost:() => decOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            onPurchase:() => player.p.autoBuyableCooldown = 10
        },
        21: {
            title: "It's Even Reasonabler",
            description: "Reduces above upgrade's log4 to ln and reduce divisor to 10",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(2).min(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 5
        },
        22: {
            title: "GIVE ME MORE!!!",
            description: "Multiplies above upgrade's effect by 10",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(2).min(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 5
        },
        23: {
            fullDisplay:() => {
                let title = "<h3></b>It's Expandin' Time!</h3></b>"
                let description = "Unlocks the next row of Penny Upgrades & more achievements, but permanently keep WNBP"
                let requirement = "Requires: " + formatWhole(decOne.mul(2**player.e.upgrades.length).div(2).min(256)) + " Penny Expansions"
                if (player.a.achievements.length < 15) requirement = requirement + ", 15 achievements"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decOne.mul(2**player.e.upgrades.length).div(2)
                return player.e.penny_expansions.points.gte(cost) && player.a.achievements.length >= 15
            },
            onPurchase() {
                player.e.everUpg23 = true
                if (!hasUpgrade("p", 23)) player.p.upgrades.push(23)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 5
        },
        24: {
            title: "Why Do These Matter???",
            description: "Multiplies Expansion and Penny Expansion gain by 1.1 per achievement - 13",
            cost:() => decOne.mul(2 ** player.e.upgrades.length).div(2).min(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let ret = new Decimal("1.1")
                if (hasMilestone("a", 2)) ret = new Decimal("1.2")
                return ret.pow(player.a.achievements.length-13)
            },
            effectDisplay:() => format(upgradeEffect("e", 24)) + "x",
            unlocked:() => player.e.upgrades.length >= 5 || hasUpgrade("e", 24)
        },
        25: {
            title: "QOL 2",
            description: "Autobuy two penny upgrades from the first three rows per second",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(2).min(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            onPurchase() {
                player.p.autoUpgCooldown = .5
            },
            unlocked:() => player.e.upgrades.length >= 5
        },
        31: {
            title: "It's So Beautiful",
            description: "Reduce divisor of upgrade two rows above this one to 4",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(4),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 10
        },
        32: {
            title: "The Machine Is Hungry...",
            description: "Reduces divisor of upgrade two rows above this one to 7.5",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(4),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 10
        },
        33: {
            title: "We Should Get A Wallet",
            description: "Unlocks Storage, but removes penny buyable respec; this upgrade is kept through respecs",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(4),
            onPurchase() {
                player.s.unlocked = true
                player.e.everUpg33 = true
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 10 || hasUpgrade("e", 33)
        },
        34: {
            title: "This Is Pretty Lazy",
            description: "Increases Seriously? exponent from .8 -> 1.8",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(4),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: 1.8,
            unlocked:() => player.e.upgrades.length >= 10
        },
        35: {
            title: "QOL 3",
            description: "Reduces investment cooldown by 5 seconds and QOL 1 cooldown by 8 seconds",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(4),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 10
        },
        41: {
            title: "It Is Reason",
            description: "Multiply effect of upgrade above this one by 6 and reduce its ln to log2",
            cost:() => decOne.mul(2**player.e.upgrades.length).div(8),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => player.e.upgrades.length >= 15
        }
    },
    tabFormat: {
        "Info": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points, 3)}</span></h2> Expansions<br><br>
                        `
                    }
                ],
                ["display-text",
                    function() {
                        let ret = "You are gaining " + format(getResetGain("e"), 4) + " Expansions per second and losing .1% of your current Expansions per second <br>"
                        ret = ret + "<br>Expansion point generation is based on your highest points ever achieved, which is only calculated when Penny upgrade WNBP is purchased. "
                        ret = ret + "Penny Expansions begin generating when Expansions surpass a value of 1<br>"
                        ret = ret + "<br>QOL (Quality-Of-Life) upgrades give small automation effects that typically purchase things at no cost once they can be afforded<br>"
                        ret = ret + "<br>Gain formulas are listed below:<br>"
                        ret = ret + "Expansion gain: (log10(log10(Highest Points Ever)) - 1) - .001 * Expansions<br>"
                        ret = ret + "Penny Expansion gain: Expansions / 200 - .01 * Penny Expansions<br>"
                        ret = ret + "<br>Highest Points Ever = " + format(player.highestPointsEver) + ", updates only when Penny upgrade WNBP is purchased<br>"
                        return ret
                    }
                ]
            ]
        },
        "Penny Expansions": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points, 3)}</span></h2> Expansions and
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.penny_expansions.points, 3)}</span></h2> Penny Expansions<br><br>
                        `
                    }
                ],
                ["display-text",
                    function(){
                        let ret = "You are gaining " + format(tmp.e.penny_expansions.getResetGain, 4) + " Penny Expansions per second and are losing 1% of your current Penny Expansions per second"
                        ret = ret + "<br>Each upgrade multiplies the cost of other upgrades by 2"
                        ret = ret + "<br>Purchasing all upgrades in a row unlocks the next row of upgrades"
                        return ret
                    }
                ],
                "blank",
                ["clickables", [1]],
                "upgrades", 
                "blank",
            ],
            unlocked(){
                return player.e.points.gte(".1")
            },
        },
        "Focused Production": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points, 3)}</span></h2> Expansions and
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.penny_expansions.points, 3)}</span></h2> Penny Expansions<br><br>
                        `
                    }
                ],
                ["display-text", "These boosts are not <b>mandatory</b> for progression, but can certainly help you progress faster when used at the right time"],
                "blank",
                ["clickables", [2]]
            ],
            unlocked() {
                return player.e.points.gte(".1")
            }
        }
    },
    clickables: {
        11: {
            title: "Respec Upgrades",
            tooltip: "Does NOT return spent currency and forces an investment reset",
            onClick() {
                let confirmText = "Are you sure you want to respec? This does NOT return spent currency, forces an investment reset "
                confirmText = confirmText + "without rewarding currency, and could unnecessarily slow down progression if done at the wrong time!"
                let respecConfirm = confirm(confirmText)
                if (!respecConfirm) return
                investmentReset(false, false)
                function removeUpgrades(index) {
                    return index == 33
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)
                player.p.autoUpgCooldown = -1
                player.p.autoBuyableCooldown = -1
            },
            canClick() {
                return player.e.upgrades.length > 0
            }
        },
        21: {
            title: "Focused Expansion",
            display() {
                let ret = "Multiplies Expansion gain by 1.5, but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 21) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 21, !getClickableState("e", 21)),
            canClick:() => getClickableState("e", 21) || getClickableState("e", 21) != !getClickableState("e", 22)
        },
        22: {
            title: "Focused Penny Expansion",
            display() {
                let ret = "Multiplies Penny Expansion gain by 1.5, but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 22) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 22, !getClickableState("e", 22)),
            canClick:() => getClickableState("e", 22) || getClickableState("e", 21) != !getClickableState("e", 22)
        }
    }
})

addLayer("s", {
    symbol: "S",
    position: 1,
    startData() { return {
        unlocked: false,
        points: decZero,
        stored_investment: {
            points: decZero
        },
        stored_expansion: {
            points: decZero
        },
    }},
    color: "#D6B7B4",
    tooltip: "",
    type: "none",
    row: 0,
    branches: ["p", "e"],
    layerShown:() => player.e.everUpg33,
    stored_investment: {
        getResetGain() {
            if (player.p.investment.points.lt(10000)) return decZero // requirement of 10k investment
            let ret = this.baseGain().times(this.gainMult()) // base gain
            return ret
        },
        gainMult() {
            let ret = decOne
            return ret
        },
        baseGain() {
            let ret = decOne
            return ret
        }
    },
    stored_expansion: {
        getResetGain() {
            if (player.p.investment.points.lt(5)) return decZero // requirement of 10k investment
            let ret = this.getBaseGain().times(this.getGainMult()) // base gain
            return ret
        },
        getGainMult() {
            let ret = decOne
            return ret
        },
        getBaseGain() {
            let ret = decOne
            return ret
        }
    },
    milestones: {
        0: {
            requirementDescription: "100000 Stored Investment",
            effectDescription:() => "Multiply Expansion Investment and Investment gain by 1 + Stored Investment / 1000000<br>Currently: " 
                + format(player.s.stored_investment.points.div(1000000).add(1)) + "x",
            done() { return player.s.stored_investment.points.gte(100000) }
        },
        1: {
            requirementDescription: "30 Stored Expansion Investment",
            effectDescription:() => "Multiply Expansion Investment and Investment gain by 1 + Stored Investment / 1000000<br>Currently: " 
                + format(player.s.stored_investment.points.div(1000000).add(1)) + "x",
            done() { return false }
        },
        2: {
            requirementDescription: "3000 Stored Expansion Investment",
            effectDescription:() => "Multiply Expansion Investment and Investment gain by 1 + Stored Investment / 1000000<br>Currently: " 
                + format(player.s.stored_investment.points.div(1000000).add(1)) + "x",
            done() { return false }
        }
    },
    clickables: {
        11: {
            title: "Store Your Investment",
            display() { return "Requires 10000 Investment" },
            canClick() { return player.p.investment.points.gte(10000) },
            onClick() {
                player.s.stored_investment.points = player.s.stored_investment.points.add(player.p.investment.points)
                investmentReset(true, true)
                upg35Index = player.p.upgrades.indexOf(35)
                if (upg35Index > -1) player.p.upgrades.splice(upg35Index, 1)
                upg41Index = player.p.upgrades.indexOf(41)
                if (upg41Index > -1) player.p.upgrades.splice(upg41Index, 1)
            }
        },
        12: {
            title: "Store Your Expansions",
            display() { return "Requires 500 Expansions"},
            canClick() { return player.e.points.gte(500) }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", function () {
                    let ret = `You have 
                    <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment `
                    ret = ret + `and <h2><span style="color: #FFFFFF; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    return ret
                }],
                "blank",
                "clickables",
                "blank"
                // effects
            ]
        },
        "Milestones": {
            content: [
                "milestones"
            ]
        },
        "Challenges": {
            content: [
                ["display-text", "Hello World!"]
            ],
            unlocked:() => false
        },
        "Info": {
            content: [
                ["display-text", 
                    "Storing a layer's currency resets that layer's features in return for boosts that help you accumulate resources faster."
                ],
                "blank", 
                ["microtabs", "investmentInfo"]
            ]
        }
    },
    microtabs: {
        investmentInfo: {
            "Resets": {
                content: [
                    ["display-text", 
                    "<br>Storing investment is functionally the same as performing a penny buyable respec (rip), but also removes the Finally... and Seriously? upgrades."
                    + "<br><br>Storing expansions is functionally the same as performing a penny expansion upgrade respec, "
                    + "but also resets expansion/penny expansion amounts and keeps the Why Do These Matter??? upgrade"
                    ]
                ]
            },
            "Stored Investment": {
                content: [
                    ["display-text", function() {
                        let ret = "Because you have stored " + format(player.s.stored_investment.points) + " investment, you currently...<br>"
                        ret = ret + "<br>Make the Education II softcap begin at an effect of " + format((player.s.stored_investment.points.log10().div(10).add(1.6)).max(new Decimal("2")))
                        if (hasMilestone("s", 0)) ret = ret + "<br>Generate " + format(tmp.p.passiveGeneration.mul(100)) + "% of your penny gain on reset per second"
                        return ret
                    }]
                ]
            },
            "Stored Expansion": {
                content: [
                    ["display-text", function() {
                        let ret = "Because you have stored " + format(player.s.stored_expansion.points) + " expansions, you currently...<br>"
                        ret = ret + "<br>Gain " + format((player.s.stored_expansion.points.add(1).log10().div(2.5)).max(decOne)) + "x more expansions"
                        return ret
                    }]
                ]
            }
        }
    }
    // expansion wallet
    // storing in [Currency] wallet resets most [Currency] related content for boosts
        // Penny wallet resets Finally... and Seriously? but boosts investment/expansion investment gain
        // Expansion wallet just resets everything (workshop later if anything *should* be kept)

    // investmentReset(false, false)
    // function removeUpgrades(index) {
    //     return index == 33 || index == 24
    // }
    // player.e.upgrades = player.e.upgrades.filter(removeUpgrades)

    // add infobox for investment effects
})