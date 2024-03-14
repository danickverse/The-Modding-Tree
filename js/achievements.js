addLayer("a", {
    symbol: "A",
    position: 1,
    startData() { 
        return {
            unlocked: true
        }
    },
    color: "yellow",
    row: "side",
    tooltip: "Achievements",
    achievements: {
        11: {
            name: "1",
            done() {
                if (player.p.upgrades.length >= 5) return true
            },
            tooltip: "Buy 5 Penny Upgrades"
        },
        12: {
            name: "2",
            done() {
                if (tmp.p.resetGain.gt(1000)) return true
            },
            tooltip: "Reach 1000 pennies earned in one reset"
        },
        13: {
            name: "3",
            done() {
                if (player.p.investment.points.gt(decZero)) return true
            },
            tooltip: "Invest your pennies once"
        },
        14: {
            name: "4",
            done() {
                if (player.p.points.lt(1000000) && tmp.p.resetGain.gt(1000000)) return true
            },
            tooltip: "Reach 1 million pennies earned in one reset with less than 1 million current pennies"
        },
        15: {
            name: "5",
            done() {
                if (hasUpgrade("p", 23) && player.p.points.gt(1000) && tmp.pointGen.gt(upgrade23Limit())) return true
            },
            tooltip: "Gain more points in a single second than you are allowed to have<br>(Must have > 1000 Pennies)"
        },
        21: {
            name: "6",
            done() {
                check = new Decimal("5e9")
                if (upgrade23Limit().gte(check) && player.points.gte(check)) return true
            },
            tooltip: "Reach 5e9 points<br>Unlock a new upgrade and more achievements",
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        22: {
            name: "7",
            done() {
                if (this.unlocked() && player.p.investment.points.eq(0)) return true
            },
            tooltip: "Perform a penny buyable respec",
            unlocked:() => hasAchievement("a", 21)
        },
        23: {
            name: "8",
            done() {
                if (this.unlocked() && hasAchievement("a", 22) && player.p.investment.points.gte(1)) return true
            },
            tooltip: "Invest your pennies again after performing a penny buyable respec",
            unlocked:() => hasAchievement("a", 21)
        },
        24: {
            name: "9",
            done() {
                if (this.unlocked() && player.p.points.gte(1000) && !hasUpgrade("p", 11)) return true
            },
            tooltip: "Reach 1000 pennies without Lucky Penny and with < 2 investment... traitor",
            unlocked:() => hasAchievement("a", 21)
        },
        25: {
            name: "10",
            done() {
                if (this.unlocked() && player.a.achievements.length >= 9 && player.p.investment.points.lt(new Decimal("2")) && player.p.points.gte(new Decimal("2e6"))) return true
            },
            tooltip: "Unlock 9 achievements and reach 2 million pennies with < 2 investment<br>Multiplies investment gain by 2 and unlocks more achievements",
            unlocked:() => hasAchievement("a", 21),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        31: {
            name: "11",
            done() {
                if (this.unlocked() && player.e.unlocked) {
                    return true
                }
            },
            tooltip: "Unlock Expansions at 1e10 points",
            unlocked:() => hasAchievement("a", 25)
        }
    },
    tabFormat: {
        "Achievements": {
            content: [
                "blank",
                ["display-text", function() { 
                    let ret = "You have completed "+ player.a.achievements.length + " achievements"
                    if (hasUpgrade("p", 21)) ret = ret + ", which boosts point gain by " + format(upgradeEffect("p", 21)) + "x"
                    if (hasUpgrade("p", 35)) ret = ret + " and penny gain by " + format(upgradeEffect("p", 35)) + "x"
                    ret = ret + "<br>Achievements with a blue border have specific rewards"
                    return ret
                }], 
                "blank", "blank",
                "achievements"
            ]
        }
    }
})