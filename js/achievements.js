addLayer("a", {
    symbol: "A",
    position: 0,
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
                if (player.p.investment.points.gt(decimalZero)) return true
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
            tooltip: "Have 3e9 points and 14 upgrades (row 1, row 2, 4 in row 3) at the same time<br><br>Unlock the fifteenth penny upgrade, more achievements, and milestones",
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
                if (this.unlocked() && investmentGain().gte(2000)) return true
            },
            tooltip: "Reach 2000 investment earned in a single investment reset",
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
            tooltip: "Gain 13 penny expansions with a highest points ever (reset to 0 by storing expansions) that is less than 5e10",
            unlocked:() => hasAchievement("a", 51)
        },
        55: {
            name: "25",
            done() {
                let investment2Limit = (1.03**player.s.stored_expansion.points.add(1).log2())**5
                if (this.unlocked() && !hasUpgrade("p", 35) && player.p.investment.points.eq(0) && player.p.investment2.points.lte(investment2Limit) && player.p.points.gte(7.77e6)) return true
            },
            tooltip: `Reach 7.77 million pennies without gaining normal investment after storing your investment
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
                if (this.unlocked() && player.p.points.gte(5e14)) return true
            },
            tooltip: "Become a multi-trillionaire (reach 5e14 pennies)",
            unlocked:() => hasMilestone("a", 5)
        },
        62: {
            name: "27",
            done() {
                if (this.unlocked() && hasUpgrade("p", 45)) return true
            },
            tooltip: "Purchase the penny upgrade I Want To Break Free!",
            unlocked:() => hasMilestone("a", 5)
        },
        63: {
            name: "28",
            done() {
                if (this.unlocked() && player.s.high_scores[11].points.gte(1e6)) return true
            },
            tooltip: "Complete the Investment Challenge at least once<br><br>Unlock two Focused Production clickables",
            unlocked:() => hasMilestone("a", 5),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        64: {
            name: "29",
            done() {
                if (this.unlocked() && inChallenge("s", 11) && player.p.points.gte(10000)) return true
            },
            tooltip: `Reach 100 dollars (10000 Pennies) while in the Investment Challenge"
                <br><br>Remove divisor from Still Can't Buy Water`,
            unlocked:() => hasMilestone("a", 5),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        65: {
            name: "30",
            done() { return false }, // Handled by Store Expansion clickable
            tooltip: "Store Expansions with less current expansion investment than your maximum kept expansion investment (see Stored Expansion effects)",
            unlocked:() => hasMilestone("a", 5)
        },
        71: {
            name: "31",
            done() {
                return (this.unlocked() && pennyTaxStart().gte("8e7") && player.s.stored_investment.points.gte(1e9))
            },
            tooltip: `Make taxes start at 80 million pennies rather than 1 million pennies and reach 1e9 Stored Investment
                <br><br>Unlock a row of penny upgrades that are kept and unlock more achievement milestones`,
            unlocked:() => hasMilestone("s", 3),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        72: {
            name: "32",
            done() {
                return (this.unlocked() && player.p.investment.points.eq(0) && player.p.points.gte(5e14))
            },
            tooltip: "Become a multi-trillionaire (5e14 Pennies) with 0 investment",
            unlocked:() => hasMilestone("s", 3)
        },
        73: {
            name: "33",
            done() {
                return (this.unlocked() && player.p.investment2.points.eq(tmp.p.buyables[12].hardcap))
            },
            tooltip: "Reach the expansion investment hardcap<br><br>Unlock storage upgrades and more storage milestones",
            unlocked:() => hasMilestone("s", 3),
            style() {
                return {
                "border-color": "blue",
                "border-width": "5px"
                }
            }
        },
        74: {
            name: "34",
            done() {
                return (this.unlocked() && inChallenge("s", 11) && player.p.investment.points.gt(0))
            },
            tooltip: "Gain investment in the Investment challenge",
            unlocked:() => hasMilestone("s", 3)
        },
        75: {
            name: "35",
            done() {
                return (this.unlocked() && challengeCompletions("s", 12) > 1)
            },
            tooltip: "Complete the Expansion Challenge twice",
            unlocked:() => hasMilestone("s", 3)
        }
    },
    milestones: {
        0: {
            requirementDescription: "10 Achievements Finished",
            effectDescription: "Multiply WNBP limit based on how far away it is from 1e10 points (~1.5x)",
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
            effectDescription: "There's A Coin For This? and Seriously? have the same exponent/effect and unlock more achievements and storage milestones",
            done() { return player.a.achievements.length >= 25 },
            unlocked:() => hasAchievement("a", 51)
        },
        6: {
            requirementDescription: "28 Achievements Finished",
            effectDescription:() => {
                let ret = "Multiply expansion investment gain by 1.01<sup>milestones + achievements - 28</sup> "
                    + "but multiply the Penny Expansion row 4 static multiplier by 1.6x<br>Currently: "
                ret = ret + format(1.01**(player.a.milestones.length+player.a.achievements.length-28), 4)
                return ret
            },
            done() { return player.a.achievements.length >= 28 },
            unlocked:() => hasAchievement("a", 51)
        },
        7: {
            requirementDescription: "32 Achievements Finished",
            effectDescription: "We Need Bigger Pockets base point effect is increased by 1 (initially 10)",
            done() { return this.unlocked() && player.a.achievements.length >= 32 },
            unlocked:() => hasAchievement("a", 71)
        },
        8: {
            requirementDescription: "35 Achievements Finished",
            effectDescription:() => { return "Gain (1 + Achievements/1000)x more Reset Time<br>Currently: "
                + format(1 + player.a.achievements.length/1000, 3) + "x" },
            done() { return this.unlocked && player.a.achievements.length >= 35 },
            unlocked:() => hasAchievement("a", 71)
        }
    },
    tabFormat: {
        "Achievements": {
            content: [
                ["display-text", function() { 
                    let totalAch = Object.entries(tmp.a.achievements).length-2
                    let ret = "You have completed "+ player.a.achievements.length + "/" + totalAch + " achievements"
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
                    let totalAch = Object.entries(tmp.a.achievements).length-2
                    let ret = "You have completed "+ player.a.achievements.length + "/" + totalAch + " achievements"
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