function upgrade23Limit() {
    let base = player.p.points.mul(100).pow(upgrade23LimitExp()).add(10)
    if (hasMilestone("a", 0) && base.lt(new Decimal("9.99e9"))) {
        let limit = new Decimal("1e10")
        let newValFactor = limit.sub(base).log10().div(20).add(1) // 1 + log10(L-B)/20
        base = base.mul(newValFactor) // max(limit, base * (1 + log10(limit-base)/20))
    }
    if (getClickableState("e", 21) || getClickableState("e", 22)) base = base.div(5)
    if (getClickableState("e", 31)) base = base.mul(clickableEffect("e", 31))
    if (getClickableState("e", 32)) base = base.div(10)
    return base.max(new Decimal("10"))
}

function upgrade23LimitExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 34)) exp = exp.add(upgradeEffect("p", 34))
    if (hasUpgrade("e", 12)) exp = exp.add(upgradeEffect("e", 12))
    if (hasAchievement('a', 35)) exp = exp.add(.01)
    if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(250))
    return exp
}

function upgrade23EffExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
    if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(30))
    if (hasUpgrade("e", 42)) exp = exp.add(upgradeEffect("e", 12).mul(6))
    return exp
}

function upgrade14Limit() {
    let limit = new Decimal("1e6")
    if (hasUpgrade("p", 33)) limit = limit.mul(upgradeEffect("p", 33))
    return limit
}

function penniesTaxFactor() {
    let pts = pennyTaxStart()
    let pte = pennyTaxExp()
    if (player.p.points.lt(pts) && player.p.best.lt(pts)) return decimalOne//(player.p.points.lt(pennyTaxStart())) return decimalOne
    let taxFactor = player.p.best.div(2).max(player.p.points).div(pts)//player.p.points.div(pennyTaxStart()) // base tax factor = pennies/1e6
    taxFactor = taxFactor.add(.5).pow(pte) // returns (.5 + pennies / 1e6)^2.5 initially
    return taxFactor
}

function pennyTaxStart() {
    let baseTaxes = new Decimal("1e6")
    if (hasUpgrade("p", 45)) baseTaxes = baseTaxes.mul(upgradeEffect("p", 42))
    if (hasMilestone("s", 2)) baseTaxes = baseTaxes.mul(player.s.stored_expansion.points.add(1).log10().sub(2))
    if (inChallenge("s", 11)) baseTaxes = baseTaxes.div(1e4)
    return baseTaxes
}

function pennyTaxExp() {
    let baseExp = new Decimal("2.5")
    if (inChallenge("s", 11)) baseExp = new Decimal("1.5")
    return baseExp
}

function investmentGain() {
    if (inChallenge("s", 11)) {
        let ret = decimalOne
        if (hasMilestone("s", 4)) ret = ret.mul(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1))
        if (hasUpgrade("p", 53)) ret = ret.mul(upgradeEffect("p", 53))
        return ret
    }
    let investmentExponent = new Decimal(".5")
    let ret = player.p.points.div(1000000).pow(investmentExponent)
    if (hasAchievement("a", 25)) ret = ret.mul(2)
    if (hasAchievement("a", 34)) ret = ret.mul(1.1)
    if (hasAchievement("a", 44)) ret = ret.mul(1.2)
    if (hasMilestone("a", 4)) ret = ret.mul(1.1 ** (player.a.milestones.length - 3))
    if (hasUpgrade("p", 43)) ret = ret.mul(upgradeEffect("p", 43))
    if (hasUpgrade("p", 53)) ret = ret.mul(upgradeEffect("p", 53))
    ret = ret.mul(player.s.stored_investment.points.add(1).log10().div(10).add(1)) // applied when player has any stored

    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    return ret
}

function investment2Gain() {
    let investmentExponent = new Decimal(".4")
    let ret = player.p.investment.points.div(10000).pow(investmentExponent)
    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    if (hasMilestone("s", 1)) ret = ret.mul(1.03**player.s.stored_expansion.points.log2())
    if (hasMilestone("a", 6)) ret = ret.mul(1.01**(player.a.milestones.length+player.a.achievements.length-28))
    
    let softcapStart = tmp.p.buyables[12].softcap
    if (ret.gte(softcapStart)) {
        // EX: 5000 softcap base, 4000 ex inv, 4200 ret --> saved = 1000, ret = 4200 - saved = 3200
        // then, apply softcap to remaining gain (which is stored in ret) --> ret = 3200^.4 = 25.24
        // return saved + ret = 1000 + 25.24
        // if ex inv >= 5000, no tricky business b/c of .max(0), simply apply softcap to ret
        // let saved = softcapStart.sub(player.p.investment2.points).max(decimalZero)
        // ret = ret.sub(saved)
        // return saved.add(ret.pow(.4))

        let excess = ret.sub(softcapStart)
        return softcapStart.add(excess.pow(.4))
    }

    return ret
}

function investmentReset(resetInvestment, resetInvestment2) {
    player.p.points = decimalZero
    player.p.best = decimalZero
    player.p.total = decimalZero
    player.p.resetTime = 0
    
    let keepUpgrades = [21, 25, 35, 41, 42, 51, 52, 53, 54, 55]
    if (player.e.everUpg23) keepUpgrades.push(23)
    function removeUpgrades(index) {
        return keepUpgrades.indexOf(index) != -1 // keeps upgrades with indices gte 25 + achievement upgrades
    }
    player.p.upgrades = player.p.upgrades.filter(removeUpgrades)

    let buyableIndices = [21, 22]
    for (const index of buyableIndices) {
        player.p.buyables[index] = decimalZero
    }

    player.points = decimalZero

    if (resetInvestment) player.p.investment.points = decimalZero
    if (resetInvestment2) player.p.investment2.points = decimalZero
}

function logXBaseN(x, n) {
    let ret = new Decimal(Math.log(x) / Math.log(n))
    return ret
}

function boostedTime(diff) {
    let ret = diff
    if (hasMilestone("a", 8)) ret = ret * (1 + player.a.achievements.length/500)
    return ret
}

