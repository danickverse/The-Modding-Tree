addLayer("effects", {
    symbol: "EF",
    row: "side",
    position: 1,
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
                    let ret = "You currently have " + player.a.achievements.length + " achievements. As seen in the Achievements layer, this number directly...<br>"
                    ret = ret + "<br>Multiplies point gain by " + format(upgradeEffect("p", 21)) + "x"
                    if (hasUpgrade("p", 35)) ret = ret + ",<br>Multiplies penny gain by " + format(upgradeEffect("p", 35))
                    if (hasUpgrade("e", 24)) ret = ret + ",<br>Multiplies expansion/penny expansion gain by " + format(upgradeEffect("e", 24))
                    if (hasMilestone("a", 8)) ret = ret + ",<br>and multiplies reset time by " + format(boostedTime(1), 4) + "x"

                    if (hasAchievement("a", 25)) {
                        ret = ret + ".<br><br>Some achievements also have specific effects. These effects include...<br>"
                        let investmentBoost = 2
                        let expansionBoost = 1
                        let pennyBoost = 1
                        if (hasAchievement("a", 32)) expansionBoost = expansionBoost * 1.1
                        if (hasAchievement("a", 34)) {
                            investmentBoost = investmentBoost * 1.1
                            expansionBoost = expansionBoost * 1.1
                            pennyBoost = pennyBoost * 1.1
                        }
                        if (hasAchievement("a", 44)) investmentBoost = investmentBoost * 1.2

                        ret = ret + "<br>Multiply investment gain by " + format(investmentBoost) + "x"
                        if (expansionBoost > 1) ret = ret + ",<br>Multiply expansion gain by " + format(expansionBoost) + "x"
                        if (pennyBoost > 1) ret = ret + ",<br>Multiply penny gain by " + format(pennyBoost) + "x"

                        if (hasAchievement("a", 35)) ret = ret + ",<br>Increase base point gain by 1 and WNBP exponent by .01"
                        if (hasAchievement("a", 51)) ret = ret + ",<br>Increase the Where Did These Come From??? exponent by .02"
                        if (hasAchievement("a", 55)) ret = ret + ",<br>Reduce the Lucky Penny logarithm from ln to log2, effectively multiplying its effect by ~1.44x"
                        if (hasAchievement("a", 64)) ret = ret + ",<br>Remove the divisor from Still Can't Afford Water"
                        ret = ret + ",<br>and unlocking various things"
                    }
                    return ret
                }]
            ]
        },
        "Pennies": {
            content: [
                ["display-text", function() {
                    let ret = "Your current investment is " + format(player.p.investment.points) + ". It is currently used to...<br>" 
                    ret = ret + "<br>Multiply point gain by " + format(upgradeEffect("p", 25)) + "x"
                    if (hasUpgrade("p", 32)) ret = ret + ",<br>Raise the base effect of Useless (1.25) to a power of " + format(upgradeEffect("p", 32))
                    if (hasUpgrade("p", 33)) ret = ret + ",<br>Multiply the point limit of Useless (initially 1e6) by " + format(upgradeEffect("p", 33)) + "x"
                    if (hasUpgrade("p", 34)) ret = ret + ",<br>Increase the WNBP limit exponent by +" + format(upgradeEffect("p", 34))
                    if (hasUpgrade("p", 44)) ret = ret + ",<br>Multiply penny gain by " + format(upgradeEffect("p", 44)) + "x"
                    return ret
                }],
                "blank",
                ["display-text", function() {
                    if (!hasUpgrade("p", 42)) return ""
                    let ret = "Your current expansion investment is " + format(player.p.investment2.points) + ". It is currently used to...<br>"
                    ret = ret + "<br>Multiply penny, expansion, and point gain by " + format(upgradeEffect("p", 42)) + "x"
                    if (hasUpgrade("p", 43)) {
                        let boost = upgradeEffect("p", 42)
                        if (hasUpgrade("p", 53)) boost = boost.mul(upgradeEffect("p", 53))
                        ret = ret + ",<br>Multiply investment gain by " + format(boost)
                    }
                    if (hasUpgrade("p", 45)) ret = ret + ",<br>Multiply PTS (see Taxes) by " + format(upgradeEffect("p", 42)) + "x"
                    if (player.s.unlocked) ret = ret + ",<br>Multiply stored investment/stored expansion gain by " + format(upgradeEffect("p", 42).pow(.25)) + "x"
                    return ret
                }]
            ]
        },
        "Expansions": {
            content: [
                ["display-text", function() {
                    let ret = "Your current expansions is " + format(player.e.points) + ". It is currently used to...<br>"
                    if (hasUpgrade("e", 12)) ret = ret + "<br>Increase WNBP limit exponent by " + format(upgradeEffect("e", 12), 4)
                    return ret
                }], 
                "blank",
                ["display-text", function() {
                    let ret = "Your current penny expansions is " + format(player.e.penny_expansions.points) + ". It is currently used to...<br>"
                    if (hasUpgrade("p", 53)) ret = ret + "<br>Multiply investment gain by " + format(upgradeEffect("p", 53)) + "x"
                    if (hasUpgrade("p", 54)) ret = ret + ",<br>Multiply penny gain by " + format(upgradeEffect("p", 54))
                    return ret
                }]
            ],
            unlocked:() => player.e.unlocked
        }
    }
})