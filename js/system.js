addLayer("sys", {
    symbol: "Sys",
    position: 2,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        best: decimalZero,
        total: decimalZero,
        resetCount: 0,
        everWNBP: false,
        lockWNBP: false,
        businesses: {
            apples: {
                points: decimalZero,
                timer: 0
            },
            acceleratorPower: {
                points: decimalZero
            },
        }
    }},
    color: "gray",
    requires:() => {
        return new Decimal("3.33e33")
    },
    type: "custom",
    resource: "dollars",
    row: 1,
    branches: ["p", "s", "e", "bills"],
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
    canReset() { return tmp[this.layer].baseAmount.gte(tmp[this.layer].requires) && hasUpgrade("p", 55) },
    gainMult() { 
        return conversionRate()
    },
    getResetGain() {
        if (tmp[this.layer].baseAmount.lt(tmp[this.layer].requires)) return decimalZero
        if (tmp[this.layer].baseAmount.lt(1)) return decimalZero
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
        // IF MODIFIED, GO TO STORAGE --> tmp.s.clickables[13].onClick()
        player.highestPointsEver = decimalZero
        player.sys.everWNBP = false
        player.subtabs.s.mainTabs = "Main"
        player.subtabs.e.mainTabs = "Info"

        player.sys.resetCount++

        updateMilestones("sys")

        if (tmp.a.achievements[93].unlocked && player.a.achievements.indexOf("93") == -1 && challengeCompletions("s", 11) == 0) {
            player.a.achievements.push("93")
            doPopup("achievement", tmp.a.achievements[93].name, "Achievement Gotten!", 3, tmp.a.color)
        }

        let keptApples = decimalZero

        if (hasMilestone("sys", 3)) {
            let gain = tmp.sys.businesses.acceleratorPower.dollarResetGain
            player.sys.businesses.acceleratorPower.points = player.sys.businesses.acceleratorPower.points.add(gain)
            keptApples = (player.sys.milestones.length - 2) ** 2
        }

        player.sys.businesses.apples.points = player.sys.businesses.apples.points.min(keptApples)
        player.sys.businesses.apples.timer = 0
    },
    effect() {
        let ret = player.sys.total.mul(2).add(1).pow(.5)
        if (ret.gte(100)) ret = softcap(ret, new Decimal(100), 0.2)
        return ret
    },
    effectDescription:() => {
        return `which currently multiplies 
            penny gain, investment gain, and stored investment/expansion gain by 
            ${format(tmp.sys.effect)} (based on total)`
    },
    milestones: {
        0: {
            requirementDescription: "1 Dollar Reset",
            effectDescription:() => `Unlock Education III, Businesses, and Quests, keep the QOL 1 autobuyer,
                and multiply Expansion/Penny Expansion gain by 1.25x per milestone<br>Currently: 
                ${format(1.25**player.sys.milestones.length)}x`,
            done() { return player.sys.resetCount >= 1 }
        },
        1: {
            requirementDescription: "2 Dollar Resets",
            effectDescription: "Unlock Stored Dollars and more Storage Upgrades, keep one row of achievements "
                + "per milestone (up to 7), and autobuy Education buyables 2x faster",
            done() { return player.sys.resetCount >= 2 }
        },
        2: {
            requirementDescription: "3 Dollar Resets",
            effectDescription: `The 6th Storage milestone no longer requires Expansion challenge completions, and
                It's Only Reasonable also uses System Upgrades<sup>2</sup>`,
            done() { return player.sys.resetCount >= 3 }
        },
        3: {
            requirementDescription: "4 Dollar Resets and 0.5 Stored Dollars",
            effectDescription:() => `Unlock the Accelerator & Accelerator Power,
                and keep (milestones - 2)<sup>2</sup> Apples/Expansion Investment on System resets
                <br>Currently: ${formatWhole(Math.max(player.sys.milestones.length - 2, 0) ** 2)}`,
            done() { return player.sys.resetCount >= 4 && player.s.stored_dollars.points.gte(.5) }
        },
        4: {
            requirementDescription: "5 Dollar Resets and 42 Achievements",
            effectDescription: `It's Expandin' Time! no longer force buys WNBP,
                unlock a toggle for being able to buy it, highest points ever always updates,
                and autobuy buyables 2x faster`,
            done() { return player.sys.resetCount >= 5 && player.a.achievements.length >= 42 },
            toggles: [
                ["sys", "lockWNBP"]
            ]
        },
        // IF THIS MILESTONE IS CHANGED, FIX CONDITION IN penny --> automate() AND functions --> investmentReset()
        // Dont forget to implement changes to QOL 2 and QOL 4
        // 5: {
        //     requirementDescription: "Placeholder",
        //     effectDescription: `Always autobuy all penny upgrades, QOL 2/4 have new (better) effects,
        //         keep QOL 1, and unlock Bills`,
        //     done() { return false }
        // }
        
        // 6: Unlock a Stored Dollars effect (auto-gen investment) and more achievements
        // requires all unlocked achievements
    },
    upgrades: {
        11: {
            title: "Where'd All My Money Go?!?",
            description:() => {
                if (!player.shiftDown) return "Multiply the point gain exponent by 1.01<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.01 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 11))}x`
        },
        12: {
            title: "There's Always More Space",
            description: "Multiply stored investment & stored expansion gain by 1.25<sup>upgrades<sup>*</sup></sup>",
            cost:() => systemUpgradeCost(1),
            effect:() => 1.25 ** player.sys.upgrades.length,
            effectDisplay:() => `${format(upgradeEffect("sys", 12))}x`
        },
        13: {
            title: "Higher Level Education",
            description:() => {
                if (!player.shiftDown) return "All Education levels multiply investment gain by 1.02<sup>upgrades<sup>*</sup></sup>"
                return "Maxes at 5 upgrades and stays active in challenges<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => {
                let base = 1.02
                let buyablePow = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22)).add(getBuyableAmount("p", 23))
                let upgPow = Math.min(player.sys.upgrades.length, 5)
                return Math.pow(base, buyablePow.mul(upgPow))
            },
            effectDisplay:() => `${format(upgradeEffect("sys", 13))}x`
        },
        14: {
            title: "Dollars = More Dollars",
            description: "Multiply the conversion rate by 1.05<sup>upgrades<sup>*</sup></sup>",
            cost:() => systemUpgradeCost(1),
            effect:() => 1.05 ** player.sys.upgrades.length,
            effectDisplay:() => `${format(upgradeEffect("sys", 14))}x`
        },
        15: {
            title: "Go Easy On Me",
            description:() => {
                if (!player.shiftDown) return "The Education II softcap starts 1.03<sup>upgrades<sup>*</sup></sup>x later"
                return "Maxes at 10 upgrades<br>"
            },
            cost:() => systemUpgradeCost(1),
            effect:() => 1.03 ** Math.min(player.sys.upgrades.length, 10),
            effectDisplay:() => `${format(upgradeEffect("sys", 15))}x`
        },
        // *** fullDisplay USED TO SHOW DECIMALS IN COST *** 
        21: {
            fullDisplay() {
                let title = "A Whole Dollar"
                let desc = "Multiply the expansion investment hardcap by 2 and its softcap by 4"
                let cost = `Cost: ${format(this.cost())} dollars`
                return `<h3>${title}</h3><br>${desc}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2)
        },
        22: {
            fullDisplay() {
                let title = "Witchcraft"
                let desc = "Multiply the WNBP limit exponent by 1 + .3ln(ln(e + Best Dollars))"
                let eff = `Currently: ${format(this.effect())}x`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.best.add(Math.E).ln().ln().mul(.3).add(1),
        },
        23: {
            fullDisplay() {
                let title = "Adventure Time"
                let desc = "Increase base point gain by 1 per Quest completion"
                let eff = `Currently: +${formatWhole(this.effect())}`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.quests.points,
        },
        24: {
            fullDisplay() {
                let title = "Rapid Expansion"
                let desc = "Multiply Penny Expansion gain by log10(10 + Total Dollars<sup>upgrades</sup>) and its loss rate by 10x"
                let eff = `Currently: ${format(this.effect())}x`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => player.sys.total.pow(player.sys.upgrades.length).add(10).log(10),
        },
        25: {
            fullDisplay() {
                let title = "Efficient Education"
                let desc = "Increase the coefficients used for Education III by .01 * upgrades<sup>*</sup>"
                if (player.shiftDown) desc = "Maxes at 10 upgrades<br>"
                let eff = `Currently: +${format(this.effect())}`
                let cost = `Cost: ${format(this.cost())} dollars`

                return `<h3>${title}</h3><br>${desc}<br>${eff}<br><br>${cost}`
            },
            cost:() => systemUpgradeCost(2),
            effect:() => .01  * Math.min(player.sys.upgrades.length, 10),
        },
        // 111: {
        //     title: ""
        // },
    },
    buyables: {
        11: {
            title: "Apple Tree",
            cost() { 
                let amt = getBuyableAmount("sys", 11)
                return new Decimal(".1").mul(amt.add(1))
                //return new Decimal(0.1).mul(amt.pow_base(1.1))
            },
            display() { 
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${formatWhole(getBuyableAmount("sys", 11))}/100`
                    let effDesc = `<h3><b>Effect:</h3></b> Produce ${format(tmp.sys.businesses.apples.gain.div(tmp.sys.buyables[11].effect.clampMin(1)))}
                        ${coloredApples} per tree every ${format(tmp.sys.businesses.apples.cooldown)} seconds`
                    let eff = `Producing ${format(tmp.sys.businesses.apples.gain)} ${coloredApples} in ${format(tmp.sys.businesses.apples.cooldown- player.sys.businesses.apples.timer, 2)} seconds`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} dollars`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h2><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[11].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>0.1 * (x + 1)`
                return `${effectiveLevels}\n\n${costFormula}`

            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 11)
                if (hasAchievement("a", 92)) ret = ret.add(1)
                ret = ret.mul(gridEffect("quests", 101))

                return ret
            },
            effect() { 
                let ret = tmp.sys.buyables[11].effectiveLevels
                ret = ret.mul(tmp.s.stored_dollars.effects[3])
                
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
                return new Decimal(10).mul(amt.pow_base(1.3)).mul(amt.pow(2).pow_base(1.01))
            },
            display() {
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 12)}/100`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce +.2 more ${coloredApples} per picker`
                    let eff = `Trees produce +${format(this.effect())} more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h3><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[12].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>10 * 1.3<sup>x</sup> * 1.01<sup>x<sup>2</sup></sup>`
                return `${effectiveLevels}\n\n${costFormula}`
            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 12)
                
                ret = ret.mul(tmp.quests.bars.applesBar.reward)
                return ret
            },
            effect() { 
                let ret = tmp.sys.buyables[12].effectiveLevels.mul(.2)

                return ret
            },
            canAfford() { return player.sys.businesses.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables("sys", 12, 1)
            }
        },
        13: {
            title: "Apple Vendor",
            cost() { 
                let amt = getBuyableAmount("sys", 13)
                return new Decimal(100).mul(amt.pow_base(1.4)) 
            },
            display() {
                if (!player.shiftDown) {
                    let coloredApples = `<span style="color: maroon; font-family: Lucida Console, Courier New, monospace">apples</span>`
                    let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("sys", 13)}/50`
                    let effDesc = `<h3><b>Effect:</h3></b> Trees produce 1.1x more ${coloredApples} per vendor`
                    let eff = `Trees produce ${format(this.effect())}x more ${coloredApples}`
                    let cost = `<h3><b>Cost:</h3></b> ${format(this.cost())} ${coloredApples}`

                    return `${levels}\n${effDesc}\n${eff}\n\n${cost}`
                }

                let effectiveLevels = `<h3><b>Effective Levels:</h3></b><br>${format(tmp.sys.buyables[13].effectiveLevels)}`
                let costFormula = `<h3><b>Cost Formula:</h3></b><br>100 * 1.4<sup>x</sup>`
                return `${effectiveLevels}\n\n${costFormula}`
            },
            effectiveLevels:() => {
                let ret = getBuyableAmount("sys", 13)
                
                return ret
            },
            effect() { return tmp.sys.buyables[13].effectiveLevels.pow_base(1.1) },
            canAfford() { return player.sys.businesses.apples.points.gte(this.cost()) },
            buy() { 
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.sub(this.cost()) 
                addBuyables("sys", 13, 1)
            }
        }
    },
    clickables: {
        11: {
            title: "Accelerator",
            display() {
                if (player.sys.businesses.acceleratorPower.points.eq(69)) return "nice."
                return `Accelerating business production speeds by ${format(this.effect())}x`
            },
            onClick() { 
                let gain = tmp.sys.businesses.acceleratorPower.clickGain
                player.sys.businesses.acceleratorPower.points = player.sys.businesses.acceleratorPower.points.add(gain) 
            },
            onHold() { this.onClick() },
            canClick: true,
            effect() {
                return player.sys.businesses.acceleratorPower.points.div(100).add(1).pow(1/50)
            },
            unlocked:() => hasMilestone("sys", 3)
        },
    },
    businesses: {
        apples: {
            gain:() => {
                let ret = decimalOne
                ret = ret.add(tmp.sys.buyables[12].effect)
                ret = ret.mul(tmp.sys.buyables[13].effect)
                if (hasMilestone("s", 1) && hasUpgrade("s", 14)) ret = ret.mul(tmp.s.stored_expansion.effects[3][0])

                ret = ret.mul(tmp.sys.buyables[11].effect).clampMin(1)
                return ret
            },
            effect:() => {
                let ret = player.sys.businesses.apples.points
                ret = ret.add(1).pow(.125)
                return ret
            },
            cooldown:() => {
                let ret = 60
                ret = ret / tmp.sys.clickables[11].effect
                return ret
            }
        },
        acceleratorPower: {
            clickGain() {
                let ret = 1
                ret *= tmp.quests.bars.acceleratorBar.reward
                return ret
            },
            investmentResetGain() {
                let ret = 25
                ret *= tmp.quests.bars.acceleratorBar.reward
                return ret
            },
            dollarResetGain() {
                let ret = 500
                ret *= tmp.quests.bars.acceleratorBar.reward
                return ret
            }
        }
    },
    update(diff) {
        //throw Error("Justify the existence of denominations by locking buyables(?)")
        if (getBuyableAmount("sys", 11).gt(0)) {
            player.sys.businesses.apples.timer += diff
            let cooldown = tmp.sys.businesses.apples.cooldown
            if (player.sys.businesses.apples.timer > cooldown) {
                let gain = tmp.sys.businesses.apples.gain
                let timeMultiplier = Math.floor(player.sys.businesses.apples.timer / cooldown)
                gain = gain.mul(timeMultiplier)
                player.sys.businesses.apples.timer -= cooldown * timeMultiplier
                player.sys.businesses.apples.points = player.sys.businesses.apples.points.add(gain)
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                "resource-display", "blank",
                ["display-text", function () { return "Current conversion rate is " + format(100*conversionRate(), 4) + " : 100 OoM" }],
                ["display-text", "Purchasing a upgrade increases the cost of other upgrades in the same row (see Info)"],
                "blank", 
                ["upgrades", [1, 2, 3, 4, 5]]
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { return `You have <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars, which currently multiplies 
                    penny gain, investment gain, and stored investment/expansion gain by 
                    ${format(tmp.sys.effect)} (based on total)
                    <br><br>You have done a total of ${player.sys.resetCount} System resets` 
                }],
                "milestones"
            ]
        },
        "Businesses": {
            content: [
                "main-display",
                ["display-text", "Press shift to see effective levels and cost formulas for each buyable"], 
                ["buyables", [1, 2, 3]],
                ["display-text", function() { return `You have <span style="color: maroon; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.businesses.apples.points)}</span> apples, 
                    which multiply post-nerf penny gain by ${format(tmp.sys.businesses.apples.effect)}x<br>`
                }], "blank",
                ["display-text", "Industry currencies (such as Apples) <b>will reset</b> when performing a dollar reset"],
                "blank",
                ["clickables", [1]], "blank",
                () => hasMilestone("sys", 3) ? ["display-text", `You have ${formatWhole(player.sys.businesses.acceleratorPower.points)} Accelerator Power
                    <br>You gain ${format(tmp.sys.businesses.acceleratorPower.clickGain)} Accelerator Power from clicking on the Accelerator,
                    ${format(tmp.sys.businesses.acceleratorPower.investmentResetGain)} from investment resets,
                    and ${format(tmp.sys.businesses.acceleratorPower.dollarResetGain)} from dollar resets`
                ] : ""
            ],
            unlocked:() => hasMilestone("sys", 0)
        },
        "Info": {
            content: [
                "main-display",
                ["microtabs", "info"]
            ]
        }
    },
    microtabs: {
        info: {
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
                        <br>Row 2: .25 Dollars per upgrade`
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
                ], unlocked:() => hasMilestone("sys", 0)
            }
        }
    },
})