addLayer("p", {
    // name: "pennies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: decimalOne,
        best: decimalOne,
        total: decimalOne,
        investment: {
            points: decimalZero,
            best: decimalZero
        },
        investment2: {
            points: decimalZero,
            best: decimalZero
        },
        investmentCooldown: 0,
        autoUpgCooldown: -1,
        autoBuyableCooldown: -1,
        resetTime: 0
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
        if (hasUpgrade("p", 42)) mult = mult.times(upgradeEffect("p", 42))
        if (hasUpgrade("p", 44)) mult = mult.times(upgradeEffect("p", 44))
        if (hasAchievement("a", 34)) mult = mult.times(1.2)
        mult = mult.times(buyableEffect("p", 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        //if (hasUpgrade("p", 52)) exp = exp.add(upgradeEffect("p", 52))
        return exp
    },
    directMult() {
        let ret = decimalOne
        if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
        if (getClickableState("e", 31)) ret = ret.div(10)
        if (getClickableState("e", 32)) ret = ret.mul(clickableEffect("e", 32))
        if (inChallenge("s", 11) && hasUpgrade("s", 11)) ret = ret.mul(5)
        if (hasMilestone("s", 4)) ret = ret.mul(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1))
        return ret
    },
    softcap: new Decimal("1e9"),
    softcapPower: new Decimal(.5),
    getResetGain() {
        if (tmp[this.layer].gainExp.eq(0)) return decimalZero
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        let gain = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent).times(tmp[this.layer].gainMult).pow(tmp[this.layer].gainExp)
        gain = gain.div(penniesTaxFactor())
        if (gain.gte(tmp[this.layer].softcap)) gain = gain.pow(tmp[this.layer].softcapPower).times(tmp[this.layer].softcap.pow(decimalOne.sub(tmp[this.layer].softcapPower)))
        if (inChallenge("s", 11)) gain = gain.pow(.5)
        if (inChallenge("s", 12)) gain = gain.pow(.25)
        gain = gain.mul(tmp.p.directMult)
        return gain.floor().max(0);
    },
    getNextAt() {
        if (tmp.p.resetGain.add == undefined) return
        let next = tmp.p.resetGain.add(1).div(tmp.p.directMult)
        if (inChallenge("s", 11)) next = next.root(.5)
        if (inChallenge("s", 12)) next = next.root(.25)
        if (next.gte(tmp.p.softcap)) next = next.div(tmp.p.softcap.pow(decimalOne.sub(tmp.p.softcapPower))).pow(decimalOne.div(tmp.p.softcapPower))
        next = next.mul(penniesTaxFactor())
        next = next.root(tmp.p.gainExp).div(tmp.p.gainMult).root(tmp.p.exponent).mul(tmp.p.requires).max(tmp.p.requires)
        return next
    },
    passiveGeneration() {
        if (hasMilestone("s", 0) && player.s.stored_investment.points.gt(decimalZero)) {
            let base = .015
            let ret = Math.max(base * Number(player.s.stored_investment.points.div(100).log2()), base)
            return ret
        }
        return decimalZero
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for pennies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Lucky Penny",
            description:() => {
                if (!hasAchievement("a", 55)) return "Multiplies point gain by 1 + ln(1 + [Best Pennies])"
                return "Multiplies point gain by 1 + log2(1 + [Best Pennies])"
            },
            cost: decimalOne,
            effect:() => {
                if (!hasAchievement("a", 55)) return player.p.best.add(1).ln().add(1)
                return player.p.best.add(1).log2().add(1)
            },
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
            description:() => {
                if (!hasUpgrade("p", 51)) return "Multiplies point gain and penny gain by 1.25"
                return "Multiplies point gain and penny gain by 25"
            },
            cost: new Decimal("25"),
            effect:() => !hasUpgrade("p", 51) ? 1.25 : 25,
            unlocked:() => hasUpgrade("p", 14) || hasUpgrade("p", 25)
        },
        21: {
            cost: new Decimal("50"),
            fullDisplay:() => {
                let title = "<b><h3>There's A Coin For This?</b></h3>"
                let description = () => {
                    if (!hasUpgrade("e", 44)) {
                        if (!hasMilestone("a", 5)) return "Increase point gain by 50% per achievement"
                        let exp = format(!hasUpgrade("e", 14) ? .2 : (!hasUpgrade("e", 34) ? upgradeEffect("e", 14) : upgradeEffect("e", 34)), 1)
                        return "Multiplies point gain by (1 + .5x)<sup>" + exp + "</sup>, where x is the number of achievements."
                    }
                    return "Multiplies point gain by [Number of Achievements]<sup>2.2</sup>"
                }
                let effect = "Currently: " + format(upgradeEffect("p", 21)) + "x<br>"
                return title + "<br>" + description() + "<br>" + effect + "<br>Cost: 50 pennies"
            },
            effect:() => {
                if (hasMilestone("a", 5)) return upgradeEffect("p", 35)
                return new Decimal(1 + .5 * player.a.achievements.length)
            },
            unlocked:() => hasUpgrade("p", 15) || hasUpgrade("p", 25)
        },
        22: {
            title: "Still Can't Buy Water",
            description:() => {
                if (hasAchievement("a", 64)) return "Multiplies point gain by (1 + Pennies)<sup>.9</sup>"
                return "Multiplies point gain by (1 + Pennies/100)<sup>.9</sup>"
            },
            cost: new Decimal("100"),
            effect:() => {
                if (hasAchievement("a", 64)) return player.p.points.add(1).pow(.9)
                return player.p.points.div(100).add(1).pow(.9)
            },
            effectDisplay:() => format(upgradeEffect("p", 22)) + "x",
            unlocked:() => hasUpgrade("p", 21) || hasUpgrade("p", 25)
        },
        23: {
            title: "We Need Bigger Pockets",
            description:() => {
                let base = new Decimal("10")
                if (hasMilestone("a", 7)) base = base.add(1)

                let exp = decimalOne
                if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
                if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(30))
                if (hasUpgrade("e", 42)) exp = exp.add(upgradeEffect("e", 12).mul(6))
                
                let ret = "Multiplies point gain by "
                if (exp.gt(1)) ret = ret + format(base.pow(exp)) + "</sup>"
                else ret = ret + format(base)

                if (upgrade23LimitExp() > 1) return ret + " but limits Points to 10 + Pennies<sup>" + format(upgrade23LimitExp()) + "</sup> * 100"
                return ret + " but limits Points to 10 + Pennies * 100"
            },
            cost: new Decimal(250),
            effect:() => {
                let base = new Decimal("10")
                if (hasMilestone("a", 7)) base = base.add(1)

                let exp = decimalOne
                if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
                if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(30))
                if (hasUpgrade("e", 42)) exp = exp.add(upgradeEffect("e", 12).mul(6))

                return base.pow(exp)
            }, // upgrade23Limit() handles limit for this upgrade!!! this is for point multiplier
            effectDisplay:() => formatWhole(upgrade23Limit()) + " points",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        24: {
            title: "Where Did These Come From???",
            description:() => {
                let exp = .06
                if (hasAchievement("a", 51)) exp = exp + .02
                //if (hasAchievement("a", 62)) exp = exp + .02
                return "Multiplies penny gain by (1 + Points)<sup>" + exp + "</sup>"
            },
            cost: new Decimal("5000"),
            effect:() => {
                let exp = .06
                if (hasAchievement("a", 51)) exp = exp + .02
                //if (hasAchievement("a", 62)) exp = exp + .02
                return player.points.add(1).pow(exp)
            },
            effectDisplay:() => format(upgradeEffect("p", 24)) + "x",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        25: {
            cost: new Decimal("1e5"),
            effect:() => {
                return player.p.investment.points.add(1).pow(.8)
                //return player.p.investment.points.add(1)
            },
            fullDisplay:() => {
                let title = "<b><h3>Now We're Getting Somewhere...</b></h3>"
                let description = (!hasUpgrade("p", 25)) ? "Unlock a way to put those pennies to good use and unlock more achievements. "
                    + "Also unlock an effect for this upgrade." : "Multiplies point gain by (1 + Investment)<sup>.8</sup>"
                //if (hasAchievement("a", 62)) description = "Multiplies point gain by 1 + Investment"
                let effect = (!hasUpgrade("p", 25)) ? "" : "Currently: " + format(upgradeEffect("p", 25)) + "x<br>"
                let ret = title + "<br>" + description + "<br>" + effect
                if (!hasUpgrade("p", 25)) return ret + "<br>Requires: 100,000 pennies (no cost)"
                return ret
            },
            pay:() => 0,
            // keeps unlocked after doing an investment
            unlocked:() => (hasUpgrade("p", 25) || hasUpgrade("p", 24) || player.p.investment.points.gt(decimalZero)) 
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
                let effect = "Currently: ^" + format(upgradeEffect("p", 32)) + "<br>"
                if (!player.p.investment.points.gte(5)) effect = ""
                let requirement = "Cost: " + format(new Decimal("4e6")) + " pennies"
                if (!player.p.investment.points.gte(5)) requirement = "Requires: 5 Investment"
                return title + "<br>" + description + "<br>" + effect + "<br>" + requirement
            },
            cost: new Decimal("4e6"),
            effect:() => player.p.investment.points.log2(),
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33)
        },
        33: {
            fullDisplay:() => {
                let title = "<b><h3>Unuselessifier</b></h3>"
                let description = () => {
                    let ret = "Multiplies Useless Limit by Investment<sup>3</sup>"
                    if (hasMilestone("s", 2)) ret = "Multiplies Useless Limit by Investment<sup>3.5</sup>"
                    if (hasMilestone("s", 3)) {
                        let exp = 3.5
                        exp = player.s.stored_expansion.points.add(1).log10().div(5).add(exp)
                        ret = "Multiplies Useless limit by Investment<sup>" + format(exp) + "</sup>"
                    }
                    if (!hasUpgrade("p", 33) && !hasUpgrade("p", 34)) ret = ret + "<br>Increases cost of next upgrade"
                    return ret
                }
                let effectDis = "Currently: " + format(upgradeEffect("p", 33))
                let requirement = () => {
                    if (!player.p.investment.points.gte(5)) return "Requires: 5 Investment"
                    let ret = new Decimal("4e6")
                    if (hasUpgrade("p", 33) || hasUpgrade("p", 34)) ret = ret.mul(1.5)
                    return "Cost: " + format(ret) + " pennies"
                }
                return title + "<br>" + description() + "<br>" + effectDis + "<br><br>" + requirement()
            },
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 33) || hasUpgrade("p", 34)) ret = ret.mul(1.5)
                return ret
            },
            effect:() => {
                let ret = player.p.investment.points
                if (hasMilestone("s", 2)) {
                    if (hasMilestone("s", 3)) {
                        let exp = 3.5
                        exp = player.s.stored_expansion.points.add(1).log10().div(5).add(exp)
                        ret = ret.pow(exp)
                    } else {
                        ret = ret.pow(3.5)
                    }
                } else {
                    ret = ret.pow(3)
                }
                return ret
            },
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33)
        },
        34: {
            fullDisplay:() => {
                let title = "<b><h3>Slightly Bigger Pockets</b></h3>"
                let description = () => {
                    let ret = "Increases WNBP limit exponent by log10(1 + Investment)/"
                    ret = ret + (hasMilestone("a", 3) ? "33.33" : "50")
                    if (!hasUpgrade("p", 33) && !hasUpgrade("p", 34)) ret = ret + "<br>Increases cost of previous upgrade"
                    return ret
                }
                let effectDis = "Currently: +" + format(upgradeEffect("p", 34))
                let requirement = () => {
                    if (!player.p.investment.points.gte(5)) return "Requires: 5 Investment"
                    let ret = new Decimal("4e6")
                    if (hasUpgrade("p", 33) || hasUpgrade("p", 34)) ret = ret.mul(1.5)
                    return "Cost: " + format(ret) + " pennies"
                }
                return title + "<br>" + description() + "<br>" + effectDis + "<br><br>" + requirement()
            },
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 33) || hasUpgrade("p", 34)) ret = ret.mul(1.5)
                return ret
            },
            effect:() => {
                let ret = player.p.investment.points.add(1).log10().div(50)
                if (hasMilestone("a", 3)) ret = ret.mul(1.5)
                return ret
            },
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33)
        },
        35: {
            fullDisplay:() => {
                let title = "<b><h3>Seriously?</b></h3>"
                let description = () => {
                    if (hasAchievement("a", 21)) {
                        let ret = "Achievements boost pennies "
                        if (!hasMilestone("a", 5)) {
                            ret = ret + "based on the effect of There's A Coin For This? (^" 
                                + format(!hasUpgrade("e", 14) ? .2 : (!hasUpgrade("e", 34) ? upgradeEffect("e", 14) : upgradeEffect("e", 34))) + ")"
                        }
                        else ret = ret + "at the same rate as There's A Coin For This?"
                        if (!hasUpgrade("e", 33)) ret = ret + ". Unlocks a buyable respec"
                        ret = ret + "<br>Currently: " + format(upgradeEffect("p", 35)) + "x"
                        return ret
                    }
                    return "Requires Achievement 6"
                }
                let cost = "Cost: " + format(tmp.p.upgrades[35].cost) + " pennies"
                return title + "<br>" + description() + "<br><br>" + cost
            },
            cost: new Decimal("2e7"),
            effect:() => {
                if (!hasUpgrade("e", 44)) {
                    let ret = new Decimal(1 + .5 * player.a.achievements.length)
                    ret = ret.pow(!hasUpgrade("e", 14) ? .2 : (!hasUpgrade("e", 34) ? upgradeEffect("e", 14) : upgradeEffect("e", 34)))
                    return ret
                } // else
                let ret = new Decimal(player.a.achievements.length)
                ret = ret.pow(upgradeEffect("e", 44))
                return ret
            },
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
            effect:() => {
                let boost = challengeEffect("s", 11)
                return player.p.investment2.points.add(1).pow(boost.add(.4))
            },
            fullDisplay:() => {
                let title = "<b><h3>Invest In The Universe!</b></h3>"
                let description = (!hasUpgrade("p", 42)) ? "Unlock Expansion Investment and unlock an effect for this upgrade"
                    : "Multiplies expansion, penny, and point gain by (1 + Expansion Investment)<sup>" 
                        + format(challengeEffect("s",11).add(.4), 3) + "</sup>"
                let effect = (!hasUpgrade("p", 42)) ? "" : "Currently: " + format(upgradeEffect("p", 42)) + "x<br>"
                return title + "<br>" + description + "<br>" + effect + "<br>Cost: 1e11 pennies"
            },
            unlocked:() => hasUpgrade("e", 23) || hasUpgrade("p", 42)
        },
        43: {
            title: "...And Yourself, Too!",
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
            unlocked:() => hasUpgrade("e", 23)
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
            unlocked:() => hasUpgrade("e", 23)
        },
        45: {
            title: "I Want To Break Free!",
            cost: new Decimal("1e13"),
            description: "Multiplies PTS (base penny value used for Tax) by IITU effect",
            effectDisplay:() => format(upgradeEffect("p", 42)) + "x",
            unlocked:() => hasUpgrade("e", 23)
        },
        51: {
            title: "8 Quintillion Waters",
            description: "Biggest Bestest Coin effect is 25",
            cost: new Decimal("1e21"),
            unlocked:() => hasAchievement("a", 71)
        },
        52: {
            title: "Title",
            description:() => {
                if (player.shiftDown) return "Resets used to determine reset time include storing resources and investment resets"
                return "Increase point gain exponent by (Reset Time<sup>*</sup>)<sup>.25</sup> / 30"
            },
            cost: new Decimal("3e26"),
            effect:() => Math.pow(player.p.resetTime, 1/4) / 30,
            effectDisplay:() => "+" + format(upgradeEffect("p", 52)),
            unlocked:() => hasAchievement("a", 71)
        },
        53: {
            title: "Title",
            description: "Multiply investment gain, including in challenges, by 1 + log10(IITU Effect)",
            cost: new Decimal("1e30"),
            effect:() => upgradeEffect("p", 42).log10().add(1),
            effectDisplay:() => format(upgradeEffect("p", 53)) + "x",
            unlocked:() => hasAchievement("a", 71)
        },
        54: {
            title: "Title",
            description: "Multiply penny gain by (1 + Penny Expansions)<sup>.15</sup>",
            cost: new Decimal("1e33"),
            effect:() => player.e.penny_expansions.points.add(1).pow(.15),
            effectDisplay:() => format(upgradeEffect("p", 53)) + "x",
            unlocked:() => hasAchievement("a", 71)
        },
        55: {
            title: "Placeholder",
            description: "(Not Implemented) Unlock The System and Education III (not autobought)",
            cost: new Decimal("1e33"),
            unlocked:() => hasAchievement("a", 71)
        }
    },
    buyables: {
        showRespec:() => hasUpgrade("p", 35) && !hasUpgrade("e", 33),
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
                    let investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies at a rate of (x/1e6)<sup>.5</sup>!"
                    if (inChallenge("s", 11) || inChallenge("s", 12)) {
                        investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies at a base rate of 1!"
                    }
                    let cooldown = "<b><h3>Cooldown:</h3></b> " + format(player.p.investmentCooldown) + " seconds."
                    let req = "<b><h3>Requires:</h3></b> " + format(this.cost()) + " pennies"
                    return investmentRate + "<br><br>" + req + "<br><br>" + cooldown
                }
                return "Investing your pennies will earn you " + format(investmentGain()) + " investment."
            },
            canAfford() {return player.p.points.gte(this.cost()) & player.p.investmentCooldown == 0},
            buy() {
                player.p.investment.points = player.p.investment.points.add(investmentGain())
                player.p.investmentCooldown = 15
                if (hasUpgrade("e", 35)) player.p.investmentCooldown = player.p.investmentCooldown - 5
                if (hasMilestone("s", 2)) player.p.investmentCooldown = player.p.investmentCooldown - 5

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
                    let investmentRate = "<b><h3>Rate:</h3></b> Invest your current investment at a rate of (x/10000)<sup>.4</sup>!"
                    let req = "<b><h3>Requires:</h3></b> " + format(this.cost()) + " investment"
                    let softcap = "<b><h3>Softcap:</h3></b> Gain past " + format(this.softcap()) + " expansion investment"
                    let hardcap = "<b><h3>Hardcap:</h3></b> " + format(this.hardcap()) + " expansion investment"
                    return investmentRate + "<br><br>" + req + "<br><br>" + softcap + "<br><br>" + hardcap
                }

                let ret = "Investing your investment will earn you " + format(investment2Gain()) + " expansion investment."
                if (investment2Gain().gte(this.softcap())) {
                    ret = "Your expansion investment gain is currently <b><h3>softcapped</b></h3> and excess gain past "
                        + format(this.softcap()) + " is raised to a power of .4<br><br>" + ret
                }
                return ret
            },
            canAfford() {
                return player.p.investment.points.gte(this.cost())
            },
            buy() {
                if (player.p.investment2.points.gte(this.hardcap())) {
                    let check = confirm("Are you sure you want to reset your investment? You cannot gain any more expansion investment!")
                    if (!check) return
                }
                player.p.investment2.points = player.p.investment2.points.add(investment2Gain()).min(this.hardcap())

                // reset data, keep investment 2, lose investment
                investmentReset(true, false)
            },
            unlocked:() => hasUpgrade("p", 42),
            softcap:() => {
                let ret = new Decimal("1000")

                return ret
            },
            hardcap:() => {
                let ret = new Decimal("5000")
                if (hasMilestone("s", 5)) {
                    ret = ret.mul(player.s.stored_expansion.points.add(1).log10().floor().sub(5).max(0).pow(2).div(10).add(1))
                }

                return ret
            }
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
                    let levels = "<b><h3>Levels:</h3></b> " + formatWhole(getBuyableAmount("p", 21))
                    let eff1 = "<b><h3>Effect:</h3></b> Multiplies penny gain by " 
                    if (buyableEffect("p", 21).gte(new Decimal("1e9"))) eff1 = eff1 + "(softcapped) "
                    let eff1Val = format(buyableEffect("p", 21))

                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + "<br>" + eff1 + eff1Val + "<br><br>" + cost
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
                if (!this.unlocked()) return decimalOne
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
                    let levels = "<b><h3>Levels:</h3></b> " + formatWhole(getBuyableAmount("p", 22))
                    let eff1 = "<b><h3>Effect:</h3></b> Divides Education 1 cost exponent base by "
                    let softcapStart = new Decimal("2")
                    if (hasMilestone("s", 2)) softcapStart = player.s.stored_investment.points.add(1).log10().div(10).add(1.7)
                    if (buyableEffect("p", 22).gte(softcapStart)) eff1 = eff1 + "(softcapped) "
                    let eff2 = format(buyableEffect("p", 22))
                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + "<br>" + eff1 + eff2 + "<br><br>" + cost
                }
                let effFormulaBase = () => {
                    let ret = "<b><h3>Effect Formula (softcap begins at effect of "
                    if (hasMilestone("s", 2)) ret = ret + format(player.s.stored_investment.points.add(1).log10().div(10).add(1.7))
                    else ret = ret + "2"
                    ret = ret + "):</h3></b><br>"
                    return ret
                }
                let effFormula1 = "1 + log4(1+Penny Expansions)/8 * x<br>"
                let effFormula2 = "1 + " + format(logXBaseN(player.e.penny_expansions.points.add(1), 4).div(8)) + " * x<br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>5e7*2.1^x<sup>1.9</sup>"
                return effFormulaBase() + effFormula1 + effFormula2 + "<br>" +  costFormula
            },
            effect() {
                if (!this.unlocked()) return decimalOne
                let base = logXBaseN(player.e.penny_expansions.points.add(1), 4).div(8) // log4(1 + penny expansions) / 8
                let mult = getBuyableAmount("p", 22) // increases Education I exponent by base * thisBuyableAmount
                let effect = base.mul(mult).add(1)
                let softcapStart = new Decimal("2")
                if (hasMilestone("s", 2)) softcapStart = player.s.stored_investment.points.add(1).log10().div(10).add(1.7)
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
            unlocked:() => hasUpgrade("e", 13) && hasUpgrade("p", 31)
        },
        respecBuyables() {
            return true
        }
    },
    update(diff) {
        if (player.p.investmentCooldown > 0) {
            player.p.investmentCooldown = Math.max(0, player.p.investmentCooldown - diff)
        }

        if (player.p.autoUpgCooldown > 0) {
            player.p.autoUpgCooldown = Math.max(0, player.p.autoUpgCooldown - diff)
        }

        if (player.p.autoBuyableCooldown > 0) {
            player.p.autoBuyableCooldown = Math.max(0, player.p.autoBuyableCooldown - diff)
        }
    },
    automate() {
        if (!hasUpgrade("p", 31) && hasUpgrade("e", 15) && canAffordUpgrade("p", 31)) player.p.upgrades.push(31)

        if (hasUpgrade("e", 15) && player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 21)) {
            addBuyables("p", 21, 1)
            player.p.autoBuyableCooldown = 5
            if (hasUpgrade("e", 35)) player.p.autoBuyableCooldown = 1
            if (hasUpgrade("e", 45)) player.p.autoBuyableCooldown = 1/6 // 6 per second
        }

        if (hasUpgrade("e", 15) && player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 22)) {
            addBuyables("p", 22, 1)
            player.p.autoBuyableCooldown = 5
            if (hasUpgrade("e", 35)) player.p.autoBuyableCooldown = 1
            if (hasUpgrade("e", 45)) player.p.autoBuyableCooldown = 1/6 // 6 per second
        }

        if (hasUpgrade("e", 25) && player.p.autoUpgCooldown == 0) {
            let upgIndices = [11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35]
            if (hasUpgrade("e", 45)) upgIndices = upgIndices.concat([41, 42, 43, 44, 45])
            function findUpg(index) {
                return !hasUpgrade("p", index)
            }
            upgIndices = upgIndices.filter(findUpg)
            for (i = 0; i < upgIndices.length; i++) {
                let upgIndex = upgIndices[i]
                if (canAffordUpgrade("p", upgIndex)) {
                    player.p.autoUpgCooldown = .5
                    if (hasUpgrade("e", 45)) player.p.autoUpgCooldown = 1/3 // 3 per second
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
                        if (!hasUpgrade("p", 25)) return ""
                        return "Tax divides penny gain by " + format(penniesTaxFactor()) + "<br>"
                            + "Tax begins at " + format(pennyTaxStart()) + " pennies<br><br>"
                    }
                ],
                "prestige-button",
                ["display-text", function() {
                    if (tmp.p.passiveGeneration > 0) return "You are gaining " + format(tmp.p.passiveGeneration*tmp.p.resetGain)
                        + " pennies per second"
                    return ""
                }],
                "blank",
                ["display-text", 
                    function() {
                        let ret = "You currently have " + format(player.points) + " points<br>"
                            + "Your best pennies is " + formatWhole(player.p.best) 
                        if (hasUpgrade("p", 52)) ret = ret + "<br>Your current reset time is " + formatWhole(player.p.resetTime) 
                            + " seconds, or about " + format(player.p.resetTime / 60) + " minutes"
                        return ret
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
                        if (!hasUpgrade("p", 25)) return ""
                        return "Tax divides penny gain by " + format(penniesTaxFactor()) + "<br>"
                            + "Tax begins at " + format(pennyTaxStart()) + " pennies<br><br>"
                    }
                ],
                "prestige-button",
                ["display-text",
                    function(){
                        let ret = ""
                        if (tmp.p.passiveGeneration > 0) ret = ret + "You are gaining " + format(tmp.p.passiveGeneration*tmp.p.resetGain)
                        + " pennies per second<br><br>"
                        ret = ret + `You have 
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment.points)}</span></h2> Investment`
                        if (player.e.everUpg23) ret = ret + ` and 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment2.points)}</span></h2> Expansion Investment`
                        return ret
                    }
                ],
                "blank",
                ["display-text", "Press shift to see useful formulas and values (reload the page if it doesn't work)"],
                "buyables", 
                "blank"
            ],
            unlocked(){
                return hasUpgrade("p", 25)
            },
        },
        "The System": {
            content: [
                "main-display",
                "blank"
            ],
            unlocked() { return hasUpgrade("p", 55)}
        },
        "Info": {
            content: [
                "main-display",
                ["microtabs", "info"]
            ],
            unlocked(){
                return hasUpgrade("p", 25)
            },
        }
    },
    microtabs: {
        info: {
            "Investment": {
                content: [
                    ["display-text", function() {
                        let ret = "<br>Investment is used in a number of places to help boost overall progression. "
                            + "Investing will reset most upgrades (including 3rd row and beyond),  current points, current pennies, " 
                        if (hasUpgrade("p", 31)) ret = ret + "best pennies, and Education buyables.<br><br>"
                        else ret = ret + " and best pennies.<br><br>"
                        ret = ret + "The first effect that investment has is a direct boost to your point gain, which is " +
                            "given by the Now We're Getting Somewhere... upgrade."
                        return ret
                    }],
                    "blank",
                ]
            },
            "Upgrades": {
                content: [
                    ["display-text", "<br>Some upgrades will behave differently to others. Upgrades that say \"Requires: x currency\" do not spend currency when purchased. "
                    + "They merely require you to reach the shown threshold to afford and unlock them. Certain upgrades will be kept through resets, especially "
                    + "upgrades that unlock major features or achievement-related upgrades. This is not a hard rule, though. "
                    + "It doesn't hurt to perform a reset and see which upgrades are kept and which are lost.<br><br>"]
                ]
            },
            "Taxes": {
                content: [
                    ["display-text", function() { return "<br>\"Tax\" will be applied to your penny gain once your <b>best</b> pennies exceeds " + format(pennyTaxStart()) + ". "
                    + "This nerf will apply to you so long as your <b>best</b> pennies exceeds " + format(pennyTaxStart()) 
                    + ". It divides your penny gain on reset by the value shown in various tabs. "
                    + "<br><br>This nerf is calculated using the formula:<br>(.5 + x / PTS)<sup>PTE</sup>,"
                    + "<br> where x = max([Best Pennies] / 2, [Current Pennies]), PTS (pennyTaxStart) = " + format(pennyTaxStart()) + ", and PTE (pennyTaxExponent) = " + format(pennyTaxExp())
                    + "<br><br>Essentially, the nerf is a minimum of 1, is applied and roughly equal to 2.76 when your best pennies reaches a value of " 
                    + format(pennyTaxStart()) + " pennies, and increases alongside your penny amount. "
                    + "It may slightly decrease and even remain stagnate after spending pennies if your current penny value is lower than [Best Pennies] / 2. "
                    + "That is normal behavior.<br><br>" } ]
                ]
            },
            "Playstyle": {
                content: [
                    ["display-text", "<br>Throughout the game, you may find yourself wanting to play less actively (mashing reset can be a bit exhausting). " 
                     + "This mod aims to support idle/passive styles of gameplay, however.<br><br>For example, a neat trick to circumvent Tax is to avoid purchasing "  
                     + "\"We Need Bigger Pockets\" (WNBP) and allow point gain to accumulate for a larger amount of pennies on reset... "
                     + "but you didn't hear that from me... <s>and it's probably slower, just much less tedious, anyways</s><br><br>"]
                ]
            },
            "Softcaps": {
                content: [
                    ["display-text", "<br>Softcaps are used for some values to limit general scaling. "
                    + "For example, once your pennies on reset (after Tax is calculated) surpasses a value of 1e9, "
                    + "the <b>excess</b> value will be raised to a softcap exponent of .5. "
                    + "This effectively square roots penny gain on reset after the starting value of 1e9 pennies."
                    + "<br><br>Similar softcaps are applied to certain buyables which you can find in the Production tab. Their softcap "
                    + "exponents and starting values are also shown in that tab. Any softcaps that are applied in the future "
                    + "will be made clear to you in a similar way.<br><br>"]
                ]
            }
        }
    }
})

