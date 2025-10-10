function visibleAchievements(showAchPhase) {
    if (showAchPhase == 1) return [1, 2, 3, 4, 5, 6, 7]
    if (showAchPhase == 2) return [8, 9, 10, 11, 12, 13]
}

function visibleMilestones(showAchPhase) {
    if (showAchPhase == 1) return [0, 1, 2, 3, 4, 5, 6, 7, 8]
    if (showAchPhase == 2) return [9, 10, 11, 12, 13]
}

const achBlueStyle = {
    "border-color": "blue",
    "border-width": "5px"
}

const achRedStyle = {
    "border-color": "red",
    "border-width": "5px"
}

const achTMStyle = {
    "border-color": "magenta",
    "border-width": "5px"
}

addLayer("a", {
    symbol: "A",
    position: 0,
    startData() { 
        return {
            unlocked: true,
            showAchPhase: 1
        }
    },
    color: "yellow",
    row: "side",
    tooltip:() => `${player.a.achievements.length}/${Object.entries(tmp.a.achievements).length-2} Achievements`,
    doReset(layer) {
        if (layer == "sys") {
            // handle achievements
            let keptAchs = new Set([11, 21, 22, 23, 31, 51])
            if (hasMilestone("sys", 1)) {
                for (i = 1; i <= Math.min(player.sys.milestones.length, 7); i++) {
                    for (j = 1; j <= 5; j++) {
                        let achIndex = i*10 + j
                        keptAchs.add(achIndex)
                    }
                }
                //console.log(keptAchs)
            }
            function achFilter(id) {
                return id > 80// || keptAchs.has(Number(id))
            }
            player.a.achievements = player.a.achievements.filter(achFilter)
            // new line below!
            player.a.achievements = player.a.achievements.concat([...keptAchs])

            // handle milestones
            function milestoneFilter(index) {
                //console.log(`${index}: ${tmp.a.milestones[index].done()}`)
                return index >= 8 || index == 5 || tmp.a.milestones[index].done()
            }
            player.a.milestones = player.a.milestones.filter(milestoneFilter)
        }
    },
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
            unlocked:() => hasUpg("p", 25)
        },
        14: {
            name: "4",
            done() {
                if (player.p.points.lt(1000000) && tmp.p.resetGain.gt(1000000)) return true
            },
            tooltip: "Reach 1 million pennies earned in one reset with less than 1 million current pennies",
            unlocked:() => hasUpg("p", 25)
        },
        15: {
            name: "5",
            done() {
                if (hasUpg("p", 23) && player.p.points.gt(1000) && tmp.pointGen.gt(upgrade23Limit())) return true
            },
            tooltip: "Gain more points in a single second than you are allowed to have<br>(Must have > 1000 Pennies)",
            unlocked:() => hasUpg("p", 25)
        },
        21: {
            name: "6",
            done() {
                check = new Decimal("3e9")
                if (player.p.upgrades.length >= 14 && upgrade23Limit().gte(check) && player.points.gte(check)) return true
            },
            tooltip: "Have 3e9 points and 14 upgrades (row 1, row 2, 4 in row 3) at the same time<br><br>Unlock the fifteenth penny upgrade, more achievements, and milestones",
            unlocked:() => hasUpg("p", 25),
            style: achBlueStyle
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
                if (this.unlocked() && player.p.points.gte(1000) && !hasUpg("p", 11)) return true
            },
            tooltip: "Reach 1000 pennies without Lucky Penny and with < 2 investment... traitor",
            unlocked:() => hasAchievement("a", 21)
        },
        25: {
            name: "10",
            done() {
                if (this.unlocked() && player.p.investment.points.lt(2) 
                        && player.p.points.gte(new Decimal("1.6e6"))) return true
            },
            tooltip: `Reach 1.6 million pennies with < 2 investment
                <br><br>Multiply investment gain by 2`,
            unlocked:() => hasAchievement("a", 21),
            style: achBlueStyle
        },
        31: {
            name: "11",
            done() {
                if (this.unlocked() && player.p.upgrades.length >= 15 && upgrade23Limit().gte("1e10") 
                        && player.highestPointsEver.gte("1e10") && player.p.investment.points.gte(50)) return true
            },
            tooltip: "Unlock Expansions and the Time Machine at 1e10 points, 50 investment, and 15 upgrades<br><br>Unlock more achievements and increase the WNBP exponent by .005",
            unlocked:() => hasAchievement("a", 21),
            style: achBlueStyle
        },
        32: {
            name: "12",
            done() {
                if (this.unlocked() && player.tm.challenges[11] == 1 && player.p.investment.points.gte(100)) return true
            },
            tooltip: "Complete Sluggish 1 and reach 100 Investment<br><br>Generate 1% of Pennies on reset per second per achievement in this row and the next",
            unlocked:() => hasAchievement("a", 31),
            style: achBlueStyle,
            effect() {
                let achComplete = 1 + [31,33,34,35,41,42,43,44,45].filter(
                    (value) => hasAchievement("a", value)
                ).length
                return 1/100 * achComplete
                // return 1/100 * (hasAchievement("a", 31) + 1 + hasAchievement("a", 33) + hasAchievement("a", 34) + hasAchievement("a", 35))
            }
        },
        33: {
            name: "13",
            done() {
                if (this.unlocked() && tmp.e.getResetGain.gte(.106)) return true
            },
            tooltip: "Reach a rate of .106 Expansions per second<br><br>Unlock more Expansion milestones",
            unlocked:() => hasAchievement("a", 31),
            style: achBlueStyle
        },
        34: {
            name: "14",
            done() {
                if (this.unlocked() && player.p.investment.points.lt(2) && player.p.points.gte(5e6)) return true
            },
            tooltip: "Reach 5 million pennies with < 2 investment<br><br>Multiplies expansion gain by 1.1 and penny and investment gain by 1.337",
            unlocked:() => hasAchievement("a", 31),
            style: achBlueStyle
        },
        35: {
            name: "15",
            done() {
                if (this.unlocked() && player.e.upgrades.length < 2 && player.p.points.gte("21e9")) return true
            },
            tooltip() {
                let ret = `Reach 21 billion pennies with at most 1 expansion upgrade. How did you manage that?`
                let eff = "<br><br>Multiply Time Flux by 1.02x and increase WNBP exponent by .01"
                if (this.effLocked()) return ret + "<s>" + eff + "</s>"
                return ret + eff
            },
            unlocked:() => hasAchievement("a", 31),
            effLocked:() => hasAchievement("a", 81) && hasAchievement("a", 94),
            style() {
                return this.effLocked() ? achRedStyle : achBlueStyle
            }
        },
        41: {
            name: "16",
            done() {
                if (this.unlocked() && player.e.everUpg23) return true
            },
            tooltip: "Force unlock WNBP :(",
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked
        },
        42: {
            name: "17",
            done() {
                return player.highestPointsEver.gte(1e17)
                // if (this.unlocked() && player.p.points.gte(3e10) && tmp.pointGen.lt(upgrade23Limit())) return true
            },
            tooltip: "Reach a Highest Points Ever of 1e17<br><br>Increase WNBP effect base by 2 (10 --> 12)",
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked,
            style: achBlueStyle
        },
        43: {
            name: "18",
            done() {
                if (this.unlocked() && player.p.investment.points.eq(0) && player.p.points.gte(1e7)) return true
            },
            tooltip: "Reach 10 million pennies with 0 (normal) investment",
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked
        },
        44: {
            name: "19",
            done() {
                if (this.unlocked() && player.p.investment2.points.gt(0)) return true
            },
            tooltip: "Gain any amount of Expansion Investment! How does this even work!<br><br>Multiply investment gain by 1.2",
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked,
            style: achBlueStyle
        },
        45: {
            name: "20",
            done() {
                return false
            },
            tooltip: "Gain over 1337 investment in a single investment reset",
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked
        },
        51: {
            name: "21",
            done() {
                if (player.s.unlocked || player.sys.unlocked && player.a.achievements.length >= 20) return true
            },
            tooltip: `Unlock the Storage feature and complete 20 achievements<br><br>Unlock more achievements,
                unlock Sluggish 2, and increase the Where Did These Come From??? exponent by .02`,
            unlocked:() => hasUpg("e", 23) || player.s.unlocked || player.sys.unlocked,
            style: achBlueStyle
        },
        52: {
            name: "22",
            done() {
                return this.unlocked() && player.s.stored_investment.points.gt(0) && player.s.stored_expansion.points.gt(0)
            },
            tooltip: "Store investment and expansion each at least one time",
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked,
        },
        53: {
            name: "23",
            done() {
                return false // handled by penny.js --> update(diff) to unlock TM
            },
            tooltip: `Reach 1e12 pennies with at most 8 Penny upgrades`,
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked
        },
        54: {
            name: "24",
            done() {
                if (this.unlocked() && player.highestPointsEver.lt(5e10) && player.e.penny_expansion.points.gte(13)) return true
            },
            tooltip: "Gain 13 penny expansions with a highest points ever (reset to 0 by storing expansions) that is less than 5e10",
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked
        },
        55: {
            name: "25",
            done() {
                let investment2Limit = (1.03**player.s.stored_expansion.points.add(1).log2())**5
                if (this.unlocked() && !hasUpg("p", 35) && player.p.investment.points.eq(0) && player.p.investment2.points.lte(investment2Limit) && player.p.points.gte(7.77e6)) return true
            },
            tooltip: `Reach 7.77 million pennies without gaining normal investment after storing your investment
                <br><br>Lucky Penny ln becomes log2`,
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked,
            style: achBlueStyle
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
                if (this.unlocked() && pennyTaxStart().gte(3e6)) return true
            },
            tooltip: "Raise the Penny Tax Start (PTS) value up to 3e6 Pennies",
            unlocked:() => hasMilestone("a", 5)
        },
        63: {
            name: "28",
            done() {
                if (this.unlocked() && player.s.high_scores[11].points.gte(1e6)) return true
            },
            tooltip: "Complete the Investment Challenge at least once<br><br>Unlock two Focused Production clickables",
            unlocked:() => hasMilestone("a", 5),
            style: achBlueStyle
        },
        64: {
            name: "29",
            done() {
                if (this.unlocked() && inChallenge("s", 11) && player.p.points.gte(10000)) return true
            },
            tooltip: `Reach 10000 Pennies while in the Investment Challenge
                <br><br>Remove divisor from Still Can't Buy Water`,
            unlocked:() => hasMilestone("a", 5),
            style: achBlueStyle
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
            unlocked:() => hasMilestone("s", 3) || player.sys.unlocked,
            style: achBlueStyle
        },
        72: {
            name: "32",
            done() {
                return (this.unlocked() && player.p.investment.points.eq(0) && player.p.points.gte(5e14))
            },
            tooltip: "Become a multi-trillionaire (5e14 Pennies) with 0 investment",
            unlocked:() => hasMilestone("s", 3) || player.sys.unlocked
        },
        73: {
            name: "33",
            done() {
                return (this.unlocked() && player.p.investment2.points.gte(5000))
            },
            tooltip: "Reach 5000 Expansion Investment<br><br>Unlock Storage upgrades and more Storage milestones",
            unlocked:() => hasMilestone("s", 3) || player.sys.unlocked,
            style: achBlueStyle
        },
        74: {
            name: "34",
            done() {
                return (this.unlocked() && inChallenge("s", 11) && player.p.investment.points.gt(0))
            },
            tooltip: "Gain investment in the Investment challenge",
            unlocked:() => hasMilestone("s", 3) || player.sys.unlocked
        },
        75: {
            name: "35",
            done() {
                return (this.unlocked() && challengeCompletions("s", 12) > 1)
            },
            tooltip: "Complete the Expansion Challenge twice",
            unlocked:() => hasMilestone("s", 3) || player.sys.unlocked
        },
        81: {
            name: "36",
            done() {
                return this.unlocked() && hasUpg("p", 55) && player.sys.points.gt(0)
            },
            tooltip: `Reset for Dollars
                <br><br>Unlock more achievements & milestones and Waste of Pocket Space
                effect is [Penny Upgrades] - 6, but nullify Ach 15`,
            unlocked:() => player.sys.unlocked,
            style: achBlueStyle
        },
        82: {
            name: "37",
            done() {
                return this.unlocked() && player.sys.upgrades.length >= 2
            },
            tooltip: `Buy 2 System upgrades<br><br>
                Buff the base conversion rate by 1% additive`,
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        83: {
            name: "38",
            done() {
                return this.unlocked() && getPointGen().gte(1e111)
            },
            tooltip: `Reach 1e111 points generated per second<br><br>
                Buff the base conversion rate by 1% additive`,
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        84: {
            name: "39",
            done() {
                return this.unlocked() && player.s.stored_dollars.points.gt(0)
            },
            tooltip: "Store dollars at least once<br><br>Buff the base conversion rate by 1% additive",
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        85: {
            name: "40",
            done() { return false }, // handled by expansion investment buyable
            tooltip: `Gain over 1337 Expansion Investment at once
                <br><br>Buff the base conversion rate by 2% additive and multiply all investment gain by 1.5x`,
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        91: {
            name: "41",
            done() {
                return this.unlocked() && player.quests.points.gte(15)
            },
            tooltip: `Complete 15 Quests`,
            unlocked:() => hasAchievement("a", 81)
        },
        92: {
            name: "42",
            done() {
                return this.unlocked() && player.p.investment.points.eq(0)
                    && player.s.stored_expansion.points.eq(0) && player.s.stored_investment.points.eq(0) 
                    && player.e.points.eq(0) && player.p.points.gte(3e7)
            },
            tooltip: `Reach 30 million pennies with 0 investment, 
                no resources in the Expansion layer, 
                and no stored investment or expansion<br><br>
                Have one more effective Apple Tree`,
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        93: {
            name: "43",
            done() { return false }, // handled by system.js --> onPrestige()
            tooltip: "Perform a System reset without completing the Investment Challenge",
            unlocked:() => hasAchievement("a", 81)
        },
        94: {
            name: "44",
            done() { return this.unlocked && player.p.points.gte(3.33e33) && player.e.upgrades.length <= 3 },
            tooltip: `Reach 3.33e33 Pennies with at most 3 Expansion upgrades. How did you manage that?
                <br><br>Reapply the effects of Ach 15`,
            unlocked:() => hasAchievement("a", 81),
            style: achBlueStyle
        },
        95: {
            name: "45",
            done() {
                return this.unlocked() && player.bills.totalEnemyKills >= 50
            },
            tooltip: "Beat up 50 orphans (you <i>monster</i>!)<br><br>Increase base loot gain by 5%",
            unlocked:() => hasMilestone("sys", 5),
            style: achBlueStyle
        },
        101: {
            name: "46",
            done() {
                return player.bills.zone % 10 == 0 && player.bills.currentEnemyKills > 0
            },
            tooltip: "Take down a beefy opponent for their loot<br><br>Unlock Automation in the Bills layer",
            unlocked:() => hasMilestone("sys", 5),
            style: achBlueStyle
        },
        102: {
            name: "47",
            done() { 
                return timeFlux() >= 2.5
            },
            tooltip: `Reach a Time Flux of 2.5`,
            unlocked:() => hasMilestone("a", 10)
        },
        103: {
            name: "48",
            done() {
                return this.unlocked() && getBuyableAmount("sys", 41).gte(1)
            },
            tooltip: "Buy an Apple Visionary",
            unlocked:() => hasMilestone("a", 10)
        },
        104: {
            name: "49",
            done() {
                return this.unlocked() && player.p.points.gte(1e90)
            },
            tooltip: `Reach 1e90 Pennies
                <br><br>Increase the WNBP effect base by 10 (15 -> 25)`,
            unlocked:() => hasMilestone("a", 10),
            style: achBlueStyle
        },
        105: {
            name: "50",
            done() {
                return this.unlocked() && hasUpgrade("bills", 22)
            },
            tooltip: "Purchase Scientific Exploration<br><br>Unlock a third Bills milestone and more achievement milestones",
            unlocked:() => hasMilestone("a", 10),
            style: achBlueStyle
        },
        111: {
            name: "51",
            done() {
                return this.unlocked() && player.banks.capital.points.gte(101) && player.p.points.gte(1e101)
            },
            tooltip: "Reach 101 Capital and 1e101 Pennies",
            unlocked:() => hasMilestone("a", 10)
        },
        112: {
            name: "52",
            done() { return false },
            tooltip: `Perform a System reset with at most 10 Education I ever<br><br>Education III is 1.5x cheaper
                and remove the exponent from Reverse Expansion!`,
            unlocked:() => hasMilestone("a", 10),
            style: achBlueStyle
        },
        113: {
            name: "53",
            done() { return player.s.high_scores[11].points.gte(1e100) },
            tooltip: `Reach a high score of 1e100 in the Investment Challenge`,
            unlocked:() => hasMilestone("a", 10)
        },
        114: {
            name: "54",
            done() { return getGridData("quests", 101) >= 1 },
            tooltip: "Purchase the Beginner Pack",
            unlocked:() => hasMilestone("a", 10)
        },
        115: {
            name: "55",
            done() { return false },
            tooltip: "Gain 20 Recharge at once",
            unlocked:() => hasMilestone("a", 10)
        }
    },
    milestones: {
        0: {
            requirementDescription: "10 Achievements Finished",
            effectDescription() { return player.shiftDown ? "Caps at 4e104 base limit"
                : `Multiply WNBP limit based on how far away it is from 1e10 points<sup>*</sup><br>Currently: ${format(this.effect())}x` },
            done() { return player.a.achievements.length >= 10 },
            effect() {
                let base = upgrade23LimitBase().min(4.2e104)
                if (base.lte(1e10)) return base.log10().neg().add(11).pow(2.6)
                
                let exp = base.div(1e10).log10().add(10).log10().mul(.5)
                return base.div(1e10).log10().add(1).pow(exp)
            }
        },
        1: {
            requirementDescription: "15 Achievements Finished",
            effectDescription:() => {
                return "Multiply Penny Expansion gain by 1.05<sup>milestones-1</sup><br>Currently: " + format(1.05**(player.a.milestones.length-1), 4)
            },
            done() { return player.a.achievements.length >= 15 },
            unlocked:() => player.e.unlocked
        },
        2: {
            requirementDescription: "18 Achievements Finished",
            effectDescription:"Increase Why Do These Matter??? base to 1.2",
            done() { return player.a.achievements.length >= 18 },
            unlocked:() => player.e.upgrades.length >= 5 || hasMilestone("a", 2)  || player.sys.unlocked
        },
        3: {
            requirementDescription: "20 Achievements Finished",
            effectDescription: "Multiply Slightly Bigger Pockets effect by 1.5",
            done() { return player.a.achievements.length >= 20 },
            unlocked:() => player.e.upgrades.length >= 5 || hasMilestone("a", 3)  || player.sys.unlocked
        },
        4: {
            requirementDescription: "22 Achievements Finished",
            effectDescription:() => {
                let ret = "Multiply investment and expansion gain by 1.1<sup>milestones - 3</sup><br>Currently: " 
                ret = ret + format(1.1 ** (player.a.milestones.length - 3)) + "x"
                return ret
            },
            done() { return player.a.achievements.length >= 22 },
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked
        },
        5: {
            requirementDescription: "25 Achievements Finished",
            effectDescription: "There's A Coin For This? and Seriously? have the same exponent/effect and unlock more achievements and storage milestones",
            done() { return player.a.achievements.length >= 25 },
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked || player.sys.unlocked
        },
        6: {
            requirementDescription: "28 Achievements Finished",
            effectDescription:() => {
                let ret = "Multiply expansion investment gain by 1.01<sup>achievements - 21</sup><br>Currently: "
                ret = ret + format(1.01**(player.a.achievements.length-21), 4)
                return ret
            },
            done() { return player.a.achievements.length >= 28 },
            unlocked:() => hasAchievement("a", 51) || player.sys.unlocked || player.sys.unlocked
        },
        7: {
            requirementDescription: "32 Achievements Finished",
            effectDescription: "We Need Bigger Pockets base point effect is increased by 3 (12 --> 15)",
            done() { return this.unlocked && player.a.achievements.length >= 32 },
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        8: {
            requirementDescription: "35 Achievements Finished",
            effectDescription:() => { return "Multiply Time Flux by (1 + Achievements<sup>1.5</sup>/1000)x<br>Currently: "
                + format(1 + player.a.achievements.length**1.5/1000, 3) + "x" },
            done() { return this.unlocked && player.a.achievements.length >= 35 },
            unlocked:() => hasAchievement("a", 71) || player.sys.unlocked
        },
        9: {
            requirementDescription: "40 Achievements Finished",
            effectDescription:() => `Multiply the conversion rate by 1.01x per achievement after 35<br>
                Currently: ${format(1.01 ** Math.max(0, player.a.achievements.length - 35), 4)}x`,
            done() { return this.unlocked && player.a.achievements.length >= 40 },
            unlocked:() => hasAchievement("a", 81)
        },
        10: {
            requirementDescription: "46 Achievements Finished",
            effectDescription:() => `Multiply loot gain by Achievements / 40 and unlock more achievements and milestones
                <br>Currently: ${player.a.achievements.length/40}x`,
            done() { return this.unlocked && player.a.achievements.length >= 46 },
            unlocked:() => hasAchievement("a", 81)
        },
        11: {
            requirementDescription: "50 Achievements Finished",
            effectDescription: "Raise System Expansion effect to ^1.1",
            done() { return this.unlocked && player.a.achievements.length >= 50 },
            unlocked:() => hasAchievement("a", 105)
        },
        12: {
            requirementDescription: "55 Achievements Finished",
            effectDescription: `Focused Production boosts no longer reset their state,
                remove negative effects from first four, and unlock two more`,
            done() { return this.unlocked && player.a.achievements.length >= 55 },
            unlocked:() => hasAchievement("a", 105)
        }
    },
    clickables: {
        11: {
            display() { 
                if (player.subtabs['a'].mainTabs == "Achievements") return "View achievements of the last phase"
                else return "View milestones of the last phase"
            },
            canClick() { return player.a.showAchPhase > 1 },
            onClick() { player.a.showAchPhase-- }
        },
        12: {
            display() { 
                if (player.subtabs['a'].mainTabs == "Achievements") return "View achievements of the next phase"
                else return "View milestones of the next phase"
            },
            canClick() { 
                // first condition to stop at last phase
                // second condition to check if next achievements are unlocked
                return player.a.showAchPhase < 2 
                    && tmp.a.achievements[10 * visibleAchievements(player.a.showAchPhase + 1)[0] + 1].unlocked
            },
            onClick() { player.a.showAchPhase++ }
        }
    },
    componentStyles: {
        "clickable"() { return {'font-size':'12px', 'min-height':'50px'} }
    },
    tabFormat: {
        "Achievements": {
            content: [
                ["display-text", function() { 
                    let totalAch = Object.entries(tmp.a.achievements).length-2
                    let ret = "You have completed "+ player.a.achievements.length + "/" + totalAch + " achievements"
                    if (hasUpg("p", 21)) ret = ret + ", which multiplies point gain by " + format(upgEff("p", 21)) + "x"
                    if (hasUpg("p", 35)) ret = ret + ", penny gain by " + format(upgEff("p", 35)) + "x"
                    if (hasUpg("e", 24)) ret = ret + ", expansion/penny expansion gain by " + format(upgEff("e", 24))
                    return ret
                }], 
                "blank", 
                () => tmp.a.achievements[81].unlocked ? "clickables" : "", 
                "blank",
                ["achievements", () => visibleAchievements(player.a.showAchPhase)] //["achievements", [1, 2, 3, 4, 5, 6, 7]]
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { 
                    let totalAch = Object.entries(tmp.a.achievements).length-2
                    let ret = "You have completed "+ player.a.achievements.length + "/" + totalAch + " achievements"
                    if (hasUpg("p", 21)) ret = ret + ", which multiplies point gain by " + format(upgEff("p", 21)) + "x"
                    if (hasUpg("p", 35)) ret = ret + ", penny gain by " + format(upgEff("p", 35)) + "x"
                    if (hasUpg("e", 24)) ret = ret + ", expansion/penny expansion gain by " + format(upgEff("e", 24))
                    return ret
                }],
                "blank", 
                () => tmp.a.achievements[81].unlocked ? "clickables" : "", 
                "blank",
                ["milestones", () => visibleMilestones(player.a.showAchPhase)]
            ],
            unlocked:() => hasAchievement("a", 21)
        },
        "Info": {
            content: [
                ["display-text", function() {
                    let ret = "Achievements with a blue border have specific rewards, while achievements with red borders "
                        + "have rewards that have been nullified by something in-game.<br>"
                        + "<br>For the most part, achievements are primarily ordered by row and only loosely ordered by column. "
                        + "You may complete some achievements in a row before others despite their left-to-right order. "
                        + "However, if you find yourself moving on to/unlocking a new row of achievements before finishing the previous row, "
                        + "it is likely that you can complete the achievements from that earlier row."
                    return ret
                }]
            ]
        }
    }
})