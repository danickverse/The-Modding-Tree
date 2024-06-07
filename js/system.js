function systemUpgradeCost(row) {
    let boughtInRow = player.sys.upgrades.filter(
        (index) => Math.floor(index / 10) == row
    ).length
    if (row == 1) {
        return .15 + .15 * boughtInRow
    } else if (row == 2) {
        return 1 + .5 * boughtInRow
    }
}

addLayer("sys", {
    symbol: "Sys",
    position: 0,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        best: decimalZero,
        total: decimalZero,
        resetCount: 0,
        appleTimer: 0,
        apples: {
            points: decimalZero
        },
        acceleratorPower: {
            points: decimalZero
        }
    }},
    color: "gray",
    requires:() => {
        return new Decimal("3.33e33")
    },
    type: "custom",
    resource: "dollars",
    row: 1,
    branches: ["p", "s", "e"],
    hotkeys: [
        {
            key: "d", 
            description: "D: Reset for dollars", 
            onPress(){ if (canReset(this.layer)) doReset(this.layer) }
        },
    ],
    layerShown:() => player.sys.unlocked,
    baseResource: "pennies",
    baseAmount() { return player.p.points },
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && player.p.upgrades.length >= 25 },
    prestigeNotify() { return player[this.layer].points.lt(1) && tmp[this.layer].canReset },
    gainMult() { 
        return conversionRate()
    },
    getResetGain() {
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
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
        return `${player[layer].points.lt(1e3) ? (tmp[layer].resetDescription !== undefined ? tmp[layer].resetDescription : "Reset for ") : ""}+<b>${formatWhole(tmp[layer].resetGain)}</b> ${tmp[layer].resource} ${tmp[layer].resetGain.lt(100) && player[layer].points.lt(1e3) ? `<br><br>Next at ${(tmp[layer].roundUpCost ? formatWhole(tmp[layer].nextAt) : format(tmp[layer].nextAt))} ${tmp[layer].baseResource}` : ""}`
    },
    onPrestige() { 
        player.highestPointsEver = decimalZero
        player.subtabs.s.mainTabs = "Main"
        player.subtabs.e.mainTabs = "Info"

        player.sys.resetCount++

        player.sys.apples.points = decimalZero
        player.sys.appleTimer = 0
    },
    effect() {
        return player.sys.points.add(1).pow(1.5)
    },
    milestones: {
        0: {
            requirementDescription: "1 Dollar Reset",
            effectDescription:() => "Unlock Education III, Businesses, and Quests, and multiply Expansion/Penny Expansion gain by 1.2x per milestone<br>Currently: " 
                + 1.2**player.sys.milestones.length + "x",
            done() { return player.sys.resetCount >= 1 }
        },
        1: {
            requirementDescription: "2 Dollar Resets",
            effectDescription: "Unlock Stored Dollars, two Stored Dollars effects, and three Storage Upgrades, "
                + " and keep one row of achievements per milestone, up to 7",
            done() { return player.sys.resetCount >= 2 }
        },
        2: {
            requirementDescription: "4 Dollar Resets",
            effectDescription: `Always autobuy all penny upgrades instantly but QOL 2 and QOL 4 have new effects, 
                and the 6th Storage milestone only requires 1 Expansion challenge completion`,
            done() { return player.sys.resetCount >= 4 }
        },
        // 3: {
        //     requirementDescription: "5 Dollar Resets",
        //     effectDescription: "Unlock the Accelerator and Accelerator Power",
        //     done() { return player.sys.resetCount >= 5 }
        // }
    },
    upgrades: {
        11: {
            title: "Where'd All My Money Go?!?",
            description:() => {
                if (!player.shiftDown) return "Multiply the point gain exponent by 1.01<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.01 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 11))}x`
        },
        12: {
            title: "Placeholder",
            description:() => {
                if (!player.shiftDown) return "Multiply stored investment & stored expansion gain by 2<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades, works in challenges"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 2 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${formatWhole(upgradeEffect("sys", 12))}x`
        },
        13: {
            title: "Placeholder",
            description:() => {
                if (!player.shiftDown) return "All Education levels multiply investment gain by 1.02<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => {
                let base = 1.02
                let buyablePow = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22)).add(getBuyableAmount("p", 23))
                let upgPow = Math.min(player.sys.upgrades.length, 10)
                return Math.pow(base, buyablePow.mul(upgPow))
            },
            effectDisplay:() => `${format(upgradeEffect("sys", 13))}x`
        },
        14: {
            title: "Dollars = More Dollars",
            description:() => {
                if (!player.shiftDown) return "Multiply the conversion rate by 1.1<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.1 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 14))}x`
        },
        15: {
            title: "Placeholder",
            description:() => {
                if (!player.shiftDown) return "Increase the coefficients used for Education III by .01<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => .01  * Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `+${format(upgradeEffect("sys", 15))}`
        },
        21: {
            title: "A Whole Dollar",
            description: "Multiply the expansion investment hardcap by 2 and its softcap value by 3",
            cost:() => systemUpgradeCost(2)
        },
        22: {
            title: "Witchcraft",
            description: "Multiply the WNBP limit exponent by 1 + .3ln(ln(e + Best Dollars))",
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.best.add(Math.E).ln().ln().mul(.3).add(1),
            effectDisplay:() => `${format(upgradeEffect("sys", 22))}x`
        }
    },
    buyables: {
        11: {
            title: "Apple Tree",
            cost() { 
                let amt = getBuyableAmount("sys", 11)
                return new Decimal(0.1).mul(amt.pow_base(1.1))
            },
            display() { 
                let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                let levels = `<h2><b>Levels</h2></b>: ${getBuyableAmount("sys", 11)}/100`
                // effDesc = ${format(decimalOne.add(tmp.sys.buyables[12].effect).mul(tmp.sys.buyables[13].effect))} 
                let effDesc = `<h2><b>Effect</h2></b>: Produce ${format(tmp.sys.apples.gain.div(tmp.sys.buyables[11].effect.clampMin(1)))}
                    ${coloredApples} per tree every ${format(tmp.sys.apples.cooldown)} seconds`
                let eff = `Producing ${format(tmp.sys.apples.gain)} ${coloredApples} in ${format(tmp.sys.apples.cooldown- player.sys.appleTimer, 2)} seconds`
                let cost = `<h2><b>Cost</h2></b>: ${format(this.cost())} dollars`

                return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
            },
            effect() { 
                let ret = getBuyableAmount("sys", 11)
                if (hasAchievement("a", 92)) ret = ret.add(1)

                return ret
            },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() {
                player.sys.points = player.sys.points.sub(this.cost())
                addBuyables("sys", 11, 1)
            }
        },
        12: {
            title: "Apple Picker",
            cost() { 
                let amt = getBuyableAmount("sys", 12)
                return new Decimal(10).mul(amt.pow_base(1.2)).mul(amt.pow(2).pow_base(1.01))
            },
            display() { 
                let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                let levels = `<h2><b>Levels</h2></b>: ${getBuyableAmount("sys", 12)}/100`
                let effDesc = `<h2><b>Effect</h2></b>: Trees produce +.25 more ${coloredApples} per picker`
                let eff = `Trees produce +${format(this.effect())} more ${coloredApples}`
                let cost = `<h2><b>Cost</h2></b>: ${format(this.cost())} ${coloredApples}`

                return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
            },
            effect() { return getBuyableAmount("sys", 12).div(4) },
            canAfford() { return player.sys.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.apples.points = player.sys.apples.points.sub(this.cost()) 
                addBuyables("sys", 12, 1)
            }
        },
        13: {
            title: "Apple Vendor",
            cost() { 
                let amt = getBuyableAmount("sys", 13)
                return new Decimal(100).mul(amt.pow_base(1.25)) 
            },
            display() { 
                let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                let levels = `<h2><b>Levels</h2></b>: ${getBuyableAmount("sys", 13)}/50`
                let effDesc = `<h2><b>Effect</h2></b>: Trees produce 1.1x more ${coloredApples} per vendor`
                let eff = `Trees produce ${format(this.effect())}x more ${coloredApples}`
                let cost = `<h2><b>Cost</h2></b>: ${format(this.cost())} ${coloredApples}`

                return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
            },
            effect() { return getBuyableAmount("sys", 13).pow_base(1.1) },
            canAfford() { return player.sys.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.apples.points = player.sys.apples.points.sub(this.cost()) 
                addBuyables("sys", 13, 1)
            }
        }
    },
    clickables: {
        11: {
            title: "Accelerator",
            display() {
                if (player.sys.acceleratorPower.points.eq(69)) return "nice."
                return `Accelerating business production speeds by ${format(this.effect())}x`
            },
            onClick:() => player.sys.acceleratorPower.points = player.sys.acceleratorPower.points.add(1),
            canClick: true,
            effect() {
                return Math.pow(1 + player.sys.acceleratorPower.points/100, 1/50)
            },
            unlocked:() => hasMilestone("sys", 3)
        }
    },
    apples: {
        gain:() => {
            let ret = decimalOne
            ret = ret.add(tmp.sys.buyables[12].effect)
            ret = ret.mul(tmp.sys.buyables[13].effect)
            ret = ret.mul(tmp.sys.buyables[11].effect)
            return ret
        },
        effect:() => {
            let ret = player.sys.apples.points
            ret = ret.add(1).pow(.5)
            return ret
        },
        cooldown:() => {
            let ret = 60
            ret = ret / tmp.sys.clickables[11].effect
            return ret
        }
    },
    update(diff) {
        if (getBuyableAmount("sys", 11).gt(0)) {
            player.sys.appleTimer += diff
            if (player.sys.appleTimer > tmp.sys.apples.cooldown) {
                let gain = tmp.sys.apples.gain
                let timeMultiplier = Math.floor(player.sys.appleTimer / tmp.sys.apples.cooldown)
                gain = gain.mul(timeMultiplier)
                player.sys.appleTimer -= tmp.sys.apples.cooldown * timeMultiplier
                player.sys.apples.points = player.sys.apples.points.add(gain)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                "prestige-button", "blank",
                "resource-display", "blank",
                ["display-text", function () { return "Current conversion rate is " + format(100*conversionRate(), 4) + " : 100 OoM" }],
                ["display-text", "Purchasing a upgrade increases the cost of other upgrades in the same row"],
                "blank", "upgrades"
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                "milestones"
            ]
        },
        "Businesses": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by  
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                "buyables", "blank",
                ["display-text", function() { return `You have <span style="color: maroon; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.apples.points)}</span> apples, 
                    which multiply penny gain by ${format(tmp.sys.apples.effect)}x<br>`
                }], "blank",
                "clickables", "blank",
                () => hasMilestone("sys", 3) ? ["display-text", function() { 
                    return `You have ${formatWhole(player.sys.acceleratorPower.points)} Accelerator Power
                    <br>You gain 1 Accelerator Power from clicking the Accelerator, 10 from investment resets,
                    and 250 from dollar resets`
                }] : ""
            ],
            unlocked:() => hasMilestone("sys", 0)
        },
        "Info": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)}<br><br>` 
                }],
                ["microtabs", "info"]
            ]
        }
    },
    microtabs: {
        info: {
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
                        <br>Row 2: .5 Dollars per upgrade`
                    ],
                    "blank"
                ]
            },
            "Conversion Rate": {
                content: [
                    "blank",
                    ["display-text", `The "conversion rate" tells you how many dollars you will earn on 
                        reset given your current penny amount. It is given as a ratio between dollars and 
                        100 orders of magnitude of pennies. This ratio is initially 1 : 100 OoM, which means that
                        you will gain 1 dollar for every 100 orders of magnitude of pennies. <br><br>
                        For example, assuming a conversion rate of 1 : 100 OoM, if you had 1e100 pennies, 
                        you would gain 1 dollar on reset. Or, if you had 1e40 pennies, you would gain 0.4 dollars on reset.`
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
                        <b>Keep in mind</b> that industry currencies (such as Apples) <b>will reset</b> when performing a dollar reset. <b>Make sure 
                        to spend</b> all of your resources before clicking that big gray button.`
                    ],
                    "blank"
                ],
                unlocked:() => hasMilestone("sys", 0)
            }
        }
    }
})