addLayer("e", {
    symbol: "E",
    position: 2,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        penny_expansions: {
            points: decimalZero
        },
        everUpg23: false
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
    getNextAt() {return decimalZero},
    baseAmount() {
        let boost = decimalZero
        if (hasMilestone("s", 0) && (hasUpgrade("e", 11) || inChallenge("s", 12)) && player.s.stored_expansion.points.gt(decimalZero)) {
            // factorPercent = percent of upg effect that is used to increase base gain
            let boostPercent = player.s.stored_expansion.points.add(1).log10().add(10).div(10)
            boost = upgradeEffect("e", 11).mul(boostPercent).div(100)
            if (inChallenge("s", 12) && player.points.gt(decimalZero) && player.highestPointsEver.lt(1e10)) {
                //console.log(upgradeEffect("e", 11).mag)
                //throw new Error("")
                // ISSUE IS IN UPGRADE E11 SOMEHOW
                // would use incorrect effect for a single tick due to game loop order
                return boost
            }
        }

        //if (player.highestPointsEver)
        if (player.highestPointsEver.lt(1e10)) return decimalZero
        let base = new Decimal(Math.log10(Math.log10(player.highestPointsEver)) - 1)
        base = base.add(boost)
        return base
    },
    gainMult() {
        let ret = decimalOne
        if (hasUpgrade("e", 24)) ret = ret.mul(upgradeEffect("e", 24))
        if (hasUpgrade("p", 42)) ret = ret.mul(upgradeEffect("p", 42))

        if (hasAchievement("a", 32)) ret = ret.mul(1.1)
        if (hasAchievement("a", 34)) ret = ret.mul(1.1)
        if (hasMilestone("a", 4)) ret = ret.mul(1.1 ** (player.a.milestones.length - 3))

        if (getClickableState("e", 21)) ret = ret.mul(clickableEffect("e", 21))
        if (getClickableState("e", 22)) ret = ret.div(5)

        // storage boost
        ret = ret.mul((player.s.stored_expansion.points.add(1).log10().div(2.5)).max(decimalOne))
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
        if (getResetGain(this.layer).gt(decimalZero)) {
            layerData.points = layerData.points.add(tmp[this.layer].resetGain.times(diff))
            layerData.points = layerData.points.sub(layerData.points.mul(.3).div(100).times(diff))
        }
        penny_expansions.points = penny_expansions.points.add(tmp.e.penny_expansions.getResetGain.times(diff))
        penny_expansions.points = penny_expansions.points.sub(penny_expansions.points.div(hasMilestone("s", 1) ? 1000/9 : 100).times(diff))
    },
    canReset() {return false},
    penny_expansions: {
        getResetGain() {
            if (player.e.points.lessThan(decimalOne)) return decimalZero
            let ret = this.baseGain().times(this.gainMult()) // base gain
            if (getClickableState("e", 21)) ret = ret.div(5)
            if (getClickableState("e", 22)) ret = ret.mul(clickableEffect("e", 22))
            return ret
        },
        gainMult() {
            let ret = decimalOne
            if (hasUpgrade("e", 24)) ret = ret.times(upgradeEffect("e", 24))
            if (hasMilestone("a", 1)) ret = ret.times(1.05**player.a.milestones.length)
            ret = ret.mul(1 + challengeCompletions("s", 12))
            return ret
        },
        baseGain() {
            let divisor = new Decimal(200)
            if (hasMilestone("s", 4)) {
                let limitingValue = 190 // 190 --> min divisor of 10
                let k = Math.log(18)/(12-6) // spreads out inputs --> output = 10 at 10^6, 95 at 10^12
                let constantShift = 12*k // moves midpoint (subtract 95) to 10^12 stored exp
                let exp = -k*player.s.stored_expansion.points.log10() + constantShift
                let scaling = 1 + Math.pow(Math.E, exp)
                divisor = divisor.sub(limitingValue/scaling)
            }
            let ret = new Decimal(player.e.points.div(divisor))
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
                else ret = ret + "log2(4 + [Expansion Upgrades]) * 5"
                return ret
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                if (!hasUpgrade("e", 21)) return new Decimal(Math.log(4 + player.e.upgrades.length)/Math.log(4)/50)
                if (!hasUpgrade("e", 31)) return new Decimal(Math.log(4 + player.e.upgrades.length)/10)
                if (!hasUpgrade("e", 41)) return new Decimal(Math.log(4 + player.e.upgrades.length)/4)
                return new Decimal(Math.log2(4 + player.e.upgrades.length) * 5)
            },
            effectDisplay:() => "+" + format(upgradeEffect("e", 11))
        },
        12: {
            title: "Is This Even Worth It?",
            description:() => {
                let ret = "Increases WNBP limit exponent by Expansions"
                if (hasUpgrade("e", 42)) ret = ret + "<sup>.11</sup>"
                else ret = ret + "<sup>.1</sup>"
                if (!hasUpgrade("e", 22)) return ret + "/100"
                if (!hasUpgrade("e", 32)) return ret + "/10"
                if (!hasUpgrade("e", 42)) return ret + "/7.5"
                return ret + "/6"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let exp = .1
                let divisor = 100
                if (hasUpgrade("e", 22)) divisor = 10
                if (hasUpgrade("e", 32)) divisor = 7.5
                if (hasUpgrade("e", 42)) {
                    divisor = 6
                    exp = .11
                }
                let ret = player.e.points.pow(exp).div(divisor)
                return ret
            },
            effectDisplay:() => "+" + format(upgradeEffect("e", 12), 4)
        },
        13: {
            title: "Cheaper Education",
            description: "Unlocks the Education II buyable (Base Cost: 5e7 Pennies)",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions
        },
        14: {
            title: "These Actually Matter?",
            description:() => {
                let name = hasMilestone("a", 5) ? "There's A Coin For This?" : "Seriously"
                return "Increases " + name + " exponent from .2 -> .8"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: .8

        },
        15: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 1</h3></b>"
                let description = "Autobuy One Man's Trash, reduce its investment requirement to 1, autobuy 1 Education buyable every 5 seconds"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).min(16)) + " Penny Expansions"
                if (!(hasUpgrade("e", 11) && hasUpgrade("e", 12) && hasUpgrade("e", 13) && hasUpgrade("e", 14))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).min(16)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 11) && hasUpgrade("e", 12) && hasUpgrade("e", 13) && hasUpgrade("e", 14))
            },
            onPurchase() {
                player.p.autoBuyableCooldown = 5
                if (!hasUpgrade("p", 15)) player.p.upgrades.push(15)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions
        },
        21: {
            title: "It's Even Reasonabler",
            description: "Reduces above upgrade's log4 to ln and reduce divisor to 10",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        22: {
            title: "GIVE ME MORE!!!",
            description: "Reduces divisor of upgrade above this one to 10",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        23: {
            fullDisplay:() => {
                let title = "<h3></b>It's Expandin' Time!</h3></b>"
                let description = "Unlocks the next row of Penny Upgrades & more achievements, but permanently keep WNBP"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)) + " Penny Expansions"
                if (player.a.achievements.length < 15) requirement = requirement + ", 15 achievements"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)
                return player.e.penny_expansions.points.gte(cost) && player.a.achievements.length >= 15
            },
            onPurchase() {
                player.e.everUpg23 = true
                if (!hasUpgrade("p", 23)) player.p.upgrades.push(23)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        24: {
            title: "Why Do These Matter???",
            description:() => {
                let ret = "Multiplies Expansion and Penny Expansion gain by 1."
                if (inChallenge("s", 12)) ret = ret + ".02"
                else ret = ret + (!hasMilestone("a", 2) ? "1" : "2")
                return ret + " per achievement - 13"
            },
            cost:() => decimalOne.mul(2 ** player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let ret = new Decimal("1.1")
                if (hasMilestone("a", 2)) ret = new Decimal("1.2")
                if (inChallenge("s", 12)) ret = new Decimal("1.02")
                return ret.pow(player.a.achievements.length-13)
            },
            effectDisplay:() => format(upgradeEffect("e", 24)) + "x",
            unlocked:() => hasUpgrade("e", 15)
        },
        25: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 2</h3></b>"
                let description = "Autobuy two penny upgrades from the first three rows per second"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)) + " Penny Expansions"
                if (!(hasUpgrade("e", 21) && hasUpgrade("e", 22) && hasUpgrade("e", 23) && hasUpgrade("e", 24))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 21) && hasUpgrade("e", 22) && hasUpgrade("e", 23) && hasUpgrade("e", 24))
            },
            onPurchase() {
                player.p.autoUpgCooldown = .5
                if (!hasUpgrade("p", 25)) player.p.upgrades.push(25)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        31: {
            title: "It's So Beautiful",
            description: "Reduce divisor of upgrade two rows above this one to 4",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        32: {
            title: "The Machine Is Hungry...",
            description: "Reduces divisor of upgrade two rows above this one to 7.5",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        33: {
            title: "We Should Get A Wallet",
            description: "Unlocks Storage, but removes penny buyable respec; this upgrade is kept through respecs",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            onPurchase() {
                player.s.unlocked = true
                hasUpgrade("e", 33) = true
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 33) || hasUpgrade("e", 25)
        },
        34: {
            title: "This Is Pretty Lazy",
            description:() => {
                let name = hasMilestone("a", 5) ? "There's A Coin For This?" : "Seriously"
                return "Increases " + name + " exponent  from .8 -> 1.8"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: 1.8,
            unlocked:() => hasUpgrade("e", 25)
        },
        35: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 3</h3></b>"
                let description = "Reduces investment cooldown by 5 seconds and QOL 1 cooldown by 4 seconds"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256)) + " Penny Expansions"
                if (!(hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e", 33) && hasUpgrade("e", 34))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e", 33) && hasUpgrade("e", 34))
            },
            onPurchase() {
                if (!hasUpgrade("p", 35)) player.p.upgrades.push(35)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        41: {
            title: "It's Compassion Is Unmatched",
            description: "Multiply effect of upgrade three rows above this one by 20 and reduce its ln to log2",
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        42: {
            title: "Maximum Overdrive",
            description: `Reduce divisor of upgrade three rows above this to 6, increase exponent by .01, 
                apply to WNBP effect exponent at 6x efficiency`,
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        43: {
            fullDisplay:() => {
                let title = "<h3></b>The More The Better</h3></b>"
                let description = "Unlock Storage challenges that grant bonuses based on best scores; this upgrade is also kept"
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                let cost = "Cost: " + format(decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))) + " Penny Expansions"
                if (player.s.milestones.length < 3) cost = "Requires 3 Storage Milestones"
                return title + "<br>" + description + "<br><br>" + cost
            },
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            canAfford:() => player.s.milestones.length >= 3,
            unlocked:() => hasUpgrade("e", 43) || hasUpgrade("e", 35)
        },
        44: {
            title: "It's Like A Reward",
            description: "Remove the +1 from There's A Coin From This, but remove the divisor and increase exponent to 2.2",
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            effect: 2.2,
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        45: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 4</h3></b>"
                let description = "Double all Focused Production buffs, autobuy one more penny upgrade & five more buyables per second, autobuy from row 4"
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                let requirement = "Requires: " + formatWhole(decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))) + " Penny Expansions"
                //if (!(hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                let cost = decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
                return player.e.penny_expansions.points.gte(cost) //&& (hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))
            },
            onPurchase() {
                if (!hasUpgrade("p", 45)) player.p.upgrades.push(45)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        55: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 5</h3></b>"
                let description = "Unlock auto-investment and "
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**(player.e.upgrades.length-15)).max(decimalOne).mul(16000)) + " Penny Expansions"
                if (!(hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                return false
                let cost = decimalOne.mul(2**(player.e.upgrades.length-15)).max(decimalOne).mul(20000)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))
            },
            onPurchase() {
                if (!hasUpgrade("p", 45)) player.p.upgrades.push(45)
            },
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => false && hasUpgrade("e", 45)
        }
    },
    clickables: {
        11: {
            title: "Respec Upgrades",
            tooltip: "Does NOT return spent currency and forces an investment reset",
            onClick() {
                let confirmText = "Are you sure you want to respec? This does NOT return spent currency, forces an investment reset "
                    + "without rewarding currency, and could unnecessarily slow down progression if done at the wrong time!"
                let respecConfirm = confirm(confirmText)
                if (!respecConfirm) return
                investmentReset(false, false)
                function removeUpgrades(index) {
                    return index == 33 || index == 43
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
                let ret = "Multiplies Expansion gain by " + format(clickableEffect("e", 21), 1) + ", but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 21) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 21, !getClickableState("e", 21)),
            canClick:() => getClickableState("e", 21) || getClickableState("e", 21) != !getClickableState("e", 22),
            effect() {
                if (!hasUpgrade("e", 45)) return 1.5
                return 3
            }
        },
        22: {
            title: "Focused Penny Expansion",
            display() {
                let ret = "Multiplies Penny Expansion gain by " + format(clickableEffect("e", 21), 1) + ", but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 22) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 22, !getClickableState("e", 22)),
            canClick:() => getClickableState("e", 22) || getClickableState("e", 21) != !getClickableState("e", 22),
            effect() {
                if (!hasUpgrade("e", 45)) return 1.5
                return 3
            }
        },
        31: {
            title: "Focused Points",
            display() {
                let ret = "Multiplies Point gain and WNPB limit by " + formatWhole(clickableEffect("e", 31), 1) + ", but divides Penny gain by 10"
                ret = ret + "<br>Currently: " + (getClickableState("e", 31) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 31, !getClickableState("e", 31)),
            canClick:() => getClickableState("e", 31) || getClickableState("e", 31) != !getClickableState("e", 32),
            effect() {
                if (!hasUpgrade("e", 45)) return 3
                return 6
            },
            unlocked:() => hasAchievement("a", 63)
        },
        32: {
            title: "Focused Pennies",
            display() {
                let ret = "Multiplies Penny gain by " + formatWhole(clickableEffect("e", 32), 1) + ", but divides Point gain and WNBP limit by 10"
                ret = ret + "<br>Currently: " + (getClickableState("e", 32) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 32, !getClickableState("e", 32)),
            canClick:() => getClickableState("e", 32) || getClickableState("e", 32) != !getClickableState("e", 31),
            effect() {
                if (!hasUpgrade("e", 45)) return 5
                return 10
            },
            unlocked:() => hasAchievement("a", 63)
        },
        // 41: {
        //     title: "Focused Pockets",
        //     display() {
        //         let ret = "Increase WNBP limit exponent by " + formatWhole(clickableEffect("e", 41) * 100 - 100, 1) + "%, but divides Penny gain by 10"
        //         ret = ret + "<br>Currently: " + (getClickableState("e", 41) ? "Active" : "Inactive")
        //         return ret
        //     },
        //     onClick:() => setClickableState("e", 41, !getClickableState("e", 41)),
        //     canClick:() => true,//getClickableState("e", 41) || getClickableState("e", 41) != !getClickableState("e", 42),
        //     effect() {
        //         if (!hasUpgrade("e", 45)) return 1.1
        //         return 1.2
        //     },
        //     unlocked:() => hasAchievement("a", 43)
        // }
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
                        let ret = "You are gaining " + format(getResetGain("e"), 4) + " Expansions per second and losing .3% of your current Expansions per second<br><br>"
                        return ret
                    }
                ],
                ["microtabs", "info"]
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
                        let ret = "You are gaining " + format(tmp.e.penny_expansions.getResetGain, 4) + " Penny Expansions per second and losing "
                        ret = ret + format(hasMilestone("s", 1) ? .9 : 1, 2) + "% of your current Penny Expansions per second"
                        ret = ret + "<br>Purchasing all upgrades in a row unlocks the next row of upgrades"
                        ret = ret + "<br>Purchasing any upgrade multiplies the cost of other upgrades by a static value"
                        ret = ret + "<br><br><h3>The static multiplier is currently " 
                        ret = ret + + (!hasUpgrade("e", 35) ? 2 : (!hasMilestone("a", 6) ? 5 : 8)) + "</h3>"
                        return ret
                    }
                ],
                "blank",
                ["clickables", [1]],
                "upgrades", 
                "blank",
            ],
            unlocked(){
                return player.e.points.gte(".1") || player.s.unlocked
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
                ["display-text", "These boosts are not <b>mandatory</b> for progression, but can certainly help you progress faster when used at the right time" 
                    + ". You can only have one active in each row. These apply after any incurred nerfs"],
                "blank",
                ["clickables", [2, 3, 4]]
            ],
            unlocked() {
                return player.e.points.gte(".1") || player.s.unlocked
            }
        }
    },
    microtabs: {
        info: {
            "Basics": {
                content: [
                    ["display-text", `<br>Expansion point generation is based on your highest points ever achieved, 
                        <b>which is only calculated when Penny upgrade WNBP is purchased</b>. Penny Expansions begin 
                        generating when Expansions surpass a value of 1 and are directly based on their value<br><br>
                        QOL (Quality-Of-Life) upgrades give small automation effects that 
                        typically purchase things <b>at no cost</b> once they can be afforded<br><br>`]
                ]
            },
            "Formulas": {
                content: [
                    ["display-text", function() { 
                        let divisor = new Decimal(200)
                        if (hasMilestone("s", 4)) {
                            let limitingValue = 190 // 190 --> min divisor of 10
                            let k = Math.log(18)/(12-6) // spreads out inputs --> output = 10 at 10^6, 95 at 10^12
                            let constantShift = 12*k // moves midpoint (subtract 95) to 10^12 stored exp
                            let exp = -k*player.s.stored_expansion.points.log10() + constantShift
                            let scaling = 1 + Math.pow(Math.E, exp)
                            divisor = divisor.sub(limitingValue/scaling)
                        }
                        return `<br>Highest Points Ever: ${format(player.highestPointsEver)}  
                        <br><br>Expansion base gain: log10(log10(Highest Points Ever)) - 1<br>
                        Penny Expansion base gain: Expansions / ${format(divisor)}<br><br>`}
                ]
                ]
            }
        }
    }
})

