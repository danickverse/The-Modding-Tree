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
            description:() => {
                if (!player.shiftDown) return "Multiplies point gain by (1 + ln(1 + [Best Pennies]))x."
                return "Multiplies point gain by " + format(player.p.best.add(1).ln().add(1)) + "x"
            },
            cost: new Decimal("1"),
            effect:() => player.p.best.add(1).ln().add(1)
        },
        12: {
            title: "Wait A Second...",
            description:() => {
                if (!player.shiftDown) return "Increases base point gain by log2(1 + [Upgrades])."
                return "Increases base point gain by +" + format(Math.log2(1 + player.p.upgrades.length))
            },
            cost: new Decimal("5"),
            effect:() => Math.log2(1 + player.p.upgrades.length)
        },
        13: {
            title: "Wait A Second!",
            description:() => {
                if (!player.shiftDown) return "Increases penny gain by (1 + ln((1 + [Points] / 100)^.5))x"
                return "Increases penny gain by " + format(player.points.div(100).add(1).pow(.5).ln().add(1)) + "x"
            },
            cost: new Decimal("100"),
            currencyDisplayName:() => "points",
            currencyInternalName:() => "points",
            currencyLocation:() => player,
            effect:() => player.points.div(100).add(1).pow(.5).ln().add(1) // player.p.total.div(100).add(1)
        },
        21: {
            title: "Still Can't Buy Water",
            description:() => {
                if (!player.shiftDown) return "Multiplies point gain by ((1 + [Pennies] / 100)^.5)x"
                return "Multiplies point gain by " + format(player.p.points.div(100).add(1).pow(.5)) + "x"
            },
            cost: new Decimal("100"),
            effect:() => player.p.points.div(100).add(1).pow(.5)
        },
        25: {
            title: "Now we're getting somewhere...",
            description:() => {
                if (!hasUpgrade("p", 25)) return "Unlock a way to put those pennies to good use."
                if (!player.shiftDown) return "Multiplies point gain by ((1 + [Investment Points])^2)x"
                return "Multiplies point gain by " + format(player.p.investment.points.add(1).pow(2)) + "x"
            },
            cost: new Decimal("1e6"),
            effect:() => player.p.investment.points.add(1).pow(2)
        }
    },
    buyables: {
        11: {
            title: "Investment",
            cost() {return decZero},
            display() {
                return "Invest your current pennies at a rate of (x/4e6)^.5!\nRequires 1e6 Pennies.\nCurrent Investment Points: " + format(player[this.layer].investment.points) + "\nCooldown: " + format(player[this.layer].investmentCooldown) + " seconds."
            },
            canAfford() {return player.p.points.gte(new Decimal("1e6")) & player.p.investmentCooldown == 0},
            buy() {
                let layerData = player.p
                let investmentExponent = getInvestmentExponent()
                layerData.investment.points = layerData.investment.points.add(layerData.points.div(4000000).pow(investmentExponent))
                layerData.points = decZero
                player.points = decZero
                player.best = decZero
                player.total = decZero
                layerData.investmentCooldown = 30
                layerData.upgrades = [25]
            },
            unlocked:() => {return hasUpgrade("p", 25)}
        }
    },
    update(diff) {
        if (player[this.layer].investmentCooldown > 0) {
            player[this.layer].investmentCooldown = Math.max(decZero, player[this.layer].investmentCooldown - diff)
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
                        return "You are gaining " + format(tmp.e.getResetGain) + " Expansions per second"
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