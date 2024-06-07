addLayer("s", {
    symbol: "S",
    position: 2,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        stored_investment: {
            points: decimalZero
        },
        stored_expansion: {
            points: decimalZero
        },
        stored_dollars: {
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
    tooltipLocked: "Storage",
    type: "none",
    row: 0,
    branches: ["p", "e"],
    layerShown:() => hasUpgrade("e", 33) || player.sys.unlocked,
    doReset(layer) {
        let keptUpgrades = player.s.upgrades
        layerDataReset("s")
        player.s.upgrades = keptUpgrades
    },
    milestones: {
        0: {
            requirementDescription: "30,000 Stored Investment",
            effectDescription: "Unlock 1 investment storage effect and 1 expansion storage effect per milestone",
            done() { return player.s.stored_investment.points.gte(30000) }
        },
        1: {
            requirementDescription: "100,000 Stored Investment and 1,250 Stored Expansions",
            effectDescription: "Reduce Penny Expansion loss rate to .9%",
            done() { return player.s.stored_investment.points.gte(1e5) && player.s.stored_expansion.points.gte(1250) }
        },
        2: {
            requirementDescription: "500,000 Stored Investment and 12,000 Stored Expansions",
            effectDescription: "Increase Unuselessifier exponent from 3 to 3.5 and reduce investment cooldown by 5 seconds",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(5e5) && player.s.stored_expansion.points.gte(12000) },
            unlocked() { return hasMilestone("a", 5) }
        },
        3: {
            requirementDescription: "250,000,000 Stored Investment and 300,000 Stored Expansions",
            effectDescription: "Keep 1 Penny Expansion upgrade when storing expansions per milestone and unlock more achievements",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2.5e8) && player.s.stored_expansion.points.gte(3e5) },
            unlocked() { return hasMilestone("a", 5) }
        },
        4: {
            requirementDescription: "2e12 Stored Investment and 8e6 Stored Expansions",
            effectDescription: "Unlock the Expansion Challenge",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2e12) && player.s.stored_expansion.points.gte(8e6) },
            unlocked() { return hasAchievement("a", 73) }
        },
        5: {
            requirementDescription:() => {
                let ret = "1e16 Stored Investment, 1e8 Stored Expansions, "
                if (hasMilestone("sys", 2)) ret += "1"
                else ret += "2" 
                return ret + " Expansion Challenge completions"
            },
            effectDescription: "While in the Expansion Challenge, Useless applies to Penny Expansion gain",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(1e16) 
                && player.s.stored_expansion.points.gte(1e8) && 
                challengeCompletions("s", 12) >= (!hasMilestone("sys", 2) ? 2 : 1) },
            unlocked() { return hasAchievement("a", 73) }
        }
    },
    upgrades: {
        11: {
            title: "Cheater Behavior",
            description: "Only while in the investment challenge, boost points and pennies (post-nerf) by 5x",
            cost: new Decimal("1e14"),
            unlocked:() => hasAchievement("a", 73) || player.sys.unlocked,
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
            cost: new Decimal("2e7"),
            unlocked:() => hasAchievement("a", 73) || player.sys.unlocked,
            onPurchase() {
                tmp.s.clickables[12].onClick()
            },
            pay() { player.s.stored_expansion.points = decimalZero },
            currencyDisplayName:() => "Stored Expansion",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_expansion,
        },
        13: {
            title: "Small Price To Pay",
            description: "Gain 5% of pennies on reset per second regardless of current Stored Investment",
            cost: new Decimal("0.5"),
            unlocked:() => hasMilestone("sys", 1),
            effect() { return .05 },
            onPurchase() { tmp.s.clickables[13].onClick() },
            pay() { player.s.stored_dollars.points = decimalZero },
            currencyDisplayName:() => "Stored Dollars",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_dollars
        },
        14: {
            title: "",
            description: "Multiply the expansion investment gain softcap value by (1 + Stored Expansion)<sup>.05</sup>",
            cost: new Decimal("5e20"),
            unlocked:() => hasMilestone("sys", 1),
            effect:() => player.s.stored_expansion.points.add(1).pow(.05),
            effectDisplay:() => format(upgradeEffect("s", 14)) + "x",
            onPurchase() { tmp.s.clickables[11].onClick() },
            pay() { player.s.stored_investment.points = decimalZero },
            currencyDisplayName:() => "Stored Investment",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_investment,
        },
        15: {
            title: "",
            description: "When storing expansions, gain stored investment at a rate of 10x",
            cost: new Decimal("1e100"),
            unlocked:() => hasMilestone("sys", 1),
            onPurchase() { tmp.s.clickables[13].onClick() },
            pay() { player.s.stored_dollars = decimalZero },
            currencyDisplayName:() => "Stored Dollars",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_dollars
        }
    },
    clickables: {
        11: {
            title: "Store Your Investment",
            display() { 
                if (inAnyChallenge()) return "Cannot store inside of a challenge"
                if (!this.canClick()) return "Requires 5000 Investment" 
                return "Gain " + format(player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))) + " stored investment"
            },
            canClick() { return player.p.investment.points.gte(5000) && !inAnyChallenge() },
            onClick() {
                let gain = player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))
                gain = gain.mul(tmp.sys.effect)
                if (hasUpgrade("sys", 12)) gain = gain.mul(upgradeEffect("sys", 12))
                    
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
                    if (inAnyChallenge()) return "Cannot store inside of a challenge"
                    let ret = "Requires 1000 Expansions"
                    if (player.s.stored_investment.points.lt(5000)) ret = ret + " and 5000 Stored Investment"
                    return ret
                }
                let gain = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
                return "Gain " + format(gain) + " stored expansions"
            },
            canClick() { return player.e.points.gte(1000) && player.s.stored_investment.points.gte(5000) && !inAnyChallenge() },
            onClick() {
                let gain = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
                gain = gain.mul(tmp.sys.effect)
                if (hasUpgrade("sys", 12)) gain = gain.mul(upgradeEffect("sys", 12))

                player.s.stored_expansion.points = player.s.stored_expansion.points.add(gain)
                investmentReset(true, false)

                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = resetInvestment2Amt.mul((1.03**player.s.stored_expansion.points.log2())**5)
                if (hasUpgrade("s", 12)) resetInvestment2Amt = resetInvestment2Amt**1.5
                if (tmp.a.achievements[65].unlocked && player.a.achievements.indexOf("65") == -1 && player.p.investment2.points.lt(resetInvestment2Amt)) {
                    player.a.achievements.push("65")
                    doPopup("achievement", tmp.a.achievements[65].name, "Achievement Unlocked!", 3, tmp.a.color)
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
        },
        13: {
            title: "Store Your Dollars",
            display() { 
                if (!this.canClick()) {
                    if (inAnyChallenge()) return "Cannot store inside of a challenge"
                    return "Requires " + format(tmp.sys.requires) + " Pennies"
                }
                let gain = player.sys.points.add(tmp.sys.resetGain)
                return "Gain " + format(gain) + " stored dollars"
            },
            canClick() { return player.p.points.gte(tmp.sys.requires) && !inAnyChallenge() },
            onClick() {
                player.sys.resetCount--
                player.sys.total = player.sys.total.sub(tmp.sys.resetGain)
                doReset("sys")
                player.s.stored_dollars.points = player.s.stored_dollars.points.add(player.sys.points)
                player.sys.points = decimalZero
            },
            unlocked:() => hasMilestone("sys", 1)
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
                () => hasAchievement("a", 73) ? ["display-text", "Purchasing an upgrade resets the related (stored) currency's value to 0 and then stores that currency<br><br>"] : "",
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
                        + "Stored investment gain is based on Investment * IITU effect<sup>.25</sup>."], "blank",
                    ["display-text", "Storing expansions is functionally the same as performing a penny expansion upgrade respec, "
                        + "but also resets expansion/penny expansion amounts and highest points ever. Again, expansion investment is reset to a value of 1 (initially). "
                        + "Stored expansion gain is based on Expansions * IITU effect<sup>.25</sup>."
                    ],
                    () => hasMilestone("sys", 1) ? ["display-text", "<br>Storing dollars performs a dollar reset. Your Dollar reset count does not increase when prestiging in this manner ."
                        + "Education III and other System features/values do not reset, aside from Dollars and Business currencies. "
                        + "Stored Dollar gain is equal to the amount of dollars you would have after a dollar reset."
                    ] : "", "blank"
                ]
            },
            "Stored Investment": {
                content: [
                    "blank",
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
                            ret = ret + ",<br>6. Multiply investment gain (including in challenges) and penny gain (post-nerfs) by "
                                + format(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1)) + "x"
                        }
                        if (hasMilestone("s", 5)) {
                            ret = ret + ",<br>7. Reduce the Tax exponent by "
                                + format(player.s.stored_investment.points.add(10).log10().div(1000))
                        }
                        return ret
                    }], "blank"
                ]
            },
            "Stored Expansion": {
                content: [
                    "blank",
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
                                + format(player.s.stored_expansion.points.add(1).log10().sub(2).max(decimalOne)) + "x"
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
                            ret = ret + ",<br>7. Multiply the expansion investment hardcap by "
                                + format(player.s.stored_expansion.points.add(1).log10().floor().sub(7).max(0).pow(2).div(10).add(1))
                                + "x"
                        }
                        return ret
                    }], "blank"
                ]
            },
            "Stored Dollars": {
                content: [
                    "blank",
                    ["display-text", function() {
                        let ret = `Because you have stored <span style="color: gray; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                        ${format(player.s.stored_dollars.points)}</span> dollars, you currently...<br>`
                        ret += `<br>1. Increase the Penny gain softcap exponent from 0.5 to 
                            ${format(player.s.stored_dollars.points.div(5).atan().mul(3).div(4).div(Math.PI).add(.5), 4)}`
                        ret += `<br>2. Buff the base conversion rate by  
                            ${format(player.s.stored_dollars.points.root(3).mul(3))}% additive`
                        ret += `<br>3. Produce ${format(player.s.stored_dollars.points.pow(2).add(10).log10())}x more apples per tree`
                        return ret
                    }], "blank"
                ],
                unlocked:() => hasMilestone("sys", 1)
            }
        }
    },
    challenges: {
        11: {
            name: "Investment Challenge",
            challengeDescription:() => "Raise point/penny gain ^.5 (after tax), Tax starts 10000x earlier, subtract 1 from the Tax exponent, and investment gain is initially 1",
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
                return "+" + format(challengeEffect("s", 11), 3) 
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
            challengeDescription:() => "Raise point/penny gain ^.25 (after tax), investment gain is initially 0.1, "
                + "Why Do These Matter??? base is 1.02, but second stored expansion effect always applies",
            goalDescription() { return format(this.requirement()) + " penny expansions" },
            rewardDescription:() => "Multiply penny expansion gain by (1 + challenge completions)<sup>1.5</sup>",
            rewardEffect() { 
                return Math.pow(challengeCompletions("s", 12) + 1, 1.5)
            },
            rewardDisplay() { 
                return format(challengeEffect("s", 12), 2) + "x"
                    + "<br>Completion count: " + challengeCompletions("s", 12) + "/" + this.completionLimit
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
                return 4**Math.cbrt(challengeCompletions("s", 12)) * 16**challengeCompletions("s", 12)
            }
        }
    }
})