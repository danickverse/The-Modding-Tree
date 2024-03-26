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
    tooltip:() => player.a.achievements.length + " Achievements",
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
            tooltip: "Invest your pennies once",
            unlocked:() => hasUpgrade("p", 25)
        },
        14: {
            name: "4",
            done() {
                if (player.p.points.lt(1000000) && tmp.p.resetGain.gt(1000000)) return true
            },
            tooltip: "Reach 1 million pennies earned in one reset with less than 1 million current pennies",
            unlocked:() => hasUpgrade("p", 25)
        },
        15: {
            name: "5",
            done() {
                if (hasUpgrade("p", 23) && player.p.points.gt(1000) && tmp.pointGen.gt(upgrade23Limit())) return true
            },
            tooltip: "Gain more points in a single second than you are allowed to have<br>(Must have > 1000 Pennies)",
            unlocked:() => hasUpgrade("p", 25)
        },
        21: {
            name: "6",
            done() {
                check = new Decimal("3e9")
                if (player.p.upgrades.length >= 14 && upgrade23Limit().gte(check) && player.points.gte(check)) return true
            },
            tooltip: "Reach 3e9 points and 14 upgrades (row 1, row 2, 4 in row 3)<br><br>Unlock the fifteenth penny upgrade, more achievements, and milestones",
            unlocked:() => hasUpgrade("p", 25),
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
                if (this.unlocked() && hasAchievement("a", 22) && player.p.investment.points.gt(0)) return true
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
                if (this.unlocked() && player.a.achievements.length >= 9 && player.p.investment.points.lt(2) 
                        && player.p.points.gte(new Decimal("1.6e6"))) return true
            },
            tooltip: `Unlock 9 achievements and reach 1.6 million pennies with < 2 investment
                <br><br>Multiply investment gain by 2 and unlock more achievements`,
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
                if (this.unlocked() && player.p.upgrades.length >= 15 && upgrade23Limit().gte("1e10") 
                        && player.highestPointsEver.gte("1e10") && player.p.investment.points.gte(50)) return true
            },
            tooltip: "Unlock Expansions at 1e10 points, 50 investment, and 15 upgrades",
            unlocked:() => hasAchievement("a", 25),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        32: {
            name: "12",
            done() {
                if (this.unlocked() && player.p.investment.points.gte(100)) return true
            },
            tooltip: "Reach 100 Investment<br>Multiplies expansion gain by 1.1",
            unlocked:() => hasAchievement("a", 31),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        33: {
            name: "13",
            done() {
                if (this.unlocked() && tmp.e.getResetGain.gte(.106)) return true
            },
            tooltip: "Reach a rate of .106 Expansions per second",
            unlocked:() => hasAchievement("a", 31)
        },
        34: {
            name: "14",
            done() {
                if (this.unlocked() && player.p.investment.points.lt(2) && player.p.points.gte(5e6)) return true
            },
            tooltip: "Reach 5 million pennies with < 2 investment<br><br>Multiplies expansion and investment gain by 1.1 and penny gain by 1.2",
            unlocked:() => hasAchievement("a", 31),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        35: {
            name: "15",
            done() {
                if (this.unlocked() && player.e.upgrades.length < 2 && player.p.points.gte("1.5e9")) return true
            },
            tooltip: `Reach 1.5 billion pennies with at most one expansion upgrade. How did you manage that?
                <br><br>Increase base point gain by 1 and WNBP exponent by .01`,
            unlocked:() => hasAchievement("a", 31),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        41: {
            name: "16",
            done() {
                if (this.unlocked() && player.e.everUpg23) return true
            },
            tooltip: "Force unlock WNBP :(",
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked
        },
        42: {
            name: "17",
            done() {
                if (this.unlocked() && player.p.points.gte(3e10) && tmp.pointGen.lt(upgrade23Limit())) return true
            },
            tooltip: "Gain less points in a single second than you are allowed to have... wait, what?<br>Requires 3e10 Pennies",
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked
        },
        43: {
            name: "18",
            done() {
                if (this.unlocked() && player.p.investment.points.eq(0) && player.p.points.gte(1e7)) return true
            },
            tooltip: "Reach 10 million pennies with 0 (normal) investment",
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked
        },
        44: {
            name: "19",
            done() {
                if (this.unlocked() && player.p.investment2.points.gte(1)) return true
            },
            tooltip: "Reach 1 Expansion Investment! How does this even work!<br><br>Multiply investment gain by 1.2",
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked,
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        45: {
            name: "20",
            done() {
                if (this.unlocked() && investmentGain().gt(1000)) return true
            },
            tooltip: "Reach 1000 investment earned in a single investment reset",
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked
        },
        51: {
            name: "21",
            done() {
                if (player.s.unlocked && player.a.achievements.length >= 20) return true
            },
            tooltip: `Unlock the Storage feature and complete 20 achievements<br><br>Unlock more achievements
                and increase the Where Did These Come From??? exponent by .02`,
            unlocked:() => hasUpgrade("e", 23) || player.s.unlocked,
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        52: {
            name: "22",
            done() {
                if (this.unlocked() && player.s.stored_investment.points.gt(0)) return true
            },
            tooltip: "Store investment at least one time",
            unlocked:() => hasAchievement("a", 51),
        },
        53: {
            name: "23",
            done() {
                if (this.unlocked() && player.s.stored_expansion.points.gt(0)) return true
            },
            tooltip: "Store expansions at least one time",
            unlocked:() => hasAchievement("a", 51),
        },
        54: {
            name: "24",
            done() {
                if (this.unlocked() && player.highestPointsEver.lt(5e10) && player.e.penny_expansions.points.gte(13)) return true
            },
            tooltip: "Gain 13 penny expansions with a highest points ever (see Expansions Formulas) that is less than 5e10",
            unlocked:() => hasAchievement("a", 51)
        },
        55: {
            name: "25",
            done() {
                if (this.unlocked() && player.p.investment.points.eq(0) && player.p.investment2.points.lte(1) && player.p.points.gte(7.77e6)) return true
            },
            tooltip: `Reach 7.77 million pennies with 0 normal investment and 1 or less expansion investment
                <br><br>Lucky Penny ln becomes log2`,
            unlocked:() => hasAchievement("a", 51),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        61: {
            name: "26",
            done() {
                if (this.unlocked() && player.p.points.gte(2e13)) return true
            },
            tooltip: "Reach 2e13 pennies",
            unlocked:() => hasMilestone("a", 5)
        },
        65: {
            name: "30",
            done() {
                return false
                if (this.unlocked() && pennyTaxStart().gte("1e8")) return true
            },
            tooltip: `(Not Implemented) Make taxes start at 1 million dollars rather than 1 million pennies
                <br><br>Unlock a penny upgrade`,
            unlocked:() => hasMilestone("a", 5),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "10 Achievements Finished",
            effectDescription: "Multiply WNBP limit based on how far away it is from 1e10 points",
            done() { return player.a.achievements.length >= 10 }
        },
        1: {
            requirementDescription: "15 Achievements Finished",
            effectDescription:() => {
                return "Multiply Penny Expansion gain by 1.05<sup>milestones</sup><br>Currently: " + format(1.05**player.a.milestones.length, 4)
            },
            done() { return player.a.achievements.length >= 15 },
            unlocked:() => player.e.unlocked
        },
        2: {
            requirementDescription: "18 Achievements Finished",
            effectDescription:"Increase Why Do These Matter??? base to 1.2",
            done() { return player.a.achievements.length >= 18 },
            unlocked:() => player.e.upgrades.length >= 5 || hasMilestone("a", 2)
        },
        3: {
            requirementDescription: "20 Achievements Finished",
            effectDescription: "Multiply Slightly Bigger Pockets effect by 1.5",
            done() { return player.a.achievements.length >= 20 },
            unlocked:() => player.e.upgrades.length >= 5 || hasMilestone("a", 3)
        },
        4: {
            requirementDescription: "22 Achievements Finished",
            effectDescription:() => {
                let ret = "Multiply investment and expansion gain by 1.1<sup>milestones - 3</sup><br>Currently: " 
                ret = ret + format(1.1 ** (player.a.milestones.length - 3)) + "x"
                return ret
            },
            done() { return player.a.achievements.length >= 22 },
            unlocked:() => hasAchievement("a", 51)
        },
        5: {
            requirementDescription: "25 Achievements Finished",
            effectDescription: "There's A Coin For This? and Seriously? have the same effect and unlock more achievements and storage milestones",
            done() { return player.a.achievements.length >= 25 },
            unlocked:() => hasAchievement("a", 51)
        }
    },
    tabFormat: {
        "Achievements": {
            content: [
                ["display-text", function() { 
                    let ret = "You have completed "+ player.a.achievements.length + "/27 achievements"
                    if (hasUpgrade("p", 21)) ret = ret + ", which multiplies point gain by " + format(upgradeEffect("p", 21)) + "x"
                    if (hasUpgrade("p", 35)) ret = ret + ", penny gain by " + format(upgradeEffect("p", 35)) + "x"
                    if (hasUpgrade("e", 24)) ret = ret + ", expansion/penny expansion gain by " + format(upgradeEffect("e", 24))
                    return ret
                }], 
                "blank", "blank",
                "achievements"
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { 
                    let ret = "You have completed "+ player.a.achievements.length + "/27 achievements"
                    if (hasUpgrade("p", 21)) ret = ret + ", which multiplies point gain by " + format(upgradeEffect("p", 21)) + "x"
                    if (hasUpgrade("p", 35)) ret = ret + ", penny gain by " + format(upgradeEffect("p", 35)) + "x"
                    if (hasUpgrade("e", 24)) ret = ret + ", expansion/penny expansion gain by " + format(upgradeEffect("e", 24))
                    return ret
                }],
                "blank", "blank",
                "milestones"
            ],
            unlocked:() => hasAchievement("a", 21)
        },
        "Info": {
            content: [
                ["display-text", function() {
                    let ret = "Achievements with a blue border have specific rewards<br>"
                    ret = ret + "<br>For the most part, achievements are primarily ordered by row and only loosely ordered by column. "
                    ret = ret + "You may complete some achievements in a row before others despite their left-to-right order. "
                    ret = ret + "However, if you find yourself moving on to/unlocking a new row of achievements before finishing the previous row, "
                    ret = ret + "it is likely that you can complete the achievements already available to you."
                    return ret
                }]
            ]
        }
    }
})