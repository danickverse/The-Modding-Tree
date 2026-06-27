addLayer("sl", {
    symbol: "SL",
    row: "side",
    position: 2,
    type: "none",
    color: "purple",
    tooltip: "Sluggish",
    resource: "temporal energy",
    startData() {
        return {
            unlocked: true,
            minTickLength: 10,
            upgradeMenu: "Temporal Energy",
            achievementMenu: "Achievements",
            points: decimalZero,
            best: decimalZero,
            total: decimalZero,
            maxPoints: decimalZero,
            maxLayer: 0,
            inChallenge: false,
            inSluggishTab: false,
            clockMade: false,
            shopDisplay: "Hover over a shop item for more information",
            layer: 0,
            clocks: {
                "clock1": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock2": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock3": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock4": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock5": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock6": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
                "clock7": {times: 0, timer:0, cenergy:decimalOne, breakdownStep:0, focus:"prod", prod: decimalZero, speed: decimalZero, bonus:decimalZero},
            },
            windup: {
                points: decimalZero,
                cursorInside: false,
                energy: decimalZero,
                passiveStep: 0,
                everHovered: false
            },
            achievementPoints: decimalZero,
            achievementPurchases: 0
        }
    },
    deactivated() {
        return player.sl.inChallenge
    },
    layerShown() {
        return player.sl.inChallenge
    },
    challenge: {
        gain() {
            let ret = player.sl.clocks["clock1"].cenergy
            ret = ret.mul(tmp.sl.challenge.clocks["clock1"].prod)
            ret = ret.mul(tmp.sl.challenge.bonus)
        
            return ret
        },
        bonus() {
            let ret = decimalOne
            for (let clock in player.sl.clocks) {
                ret = ret.mul(tmp.sl.challenge.clocks[clock].bonus)
            }
            if (hasAchievement("sl", 12)) ret = ret.mul(achievementEffect("sl", 12))
            if (player.sl.inChallenge) {
                ret = ret.mul(gridEffect("sl", 101))
                ret = ret.mul(gridEffect("sl", 102)[0])
            }
            return ret
        },
        perSecond() {
            let tSlug = tmp.sl.challenge
            return tSlug.clocks["clock1"].speed.div(12).mul(tSlug.gain)
        },
        completions() {
            return Object.values(player.sl.challenges).reduce((a,b)=>a+b)
        },
        achievementPointGain() {
            return new Decimal(player.sl.achievements.length).pow(1.5)
        },
        clocks: {
            globalClockSpeedMult() {
                let ret = decimalOne
                if (hasUpg("tm", 212)) ret = ret.mul(upgEff("tm", 212))
                if (hasUpg("tm", 114)) ret = ret.mul(upgEff("tm", 114))
                if (tmp.sl.challenge.windup.unlocked) ret = ret.mul(tmp.sl.challenge.windup.effects.clockSpeed)
                return ret
            },
            clock1: {
                unlocked() { return true },
                prod() { 
                    return player.sl.clocks["clock1"].prod.div(12).add(1).root(1/2) 
                },
                speed() { 
                    let base = 1/10
                    let pointEff = player.sl.clocks["clock1"].speed.div(24).add(2).log(2)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock1"].bonus.add(1).log2().div(10).add(1)
                },
                breakdownRate() {
                    let rate = 1/60
                    return rate
                }
            },
            clock2: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock2"].prod.div(12).add(1).root(1/3).div(10**2)
                },
                speed() { 
                    let base = 1/50
                    let pointEff = player.sl.clocks["clock2"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock2"].bonus.add(1).log2().div(9).add(1)
                },
                breakdownRate() {
                    let rate = 1/72
                    return rate
                }
            },
            clock3: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock3"].prod.div(12).add(1).root(1/4).div(10**4)
                },
                speed() { 
                    let base = 1/144
                    let pointEff = player.sl.clocks["clock3"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock3"].bonus.add(1).log2().div(8).add(1)
                },
                breakdownRate() {
                    let rate = 1/90
                    return rate
                }
            },
            clock4: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock4"].prod.div(12).add(1).root(1/5).div(10**6)
                },
                speed() { 
                    let base = 1/350
                    let pointEff = player.sl.clocks["clock4"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock4"].bonus.add(1).log2().div(7).add(1)
                },
                breakdownRate() {
                    let rate = 1/120
                    return rate
                }
            },
            clock5: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock5"].prod.div(12).add(1).root(1/6).div(10**8)
                },
                speed() { 
                    let base = 1/666
                    let pointEff = player.sl.clocks["clock5"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock5"].bonus.add(1).log2().div(6).add(1)
                },
                breakdownRate() {
                    let rate = 1/180
                    return rate
                }
            },
            clock6: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock6"].prod.div(12).add(1).root(1/7).div(10**10)
                },
                speed() { 
                    let base = 1/1500
                    let pointEff = player.sl.clocks["clock6"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock6"].bonus.add(1).log2().div(5).add(1)
                },
                breakdownRate() {
                    let rate = 1/270
                    return rate
                }
            },
            clock7: {
                unlocked() { return false },
                prod() { 
                    return player.sl.clocks["clock7"].prod.div(12).add(1).root(1/8).div(10**12)
                },
                speed() { 
                    let base = 1/7500
                    let pointEff = player.sl.clocks["clock7"].speed.div(120).add(2).log(2).mul(base)
                    return pointEff.mul(base).mul(tmp.sl.challenge.clocks.globalClockSpeedMult)
                },
                bonus() { 
                    return player.sl.clocks["clock7"].bonus.add(1).log2().div(4).add(1)
                },
                breakdownRate() {
                    let rate = 1/600
                    return rate
                }
            }
        },
        windup: {
            unlocked() {
                return hasUpg("tm", 214)
            },
            gain() {
                let ret = new Decimal(0.01)
                ret = ret.mul(player.sl.windup.energy)
                return ret
            },
            cap() {
                let ret = decimalZero
                if (hasUpg("tm", 214)) ret = ret.add(upgEff("tm", 214))
                if (hasUpg("tm", 215)) ret = ret.add(upgEff("tm", 215))
                if (hasUpg("tm", 221)) ret = ret.add(upgEff("tm", 221))

                return ret
            },
            pointLossRate() {
                let ret = 0.04
                return ret
            },
            energyGain() {
                let ret = new Decimal(.1)
                
                //if (hasUpg("tm", 215)) ret = ret.mul(upgEff("tm", 215)[1])
                return ret
            },
            energyLoss() {
                let loss = tmp.sl.challenge.windup.energyGain
                let passiveGain = loss.mul(player.sl.windup.passiveStep / 20).neg()
                let ret = loss.add(passiveGain)
                return ret
            },
            energyCap() {
                let ret = decimalOne
                if (hasUpg("tm", 115)) ret = ret.add(upgEff("tm", 115))
                
                return ret
            },
            energyMin() {
                let ret = tmp.sl.challenge.windup.energyCap.neg().mul(2)
                if (hasUpg("tm", 115)) ret = ret.add(upgEff("tm", 115))

                return ret
            },
            effects: {
                points() {
                    return player.sl.windup.points.div(20).add(1)
                },
                clockSpeed() {
                    return player.sl.windup.points.add(1).root(5)
                }
            }
        },
        breakdown: {
            unlocked() {
                return inSluggishLayer(2) && hasAchievement("tm", 13)
            }
        }
    },
    update(diff) {
        if (player.tm.isWarping || !player.tm.unlocked || !player.sl.inChallenge) return

        player.sl.achievementPoints = 
            player.sl.achievementPoints.add(tmp.sl.challenge.achievementPointGain.mul(diff))
        
        player.sl.inSluggishTab = player.tab == "sl" 
            && player.subtabs.sl.mainTabs == "Main"
            && player.subtabs.sl.sluggish == "Clocks"
        
        if (tmp.sl.challenge.windup.unlocked) {
            updateWindupPoints(diff)
            if (player.sl.inSluggishTab) {
                setupWindup()
                updateWindupStatDisplay()
            }
        }
        
        for (let clock in tmp.sl.challenge.clocks) {
            if (!tmp.sl.challenge.clocks[clock].unlocked) continue
            
            updateClock(clock, diff)
            
            if (!player.sl.inSluggishTab) continue

            updateClockStatDisplay(clock)
            setupClock(clock)
        }
        player.sl.clockMade = player.sl.inSluggishTab
        
    },
    grid: {
        resource: "AP",
        rows:() => shopRowsAvailable(this.layer), // If these are dynamic make sure to have a max value as well!
        maxRows: 5,
        cols: 6,
        getStartData(id) {
            if (id === undefined) return 
            return 0
        },
        // getUnlocked(id) { // Default
        //     return true
        // },
        getCanClick(data, id) {
            return player.sl.achievementPoints.gte(getShopItemCost(this.layer, id, data)) 
                    && data < getShopData(this.layer, id).maxLevels
        },
        onHold(data, id) { this.onClick(data, id) },
        onClick(data, id) {
            player.sl.achievementPoints = player.sl.achievementPoints.sub(this.getCost(data, id))
            player.sl.achievementPurchases++
            player.tm.grid[id]++
            updateShopDisplay(this.layer, id)
        },
        getEffect(data, id) {
            if (data === undefined) return
            return getShopItemEffect(this.layer, id, data)
        },
        getTitle(data, id) {
            return getShopData(this.layer, id).title
        },
        getDisplay(data, id) {
            return getShopItemDisplay(this.layer, id, data)
        },
        getCost(data, id) {
            if (data === undefined) return
            return getShopItemCost(this.layer, id, data)
        },
        getUnlocked(id) {
            if (id <= 102) return true
            else if (id <= 104) return false && inSluggishLayer(2)
            else if (id <= 106) return false && inSluggishLayer(3)
            throw Error("Invalid id:", id)
            // switch (id) {
            //     case 101: return true
            //     case 102: case 103: case 104: case 105: case 106: return false
            //     default: throw Error("Invalid shop ")
            // }
        }
    },
    upgrades: {
        11: {
            title: "Work = More Power",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            branches: [21, 22]
        },
        12: {
            title: "Work = Work",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            branches: [22, 23, 24]
        },
        13: {
            title: "Nerfed Nerfs",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            branches: [24, 25]
        },
        21: {
            title: "A",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 11) }
        },
        22: {
            title: "B",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 11) && hasUpg("tm", 12) }
        },
        23: {
            title: "C",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 12)}
        },
        24: {
            title: "D",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 12) && hasUpg("tm", 13) }
        },
        25: {
            title: "E",
            description: "Placeholder",
            unlocked:() => tmp.sl.challenge.breakdown.unlocked,
            canAfford() { return hasUpg("tm", 13) }
        },
        111: {
            title: "Unsluggify",
            description: "Multiply penny gain by log10(Temporal Energy + 10)",
            cost: 10,
            effect:() => player.sl.points.add(10).log10(),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        112: {
            title: "Lightspeed",
            description: "Multiply point gain by log10(Temporal Energy + 10)<sup>2</sup>",
            cost: 10,
            effect:() => player.sl.points.add(10).log10().pow(2),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        113: {
            title: "Back Up to Speed",
            description: "Raise point gain to the power of (1 + log10(log10(Temporal Energy + 10)))<sup>.5</sup>",
            cost: 50,
            effect:() => player.sl.points.add(10).log10().log10().add(1).pow(.5),
            effectDisplay() { return `^${format(upgEff(this.layer, this.id))}` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        114: {
            title: "Back Up to Speed",
            description: "Multiply clock speed by 1 + log10(1 + Points) / 100",
            cost: 1000,
            effect:() => player.points.add(10).log10().div(100).add(1),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        115: {
            title: "Back Up to Speed",
            description: "Increase the Energy max and min values by 0.05 per TM achievement up to 20",
            cost: 2500,
            effect:() => Math.min(20, player.tm.achievements.length) * 0.05,
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.sl.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        121: {
            title: "The Power Within",
            description: "Sluggish Time<sup>Time Flux</sup> multiplies point/penny gain at a rate of ln(X)",
            cost: 100,
            effect:() => Math.log1p(player.tm.resetTime ** timeFlux()),
            effectDisplay() { return `${format(upgEff(this.layer, this.id))}x` },
            unlocked:() => player.sl.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        122: {
            title: "I Feel Badly That You Feel Badly",
            description:() => player.shiftDown ? "Caps at 100%"
                : "Every OoM of Temporal Energy adds 2% Penny generation<sup>*</sup>",
            cost: 5000,
            effect:() => player.sl.points.add(1).log10().floor().mul(.02).toNumber(),
            effectDisplay() { return `${upgEff(this.layer, this.id) * 100}%` },
            unlocked:() => tmp.sl.upgrades[121].unlocked,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        123: {
            title: "This Is Fine.",
            description: "Increase Investment Rate Exponent by log2(SL) / 30",
            cost: 150000,
            effect:() => Math.log2(player.sl.layer)/30,
            effectDisplay() { return `+${format(upgEff(this.layer, this.id))}` },
            unlocked:() => tmp.sl.upgrades[122].unlocked,
            currencyDisplayName: "temporal energy",
            currencyInternalName: "points",
            currencyLocation:() => player.sl
        },
        211: {
            title: "Lightspeed",
            description: "Increase point/penny gain by 25%/50% per Sluggish upgrade",
            cost: 10,
            effect:() => [1 + player.tm.upgrades.length / 4, 1 + player.tm.upgrades.length / 2],
            effectDisplay() { 
                let eff = upgEff(this.layer, this.id)
                return `${format(eff[0])}x, ${format(eff[1])}x` 
            },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
        },
        212: {
            title: "Elite Traveler",
            description: "Clocks are 1% faster per Sluggish upgrade",
            cost: 1337,
            effect:() => 1 + player.tm.upgrades.length / 100,
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "points",
            currencyInternalName: "points",
            currencyLocation:() => player
        },
        213: {
            title: "Synergy, my Beloved",
            description: "Multiply point gain by log10(Pennies + 10)",
            cost: 42,
            effect:() => player.p.points.add(10).log10(),
            effectDisplay() { return `${format(this.effect())}x` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
        },
        214: {
            title: "Rise and Grind",
            description:() => !hasUpg("tm", 214) ? "Purchase this upgrade to unlock the Windup mechanic" 
                : "Increase the Windup cap by log1000(Best Points)<sup>.25</sup>",
            cost: 100000,
            effect:() => player.best.max(1000).log(1000).pow(.25),
            effectDisplay() { return !hasUpg("tm", 214) ? "Does nothing" : `+${format(this.effect())}` },
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "points",
            currencyInternalName: "points",
            currencyLocation:() => player
        },
        215: {
            title: "Early Worm Gets the Bird",
            description: "Increase Windup cap by .02 per Sluggish upgrade",
            cost: 5,
            effect:() => player.tm.upgrades.length / 50,
            effectDisplay:() => `+${format(upgEff("tm", 215))}`,
            unlocked:() => hasUpg("tm", 214) || player.sl.inChallenge && inSluggishLayer(2),
            currencyDisplayName: "investment",
            currencyInternalName: "points",
            currencyLocation:() => player.p.investment
        },
        221: {
            title: "Prime Time",
            description:() => player.shiftDown ? "Softcap at 50 levels<br>Excess &#8658; Excess<sup>.5</sup>"
                : "Every Education I/II level<sup>*</sup> increases Windup Cap by .023",
            cost: 2005001,
            effect() {
                let x = getBuyableAmount("p", 21).add(getBuyableAmount("p", 22))
                if (x.gt(50)) x = x.sub(50).pow(.5).add(50)
                return x.mul(.023)
            },
            effectDisplay:() => `+${format(upgEff("tm", 221))}`,
            unlocked:() => tmp.sl.upgrades[215].unlocked,
            currencyDisplayName: "pennies",
            currencyInternalName: "points",
            currencyLocation:() => player.p
        },
        311: {
            title: "Temporal Expansion",
            description: "Unlock the 2nd Clock!",
            cost: 1,
            unlocked:() => player.sl.inChallenge,
            currencyDisplayName: "expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e
        }
    },
    achievements: {
        11: {
            name: "1",
            done() {
                return player.sl.clocks["clock1"].prod.gte(12)
                    && player.sl.clocks["clock1"].speed.gte(12)
                    && player.sl.clocks["clock1"].bonus.gte(12)
            },
            tooltip: `Gain 12 stat points in each of Production, Speed, and Bonus for the first clock
                <br><br>Multiply Point/Penny gain by 1.2x`,
            style: achTMStyle,
            effect() {
                return player.sl.inChallenge ? 1.2 : 1
            }
        },
        12: {
            name: "2",
            done() {
                return player.sl.inChallenge && player.p.investment.points.gt(0)
            },
            tooltip: `Gain any amount of investment
                <br><br>Gain 2x Temporal Energy`,
            style: achTMStyle,
            effect() {
                return player.sl.inChallenge ? 2 : 1
            }
        },
        13: {
            name: "3",
            done() {
                return player.sl.clocks.clock1.cenergy.gte(2)
            },
            tooltip: `Reach 2 or more Clock 1 Energy
                <br><br>Unlock the Breakdown feature if SL >= 2`,
            unlocked: () => inSluggishLayer(2),
            style: achTMStyle
        }
    },
    challenges: {
        11: {
            name: "Sluggish 1",
            id: 1,
            challengeDescription:() => `Raise all row 1 point/penny boosts ^0.5,
                investment rate exponent is 5x less, Tax starts 5x earlier per SL<sup>0.5</sup>, perform a penny buyable respec, and reset Penny/Expansion`,
            goalDescription() { return format(this.requirement) + " temporal energy" },
            rewardDescription:() => `Multiply point/penny gain based on total time played,
                and double offline time limit (7.5m --> 15m)`,
            rewardEffect() { 
                let ret = (player.timePlayed ** 0.03) * Math.log10(player.timePlayed + 1) ** .25
                let exp = buyableEffect("tm", 31)
                return exp.pow_base(ret)
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", 11), 2) + "x"
            },
            canComplete() {
                return player.sl.points.gte(this.requirement)
            },
            onEnter() {
                resetSluggish(on=true, layer=1, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=false, layer=1)
            },
            requirement: new Decimal(1e5)
        },
        12: {
            name: "Sluggish 2",
            challengeDescription:() => `Reset Storage, Time Flux is square rooted, and then divided by 1.5 per SL,
                and raise point/penny gain ^0.9 per SL after 1`,
            goalDescription() { return format(this.requirement) + " temporal energy" },
            rewardDescription:() => `Multiply Expansion gain by 1.25, unlock more Time Machine buyables
                and double offline time limit (15m --> 30m)`,
            rewardEffect() {
                // return challengeCompletions("tm", this.id) == 0 ? 1 : 1.25
                return 1.25
            },
            rewardDisplay() { 
                return format(challengeEffect("tm", this.id), 2) + "x"
            },
            canComplete() {
                return player.sl.points.gte(this.requirement)
            },
            onEnter() {
                resetSluggish(on=true, layer=2, max=this.requirement)
            },
            onExit() {
                resetSluggish(on=false, layer=2)
            },
            requirement: new Decimal(1e9),
            unlocked:() => player.tm.challenges[11] != 0 && hasAchievement("a", 51)
        }
        // 13: `Perform a Dollar reset, and Global Speed is divided by 2 per Sluggish challenge layer`
        // `Increase the base conversion rate by 1% per Sluggish challenge completed,
        //      and double offline time limit (30 --> 60m)`
        // 14: Unlocked in specks shop
    },
    tabFormat: {
        "Main" : {
            content: [
                ["display-text", () => 
                    `You have <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.sl.points)}</h2> temporal energy (+${format(tmp.sl.challenge.perSecond)}/s)<br>`
                ], "blank",
                ["microtabs", "sluggish"]
            ],
            unlocked:() => player.sl.inChallenge
        },
        "Info": {
            content: [
                ["display-text", () => 
                    `You are currently in Sluggish Layer (SL) <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${formatWhole(player.sl.layer)}</h2>`
                ], 
                "blank",
                ["microtabs", "information"]
            ]
        }
    },
    microtabs: {
        information: {
            "Sluggish": {
                content: [
                    "blank",
                    ["display-text", () => 
                        `Each clock's hand runs clockwise from 0 --> 12 (which loops back around to 0). 
                        Once a clock's hand reaches the 12th hour, it produces a certain currency.
                        The 6th Clock produces 5th Clock Clock Energy, the 5th produces 4th Clock Clock Energy, etc. down to the 1st Clock, which produces Temporal Energy.
                        The amount of currency (CE or TE) that a clock produces is directly based on its Clock Power.
                        <br><br>Everytime a clock's hand reaches another hour (1, 2, 3, etc.), 1 point is allocated to 1 of the clock's stats.
                        Each clock has exactly 3 stats: Speed, Production, and Bonus. Speed boosts the rate at which a clock's hand moves.
                        Production multiplies the currency produced by the clock.
                        Bonus provides an overall boost to Temporal Energy gain.
                        <br><br>Therefore, the total Temporal Energy gained when the 1st Clock reaches the 12th hour is based on:
                        <br><br>(<b>Clock Power</b> of <b>Clock 1</b>) * (<b>Production</b> of <b>Clock 1</b>) * (Product of all <b>Bonus</b>),
                        <br><br>which is then modified by any other factors that may be applied later on.
                        <br><br>When a Clock reaches its max speed (12 hours on the clock / second), you can perform a Clock Ascension.
                        Clock Ascensions reset the Clock's Production/Speed stats (Bonus is kept) and divide the Clock's base speed by 5,
                        but triple the stat points accumulated by the Clock and generate Ascension Points<br><br>
                        Temporal Energy per second:
                        <br><br>C1 Energy * C1 Prod * C1 Revolutions/s * Bonuses
                        <br>&#8658; ${format(player.sl.clocks["clock1"].cenergy)} * ${format(tmp.sl.challenge.clocks.clock1.prod)} * ${format(tmp.sl.challenge.clocks.clock1.speed.div(12))} * ${format(tmp.sl.challenge.bonus)}
                        <br>&#8658; +${format(tmp.sl.challenge.perSecond)}/s`
                    ],
                    "blank"
                ]
            },
            "Windup": {
                content: [
                    "blank",
                    ["display-text", 
                        `The Windup feature is used to buff various stats across the game`
                    ],
                    "blank"
                ]
            }
        },
        sluggish: {
            "Clocks": {
                content: [
                    "blank",
                    ["display-text", 
                        () => sluggishClocksDisplay()
                    ],
                    "blank"
                ]
            },
            "Upgrades": {
                content: [
                    "blank",
                    ["drop-down", ["upgradeMenu", () => availableTMUpgrades()]],
                    "blank",
                    () => displayTMUpgrades(),
                    //["upgrades", () => displayTMUpgrades()],
                    "blank"
                ],
                style() {
                    return {
                        "padding-left":"20px",
                        "padding-right":"20px"
                    }
                }
            },
            "Achievements": {
                content: [
                    "blank",
                    ["display-text", () => 
                    `You have <h2 style="color: magenta; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${format(player.sl.achievementPoints)}</h2> achievement points (+${format(tmp.sl.challenge.achievementPointGain)}/s)<br>`
                    ], "blank",
                    ["display-text", "TM (Sluggish) achievements/achievement upgrades (AUs) are permanently kept, but their effects only apply inside of the Sluggish challenge"],
                    "blank",
                    ["drop-down", ["achievementMenu", ["Achievements", "Achievement Upgrades"]]],
                    "blank",
                    () => displayAchTab(),
                    "blank"
                ]
            }
        }
    }
})