addLayer("s", {
    symbol: "S",
    position: 1,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        stored_investment: {
            points: decimalZero
        },
        stored_expansion: {
            points: decimalZero
        },
        high_scores: {
            11: {
                points: decimalZero
            }
        }
    }},
    color: "#D6B7B4",
    tooltip: "Storage",
    type: "none",
    row: 0,
    branches: ["p", "e"],
    layerShown:() => hasUpgrade("e", 33),
    milestones: {
        0: {
            requirementDescription: "30,000 Stored Investment",
            effectDescription:() => "Unlock 1 investment storage effect and 1 expansion storage effect per milestone",
            done() { return player.s.stored_investment.points.gte(30000) }
        },
        1: {
            requirementDescription: "100,000 Stored Investment and 1,250 Stored Expansions",
            effectDescription:() => "Reduce Penny Expansion loss rate to .9%",
            done() { return player.s.stored_investment.points.gte(1e5) && player.s.stored_expansion.points.gte(1250) }
        },
        2: {
            requirementDescription: "500,000 Stored Investment and 12,000 Stored Expansions",
            effectDescription:() => "Increase Unuselessifier exponent from 3 to 3.5 and reduce investment cooldown by 5 seconds",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(5e5) && player.s.stored_expansion.points.gte(12000) },
            unlocked() { return hasMilestone("a", 5) }
        },
        3: {
            requirementDescription: "250,000,000 Stored Investment and 300,000 Stored Expansions",
            effectDescription:() => "Keep 1 Penny Expansion upgrade when storing expansions per milestone and unlock more achievements",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2.5e8) && player.s.stored_expansion.points.gte(3e5) },
            unlocked() { return hasMilestone("a", 5) }
        },
        4: {
            requirementDescription: "2e12 Stored Investment and 8e6 Stored Expansions",
            effectDescription:() => "Unlock the Expansion Challenge",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2e12) && player.s.stored_expansion.points.gte(8e6) },
            unlocked() { return hasAchievement("a", 73) }
        }
    },
    upgrades: {
        11: {
            title: "Cheating the System",
            description: "Only while in the investment challenge, boost points and pennies (post-nerf) by 5x",
            cost: new Decimal("1e14"),
            unlocked:() => hasAchievement("a", 73),
            onPurchase:() => {
                tmp.s.clickables[11].onClick()
            },
            pay() { player.s.stored_investment.points = decimalZero },
            currencyDisplayName:() => "Stored Investment",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_investment,
        },
        12: {
            title: "Blessed Inflation",
            description: "Raise secondary effect of third stored expansion effect to the 1.5th power",
            cost: new Decimal("8e7"),
            unlocked:() => hasAchievement("a", 73),
            onPurchase() {
                tmp.s.clickables[12].onClick()
            },
            pay() { player.s.stored_expansion.points = decimalZero },
            currencyDisplayName:() => "Stored Expansion",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_expansion,
        },
        
    },
    clickables: {
        11: {
            title: "Store Your Investment",
            display() { 
                if (inChallenge("s", 11) || inChallenge("s", 12)) return "Cannot store inside of a challenge"
                if (!this.canClick()) return "Requires 5000 Investment" 
                return "Gain " + format(player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))) + " stored investment"
            },
            canClick() { return player.p.investment.points.gte(5000) && !inChallenge("s", 11) && !inChallenge("s", 12) },
            onClick() {
                let gain = player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))
                player.s.stored_investment.points = player.s.stored_investment.points.add(gain)
                investmentReset(true, false)

                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = resetInvestment2Amt.mul((1.03**player.s.stored_expansion.points.log2())**5)
                if (hasUpgrade("s", 12)) resetInvestment2Amt = resetInvestment2Amt**1.5
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                upg35Index = player.p.upgrades.indexOf(35)
                if (upg35Index > -1) player.p.upgrades.splice(upg35Index, 1)
                // upg41Index = player.p.upgrades.indexOf(41)
                // if (upg41Index > -1) player.p.upgrades.splice(upg41Index, 1)
            }
        },
        12: {
            title: "Store Your Expansions",
            display() { 
                if (!this.canClick()) {
                    if (inChallenge("s", 11) || inChallenge("s", 12)) return "Cannot store inside of a challenge"
                    let ret = "Requires 1000 Expansions"
                    if (player.s.stored_investment.points.lt(5000)) ret = ret + " and 5000 Stored Investment"
                    return ret
                }
                let gain = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
                return "Gain " + format(gain) + " stored expansions"
            },
            canClick() { return player.e.points.gte(1000) && player.s.stored_investment.points.gte(5000) && !inChallenge("s", 11) && !inChallenge("s", 12) },
            onClick() {
                let gain = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
                player.s.stored_expansion.points = player.s.stored_expansion.points.add(gain)
                investmentReset(true, false)

                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = resetInvestment2Amt.mul((1.03**player.s.stored_expansion.points.log2())**5)
                if (hasUpgrade("s", 12)) resetInvestment2Amt = resetInvestment2Amt**1.5
                if (tmp.a.achievements[65].unlocked && player.a.achievements.indexOf("65") == -1 && player.p.investment2.points.lt(resetInvestment2Amt)) {
                    player.a.achievements.push(65)
                    doPopup("achievement", tmp.a.achievements[65].name, "Achievement Gotten!", 3, tmp.a.color)
                }
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                let keepUpgIndices = [33, 43]
                if (hasMilestone("s", 3)) {
                    for (i = 0; i < player.s.milestones.length; i++) {
                        let row = Math.floor(i/5) + 1
                        let col = (i % 5) + 1
                        let upgIndex = row * 10 + col
                        keepUpgIndices.push(upgIndex)
                    }
                }
                function removeUpgrades(index) {
                    return keepUpgIndices.indexOf(index) != -1
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)

                setClickableState("e", 21, false)
                setClickableState("e", 22, false)
                setClickableState("e", 31, false)
                setClickableState("e", 32, false)

                player.highestPointsEver = decimalZero
                player.e.points = decimalZero
                player.e.penny_expansions.points = decimalZero
                if (!hasUpgrade("e", 21)) player.p.autoUpgCooldown = -1
                if (!hasUpgrade("e", 11)) player.p.autoBuyableCooldown = -1
            }
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
                "blank",
                ["display-text", 
                    "Storing a layer's currency resets that layer's features in return for boosts that help you accumulate resources faster."
                ],
                "blank", 
                ["microtabs", "storageInfo"],
                "blank",
                () => hasAchievement("a", 73) ? ["display-text", "Purchasing an upgrade resets the related currency's value to 1 and stores that currency<br><br>"] : "",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function () {
                    let ret = `You have 
                    <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment `
                    ret = ret + `and <h2><span style="color: #FFFFFF; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    return ret
                }], "blank",
                "milestones"
            ]
        },
        "Challenges": {
            content: [
                ["display-text", function () {
                    let ret = `You have 
                    <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment `
                    ret = ret + `and <h2><span style="color: #FFFFFF; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    return ret
                }], "blank",
                ["display-text", "Starting a challenge for a resource performs a storage reset for that currency"],
                "blank",
                "challenges"
            ],
            unlocked:() => hasUpgrade("e", 43)
        }
    },
    microtabs: {
        storageInfo: {
            "Resets": {
                content: [
                    ["display-text", "<br>Storing investment is functionally the same as performing a penny buyable respec (rip), but also removes the Seriously? upgrade. "
                    + "This means it will perform an investment reset, remove one additional upgrade, and reset investment; though expansion investment is only reset to a value of 1 (initially). "
                    + "Stored investment gain is based on Investment * IITU effect<sup>.25</sup>."
                    + "<br><br>Storing expansions is functionally the same as performing a penny expansion upgrade respec, "
                    + "but also resets expansion/penny expansion amounts and highest points ever. Again, expansion investment is reset to a value of 1 (initially). "
                    + "Stored expansion gain is based on Expansions * IITU effect<sup>.25</sup>."
                    ], "blank"
                ]
            },
            "Stored Investment": {
                content: [
                    ["display-text", function() {
                        let ret = `Because you have stored <span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.s.stored_investment.points)}</span> investment, you currently...<br>`
                        ret = ret + "<br>1. Gain " + format(player.s.stored_investment.points.add(1).log10().div(10).add(1)) + "x more investment"
                        if (hasMilestone("s", 0)) {
                            ret = ret + ",<br>2. Generate " + format(tmp.p.passiveGeneration * 100) 
                                + "% of your penny gain on reset per second"
                        }
                        if (hasMilestone("s", 1)) {
                            ret = ret + ",<br>3. Increase the WNBP limit exponent by " + format(player.s.stored_investment.points.add(1).log2().div(250)) 
                                + " and effect exponent by " + format(player.s.stored_investment.points.add(1).log2().div(30))
                        }
                        if (hasMilestone("s", 2)) {
                            ret = ret + "<br>4. Make the Education II softcap begin at an effect of " 
                                + format((player.s.stored_investment.points.add(1).log10().div(10).add(1.7)).max(new Decimal("2")))
                        }
                        if (hasMilestone("s", 3)) {
                            ret = ret + ",<br>5. Multiply point gain by "
                                + format(player.s.stored_investment.points.div(1e6).add(1).pow(.4))
                        }
                        if (hasMilestone("s", 4)) {
                            ret = ret + ",<br>6. Multiply investment gain (in challenges) and penny gain (post-nerfs) by "
                                + format(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1)) + "x"
                        }
                        return ret
                    }], "blank"
                ]
            },
            "Stored Expansion": {
                content: [
                    ["display-text", function() {
                        let ret = `Because you have stored <span style="color: #FFFFFF; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.s.stored_expansion.points)}</span> expansions, you currently...<br>`
                        ret = ret + "<br>1. Gain " + format((player.s.stored_expansion.points.add(1).log10().div(2.5)).max(decimalOne)) + "x more expansions"
                        if (hasMilestone("s", 0)) {
                            let factorPercent = player.s.stored_expansion.points.add(1).log10().add(10).div(10)
                            if (player.s.stored_expansion.points.eq(decimalZero)) factorPercent = 0
                            ret = ret + ",<br>2. Apply It's Only Reasonable to base expansion gain at a rate of "+ format(factorPercent) + "%"
                            if (tmp.e.baseAmount.eq(decimalZero)) {
                                ret = ret + ", which only applies when your highest points ever exceeds 1e10"
                            } else {
                                let effect = upgradeEffect("e", 11).mul(factorPercent).div(100)
                                if (hasUpgrade("e", 11) || inChallenge("s", 12)) ret = ret + ", which makes up " + format(effect.div(tmp.e.baseAmount).mul(100)) + "% of base expansion gain"
                            }
                        }
                        if (hasMilestone("s", 1)) {
                            ret = ret + ",<br>3. Multiply expansion investment gain by " + format(1.03**player.s.stored_expansion.points.add(1).log2()) + "x" 
                            ret = ret + " and maximum kept expansion investment is " 
                            if (!hasUpgrade("s", 12)) ret = ret + format((1.03**player.s.stored_expansion.points.add(1).log2())**5)
                            else ret = ret + format((1.03**player.s.stored_expansion.points.add(1).log2())**7.5)
                        }
                        if (hasMilestone("s", 2)) {
                            ret = ret + ",<br>4. Multiply PTS (base penny value used for tax) by " 
                                + format(player.s.stored_expansion.points.add(1).log10().sub(2)) + "x"
                        }
                        if (hasMilestone("s", 3)) {
                            ret = ret + ",<br>5. Increase the Unuselessifier exponent by "
                                + format(player.s.stored_expansion.points.add(1).log10().div(5))
                        }
                        if (hasMilestone("s", 4)) {
                            let limitingValue = 190 // 190 --> min divisor of 10
                            let k = Math.log(18)/(12-6) // spreads out inputs --> output = 10 at 10^6, 95 at 10^12
                            let constantShift = 12*k // moves midpoint (subtract 95) to 10^12 stored exp
                            let exp = -k*player.s.stored_expansion.points.log10() + constantShift
                            let scaling = 1 + Math.pow(Math.E, exp)
                            ret = ret + ",<br>6. Subtract " + format(limitingValue/scaling)
                                + " from the divisor in the Penny Expansion base gain formula"
                        }
                        if (hasMilestone("s", 5)) {
                            ret = ret + ",<br>7. (Not Properly Implemented) Multiply expansion investment hardcap by "
                                + format(player.s.stored_expansion.points.add(1).log10().floor().sub(5).max(0).pow(2).div(10).add(1))
                        }
                        return ret
                    }], "blank"
                ]
            }
        }
    },
    challenges: {
        11: {
            name: "Investment Challenge",
            challengeDescription:() => "Raise point/penny gain ^.5 (after tax), Tax starts 10000x earlier, the Tax exponent is 1.5, and investment gain is initially 1",
            goalDescription() { return format(player.s.high_scores[11].points.max(1e6)) + " points" },
            rewardDescription:() => {
                let ret = "Increases the IITU effect exponent based on high score"
                if (challengeEffect("s", 11).gte(.3)) {
                    if (!player.shiftDown) return ret + " (softcapped*)"
                    return "Effect after .3 is divided by 10 --> +(.3 + [Remaining Effect]/10)"
                }
                return ret
            },
            rewardEffect() { 
                let ret = player.s.high_scores[11].points
                ret = ret.add(1).log2().div(500)
                if (ret.gte(.3)) ret = .3 + (ret.sub(.3).div(10))
                return ret
            },
            rewardDisplay() { 
                return "+" + format(challengeEffect("s", 11)) 
            },
            canComplete() {
                return player.points.gte(player.s.high_scores[11].points.max(1e6))
            },
            // onComplete() {
            //     return
            // },
            onEnter() {
                tmp.s.clickables[11].onClick()
                // let gain = player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))
                // player.s.stored_investment.points = player.s.stored_investment.points.add(gain)
                // investmentReset(true, false)

                // let resetInvestment2Amt = decimalOne
                // if (hasMilestone("s", 1)) resetInvestment2Amt = resetInvestment2Amt.mul((1.03**player.s.stored_expansion.points.log2())**5)
                // player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                // upg35Index = player.p.upgrades.indexOf(35)
                // if (upg35Index > -1) player.p.upgrades.splice(upg35Index, 1)
            },
            onExit() {
                if (player.points.gt(player.s.high_scores[11].points)) player.s.high_scores[11].points = player.points
            }
        },
        12: {
            name: "Expansion Challenge",
            challengeDescription:() => "Raise point/penny gain ^.375 (after tax), investment gain is initially 1, "
                + "Why Do These Matter??? base is 1.02, but second stored expansion effect always applies",
            goalDescription() { return format(this.requirement()) + " penny expansions" },
            rewardDescription:() => "Multiply penny expansion gain by 1 + challenge completions",
            rewardEffect() { 
                let ret = player.s.high_scores[11].points
                ret = ret.add(1).log2().div(500)
                return ret
            },
            rewardDisplay() { 
                return format(1 + challengeCompletions("s", 12), 0) + "x"
            },
            canComplete() {
                return player.e.penny_expansions.points.gte(this.requirement())
            },
            // onComplete() {
            //     return
            // },
            onEnter() {
                // tmp.s.clickables[12].onClick(), but dont keep expansion upgrades
                let gain = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
                player.s.stored_expansion.points = player.s.stored_expansion.points.add(gain)
                investmentReset(true, false)

                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = resetInvestment2Amt.mul((1.03**player.s.stored_expansion.points.log2())**5)
                if (hasUpgrade("s", 12)) resetInvestment2Amt = resetInvestment2Amt**1.5
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                let keepUpgIndices = [33, 43]
                // if (hasMilestone("s", 3)) {
                //     for (i = 0; i < player.s.milestones.length; i++) {
                //         let row = Math.floor(i/5) + 1
                //         let col = (i % 5) + 1
                //         let upgIndex = row * 10 + col
                //         keepUpgIndices.push(upgIndex)
                //     }
                // }
                function removeUpgrades(index) {
                    return keepUpgIndices.indexOf(index) != -1
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)

                setClickableState("e", 21, false)
                setClickableState("e", 22, false)
                setClickableState("e", 31, false)
                setClickableState("e", 32, false)

                player.highestPointsEver = decimalZero
                player.e.points = decimalZero
                player.e.penny_expansions.points = decimalZero
                if (!hasUpgrade("e", 21)) player.p.autoUpgCooldown = -1
                if (!hasUpgrade("e", 11)) player.p.autoBuyableCooldown = -1
            },
            // onExit() {
            //     return
            // }
            completionLimit: 100,
            requirement:() => {
                //if (challengeCompletions("s", 12) == 0) return new Decimal("16")
                return 2**Math.cbrt(challengeCompletions("s", 12)) * 16**challengeCompletions("s", 12)
            }
        }
        // Expansion Challenge 
            // Each completion removes 1 from the bases in the initial expansion gain formula
            // i.e 1 completion --> log9(log9(Points)) - 1
    }
})