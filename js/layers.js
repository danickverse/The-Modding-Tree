function getInvestmentExponent() {
    return new Decimal(".5")
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
        mult = mult.times(buyableEffect("p", 21))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for pennies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Lucky Penny",
            description:() => "Multiplies point gain by 1 + ln(1 + [Best Pennies])",
            cost: new Decimal("1"),
            effect:() => player.p.best.add(1).ln().add(1),
            effectDisplay:() => format(upgradeEffect("p", 11)) + "x"
        },
        12: {
            title: "Wait A Second...",
            description:() => "Increases base point gain by log2(2 + [Upgrades]).",
            cost: new Decimal("5"),
            effect:() => Math.log2(2 + player.p.upgrades.length),
            effectDisplay:() => "+" + format(upgradeEffect("p", 12)),
            unlocked:() => hasUpgrade("p", 11) || hasUpgrade("p", 25)
        },
        13: {
            title: "Wait A Second...?",
            description:() => "Multiplies penny gain by 1 + ln((1 + [Points]/100)<sup>.5</sup>)",
            cost: new Decimal("100"),
            currencyDisplayName:() => "points",
            currencyInternalName:() => "points",
            currencyLocation:() => player,
            effect:() => player.points.div(100).add(1).pow(.5).ln().add(1),
            effectDisplay:() => format(upgradeEffect("p", 13)) + "x",
            unlocked:() => hasUpgrade("p", 12) || hasUpgrade("p", 25)
        },
        14: {
            title:() => "Useless",
            description:() => {
                if (!hasUpgrade("p", 14)) return ""
                if (!hasUpgrade("p", 32)) return "Multiplies penny gain by 1.1 if [Points] < 1e6"
                return "Multiplies penny gain by 1.1<sup>Investment</sup> if [Points] < 1e6"
            },
            cost: new Decimal("10"),
            effect:() => {
                let base = new Decimal("1.1")

                let exp = 1
                if (hasUpgrade("p", 32)) exp = upgradeEffect("p", 32)

                let limit = new Decimal("1e6")

                if (player.points.lt(limit)) return base.pow(exp)
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
            description:() => "Multiplies point gain and penny gain by 1.25",
            cost: new Decimal("25"),
            effect:() => 1.25,
            unlocked:() => hasUpgrade("p", 14) || hasUpgrade("p", 25)
        },
        21: {
            title: "Still Can't Buy Water",
            description:() => "Multiplies point gain by (1 + [Pennies]/100)<sup>.5</sup>",
            cost: new Decimal("100"),
            effect:() => player.p.points.div(100).add(1).pow(.5),
            effectDisplay:() => format(upgradeEffect("p", 21)) + "x",
            unlocked:() => hasUpgrade("p", 15) || hasUpgrade("p", 25)
        },
        22: {
            title: "We Need Bigger Pockets",
            description: ""
        },
        25: {
            title: "Now We're Getting Somewhere...",
            cost: new Decimal("1e6"),
            effect:() => player.p.investment.points.add(1).pow(2),
            //effectDisplay:() => format(player.p.investment.points.add(1).pow(2)) + "x"
            fullDisplay:() => {
                let title = "<b><h3>Now we're getting somewhere...</b></h3>"
                let description = (!hasUpgrade("p", 25)) ? "Unlock a way to put those pennies to good use." : "Multiplies point gain by (1 + [Investment])<sup>2</sup>"
                let effect = (!hasUpgrade("p", 25)) ? "" : "Currently: " + format(player.p.investment.points.add(1).pow(2)) + "x"
                let cost = "Cost: 1,000,000 pennies"
                return title + "<br>" + description + "<br>" + effect + "<br><br>" + cost
            },
            // keeps unlocked after doing an investment
            unlocked:() => (hasUpgrade("p", 21) || player.p.investment.points.gt(decZero)) 
        },
        31: {
            title: "One Man's Trash",
            description:() => {
                if (!player.shiftDown & !hasUpgrade("p", 31)) return "Unlock the ability to take classes in finding pennies!"
                return "Unlocks the Education buyable"
            },
            cost: new Decimal("1e5"),
            unlocked:() => (hasUpgrade("p", 25) && player.p.investment.points.gte(2))
        },
        32: {
            title: "Not As Useless Anymore",
            description:() => {
                return "Raises [Useless Effect] by [Investment]"
            },
            cost: new Decimal("1e7"),
            effect:() => player.p.investment.points,
            unlocked:() => hasUpgrade("p", 31)
        },
        33: {
            title: "Unuselessifier",
            description:() => {
                let ret = "Multiplies [Useless Point Limit] by [Investment<sup>1.5</sup>]"
                if (!hasUpgrade("p", 34)) ret = ret + "<br>Increases cost of next upgrade"
                return ret
            },
            cost:() => {
                let ret = new Decimal("1e8")
                if (hasUpgrade("p", 34)) ret = ret.mul(10)
                return ret
            },
            effect:() => player.p.investment.points.pow(1.5),
            unlocked:() => hasUpgrade("p", 32)
        },
        34: {
            title: "Idk yet",
            description:() => {
                let base = "Idk yet"
                if (true) return base
            },
            cost:() => {
                let ret = new Decimal("1e8")
                if (hasUpgrade("p", 33)) ret = ret.mul(10)
                return ret
            },
            effect:() => 1,
            unlocked:() => hasUpgrade("p", 32)
        }
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
                    return index >= 25 // keeps upgrades with indices gte 25
                }
                layerData.upgrades = layerData.upgrades.filter(removeUpgrades)
                player.points = decZero
            },
            unlocked:() => hasUpgrade("p", 25)
        },
        21: {
            title: "Education",
            cost() {
                let baseCost = new Decimal("1e5")
                let base = new Decimal("2")
                let exp = new Decimal(Math.max(1, getBuyableAmount("p", 21))).pow(1.1)
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
                let effFormula1 = "log2(Investment)<sup>x</sup><br>"
                let effFormula2 = format(player.p.investment.points.log2()) + "<sup>x</sup><br>"
                let costFormula = "<b><h3>Cost Formula:</h3></b><br>1e5*2^(x<sup>1.2</sup>)"
                return effFormulaBase + effFormula1 + effFormula2 + costFormula
            },
            effect() {
                if (!this.unlocked()) return new Decimal("1")
                let base = player.p.investment.points.log2()
                let exp = getBuyableAmount("p", 21)
                return base.pow(exp)
            },
            canAfford() {
                return player.p.points.gt(this.cost())
            },
            buy() {
                if (!this.canAfford()) return // should never happen, just in case
                player.p.points.sub(this.cost())
                addBuyables("p", 21, 1)
            },
            unlocked:() => (hasUpgrade("p", 31) && player.p.investment.points.gt(new Decimal("2")))
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
                "prestige-button",
                ["display-text", function() {return "Your best pennies is " + formatWhole(player.p.best)}],
                "blank",
                "upgrades"
            ]
        },
        "Production": {
            content: [
                "main-display",
                ["display-text",
                    function(){
                        //return "You have <h2><span style=\"color:#AD6F69\">"
                        return `You have 
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${formatWhole(player.p.investment.points)}</span></h2> Investment
                        `
                        //return `
                        //<div><span v-if="player[layer].points.lt('1e1000')">You have </span><h2 v-bind:style="{'color': tmp[layer].color, 'text-shadow': '0px 0px 10px ' + tmp[layer].color}">{{data ? format(player[layer].points, data) : formatWhole(player[layer].points)}}</h2> {{tmp[layer].resource}}<span v-if="layers[layer].effectDescription">, <span v-html="run(layers[layer].effectDescription, layers[layer])"></span></span><br><br></div>
                        //`
                    }
                ],
                "blank",
                ["display-text", 
                    "Investing resets the first two rows of upgrades except for the last row 2 upgrades, current points, current pennies, and best pennies"
                ],
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
        unlocked: true,
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
    layerShown() {return true},
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