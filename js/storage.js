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
        if (layer == "sys") {
            updateMilestones("s")
            let keptUpgrades = player.s.upgrades
            let storedDollars = player.s.stored_dollars.points
            let keptMilestones = []
            let keptExpChall = 0
            let invHighScore = decimalZero
            let keptStoredInv = decimalZero
            let keptExpInv = decimalZero
            if (hasMilestone("sys", 6)) keptExpChall = player.s.challenges[12]
            if (hasMilestone("sys", 7)) invHighScore = player.s.high_scores[11].points
            if (hasMilestone("s", 6)) keptMilestones.push('6')
            if (hasMilestone("s", 7)) {
                keptMilestones.push('7')
                keptStoredInv = player.s.stored_investment.points.min(1e6)
                keptExpInv = player.s.stored_expansion.points.min(2e4)
            }

            layerDataReset("s")

            player.s.stored_dollars.points = storedDollars
            player.s.upgrades = keptUpgrades
            if (player.s.stored_dollars.points.eq(0)) player.s.unlocked = false
            for (const id of keptMilestones) player.s.milestones.push(id)
            player.s.challenges[12] = keptExpChall
            player.s.high_scores[11].points = invHighScore
            player.s.stored_investment.points = keptStoredInv
            player.s.stored_expansion.points = keptExpInv
            updateMilestones("s", showPopups=false)
        }
    },
    stored_investment: {
        softcapStart() {
            let ret = new Decimal(1e40)

            return ret
        },
        softcapExp() {
            let ret = .2
            ret += shopEffect(102)
            return ret
        },
        gain() {
            let ret = player.p.investment.points.mul(upgradeEffect("p", 42).pow(.25))
            ret = ret.mul(tmp.sys.effect)
            if (hasUpgrade("sys", 12)) ret = ret.mul(upgradeEffect("sys", 12))

            return softcap(ret, this.softcapStart(), this.softcapExp())
        },
        effects: {
            1: () => player.s.stored_investment.points.add(1).log10().div(10).add(1),
            2: () => player.s.stored_investment.points.div(100).add(1).log2().mul(1.5).div(100).min(.95),
            3: () => [player.s.stored_investment.points.add(1).log2().div(250), 
                player.s.stored_investment.points.add(1).log2().div(30)],
            4: () => player.s.stored_investment.points.add(1).log10().div(10).add(1.7).max(2).min(4),
            5: () => player.s.stored_investment.points.div(1e6).add(1).pow(.4),
            6: () => player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1),
            7: () => player.s.stored_investment.points.sqrt().add(10).log10().pow(1.5).div(1000).min(.25)
        }
    },
    stored_expansion: {
        gain() {
            let ret = player.e.points.mul(upgradeEffect("p", 42).pow(.25))
            ret = ret.mul(tmp.sys.effect)
            if (hasUpgrade("sys", 12)) ret = ret.mul(upgradeEffect("sys", 12))
            
            return softcap(ret, new Decimal("5e9"), .5)
        },
        effects: {
            1: () => player.s.stored_expansion.points.add(1).log10().div(2.5).max(1),
            2: () => {
                let ret = player.s.stored_expansion.points.add(1).log10().add(10).div(10)
                if (player.s.stored_expansion.points.eq(decimalZero)) ret = 0
                return ret // as a percentage
            },
            3: () => { 
                let investmentMul = player.s.stored_expansion.points.add(1).log2().pow_base(1.03)
                let keptExpansionInvestment = investmentMul.pow(5)
                if (hasUpgrade("s", 12)) keptExpansionInvestment = keptExpansionInvestment.pow(1.5)

                return [investmentMul, keptExpansionInvestment]
            },
            4: () => player.s.stored_expansion.points.add(1).log10().sub(2).max(1),
            5: () => player.s.stored_expansion.points.add(1).log10().div(5),
            6: () => {
                let limitingValue = 190 // 190 --> min divisor of 10
                let k = Math.log(18)/(12-6) // spreads out inputs --> output = 10 at 10^6, 95 at 10^12
                let constantShift = 12*k // moves midpoint (subtract 95) to 10^12 stored exp
                let exp = -k*player.s.stored_expansion.points.add(1).log10() + constantShift
                let scaling = 1 + Math.pow(Math.E, exp)
                return limitingValue/scaling
            },
            7: () => player.s.stored_expansion.points.add(1).log10().floor().sub(7).max(0).pow(2).div(10).add(1)
        }
    },
    stored_dollars: {
        gain:() => player.sys.points.add(tmp.sys.resetGain),
        effects: {
            1: () => player.s.stored_dollars.points.div(50).atan().div(4).div(Math.PI),
            // 1 => player.s.stored_dollars.points.div(5).atan().mul(3).div(4).div(Math.PI)
            2: () => {
                let ret = player.s.stored_dollars.points
                //if (ret.gte(1000)) ret = ret.log10().add(7).pow(3)
                if (ret.gte(10)) ret = ret.pow(.25).mul(10 ** .75)

                return ret.div(100) // as a percentage
                // return player.s.stored_dollars.points.root(3).mul(3).div(100)
            },
            3: () => player.s.stored_dollars.points.add(1).log10().mul(2).add(1),
            // 3 => player.s.stored_dollars.points.pow(2).add(10).log10(),
            4: () => player.s.stored_dollars.points.add(1).pow(.15),
            5: () => player.s.stored_dollars.points.max(1).log2(),
            //6: () => player.s.stored_dollars.points.sqrt().div(10).add(2).log2(),
            6: () => player.s.stored_dollars.points.add(1).root(5),
        }
    },
    milestones: {
        0: {
            requirementDescription: "30,000 Stored Investment",
            effectDescription: "Unlock 1 investment storage effect and 1 expansion storage effect per milestone (up to 6)",
            done() { return player.s.stored_investment.points.gte(30000) }
        },
        1: {
            requirementDescription: "100,000 Stored Investment and 1,250 Stored Expansion",
            effectDescription: "Multiply Penny Expansion loss rate by 9/10",
            done() { return player.s.stored_investment.points.gte(1e5) && player.s.stored_expansion.points.gte(1250) }
        },
        2: {
            requirementDescription: "500,000 Stored Investment and 12,000 Stored Expansion",
            effectDescription: "Increase Unuselessifier exponent from 3 to 3.5 and reduce investment cooldown by 5 seconds",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(5e5) && player.s.stored_expansion.points.gte(12000) },
            unlocked() { return hasMilestone("a", 5) || hasMilestone("sys", 5) }
        },
        3: {
            requirementDescription: "250,000,000 Stored Investment and 250,000 Stored Expansion",
            effectDescription: "Keep 1 Penny Expansion upgrade when storing expansion per milestone and unlock more achievements",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2.5e8) && player.s.stored_expansion.points.gte(2.5e5) },
            unlocked() { return hasMilestone("a", 5) || hasMilestone("sys", 5) }
        },
        4: {
            requirementDescription: "2e12 Stored Investment and 8e6 Stored Expansion",
            effectDescription: "Unlock the Expansion Challenge",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(2e12) && player.s.stored_expansion.points.gte(8e6) },
            unlocked() { return hasAchievement("a", 73) || hasMilestone("sys", 5) }
        },
        5: {
            requirementDescription:() => {
                if (!hasMilestone("sys", 2))
                    return "1e16 Stored Investment, 1e8 Stored Expansion, 2 Expansion Challenge completions"
                return "1e16 Stored Investment and 1e8 Stored Expansion"
            },
            effectDescription: "While in the Expansion Challenge, Useless applies to Penny Expansion gain",
            done() { return this.unlocked() && player.s.stored_investment.points.gte(1e16) 
                && player.s.stored_expansion.points.gte(1e8) && 
                challengeCompletions("s", 12) >= (!hasMilestone("sys", 2) ? 2 : 0) },
            unlocked() { return hasAchievement("a", 73) || hasMilestone("sys", 5) }
        },
        6: {
            requirementDescription: "1.25 Stored Dollars, 8 Expansion Challenge Completions",
            effectDescription:() => `Unlock a Stored Dollars effect and increase the base conversion rate by 1% per Expansion Challenge completion after 5
                <br>Currently: +${Math.max(0, challengeCompletions("s", 12) - 5)}%`,
            done() { return this.unlocked() && player.s.stored_dollars.points.gte(1.25) && challengeCompletions("s", 12) >= 8 },
            unlocked() { return hasMilestone("sys", 6) }
        },
        7: {
            requirementDescription: "3 Stored Dollars, 1e40 Investment Challenge score",
            effectDescription:() => `Unlock another Stored Dollars effect and keep 1e6/2e4 Stored Investment/Expansion on reset`,
            done() { return this.unlocked() && player.s.stored_dollars.points.gte(3) && player.s.high_scores[11].points.gte(1e40) },
            unlocked() { return hasMilestone("sys", 6) }
        }
    },
    upgrades: {
        11: {
            title: "Give Me All The Points",
            description: "Only while in the investment challenge, boost points and pennies (post-nerf) by 5x",
            cost: new Decimal("1e14"),
            unlocked:() => hasAchievement("a", 73) || player.sys.unlocked,
            onPurchase:() => { tmp.s.clickables[11].onClick() },
            currencyDisplayName:() => "Stored Investment",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_investment,
        },
        12: {
            title: "Blessed Inflation",
            description: "Raise secondary effect of third stored expansion effect to the 1.5th power",
            cost: new Decimal("2e7"),
            unlocked:() => hasAchievement("a", 73) || player.sys.unlocked,
            onPurchase() { tmp.s.clickables[12].onClick() },
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
            onPurchase() { 
                player.sys.resetTime = 3000000
                player.sys.resetCount -= 1
                tmp.s.clickables[13].onClick() 
            },
            currencyDisplayName:() => "Stored Dollars",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_dollars
        },
        14: {
            title: "Spread Evenly",
            description: "The third Stored Expansion effect also applies to investment and apple gain",
            cost: new Decimal("1e23"),
            unlocked:() => hasMilestone("sys", 1),
            onPurchase() { tmp.s.clickables[11].onClick() },
            currencyDisplayName:() => "Stored Investment",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_investment,
        },
        15: {
            title: "Click Me!",
            description: "The 4th Storage Milestone applies when entering the Expansion Challenge",
            cost: new Decimal("5e9"),
            unlocked:() => hasMilestone("sys", 1),
            onPurchase() { tmp.s.clickables[12].onClick() },
            currencyDisplayName:() => "Stored Expansion",
            currencyInternalName:() => "points",
            currencyLocation:() => player.s.stored_expansion
        }
    },
    clickables: {
        11: {
            title: "Store Your Investment",
            display() { 
                if (inAnyChallenge()) return "Cannot store inside of a challenge"
                if (!this.canClick()) return "Requires 5000 Investment" 
                return `Gain ${format(tmp.s.stored_investment.gain)} stored investment`
            },
            canClick() { return player.p.investment.points.gte(5000) && !inAnyChallenge() },
            onClick() {
                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = tmp.s.stored_expansion.effects[3][1]
                    
                player.s.stored_investment.points = player.s.stored_investment.points.add(tmp.s.stored_investment.gain)
                investmentReset(true, false)
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                upg35Index = player.p.upgrades.indexOf(35)
                if (upg35Index > -1) player.p.upgrades.splice(upg35Index, 1)
                // upg41Index = player.p.upgrades.indexOf(41)
                // if (upg41Index > -1) player.p.upgrades.splice(upg41Index, 1)
            }
        },
        12: {
            title: "Store Your Expansion",
            display() {
                if (!this.canClick()) {
                    if (inAnyChallenge()) return "Cannot store inside of a challenge"
                    let ret = "Requires 1000 Expansion"
                    if (player.s.stored_investment.points.lt(5000)) ret = ret + " and 5000 Stored Investment"
                    return ret
                }
                return `Gain ${format(tmp.s.stored_expansion.gain)} stored expansion`
            },
            canClick() { return player.e.points.gte(1000) && player.s.stored_investment.points.gte(5000) && !inAnyChallenge() },
            onClick() {
                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = tmp.s.stored_expansion.effects[3][1]

                if (tmp.a.achievements[65].unlocked && player.a.achievements.indexOf("65") == -1 && player.p.investment2.points.lt(resetInvestment2Amt)) {
                    player.a.achievements.push("65")
                    doPopup("achievement", tmp.a.achievements[65].name, "Achievement Unlocked!", 3, tmp.a.color)
                }

                player.s.stored_expansion.points = player.s.stored_expansion.points.add(tmp.s.stored_expansion.gain)
                investmentReset(true, false)
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                let keepUpgIndices = [33, 43]
                if (hasMilestone("s", 3)) {
                    let kept = 0
                    for (i = 0; i <= 20; i++) {
                        let row = Math.floor(i/5) + 1
                        let col = (i % 5) + 1
                        let upgIndex = row * 10 + col
                        if (hasUpgrade("e", upgIndex)) {
                            kept += 1
                            keepUpgIndices.push(upgIndex)
                        }
                        if (kept == player.s.milestones.length) break
                    }
                }
                function removeUpgrades(index) {
                    return keepUpgIndices.includes(index) || index > 100
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)

                player.highestPointsEver = decimalZero
                player.e.points = decimalZero
                player.e.penny_expansion.points = decimalZero
                if (!hasMilestone("sys", 0)) {
                    if (!hasUpgrade("e", 25)) player.p.autoUpgCooldown = -1
                    if (!hasUpgrade("e", 15)) player.p.autoBuyableCooldown = -1
                }
                updateTempData(layers["e"], tmp["e"], funcs["e"])
            }
        },
        13: {
            title: "Store Your Dollars",
            display() { 
                if (!this.canClick()) {
                    if (inAnyChallenge()) return "Cannot store inside of a challenge"
                    return "Requires " + format(tmp.sys.requires) + " Pennies"
                }
                return "Gain " + format(tmp.s.stored_dollars.gain) + " stored dollars"
            },
            canClick() { return canReset("sys") && !inAnyChallenge() },
            onClick() {
                player.s.stored_dollars.points = player.s.stored_dollars.points.add(tmp.s.stored_dollars.gain)
                player.highestPointsEver = decimalZero
                player.sys.everWNBP = false
                player.subtabs.s.mainTabs = "Main"
                player.subtabs.e.mainTabs = "Info"
                player.sys.points = decimalZero
                player.sys.resetCount++

                // update temp before doing reset and updating quests to not give free quest completions
                // also grants system milestones to keep expansion investment and apples/not force additional resets once already done
                // same idea with storage milestones
                updateMilestones("sys")
                tmp.quests.bars.dollarResetBar.progress = layers.quests.bars.dollarResetBar.progress()

                let keptApples = decimalZero

                if (hasMilestone("sys", 3)) {
                    keptApples = (player.sys.milestones.length - 2) ** 2
                }

                player.sys.businesses.apples.points = player.sys.businesses.apples.points.min(keptApples)
                player.sys.businesses.apples.timer = 0
                player.sys.bestPenniesInReset = decimalZero
                doReset("sys", true)
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
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment`
                    ret += player.s.stored_dollars.points.eq(0) ? " and " : ", "
                    ret += `<h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    if (player.s.stored_dollars.points.gt(0)) ret += `, and
                    <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_dollars.points)}</span></h2> Stored Dollars`
                    return ret
                }], "blank",
                "clickables", "blank",
                ["display-text", 
                    "Storing a layer's currency resets that layer's features in return for boosts that help you accumulate resources faster."
                ], "blank", 
                ["microtabs", "storageInfo"], "blank",
                () => hasAchievement("a", 73) || player.sys.unlocked ? ["display-text", `Purchasing an upgrade
                    stores the corresponding currency after spending resources<br><br>`] : "",
                "upgrades"
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function () {
                    let ret = `You have 
                    <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment`
                    ret += player.s.stored_dollars.points.eq(0) ? " and " : ", "
                    ret += `<h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    if (player.s.stored_dollars.points.gt(0)) ret += `, and
                    <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_dollars.points)}</span></h2> Stored Dollars`
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
                        ${format(player.s.stored_investment.points)}</span></h2> Stored Investment`
                    ret += player.s.stored_dollars.points.eq(0) ? " and " : ", "
                    ret += `<h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_expansion.points)}</span></h2> Stored Expansion`
                    if (player.s.stored_dollars.points.gt(0)) ret += `, and
                    <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.s.stored_dollars.points)}</span></h2> Stored Dollars`
                    return ret
                }], "blank",
                ["display-text", "Starting a challenge for a resource performs a storage reset for that currency"],
                "blank",
                "challenges"
            ],
            unlocked:() => hasUpgrade("e", 43) || hasMilestone("s", 4)
        }
    },
    microtabs: {
        storageInfo: {
            "Resets": {
                content: [
                    ["display-text", "<br>Storing investment is functionally the same as performing a penny buyable respec (rip), but also removes the Seriously? upgrade. "
                        + "This means it will perform an investment reset, remove one additional upgrade, and reset investment; though expansion investment is only reset to a value of 1 (initially). "
                        + "Stored investment gain is based on Investment * IITU effect<sup>.25</sup>."], "blank",
                    ["display-text", "Storing expansion is functionally the same as performing a penny expansion upgrade respec, "
                        + "but also resets expansion/penny expansion amounts and highest points ever. Again, expansion investment is reset to a value of 1 (initially). "
                        + "Stored expansion gain is based on Expansion * IITU effect<sup>.25</sup>."
                    ],
                    () => hasMilestone("sys", 1) ? ["display-text", `<br>Storing dollars performs a dollar reset. Your total dollars does not increase
                        when prestiging in this manner. Education III and other System features/values do not reset, aside from
                        Dollars and the Apple industry. Stored Dollar gain is equal to the amount of dollars you would have after a dollar reset.`
                    ] : "", "blank"
                ]
            },
            "Stored Investment": {
                content: [
                    "blank",
                    ["display-text", function() {
                        let ret = `Because you have stored <span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.s.stored_investment.points)}</span> investment, you currently...<br>`
                        ret += `<br>1. Gain ${format(tmp.s.stored_investment.effects[1])}x more investment`
                        if (hasMilestone("s", 0)) {
                            ret += `,<br>2. Generate ${format(tmp.s.stored_investment.effects[2].mul(100))}%
                                of your penny gain on reset per second`
                        }
                        if (hasMilestone("s", 1)) {
                            ret += `,<br>3. Increase the WNBP limit exponent by ${format(tmp.s.stored_investment.effects[3][0])}
                                and effect exponent by ${format(tmp.s.stored_investment.effects[3][1])}`
                        }
                        if (hasMilestone("s", 2)) {
                            let eff = tmp.s.stored_investment.effects[4]
                            ret += `<br>4. Make the Education II softcap begin at an effect of
                                ${format(eff)}`
                            if (eff.eq(4)) ret += " (capped)"
                        }
                        if (hasMilestone("s", 3)) {
                            ret += `,<br>5. Multiply point gain by ${format(tmp.s.stored_investment.effects[5])}`
                        }
                        if (hasMilestone("s", 4)) {
                            ret += `,<br>6. Multiply investment gain (including in challenges) and penny gain (post-nerfs) by
                                ${format(tmp.s.stored_investment.effects[6])}x`
                        }
                        if (hasMilestone("s", 5)) {
                            ret += `,<br>7. Reduce the Tax exponent by
                                ${format(tmp.s.stored_investment.effects[7])}`
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
                            ${format(player.s.stored_expansion.points)}</span> expansion, you currently...<br>`
                        ret += `<br>1. Gain ${format(tmp.s.stored_expansion.effects[1])}x more expansion`
                        if (hasMilestone("s", 0)) {
                            let factorPercent = tmp.s.stored_expansion.effects[2]
                            ret += `,<br>2. Apply It's Only Reasonable to base expansion gain at a rate of ${format(factorPercent)}%`
                            if (tmp.e.baseAmount.eq(decimalZero)) {
                                ret += ", which only applies when your highest points ever exceeds 1e10"
                            } else {
                                let effect = upgradeEffect("e", 11).mul(factorPercent).div(100)
                                if (hasUpgrade("e", 11) || inChallenge("s", 12)) 
                                    ret += `, which makes up ${format(effect.div(tmp.e.baseAmount).mul(100))}% of base expansion gain`
                            }
                        }
                        if (hasMilestone("s", 1)) {
                            ret += ",<br>3. Multiply "
                            if (hasUpgrade("s", 14)) ret = ret + "apple, investment, and "
                            ret += `expansion investment gain by ${format(tmp.s.stored_expansion.effects[3][0])}x` 
                            ret += ` and maximum kept expansion investment is ${format(tmp.s.stored_expansion.effects[3][1])}`
                            // if (!hasUpgrade("s", 12)) ret = ret + format((1.03**player.s.stored_expansion.points.add(1).log2())**5)
                            // else ret = ret + format((1.03**player.s.stored_expansion.points.add(1).log2())**7.5)
                        }
                        if (hasMilestone("s", 2)) {
                            ret += `,<br>4. Multiply PTS (base penny value used for tax) by
                                ${format(tmp.s.stored_expansion.effects[4])}x`
                        }
                        if (hasMilestone("s", 3)) {
                            ret += `,<br>5. Increase the Unuselessifier exponent by
                                ${format(tmp.s.stored_expansion.effects[5])}`
                        }
                        if (hasMilestone("s", 4)) {
                            ret += `,<br>6. Subtract ${format(tmp.s.stored_expansion.effects[6])}
                                from the divisor in the Penny Expansion base gain formula`
                        }
                        if (hasMilestone("s", 5)) {
                            ret += `,<br>7. Multiply the expansion investment hardcap by
                                ${format(tmp.s.stored_expansion.effects[7])}x (increases every OoM)`
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
                        ret += `<br>1. Increase the Penny gain softcap exponent (initially 0.5) by 
                            ${format(tmp.s.stored_dollars.effects[1], 4)}`
                        ret += `,<br>2. Buff the base conversion rate by  
                            ${format(tmp.s.stored_dollars.effects[2].mul(100))}% additive`
                        ret += `,<br>3. Produce ${format(tmp.s.stored_dollars.effects[3])}x more apples per tree`
                        ret += `,<br>4. Multiply the expansion investment gain softcap and hardcap by 
                            ${format(tmp.s.stored_dollars.effects[4])}x`
                        if (hasMilestone("s", 6)) ret += `,<br>5. Passively generate
                            ${format(tmp.s.stored_dollars.effects[5])}% of investment gain per second`
                        if (hasMilestone("s", 7)) ret += `,<br>6. Multiply loot gain by 
                            ${format(tmp.s.stored_dollars.effects[6])}x`
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
            challengeDescription:() => "Point/penny gain ^.5 (after tax), Tax starts 1e4x earlier, subtract 1 from Tax exponent, and investment gain is 1",
            goalDescription() { return format(player.s.high_scores[11].points.max(1e6)) + " points" },
            rewardDescription:() => {
                if (player.shiftDown) return "Softcapped at .1/.2, capped at .35"
                return "Increases the IITU effect exponent based on high score"
            },
            rewardEffect() { 
                let ret = player.s.high_scores[11].points.add(1).log2().div(500)
                if (ret.gte(2.1)) return new Decimal(.35)
                else if (ret.gte(.6)) return ret.sub(.6).div(10).add(.2)
                else if (ret.gte(.1)) return ret.sub(.1).div(5).add(.1)
                return ret

                // if (ret.gte(.1)) ret = ret.sub(.1).div(5).add(.1)
                // if (ret.gte(.2)) ret = ret.sub(.2).div(2).add(.2)
                // return ret.min(.35)
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
            },
            marked() { return this.rewardEffect() == .35 },
            unlocked:() => hasUpgrade("e", 43)
        },
        12: {
            name: "Expansion Challenge",
            challengeDescription:() => `Point/penny gain ^.25 (after tax), investment gain is 0.1,
                Why Do These Matter??? base is 1.02, cap It's Only Reasonable at +5, 
                but 2nd stored expansion effect always applies`,
            goalDescription() { return format(this.requirement()) + " penny expansion" },
            rewardDescription:() => "Multiply penny expansion gain by (1 + challenge completions)<sup>1.5</sup>",
            rewardEffect() { 
                return [
                    Math.pow(challengeCompletions("s", 12) + 1, 1.5), // penny expansion gain
                    Math.max(0, challengeCompletions("s", 12) - 5) * .01 // base conversion rate
                ]
            },
            rewardDisplay() { 
                return format(challengeEffect("s", 12)[0], 2) + "x"
                    + "<br>Completion count: " + challengeCompletions("s", 12) + "/" + this.completionLimit
            },
            canComplete() {
                return player.e.penny_expansion.points.gte(this.requirement())
            },
            // onComplete() {
            //     return
            // },
            onEnter() {
                // tmp.s.clickables[12].onClick(), but no achievement and no kept upgrades
                let resetInvestment2Amt = decimalOne
                if (hasMilestone("s", 1)) resetInvestment2Amt = tmp.s.stored_expansion.effects[3][1]

                player.s.stored_expansion.points = player.s.stored_expansion.points.add(tmp.s.stored_expansion.gain)
                investmentReset(true, false)
                player.p.investment2.points = player.p.investment2.points.min(resetInvestment2Amt)

                let keepUpgIndices = [33, 43]
                if (hasUpgrade("s", 15)) {
                    let kept = 0
                    for (i = 0; i <= 20; i++) {
                        let row = Math.floor(i/5) + 1
                        let col = (i % 5) + 1
                        let upgIndex = row * 10 + col
                        if (hasUpgrade("e", upgIndex)) {
                            kept += 1
                            keepUpgIndices.push(upgIndex)
                        }
                        if (kept == player.s.milestones.length) break
                    }
                }
                function removeUpgrades(index) {
                    return keepUpgIndices.includes(index) || index > 100
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)

                player.highestPointsEver = decimalZero
                player.e.points = decimalZero
                player.e.penny_expansion.points = decimalZero
                if (!hasMilestone("sys", 0)) {
                    if (!hasUpgrade("e", 25)) player.p.autoUpgCooldown = -1
                    if (!hasUpgrade("e", 15)) player.p.autoBuyableCooldown = -1
                }
                updateTempData(layers["e"], tmp["e"], funcs["e"])
            },
            // onExit() {
            //     return
            // }
            completionLimit: 100,
            requirement:() => {
                //if (challengeCompletions("s", 12) == 0) return new Decimal("16")
                let x = challengeCompletions("s", 12)
                return 4**(x + x**(2/3))
            },
            unlocked:() => hasMilestone("s", 4)
        }
        // 13: dollar challenge --> all boosts from row 1 are nullified
        // perform dollar storage, but also resets toys
        // main objective is to grind toys for more dollars (see "sell toys")
        // more dollars = better row 2 boosts = more points = higher score
    }
})