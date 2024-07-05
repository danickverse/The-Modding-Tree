addLayer("p", {
    // name: "pennies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
        if (hasUpgrade("p", 54)) mult = mult.times(upgradeEffect("p", 54))
        if (hasAchievement("a", 34)) mult = mult.times(1.2)
        mult = mult.times(buyableEffect("p", 21))
        mult = mult.times(tmp.sys.effect)
        if (hasUpgrade("p", 61)) mult = mult.mul(upgradeEffect('p', 61))
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
        if (hasMilestone("s", 4)) ret = ret.mul(tmp.s.stored_investment.effects[6])
        ret = ret.mul(buyableEffect("p", 23))
        ret = ret.mul(tmp.sys.businesses.apples.effect)
        ret = ret.mul(tmp.quests.bars.pointsBar.reward)
        ret = ret.mul(gridEffect("quests", 101))
        return ret
    },
    softcap: new Decimal("1e9"),
    softcapPower:() => {
        let ret = new Decimal(.5)
        if (player.s.stored_dollars.points.gt(0)) ret = ret.add(tmp.s.stored_dollars.effects[1])
        return ret
    },
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
        let ret = 0
        if (hasMilestone("s", 0)) ret = Number(tmp.s.stored_investment.effects[2])
        if (hasUpgrade("s", 13)) ret += upgradeEffect("s", 13)
        return ret
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {
            key: "p", 
            description: "P: Reset for pennies", 
            onPress(){ if (canReset(this.layer)) doReset(this.layer) }
        },
        {
            key: "i", 
            description: "I: Reset for investment", 
            onPress() { if (tmp[this.layer].buyables[11].canAfford) tmp[this.layer].buyables[11].buy() }, 
            unlocked() { return hasUpgrade("p", 25)}
        },
        {
            key: "e",
            description: "E: Reset for expansion investment",
            onPress() { if (tmp[this.layer].buyables[12].canAfford) tmp[this.layer].buyables[12].buy() },
            unlocked() { return tmp[this.layer].buyables[12].unlocked }
        }
    ],
    layerShown(){return true},
    doReset(layer) {
        if (layer == "sys") {
            let tempBuyable23 = getBuyableAmount("p", 23)
            let keptUpgrades = [25, 42, 51, 53, 54, 55, 61, 62, 63, 64, 65].filter(
                (index) => player.p.upgrades.includes(index)
            )
            let keptExpansionInvestment = !hasMilestone("sys", 3) ? decimalZero
                : player.p.investment2.points.min((player.sys.milestones.length - 2) ** 2)

            layerDataReset("p")

            // for (id in keptUpgrades) {
            //     player.p.upgrades.push(keptUpgrades[id])
            // }
            setBuyableAmount("p", 23, tempBuyable23)
            player.p.upgrades = keptUpgrades
            player.p.investment2.points = keptExpansionInvestment
            player.p.autoUpgCooldown = 0
            player.p.autoBuyableCooldown = 0
        }
    },
    upgrades: {
        11: {
            title: "Lucky Penny",
            description:() => {
                if (!hasAchievement("a", 55)) return "Multiply point gain by 1 + ln(1 + [Best Pennies])"
                return "Multiply point gain by 1 + log2(1 + [Best Pennies])"
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
            description:() => {
                if (!hasAchievement("a", 81)) return "Increase base points by (2 + Upgrades)<sup>.8</sup>"
                return "Increase base points by Upgrades - 6"
            },
            cost: new Decimal("5"),
            effect:() => !hasAchievement("a", 81) ? Math.pow(2 + player.p.upgrades.length, .8) : player.p.upgrades.length - 6,
            effectDisplay:() => "+" + format(upgradeEffect("p", 12)),
            unlocked:() => hasUpgrade("p", 11) || hasUpgrade("p", 25)
        },
        13: {
            title: "Wait A Second...?",
            description: "Multiply penny gain by 1 + ln((1 + Points/100)<sup>.4</sup>)",
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
                if (!hasUpgrade("p", 14) && !hasUpgrade("p", 25) && !player.sys.unlocked) return ""
                
                let base = new Decimal("1.25"); let limit = upgrade14Limit()

                if (!hasUpgrade("p", 32)) return `Multiply penny gain by ${format(base)} if Points < ${format(limit)}`
                return `Multiply penny gain by ${format(base)}<sup>log2(Investment)</sup> if Points < ${format(limit)}`
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
                if (!hasUpgrade("p", 14) && !player.sys.unlocked) return "Does nothing"
                return format(upgradeEffect("p", 14)) + "x"
            },
            unlocked:() => hasUpgrade("p", 13) || hasUpgrade("p", 25)
        },
        15: {
            fullDisplay:() => {
                let title = "<b><h3>Biggest Bestest Coin</b></h3>"
                let description = hasUpgrade("p", 51) ? (
                    player.shiftDown ? "Originally, this multiplied point/penny gain by 1.25"
                        : "Multiply point/penny gain by log10(10 + Best Pennies)<sup>1.25</sup>"
                ) : "Multiply point/penny gain by 1.25"
                let effect = hasUpgrade("p", 51) ? `Currently: ${format(upgradeEffect("p", 15))}x<br>` : ""
                let cost = "Cost: 25 pennies"
                return title + "<br>" + description + "<br>" + effect + "<br>" + cost
            },
            cost: new Decimal("25"),
            effect:() => hasUpgrade("p", 51) ? player.p.best.add(10).log10().pow(1.25) : 1.25,
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
                        return "Multiply point gain by (1 + .5x)<sup>" + exp + "</sup>, where x is the number of achievement."
                    }
                    return "Multiply point gain by [Number of Achievements]<sup>2.2</sup>"
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
                if (hasAchievement("a", 64)) return "Multiply point gain by (1 + Pennies)<sup>.9</sup>"
                return "Multiply point gain by (1 + Pennies/100)<sup>.9</sup>"
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
            description() {
                let base = upgrade23EffBase()
                let exp = upgrade23EffExp()
                
                let ret = "Multiply point gain by "
                if (!player.shiftDown) {
                    if (exp.gt(1)) ret += format(base.pow(exp))
                    else ret += format(base)
                } else {
                    if (exp.gt(1)) ret += `${format(base)}<sup>${format(exp)}</sup>`
                    else ret += format(base)
                }

                if (upgrade23LimitExp() > 1) ret += ` but limit Points to 100 * (Pennies<sup>${format(upgrade23LimitExp())}</sup> + 1)`// * 100"
                else ret += " but limit Points to 100 * (Pennies + 1)"//100 + Pennies * 100"

                return ret
            },
            cost: new Decimal(250),
            canAfford() { return !player.sys.lockWNBP },
            effect() {
                return upgrade23EffBase().pow(upgrade23EffExp())
            }, // upgrade23Limit() handles limit for this upgrade!!! this is for point multiplier
            onPurchase() { player.sys.everWNBP = true },
            effectDisplay:() => formatWhole(upgrade23Limit()) + " points",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        24: {
            title: "Where Did These Come From???",
            description:() => {
                let exp = .06
                if (hasAchievement("a", 51)) exp = exp + .02
                return "Multiply penny gain by (1 + Points)<sup>" + exp + "</sup>"
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
                    + "Also unlock an effect for this upgrade." : "Multiply point gain by (1 + Investment)<sup>.8</sup>"
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
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33)  || player.sys.unlocked
        },
        33: {
            fullDisplay:() => {
                let title = "<b><h3>Unuselessifier</b></h3>"
                let description = () => {
                    let ret = "Multiply Useless Limit by Investment<sup>3</sup>"
                    if (hasMilestone("s", 2)) ret = "Multiply Useless Limit by Investment<sup>3.5</sup>"
                    if (hasMilestone("s", 3)) {
                        let exp = 3.5
                        exp = player.s.stored_expansion.points.add(1).log10().div(5).add(exp)
                        ret = "Multiply Useless limit by Investment<sup>" + format(exp) + "</sup>"
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
                let exp = 3
                if (hasMilestone("s", 2)) exp = 3.5
                if (hasMilestone("s", 3)) exp = tmp.s.stored_expansion.effects[5].add(3.5)
                return ret.pow(exp)
            },
            canAfford:() => player.p.investment.points.gte(5),
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33) || player.sys.unlocked
        }, 
        34: {
            fullDisplay:() => {
                let title = "<b><h3>Slightly Bigger Pockets</b></h3>"
                let description = () => {
                    let ret = "Increase WNBP limit exponent by log10(1 + Investment)/"
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
            unlocked:() => hasUpgrade("p", 31) || hasUpgrade("p", 35) || hasUpgrade("e", 33) || player.sys.unlocked
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
            description: "Increase WNBP <b>effect</b> exponent by log2(1 + Penny Expansions)/10",
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
                    : "Multiply expansion, penny, and point gain by (1 + Expansion Investment)<sup>" 
                        + format(challengeEffect("s",11).add(.4), 3) + "</sup>"
                let effect = (!hasUpgrade("p", 42)) ? "" : "Currently: " + format(upgradeEffect("p", 42)) + "x<br>"
                return title + "<br>" + description + "<br>" + effect + "<br>Cost: 1e11 pennies"
            },
            unlocked:() => hasUpgrade("e", 23) || hasUpgrade("p", 42)
        },
        43: {
            title: "...And Yourself, Too!",
            description:() => { 
                let ret = "Multiply investment gain by previous upgrade effect"
                if (!hasUpgrade("p", 43) && !hasUpgrade("p", 44)) ret = ret + "<br>Increases cost of next upgrade"
                return ret
            },
            cost:() => {
                let ret = new Decimal("5e10")
                if (hasUpgrade("p", 44)) ret = ret.mul(10)
                if (inAnyChallenge()) ret = ret.mul(1.1)
                return ret
            },
            effect:() => upgradeEffect("p", 42),
            unlocked:() => hasUpgrade("e", 23)
        },
        44: {
            title: "Recycling",
            description:() => { 
                let ret = "Multiply penny gain by 1 + log10(1 + Investment)"
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
            description: "Multiply PTS (base penny value used for Tax) by IITU effect",
            effectDisplay:() => format(upgradeEffect("p", 42)) + "x",
            unlocked:() => hasUpgrade("e", 23)
        },
        51: {
            title: "8 Quintillion Waters",
            description: "Biggest Bestest Coin has a new effect and multiply investment gain by 1.25",
            cost: new Decimal("1e21"),
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        52: {
            title: "Zoomies",
            description() {
                if (!this.canAfford()) return "Requires the 31st Achievement"
                if (player.shiftDown) return "Resets include storing resources and investment resets; maxes at +1"
                return "Increase point gain exponent by (Reset Time<sup>*</sup>)<sup>.25</sup> / 30"
            },
            fullDisplay() {
                let title = "Zoomies"
                let desc
                if (!this.canAfford()) desc = "Requires the 31st Achievement"
                else if (player.shiftDown) desc = "Resets include storing resources and investment resets; maxes at +1"
                else desc = "Increase point gain exponent by (Reset Time<sup>*</sup>)<sup>.25</sup> / 30"
                let eff = "<br>Currently: +" + format(upgradeEffect("p", 52))
                if (!this.canAfford()) eff = ""
                let cost = `Cost: ${format(this.cost())} pennies`

                return `<h3>${title}</h3><br>${desc}${eff}<br><br>${cost}`
            },
            cost:() => !hasAchievement("a", 81) ? new Decimal("3e26") : new Decimal("1e9"),
            canAfford:() => hasAchievement("a", 71),
            effect:() => Math.min(1, Math.pow(player.resetTime, 1/4) / 30),
            effectDisplay:() => "+" + format(upgradeEffect("p", 52)),
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        53: {
            title: "Reverse Expansion!",
            description:() => {
                if (!player.shiftDown) return "Multiply investment gain<sup>*</sup> by 1 + log10(1 + Penny Expansions)<sup>.5</sup>"
                return "Applies during challenges at 2x efficiency"
            },
            cost: new Decimal("1e30"),
            effect:() => {
                let ret = player.e.penny_expansions.points.add(1).log10().pow(.5)
                if (inAnyChallenge()) ret = ret.mul(2)
                return ret.add(1)
            },
            effectDisplay:() => format(upgradeEffect("p", 53)) + "x",
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        54: {
            title: "Who Wants To Be A Decillionaire?",
            description: "Multiply penny gain by (1 + Penny Expansions)<sup>.25</sup>",
            cost: new Decimal("1e33"),
            effect:() => player.e.penny_expansions.points.add(1).pow(.1),
            effectDisplay:() => format(upgradeEffect("p", 54)) + "x",
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        55: {
            fullDisplay:() => {
                let title = "<b><h3>Penny Coalesence</b></h3>"
                let description = "Unlock The System and a new achievement"
                let requirement = "Requires: 2.00e18 investment and 35 Achievements"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => player.p.investment.points.gte(2e18) && player.a.achievements.length >= 35,
            // currencyDisplayName:() => "Investment",
            // currencyInternalName:() => "points",
            // currencyLocation:() => player.p.investment,
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked,
            onPurchase() {
                player.sys.unlocked = true
            }
        },
        61: {
            title: "Maximum Investment",
            description:() => {
                if (player.shiftDown) {
                    let ret = `If Pennies < 1e33, effect raised to log(Pennies) / 100` 
                    if (player.p.points.lt(1e33)) ret += ` = ^${format(player.p.points.log10().div(100))}`
                    return ret
                }
                return "Multiply point/penny gain by log2(Exp Investment<sup>3</sup> * Investment)<sup>*</sup>"
            },
            cost: new Decimal("1e40"),
            effect() { 
                let invVal = player.p.investment.points
                let expInvVal = player.p.investment2.points.pow(3)
                let ret = invVal.mul(expInvVal).max(2).log2()

                if (player.p.points.lt(1e33)) ret = ret.pow(player.p.points.max(1).log10().div(100))
                
                return ret
            },
            effectDisplay:() => `${format(upgradeEffect("p", 61))}x`,
            unlocked:() => player.quests.completions.wnbpBar >= 1 
        },
        62: {
            title: "Running Around at the Speed of Sound",
            description: "Decrease the Penny Tax Exponent (PTE) by Zoomies / 2",
            cost: new Decimal("1e50"),
            effect:() => hasUpgrade("p", 52) ? upgradeEffect("p", 52) / 2 : 0,
            effectDisplay:() => `-${format(upgradeEffect("p", 62), 4)}`,
            unlocked:() => player.quests.completions.wnbpBar >= 2
        },
        63: {
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal("1e60"),
            effect:() => 0,
            effectDisplay:() => `${format(upgradeEffect("p", 63))}`,
            unlocked:() => player.quests.completions.wnbpBar >= 3
        },
        64: {
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal("1e80"),
            effect:() => 0,
            effectDisplay:() => `${format(upgradeEffect("p", 64))}`,
            unlocked:() => player.quests.completions.wnbpBar >= 4
        },
        65: {
            title: "Placeholder",
            description: "Placeholder",
            cost: new Decimal("1e100"),
            effect:() => 0,
            effectDisplay:() => `${format(upgradeEffect("p", 65))}`,
            unlocked:() => player.quests.completions.wnbpBar >= 5
        }
    },
    buyables: {
        showRespec:() => hasUpgrade("p", 35) && !hasUpgrade("e", 33),
        respecText: "Resets ALL buyables and forces an investment reset",
        respecMessage: "Are you sure you want to respec? This will reset all investment and force an investment reset!",
        respec() {
            investmentReset(true, true)
        },
        11: {
            title: "Investment",
            cost() {return new Decimal("5e5")}, //new Decimal("1e6")},
            display() {
                if (!player.shiftDown) {
                    let investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies at a rate of (x/1e6)<sup>.5</sup>!"
                    if (inAnyChallenge()) {
                        investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies to gain " + format(investmentGain()) + " investment!"
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
                if (hasUpgrade("e", 35)) player.p.investmentCooldown -= 5
                if (hasMilestone("s", 2)) player.p.investmentCooldown -= 5

                // reset data, keep investment and investment2
                investmentReset(false, false)
                if (hasMilestone("sys", 3)) {
                    let gain = tmp.sys.businesses.acceleratorPower.investmentResetGain
                    player.sys.businesses.acceleratorPower.points = player.sys.businesses.acceleratorPower.points.add(gain)
                }
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

                let gain = investment2Gain()
                if (tmp.a.achievements[85].unlocked && player.a.achievements.indexOf("85") == -1 && gain.gte(1337)) {
                    player.a.achievements.push("85")
                    doPopup("achievement", tmp.a.achievements[85].name, "Achievement Unlocked!", 3, tmp.a.color)
                }
                player.p.investment2.points = player.p.investment2.points.add(gain).min(this.hardcap())

                // reset data, keep investment 2, lose investment
                investmentReset(true, false)
            },
            unlocked:() => hasUpgrade("p", 42),
            softcap:() => {
                let ret = new Decimal("1000")
                ret = ret.mul(tmp.s.stored_dollars.effects[4])
                if (hasUpgrade("sys", 21)) ret = ret.mul(5)
                ret = ret.mul(tmp.quests.bars.dollarGainBar.reward)

                return ret
            },
            hardcap:() => {
                let ret = new Decimal("5000")
                if (hasMilestone("s", 5)) ret = ret.mul(tmp.s.stored_expansion.effects[7]) 
                ret = ret.mul(tmp.s.stored_dollars.effects[4])
                if (hasUpgrade("sys", 21)) ret = ret.mul(2)
                ret = ret.mul(tmp.quests.bars.dollarGainBar.reward)

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
                    let levels = "<b><h3>Levels:</h3></b> " + getBuyableAmount("p", 21)
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
                return this.unlocked() && hasUpgrade("p", 31) && player.p.investment.points.gt(1) && player.p.points.gt(this.cost())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("p", 21, 1)
            },
            unlocked:() => hasUpgrade("p", 31) || player.sys.unlocked
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
                    let levels = "<b><h3>Levels:</h3></b> " + getBuyableAmount("p", 22)
                    let eff1 = "<b><h3>Effect:</h3></b> Divides Education 1 cost exponent base by "
                    if (buyableEffect("p", 22).gte(this.softcapStart())) eff1 = eff1 + "(softcapped) "
                    let eff2 = format(buyableEffect("p", 22))
                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + "<br>" + eff1 + eff2 + "<br><br>" + cost
                }
                let effFormulaBase = () => {
                    let ret = "<b><h3>Effect Formula (softcap begins at effect of "
                        + format(this.softcapStart()) + "):</h3></b><br>"
                    return ret
                }
                let effFormula1 = "1 + log4(1+Penny Expansions)/8 * x<br>"
                let effFormula2 = "1 + " + format(player.e.penny_expansions.points.add(1).log(4).div(8)) + " * x<br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>5e7*2.1^x<sup>1.9</sup>"
                return effFormulaBase() + effFormula1 + effFormula2 + "<br>" +  costFormula
            },
            effect() {
                if (!this.unlocked()) return decimalOne
                let base = player.e.penny_expansions.points.add(1).log(4).div(8) // log4(1 + penny expansions) / 8
                let mult = getBuyableAmount("p", 22) // increases Education I exponent by base * thisBuyableAmount
                let effect = base.mul(mult).add(1)

                let softcapStart = this.softcapStart()
                let softcapPower = new Decimal(".2")
                if (effect.gte(softcapStart)) effect = softcap(effect, softcapStart, softcapPower)
                    // effect = effect.pow(softcapPower).times(softcapStart.pow(decimalOne.sub(softcapPower)))

                return effect
            },
            softcapStart() {
                let ret = new Decimal("2")
                if (hasMilestone("s", 2)) ret = tmp.s.stored_investment.effects[4]
                if (hasUpgrade("sys", 15)) ret = ret.mul(upgradeEffect("sys", 15))

                return ret
            },
            canAfford() {
                return this.unlocked() && player.p.points.gt(this.cost()) && hasUpgrade("e", 13)
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("p", 22, 1)
            },
            unlocked:() => (hasUpgrade("e", 13) && hasUpgrade("p", 31)) || player.sys.unlocked
        },
        23: {
            title: "Education III",
            cost() {
                let baseCost = new Decimal(".15")
                let base = new Decimal("2")
                let exp = new Decimal(getBuyableAmount("p", 23))
                return baseCost.mul(base.pow(exp))
            },
            coefficient:() => {
                let ret = .25
                if (hasUpgrade("sys", 25)) ret = ret + upgradeEffect("sys", 25)
                return ret
            },
            display() {
                if (!player.shiftDown) {
                    let levels = "<b><h3>Levels:</h3></b> " + getBuyableAmount("p", 23)
                    let eff = "<b><h3>Effect:</h3></b> Multiplies post-nerf point/penny gain and investment gain by "
                        + format(buyableEffect("p", 23)) + "x"
                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " dollars"
                    return levels + "<br>" + eff + "<br><br>" + cost
                }

                let coeff = this.coefficient()
                let formulaNum = getBuyableAmount("p", 23).mul(coeff).add(1)

                let effFormulaBase = "<b><h3>Effect Formula:</h3></b><br>"
                let effFormula1 = `(1 + ${coeff}x)<sup>(1 + ${coeff}x)</sup><br>`
                let effFormula2 = `${format(formulaNum)}<sup>${format(formulaNum)}</sup><br>`
                let nextEffFormula2 = () => {
                    let nextFormNum = getBuyableAmount("p", 23).add(1).mul(coeff).add(1)
                    return `<b><h3>Next:</b></h3> ${format(nextFormNum)}<sup>${format(nextFormNum)}</sup> = ${format(nextFormNum.pow(nextFormNum))}`
                }
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>0.15*2^x"
                return effFormulaBase + effFormula1 + effFormula2 + nextEffFormula2() + "<br><br>" +  costFormula
            },
            effect(x) {
                if (!this.unlocked()) return decimalOne
                let base = x.mul(this.coefficient()).add(1)
                let exp = x.mul(this.coefficient()).add(1)

                // (1 + .25x)^(1 + x/10)
                // let base = new Decimal(1.25)
                // let exp = getBuyableAmount("p", 23)
                // 1.25^x
                
                let effect = base.pow(exp)
                return effect
            },
            canAfford() {
                return this.unlocked() && player.sys.points.gt(this.cost())
            },
            buy() {
                player.sys.points = player.sys.points.sub(this.cost())
                addBuyables("p", 23, 1)
            },
            unlocked:() => hasMilestone("sys", 0)
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

        
        if (hasUpgrade("e", 15) || hasMilestone("sys", 0)) {
            player.p.autoBuyableCooldown += diff

            let divisor = 1
            if (hasUpgrade("e", 35)) divisor *= 2.5
            if (hasUpgrade("e", 45)) divisor *= 8
            if (hasMilestone("sys", 1)) divisor *= 2
            if (hasMilestone("sys", 4)) divisor *= 2
            let cooldown = 2.5 / divisor

            while (player.p.autoBuyableCooldown >= cooldown) {
                if (canBuyBuyable("p", 21)) {
                    addBuyables("p", 21, 1)
                    updateBuyableTemp("p")
                } else if (canBuyBuyable("p", 22)) {
                    addBuyables("p", 22, 1)
                    updateBuyableTemp("p")
                }
                player.p.autoBuyableCooldown -= cooldown
            }
        }
    },
    automate() {
        if (!hasUpgrade("p", 31) && hasUpgrade("e", 15) && canAffordUpgrade("p", 31)) 
            player.p.upgrades.push(31)

        // if (hasUpgrade("e", 15) || hasMilestone("sys", 0)) {
        //     if (player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 21)) {
        //         addBuyables("p", 21, 1)

        //         let divisor = 1
        //         if (hasUpgrade("e", 35)) divisor *= 2.5
        //         if (hasUpgrade("e", 45)) divisor *= 8
        //         if (hasMilestone("sys", 1)) divisor *= 2

        //         player.p.autoBuyableCooldown = 2.5 / divisor
        //     }

        //     if (player.p.autoBuyableCooldown == 0 && canBuyBuyable("p", 22)) {
        //         addBuyables("p", 22, 1)

        //         let divisor = 1
        //         if (hasUpgrade("e", 35)) divisor *= 2.5
        //         if (hasUpgrade("e", 45)) divisor *= 8
        //         if (hasMilestone("sys", 1)) divisor *= 2

        //         player.p.autoBuyableCooldown = 2.5 / divisor
        //     }
        // }

        if (hasMilestone("sys", 5)) {
            for (id in tmp[layer].upgrades)
                if (id > "60") continue
                if (isPlainObject(tmp[layer].upgrades[id]) && (layers[layer].upgrades[id].canAfford === undefined || layers[layer].upgrades[id].canAfford() === true))
                    buyUpg(layer, id) 
        } else if (hasUpgrade("e", 25) || hasMilestone("sys", 0) && player.p.autoUpgCooldown == 0) {
            let upgIndices = [11, 12, 13, 14, 15, 21, 22]
            if (!player.sys.lockWNBP) upgIndices.push(23)
            upgIndices = upgIndices.concat([24, 25, 31, 32, 33, 34, 35])
            if (hasUpgrade("e", 45)) upgIndices.push(41, 42, 43, 44, 45)
            function findUpg(index) {
                return !hasUpgrade("p", index)
            }
            upgIndices = upgIndices.filter(findUpg)
            for (i = 0; i < upgIndices.length; i++) {
                let upgIndex = upgIndices[i]
                if (canAffordUpgrade("p", upgIndex)) {
                    player.p.autoUpgCooldown = .5
                    if (hasUpgrade("e", 45)) player.p.autoUpgCooldown = 1/3 // 3 per second
                    buyUpg("p", upgIndex)
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
                        if (hasUpgrade("p", 52)) ret = ret + `<br>Your current reset time is ${timeDisplay(player.resetTime)}`
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
                "prestige-button", "blank",
                ["display-text",
                    function(){
                        let ret = ""
                        if (tmp.p.passiveGeneration > 0) ret = ret + "You are gaining " + format(tmp.p.passiveGeneration*tmp.p.resetGain)
                        + " pennies per second<br><br>"
                        ret = ret + `You have 
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment.points)}</span></h2> Investment`
                        if (player.e.everUpg23 || player.sys.unlocked) ret = ret + ` and 
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