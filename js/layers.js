addLayer("p", {
    // name: "pennies", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
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
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for pennies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "The first one.",
            description: "Multiplies point gain by 2.",
            cost: new Decimal("1")
        }
    }
})

addLayer("e", {
    symbol: "E",
    position: 1,
    startData() { return {
        unlocked: true,
        points: new Decimal(0)
    }},
    color: "#FFFFFF",
    resource: "expansions",
    baseResource: "points",
    type: "none",
    passiveGeneration() {
        return Math.log10(Math.log10(10 + Math.max(1,player.points))) / 1000
    },
    baseAmount() {return player.points},
    exponent: .5,
    gainMult() {
        return new Decimal(1)
    },
    gainExp() {
        return new Decimal(1)
    },
    row: 0,
    layerShown() {return true},
    update(diff) {
        player[this.layer].points = player[this.layer].points.add(1)
    }
})