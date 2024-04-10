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
                    if (hasUpgrade("p", 43)) ret = ret + ",<br>Multiply investment gain by " + format(upgradeEffect("p", 42))
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
                    if (hasUpgrade("p", 53)) ret = ret + "<br>Multiply penny gain by " + format(upgradeEffect("p", 53))
                    return ret
                }]
            ],
            unlocked:() => player.e.unlocked
        }
    }
})