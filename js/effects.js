addLayer("effects", {
    symbol: "EF",
    row: "side",
    position: 2,
    type: "none",
    color: "white",
    startData() { 
        return {
            unlocked: false
        }
    },
    tooltip: "Effects",
    layerShown() {
        let visible = false
        if (player.effects.unlocked || hasUpgrade("p", 25)) {
            player.effects.unlocked = true
            visible = true
        }
        return visible
    },
    tabFormat: {
        "Achievements": {
            content: [
                ["display-text", function() {
                    let ret = "You currently have " + player.a.achievements.length + " achievements. "
                    if (hasUpgrade("p", 23)) ret += `As seen in the Achievements layer, this number directly...<br>
                        <br>Multiplies point gain by ${format(upgradeEffect("p", 21))}`
                    if (hasUpgrade("p", 35)) ret += ",<br>Multiplies penny gain by " + format(upgradeEffect("p", 35))
                    if (hasUpgrade("e", 24)) ret += ",<br>Multiplies expansion/penny expansion gain by " + format(upgradeEffect("e", 24))
                    if (hasMilestone("a", 8)) ret += ",<br>and multiplies reset time by " + format(boostedTime(1), 4)

                    if (hasAchievement("a", 25)) {
                        ret += ".<br><br>Some achievements have specific effects. These effects include...<br>"
                        let investmentBoost = 2
                        let allInvestmentBoost = 1
                        let expansionBoost = 1
                        let pennyBoost = 1
                        let conversionRateBaseBoost = 0
                        if (hasAchievement("a", 34)) {
                            investmentBoost *= 1.1
                            expansionBoost *= 1.1
                            pennyBoost *= 1.1
                        }
                        if (hasAchievement("a", 44)) investmentBoost *= 1.2
                        if (hasAchievement("a", 85)) allInvestmentBoost *= 1.2
                        if (hasAchievement("a", 32)) expansionBoost *= 1.1
                        if (hasAchievement("a", 82)) conversionRateBaseBoost += .01
                        if (hasAchievement("a", 83)) conversionRateBaseBoost += .01
                        if (hasAchievement("a", 84)) conversionRateBaseBoost += .01
                        if (hasAchievement("a", 85)) conversionRateBaseBoost += .02

                        ret += "<br>Multiplying investment gain by " + format(investmentBoost) + "x"
                        if (allInvestmentBoost > 1) ret += ",<br>Multiplying all investment gain by " + format(expansionInvestmentBoost) + "x, including in challenges"
                        if (expansionBoost > 1) ret += ",<br>Multiplying expansion gain by " + format(expansionBoost) + "x"
                        if (pennyBoost > 1) ret += ",<br>Multiplying penny gain by " + format(pennyBoost) + "x"

                        if (hasAchievement("a", 35) && !hasAchievement("a", 81)) ret += ",<br>Increase base point gain by 1 and WNBP exponent by .01"
                        if (hasAchievement("a", 51)) ret += ",<br>Increasing the Where Did These Come From??? exponent by .02"
                        if (hasAchievement("a", 55)) ret += ",<br>Reducing the Lucky Penny logarithm from ln to log2, effectively multiplying its effect by ~1.44x"
                        if (hasAchievement("a", 64)) ret += ",<br>Removing the divisor from Still Can't Afford Water"
                        if (conversionRateBaseBoost > 0) ret += ",<br>Increasing the conversion rate base by " + conversionRateBaseBoost + " additive"
                        if (hasAchievement("a", 92)) ret += ",<br>Granting you an additional effective Apple Tree"
                        ret += ",<br>and unlocking various things"
                    }
                    if (player.a.milestones.length > 0) {
                        ret += "<br><br>You have also unlocked achievement milestones, which provide boosts as shown in Achievements layer."
                    }
                    return ret
                }]
            ]
        },
        "Time": {
            content: [
                ["display-text", function() {
                    let ret = "Base reset time per second is 1, and it is increased by...<br>"
                    ret += "<br>" + format(1 + player.a.achievements.length/1000, 3) + "x from Achievement Milestone 9"
                    ret += "<br><br>for a result of " + boostedTime(1) + "x more reset time per second."
                    return ret
                }]
            ],
            unlocked:() => hasMilestone("a", 8)
        },
        "Pennies": {
            content: [
                ["display-text", function() {
                    let ret = "Your current investment is " + format(player.p.investment.points) + ". It is currently used to...<br>" 
                    ret += "<br>Multiply point gain by " + format(upgradeEffect("p", 25)) + "x"
                    if (hasUpgrade("p", 32)) ret += ",<br>Raise the base effect of Useless (1.25) to a power of " + format(upgradeEffect("p", 32))
                    if (hasUpgrade("p", 33)) ret += ",<br>Multiply the point limit of Useless (initially 1e6) by " + format(upgradeEffect("p", 33)) + "x"
                    if (hasUpgrade("p", 34)) ret += ",<br>Increase the WNBP limit exponent by +" + format(upgradeEffect("p", 34))
                    if (hasUpgrade("p", 44)) ret += ",<br>Multiply penny gain by " + format(upgradeEffect("p", 44)) + "x"
                    return ret
                }],
                "blank",
                ["display-text", function() {
                    if (!hasUpgrade("p", 42)) return ""
                    let ret = "Your current expansion investment is " + format(player.p.investment2.points) + ". It is currently used to...<br>"
                    ret += "<br>Multiply penny, expansion, and point gain by " + format(upgradeEffect("p", 42)) + "x"
                    if (hasUpgrade("p", 43)) {
                        let boost = upgradeEffect("p", 42)
                        if (hasUpgrade("p", 53)) boost = boost.mul(upgradeEffect("p", 53))
                        ret += ",<br>Multiply investment gain by " + format(boost)
                    }
                    if (hasUpgrade("p", 45)) ret += ",<br>Multiply PTS (see Taxes) by " + format(upgradeEffect("p", 42)) + "x"
                    if (player.s.unlocked) ret += ",<br>Multiply stored investment/stored expansion gain by " + format(upgradeEffect("p", 42).pow(.25)) + "x"
                    return ret
                }]
            ]
        },
        "Expansions": {
            content: [
                ["display-text", function() {
                    let ret = "Your current expansion is " + format(player.e.points) + ". It is currently used to...<br>"
                    if (hasUpgrade("e", 12)) ret += "<br>Increase WNBP limit exponent by " + format(upgradeEffect("e", 12), 4)
                    return ret
                }], 
                "blank",
                ["display-text", function() {
                    let ret = "Your current penny expansions is " + format(player.e.penny_expansions.points) + ". It is currently used to...<br>"
                    if (hasUpgrade("p", 41)) ret += "<br>Increase the WNBP effect exponent by " + format(upgradeEffect("p", 41)) + "x"
                    if (hasUpgrade("p", 53)) ret += ",<br>Multiply investment gain by " + format(upgradeEffect("p", 53)) + "x"
                    if (hasUpgrade("p", 54)) ret += ",<br>Multiply penny gain by " + format(upgradeEffect("p", 54))
                    return ret
                }]
            ],
            unlocked:() => player.e.unlocked
        }
    }
})