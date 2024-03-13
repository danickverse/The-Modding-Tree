function getInvestmentExponent() {
    return new Decimal(".5")
}

function upgrade23Limit() {
    return player.p.points.mul(100).pow(upgrade23Exp()).add(10)
}

function upgrade23Exp() {
    let exp = new Decimal("1")
    if (hasUpgrade("p", 35)) exp = exp.add(upgradeEffect("p", 35))
    return exp
}

function upgrade14Limit() {
    let limit = new Decimal("1e6")
    if (hasUpgrade("p", 33)) limit = limit.pow(upgradeEffect("p", 33))
    return limit
}

function penniesTaxFactor() {
    if (player.p.points.lt(pennyTaxStart())) return new Decimal("1")
    let taxFactor = player.p.points.div(pennyTaxStart()) // base tax factor 
    taxFactor = taxFactor.add(.5).pow(3) // returns (.5 + pennies / 1e6)^3
    //taxFactor.ln().div(logarithmBase.ln()) // returns log_base(pennies)
    return taxFactor
}

function pennyTaxStart() {
    let baseTaxes = new Decimal("1e6")
    return baseTaxes
}

let decZero = new Decimal("0")

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
        investmentCooldown: 0
    }},
    color: "#AD6F69",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "pennies", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: .5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade("p", 13)) mult = mult.times(upgradeEffect("p", 13))
        if (hasUpgrade("p", 14)) mult = mult.times(upgradeEffect("p", 14))
        if (hasUpgrade("p", 15)) mult = mult.times(upgradeEffect("p", 15))
        if (hasUpgrade("p", 24)) mult = mult.times(upgradeEffect("p", 24))
        mult = mult.times(buyableEffect("p", 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    getResetGain() {
        if (tmp[this.layer].gainExp.eq(0)) return decimalZero
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        let gain = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent).times(tmp[this.layer].gainMult).pow(tmp[this.layer].gainExp)
        if (gain.gte(tmp[this.layer].softcap)) gain = gain.pow(tmp[this.layer].softcapPower).times(tmp[this.layer].softcap.pow(decimalOne.sub(tmp[this.layer].softcapPower)))
        gain = gain.times(tmp[this.layer].directMult)
        gain = gain.div(penniesTaxFactor())
        return gain.floor().max(0);
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
            cost: new Decimal("1"),
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
            description: "Multiplies penny gain by 1 + ln((1 + [Points]/100)<sup>.3</sup>)",
            cost: new Decimal("100"),
            currencyDisplayName:() => "points",
            currencyInternalName:() => "points",
            currencyLocation:() => player,
            effect:() => player.points.div(100).add(1).pow(.3).ln().add(1),
            effectDisplay:() => format(upgradeEffect("p", 13)) + "x",
            unlocked:() => hasUpgrade("p", 12) || hasUpgrade("p", 25)
        },
        14: {
            title: "Useless",
            description:() => {
                if (!hasUpgrade("p", 14) && !hasUpgrade("p", 25)) return ""
                if (!hasUpgrade("p", 32)) return "Multiplies penny gain by 1.1 if [Points] < " + format(upgrade14Limit())
                return "Multiplies penny gain by 1.1<sup>Investment</sup> if [Points] < " + format(upgrade14Limit())
            },
            cost: new Decimal("10"),
            effect:() => {
                let base = new Decimal("1.1")

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
            title: "There's A Coin For This?",
            description: "Increases point gain by 50% per achievement",
            cost: new Decimal("50"),
            effect:() => 1 + .5 * player.a.achievements.length,
            effectDisplay:() => format(upgradeEffect("p", 21)) + "x",
            unlocked:() => hasUpgrade("p", 15) || hasUpgrade("p", 25)
        },
        22: {
            title: "Still Can't Buy Water",
            description: "Multiplies point gain by (1 + [Pennies]/100)<sup>.9</sup>",
            cost: new Decimal("100"),
            effect:() => player.p.points.div(100).add(1).pow(.9),
            effectDisplay:() => format(upgradeEffect("p", 22)) + "x",
            unlocked:() => hasUpgrade("p", 21) || hasUpgrade("p", 25)
        },
        23: {
            title: "We Need Bigger Pockets",
            description:() => {
                if (upgrade23Exp() == 1) return "Multiplies point gain by 10 but limits Points to 10 + [Pennies] * 100"
                return "Multiplies point gain by 10 but limits Points to 10 + [Pennies]<sup>" + format(upgrade23Exp()) + "</sup> * 100"
            },
            cost: new Decimal(250),
            effect: 10,
            effectDisplay:() => formatWhole(upgrade23Limit()) + " points",
            unlocked:() => hasUpgrade("p", 22) || hasUpgrade("p", 25)
        },
        24: {
            title: "Where Did These Come From???",
            description: "Multiplies penny gain by (1 + [Points])<sup>.06</sup>",
            cost: new Decimal(10000),
            effect:() => player.points.add(1).pow(.06),
            effectDisplay:() => format(upgradeEffect("p", 24)) + "x",
            unlocked:() => hasUpgrade("p", 23) || hasUpgrade("p", 25)
        },
        25: {
            title: "Now We're Getting Somewhere...",
            cost: new Decimal("1e5"),
            effect:() => player.p.investment.points.add(1).pow(.8),
            fullDisplay:() => {
                let title = "<b><h3>Now we're getting somewhere...</b></h3>"
                let description = (!hasUpgrade("p", 25)) ? "Unlock a way to put those pennies to good use." : "Multiplies point gain by (1 + [Investment])<sup>.8</sup>"
                let effect = (!hasUpgrade("p", 25)) ? "" : "Currently: " + format(upgradeEffect("p", 25)) + "x"
                let cost = "Cost: 100,000 pennies"
                return title + "<br>" + description + "<br>" + effect + "<br>" + cost
            },
            // keeps unlocked after doing an investment
            unlocked:() => (hasUpgrade("p", 24) || player.p.investment.points.gt(decZero)) 
        },
        31: {
            title: "One Man's Trash",
            description:() => {
                if (!hasUpgrade("p", 31)) {
                    return "Unlock the ability to take classes in finding pennies! Requires 2 Investment"
                }
                return "Unlocks the Education buyable"
            },
            cost: new Decimal("2e5"),
            canAfford:() => player.p.investment.points.gte(2),
            unlocked:() => hasUpgrade("p", 25)
        },
        32: {
            title: "Slightly Less Useless",
            description: "Raises Useless Effect to [Investment]",
            cost: new Decimal("4e6"),
            effect:() => player.p.investment.points,
            unlocked:() => hasUpgrade("p", 31)
        },
        33: {
            title: "Unuselessifier",
            description: "Increases Useless Limit exponent by (1 + [Investment]/10)<br>Increases cost of next upgrade",
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 34)) ret = ret.mul(10)
                return ret
            },
            effect:() => player.p.investment.points.div(10).add(1),
            effectDisplay:() => upgradeEffect("p", 33),
            unlocked:() => hasUpgrade("p", 32)
        },
        34: {
            title: "Slightly Bigger Pockets",
            description: "Increases We Need Bigger Pockets limit exponent by log10(1 + [Investment])/100<br>Increases cost of next upgrade",
            cost:() => {
                let ret = new Decimal("4e6")
                if (hasUpgrade("p", 33)) ret = ret.mul(10)
                return ret
            },
            effect:() => player.p.investment.points.add(1).log10().div(100),
            effectDisplay:() => "^" + format(upgradeEffect("p", 34)),
            unlocked:() => hasUpgrade("p", 32)
        },
        35: {
            title: "Already?",
            cost: new Decimal("2e7"),
            description: "Increases We Need Bigger Pockets limit exponent by log10(1 + [Investment])/100",
            cost: new Decimal("1e10"),
            effect:() => player.p.investment.points.add(1).log10().div(100),
            effectDisplay:() => upgradeEffect("p", 35),
            unlocked:() => hasUpgrade("p", 33) && hasUpgrade("p", 34)
        }
        // },
        // 25: {
        //     title: "Now We're Getting Somewhere...",
        //     cost: new Decimal("1e5"),
        //     effect:() => player.p.investment.points.add(1).pow(.8),
        //     fullDisplay:() => {
        //         let title = "<b><h3>Now we're getting somewhere...</b></h3>"
        //         let description = (!hasUpgrade("p", 25)) ? "Unlock a way to put those pennies to good use." : "Multiplies point gain by (1 + [Investment])<sup>.8</sup>"
        //         let effect = (!hasUpgrade("p", 25)) ? "" : "Currently: " + format(upgradeEffect("p", 25)) + "x"
        //         let cost = "Cost: 100,000 pennies"
        //         return title + "<br>" + description + "<br>" + effect + "<br>" + cost
        //     },
        //     // keeps unlocked after doing an investment
        //     unlocked:() => (hasUpgrade("p", 24) || player.p.investment.points.gt(decZero)) 
        // }
    },
    buyables: {
        11: {
            title: "Investment",
            cost() {return new Decimal("1e6")},
            display() {
                "Invest your current pennies at a rate of (x/4e6)^.5!\nRequires 1e6 Pennies.\n"
                "Current Investment: " + format(player[this.layer].investment.points) + "\n"
                "Cooldown: " + format(player[this.layer].investmentCooldown) + " seconds."
                let investmentRate = "<b><h3>Rate:</h3></b> Invest your current pennies at a rate of (x/4e6)<sup>.5</sup>!<br>"
                let curr = "<b><h3>Current Investment:</h3></b> " + + format(player[this.layer].investment.points) + "<br>"
                let cooldown = "<b><h3>Cooldown:</h3></b> " + format(player[this.layer].investmentCooldown) + " seconds.<br>"
                let req = "<b><h3>Requires:</h3></b> " + format(this.cost()) + " pennies"
                return investmentRate + curr + cooldown + req
            },
            canAfford() {return player.p.points.gte(this.cost()) & player.p.investmentCooldown == 0},
            buy() {
                let layerData = player.p
                let investmentExponent = getInvestmentExponent()
                layerData.investment.points = layerData.investment.points.add(layerData.points.div(4000000).pow(investmentExponent))
                layerData.investmentCooldown = 15

                // reset data
                layerData.points = decZero
                layerData.best = decZero
                layerData.total = decZero
                function removeUpgrades(index) {
                    return (index == 21 || index == 25)  // keeps upgrades with indices gte 25 + achievement upgrade
                }
                let buyableIndices = [21]
                layerData.upgrades = layerData.upgrades.filter(removeUpgrades)
                for (const index of buyableIndices) {
                    layerData.buyables[index] = decZero
                }
                player.points = decZero
            },
            unlocked:() => hasUpgrade("p", 25)
        },
        21: {
            title: "Education I",
            cost() {
                let baseCost = new Decimal("2e5")
                let base = new Decimal("2")
                let exp = new Decimal(getBuyableAmount("p", 21)).pow(2)
                return baseCost.mul(base.pow(exp))
            },
            display() {
                if (!player.shiftDown) {
                    let levels = "<b><h3>Levels:</h3></b> " + format(getBuyableAmount("p", 21)) + "<br>"
                    let eff = "<b><h3>Effect:</h3></b> Multiplies penny gain by " + format(buyableEffect("p", 21)) + "<br>"
                    let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                    return levels + eff + cost
                }
                let effFormulaBase = "<b><h3>Effect Formula:</h3></b><br>"
                let effFormula1 = "log10(10 + Investment)<sup>x</sup><br>"
                let effFormula2 = format(player.p.investment.points.log10().add(1)) + "<sup>x</sup><br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>1e5*2^(x<sup>2</sup>)"
                return effFormulaBase + effFormula1 + effFormula2 + costFormula
            },
            effect() {
                if (!this.unlocked()) return new Decimal("1")
                let base = player.p.investment.points.log10().add(1)
                let exp = getBuyableAmount("p", 21)
                return base.pow(exp)
            },
            canAfford() {
                return player.p.points.gt(this.cost())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("p", 21, 1)
            },
            unlocked:() => (hasUpgrade("p", 31) && player.p.investment.points.gte(2)) // second condition to make sure cant have less than 1 mult
        }
    },
    update(diff) {
        if (player[this.layer].investmentCooldown > 0) {
            player[this.layer].investmentCooldown = Math.max(decZero, player[this.layer].investmentCooldown - diff)
        }
    },
    tabFormat: {
        "Upgrades": {
            content: [
                "main-display",
                ["display-text",
                    function() {
                        if (player.p.points.gte(pennyTaxStart())) return "Millionaire Tax divides penny gain by " + format(penniesTaxFactor()) + "<br><br>"
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
                        if (player.p.points.gte(pennyTaxStart())) return "Millionaire Tax divides penny gain by " + format(penniesTaxFactor()) + "<br><br>"
                        return ""
                    }
                ],
                "prestige-button",
                "blank",
                ["display-text",
                    function(){
                        //return "You have <h2><span style=\"color:#AD6F69\">"
                        return `You have 
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.p.investment.points)}</span></h2> Investment
                        `
                    }
                ],
                "blank",
                ["display-text", function() {
                    let ret = "Investing resets most upgrades (including 3rd row and beyond), current points, current pennies, " 
                    if (hasUpgrade("p", 31)) return ret + "best pennies, and Education buyables"
                    return ret + "and best pennies"
                }],
                "buyables", 
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
    position: 1,
    startData() { return {
        unlocked: false,
        points: decZero,
        penny_expansions: {
            points: decZero
        }
    }},
    color: "#FFFFFF",
    resource: "expansions",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "custom",
    getResetGain() {
        if (player.points.lessThan(new Decimal("1e10"))) return decZero
        return new Decimal((Math.log10(Math.log10(10 + player.points)) - 1) / 10)
    },
    prestigeButtonText(){
        return "hello"
    },
    getNextAt() {return decZero},
    baseAmount() {return player.points},
    doReset(layer) {},
    row: 0,
    layerShown() {
        let visible = false
        if (player.e.unlocked || player.points.gt("1e10")) {
            player.e.unlocked = true
            visible = true
        }
        return visible
    },
    update(diff) {
        let layerData = player[this.layer]
        let penny_expansions = layerData.penny_expansions
        layerData.points = layerData.points.add(getResetGain(this.layer).times(diff))
        penny_expansions.points = penny_expansions.points.add(tmp.e.penny_expansions.getResetGain.times(diff))
    },
    canReset() {return false},
    penny_expansions: {
        getResetGain() {
            if (player.e.points.lessThan(new Decimal("1"))) return decZero
            ret = new Decimal(Math.log10(9 + player.e.points) / 100) // base gain
            return ret.times(this.getGainMult())
        },
        getGainMult() {
            ret = new Decimal("1")
            if (hasUpgrade("e", 11)) ret = ret.times(upgradeEffect("e", 11))
            return ret
        }
    },
    tabFormat: {
        "Info": {
            content: [
                "main-display",
                ["display-text",
                    function() {
                        if (player.shiftDown) return "You are gaining max(0, log10(log10(10 + points)) - 1) / 1000 Expansions per second"
                        return "You are gaining " + format(player.e.getResetGain) + " Expansions per second"
                    }
                ],
                ["display-text",
                    function() {
                        return "You begin gaining expansions when your points surpass a value of 1e10"
                    }
                ]
            ]
        },
        "Pennies": {
            content: [
                "main-display",
                ["display-text",
                    function(){
                        return "You have " + format(player.e.penny_expansions.points) + " Penny Expansions"
                    }
                ],
                ["display-text",
                    function(){
                        if (player.shiftDown) return "You are gaining log10(9 + expansions) / 100 Penny Expansions per second"
                        return "You are gaining " + format(tmp.e.penny_expansions.getResetGain) + " Penny Expansions per second"
                    }
                ],
                "blank",
                ["upgrades", [1]], 
                "blank",
            ],
            unlocked(){
                return true
            },
        }
    },
    upgrades: {
        11: {
            title: "The first thing that does the thing",
            description: "Multiplies expansion gain by ln(e + [Upgrades]).",
            cost: new Decimal("1"),
            currencyDisplayName:() => "Penny Expansions",
            currencyInternalName:() => "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => 1 + Math.log(Math.E + player.e.upgrades.length),
            effectDisplay:() => "Multiplies expansion gain by " + format(Math.log(Math.E + player.e.upgrades.length)) + "x"
        }
    }
})

addLayer("a", {
    symbol: "A",
    position: 1,
    startData() { 
        return {
            unlocked: true
        }
    },
    color: "yellow",
    row: "side",
    tooltip: "Achievements",
    achievements: {
        11: {
            name: "1",
            done() {
                if (player.p.upgrades.length >= 5) return true
            },
            tooltip: "Buy 5 Penny Upgrades"
        },
        12: {
            name: "2",
            done() {
                if (tmp.p.resetGain.gt(1000)) return true
            },
            tooltip: "Reach 1000 Pennies Earned in One Reset"
        },
        13: {
            name: "3",
            done() {
                if (player.p.investment.points.gt(decZero)) return true
            },
            tooltip: "Invest Your Pennies Once"
        },
        14: {
            name: "4",
            done() {
                if (hasUpgrade("p", 23) && player.p.points.gt(1000) && tmp.pointGen.gt(upgrade23Limit())) return true
            },
            tooltip: "Gain more points in a single second than you are allowed to have<br>(Must have > 1000 Pennies)"
        }
    },
    tabFormat: {
        "Achievements": {
            content: [
                "blank",
                ["display-text", function() { 
                    let ret = "You have completed "+ player.a.achievements.length + " achievements"
                    if (hasUpgrade("p", 21)) ret = ret + ", which boosts point gain by " + format(upgradeEffect("p", 21)) + "x"
                    return ret
                }], 
                "blank", "blank",
                "achievements"
            ]
        }
    }
})