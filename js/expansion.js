addLayer("e", {
    symbol: "E",
    position: 3,
    startData() { return {
        unlocked: false,
        points: decimalZero,
        penny_expansions: {
            points: decimalZero
        },
        everUpg23: false
    }},
    color: "#FFFFFF",
    resource: "expansion",
    baseResource: "points",
    type: "custom",
    getResetGain() {
        let base = tmp.e.baseAmount
        let mult = tmp.e.gainMult
        return base.mul(mult)
    },
    prestigeButtonText(){ return "" },
    getNextAt() {return decimalZero},
    baseAmount() {
        let boost = decimalZero
        if (hasMilestone("s", 0) && (hasUpgrade("e", 11) || inChallenge("s", 12)) && player.s.stored_expansion.points.gt(0)) {
            // factorPercent = percent of upg effect that is used to increase base gain
            let boostPercent = tmp.s.stored_expansion.effects[2]
            boost = upgradeEffect("e", 11).mul(boostPercent).div(100)
            if (inChallenge("s", 12) && player.points.gt(decimalZero) && player.highestPointsEver.lt(1e10)) {
                //console.log(upgradeEffect("e", 11).mag)
                //throw new Error("")
                // ISSUE IS IN UPGRADE E11 SOMEHOW
                // would use incorrect effect for a single tick due to game loop order
                return boost
            }
        }

        if (player.highestPointsEver.lt(1e10)) return decimalZero
        let base = new Decimal(player.highestPointsEver.log10().log10().sub(1))
        return base.add(boost)
    },
    gainMult() {
        let ret = decimalOne
        if (hasUpgrade("e", 24)) ret = ret.mul(upgradeEffect("e", 24))
        if (hasUpgrade("p", 42)) ret = ret.mul(upgradeEffect("p", 42))

        if (hasAchievement("a", 32)) ret = ret.mul(1.1)
        if (hasAchievement("a", 34)) ret = ret.mul(1.1)
        if (hasMilestone("a", 4)) ret = ret.mul(1.1 ** (player.a.milestones.length - 3))

        if (getClickableState("e", 21)) ret = ret.mul(clickableEffect("e", 21))
        if (getClickableState("e", 22)) ret = ret.div(5)

        ret = ret.mul(tmp.s.stored_expansion.effects[1])

        ret = ret.mul(1.25**player.sys.milestones.length)
        ret = ret.mul(gridEffect("quests", 101))
        return ret
    },
    row: 0,
    layerShown() {
        let visible = false
        if (player.e.unlocked || hasAchievement("a", 31)) {
            player.e.unlocked = true
            visible = true
        }
        return visible
    },
    update(diff) {
        if (!player.e.unlocked) return

        let e = player.e
        let pE = e.penny_expansions
        //let dE = e.dollar_expansions
        let tmpE = tmp.e
        let tmpPE = tmpE.penny_expansions
        //let tmpDE = tmpE.dollar_expansions
        e.points = getLogisticAmount(e.points, tmpE.getResetGain, tmpE.lossRate, diff)
        pE.points = getLogisticAmount(pE.points, tmpPE.getResetGain, tmpPE.lossRate, diff)
        //dE.points = getLogisticAmount(dE.points, tmpDE.getResetGain, tmpDE.lossRate, diff)

    },
    automate() {
        if (hasMilestone("sys", 7)) {
            for (upg in tmp.e.upgrades) {
                let id = Number(upg)
                if (id > 100) break
                
                if (isPlainObject(tmp.e.upgrades[id]) && (layers.e.upgrades[id].canAfford === undefined || layers.e.upgrades[id].canAfford() === true))
                    buyUpg("e", id) 
            }
        }
    },
    canReset() {return false},
    lossRate() {
        let ret = .3 / 100
        return ret
    },
    penny_expansions: {
        getResetGain() {
            if (player.e.points.lessThan(decimalOne)) return decimalZero
            let ret = this.baseGain().times(this.gainMult()) // base gain
            if (getClickableState("e", 21)) ret = ret.div(5)
            if (getClickableState("e", 22)) ret = ret.mul(clickableEffect("e", 22))
            return ret
        },
        gainMult() {
            let ret = decimalOne
            if (hasUpgrade("e", 24)) ret = ret.times(upgradeEffect("e", 24))
            if (hasMilestone("a", 1)) ret = ret.times(1.05**player.a.milestones.length)
            if (tmp.s.challenges[12].unlocked) ret = ret.mul(challengeEffect("s", 12)[0])
            if (inChallenge("s", 12) && hasMilestone("s", 5)) ret = ret.mul(upgradeEffect("p", 14))
            ret = ret.mul(1.25**player.sys.milestones.length)
            if (hasUpgrade("sys", 24)) ret = ret * upgradeEffect("sys", 24)
            return ret
        },
        baseGain() {
            let divisor = new Decimal(200)
            if (hasMilestone("s", 4)) divisor = divisor.sub(tmp.s.stored_expansion.effects[6]) 
            let ret = new Decimal(player.e.points.div(divisor))
            if (hasUpgrade("e", 11)) ret = ret.add(upgradeEffect("e", 11))
            return ret
        },
        lossRate:() => {
            let ret = .01
            if (hasMilestone("s", 1)) ret = ret * 9 / 10
            if (hasUpgrade("sys", 24)) ret = ret * 10

            return ret
        }
    },
    upgrades: {
        11: {
            title: "It's Only Reasonable",
            description:() => {
                if (player.shiftDown) {
                    if (hasMilestone("sys", 2)) return "Uses Expansion Upgrades and System Upgrades<sup>2</sup>"
                    return "Uses Expansion Upgrades"
                }
                let ret = "Increases base penny expansion gain by "
                if (!hasUpgrade("e", 21)) ret = ret +  "log4(4 + Upgrades<sup>*</sup>) / 50"
                else if (!hasUpgrade("e", 31)) ret = ret + "ln(4 + Upgrades<sup>*</sup>) / 10"
                else if (!hasUpgrade("e", 41)) ret = ret + "ln(4 + Upgrades<sup>*</sup>) / 4"
                else ret = ret + "log2(4 + Upgrades<sup>*</sup>) * 5"
                return ret
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let upgCount = 4 + player.e.upgrades.length
                if (hasMilestone("sys", 2)) upgCount += player.sys.upgrades.length ** 2

                let ret
                if (hasUpgrade("e", 41)) ret = Decimal.log2(upgCount).mul(5)
                else if (hasUpgrade("e", 31)) ret = Decimal.ln(upgCount).div(4)
                else if (hasUpgrade("e", 21)) ret = Decimal.ln(upgCount).div(10)
                else ret = Decimal.log(upgCount, 4).div(50)

                if (inChallenge("s", 12)) ret = ret.min(5)

                return ret

                // let upgCount = player.e.upgrades.length
                // if (hasMilestone("sys", 2)) upgCount += player.sys.upgrades.length ** 2
                // if (!hasUpgrade("e", 21)) return new Decimal(Math.log(4 + upgCount)/Math.log(4)/50)
                // if (!hasUpgrade("e", 31)) return new Decimal(Math.log(4 + upgCount)/10)
                // if (!hasUpgrade("e", 41)) return new Decimal(Math.log(4 + upgCount)/4)
                // return new Decimal(Math.log2(4 + upgCount) * 5)
            },
            effectDisplay:() => "+" + format(upgradeEffect("e", 11))
        },
        12: {
            title: "Is This Even Worth It?",
            description:() => {
                let ret = "Increases WNBP limit exponent by Expansion"
                if (hasUpgrade("e", 42)) ret = ret + "<sup>.11</sup>"
                else ret = ret + "<sup>.1</sup>"
                if (!hasUpgrade("e", 22)) return ret + "/100"
                if (!hasUpgrade("e", 32)) return ret + "/10"
                if (!hasUpgrade("e", 42)) return ret + "/7.5"
                return ret + "/6"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let exp = .1
                let divisor = 100
                if (hasUpgrade("e", 22)) divisor = 10
                if (hasUpgrade("e", 32)) divisor = 7.5
                if (hasUpgrade("e", 42)) {
                    divisor = 6
                    exp = .11
                }
                let ret = player.e.points.pow(exp).div(divisor)
                return ret
            },
            effectDisplay:() => "+" + format(upgradeEffect("e", 12), 4)
        },
        13: {
            title: "Cheaper Education",
            description: "Unlocks the Education II buyable (Base Cost: 5e7 Pennies)",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions
        },
        14: {
            title: "These Actually Matter?",
            description:() => {
                let name = hasMilestone("a", 5) ? "There's A Coin For This?" : "Seriously"
                return "Increases " + name + " exponent from .2 -> .8"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).min(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: .8

        },
        15: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 1</h3></b>"
                let description = "Autobuy One Man's Trash, reduce its investment requirement to 1, autobuy 1 Education buyable every 2.5 seconds"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).min(16)) + " Penny Expansion"
                if (!(hasUpgrade("e", 11) && hasUpgrade("e", 12) && hasUpgrade("e", 13) && hasUpgrade("e", 14))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).min(16)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 11) && hasUpgrade("e", 12) && hasUpgrade("e", 13) && hasUpgrade("e", 14))
            },
            onPurchase() {
                player.p.autoBuyableCooldown = 0
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions
        },
        21: {
            title: "It's Even Reasonabler",
            description: "Reduces above upgrade's log4 to ln and reduce divisor to 10",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        22: {
            title: "GIVE ME MORE!!!",
            description: "Reduces divisor of upgrade above this one to 10",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        23: {
            fullDisplay:() => {
                let title = "<h3></b>It's Expandin' Time!</h3></b>"
                let description = "Unlocks the next row of Penny Upgrades & more achievements"
                if (!hasMilestone("sys", 4)) description += ", but permanently keep WNBP"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)) + " Penny Expansion"
                if (player.a.achievements.length < 15) requirement = requirement + ", 15 achievements"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)
                return player.e.penny_expansions.points.gte(cost) && player.a.achievements.length >= 15
            },
            onPurchase() {
                if (!hasMilestone("sys", 4)) {
                    player.e.everUpg23 = true
                    if (!hasUpgrade("p", 23)) player.p.upgrades.push(23)
                }
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        24: {
            title: "Why Do These Matter???",
            description:() => {
                if (!player.shiftDown) {
                    let ret = "Multiplies Expansion and Penny Expansion gain by 1."
                    if (inChallenge("s", 12)) ret = ret + "02"
                    else ret = ret + (!hasMilestone("a", 2) ? "1" : "2")
                    return ret + " per achievement<sup>*</sup> - 13"
                }
                return "Maxes out at 40 achievements"
            },
            cost:() => decimalOne.mul(2 ** player.e.upgrades.length).div(2).min(256).max(16),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            effect:() => {
                let ret = new Decimal("1.1")
                if (hasMilestone("a", 2)) ret = new Decimal("1.2")
                if (inChallenge("s", 12)) ret = new Decimal("1.02")
                return ret.pow(Math.min(player.a.achievements.length, 40)-13)
            },
            effectDisplay:() => format(upgradeEffect("e", 24)) + "x",
            unlocked:() => hasUpgrade("e", 15)
        },
        25: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 2</h3></b>"
                let description = "Autobuy two penny upgrades from the first three rows per second<sup>*</sup>"
                if (player.shiftDown) description = "Does not autobuy WNBP"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)) + " Penny Expansion"
                if (!(hasUpgrade("e", 21) && hasUpgrade("e", 22) && hasUpgrade("e", 23) && hasUpgrade("e", 24))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(2).min(256).max(16)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 21) && hasUpgrade("e", 22) && hasUpgrade("e", 23) && hasUpgrade("e", 24))
            },
            onPurchase() {
                player.p.autoUpgCooldown = .5
                // if (!hasUpgrade("p", 25)) player.p.upgrades.push(25)
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 15)
        },
        31: {
            title: "It's So Beautiful",
            description: "Reduce divisor of upgrade two rows above this one to 4",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        32: {
            title: "The Machine Is Hungry...",
            description: "Reduces divisor of upgrade two rows above this one to 7.5",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        33: {
            title: "We Should Get A Wallet",
            description: "Unlock Storage, but remove penny buyable respec; this upgrade is kept through respecs",
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            onPurchase() {
                player.s.unlocked = true
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 33) || hasUpgrade("e", 25)
        },
        34: {
            title: "Earning Your Pay",
            description:() => {
                let name = hasMilestone("a", 5) ? "There's A Coin For This?" : "Seriously"
                return "Increases " + name + " exponent  from .8 -> 1.8"
            },
            cost:() => decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256),
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            effect: 1.8,
            unlocked:() => hasUpgrade("e", 25)
        },
        35: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 3</h3></b>"
                let description = "Reduces investment cooldown by 5 seconds and autobuy Education buyables 2.5x faster"
                let requirement = "Requires: " + formatWhole(decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256)) + " Penny Expansion"
                if (!(hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e", 33) && hasUpgrade("e", 34))) requirement = requirement + ", 4 upgrades in this row"
                return title + "<br>" + description + "<br><br>" + requirement
            },
            canAfford:() => {
                let cost = decimalOne.mul(2**player.e.upgrades.length).div(4).min(4096).max(256)
                return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 31) && hasUpgrade("e", 32) && hasUpgrade("e", 33) && hasUpgrade("e", 34))
            },
            onPurchase() {
                if (!hasUpgrade("p", 35)) player.p.upgrades.push(35)
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 25)
        },
        41: {
            title: "It's Compassion Is Unmatched",
            description: "Multiply effect of upgrade three rows above this one by 20 and reduce its ln to log2",
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        42: {
            title: "Maximum Overdrive",
            description: `Reduce divisor of upgrade three rows above this to 6, increase exponent by .01, 
                apply to WNBP effect exponent at 6x efficiency`,
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        43: {
            fullDisplay:() => {
                let title = "<h3></b>The More The Better</h3></b>"
                let description = "Unlock a Storage challenge; this upgrade is also kept"
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                let cost = "Cost: " + format(decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))) + " Penny Expansion"
                if (player.s.milestones.length < 3) cost = "Requires 3 Storage Milestones"
                return title + "<br>" + description + "<br><br>" + cost
            },
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            canAfford:() => player.s.milestones.length >= 3,
            unlocked:() => hasUpgrade("e", 43) || hasUpgrade("e", 35)
        },
        44: {
            title: "It's Like A Reward",
            description: "Remove the +1 from There's A Coin From This, but remove the divisor and increase exponent to 2.2",
            cost:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                return decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
            },
            effect: 2.2,
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        45: {
            fullDisplay:() => {
                let title = "<h3></b>QOL 4</h3></b>"
                let description = !hasMilestone("sys", 5) ? `Double all Focused Production buffs, autobuy one more penny upgrade 
                    & 8x more buyables per second, autobuy from row 4` 
                    : "Triple all Focused Production buffs, autobuy 10x more buyables, and reduce investment cooldown by 2.5 seconds"
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult *= 1.6
                let requirement = "Requires: " + formatWhole(decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))) + " Penny Expansion"
                    
                return title + "<br>" + description + "<br><br>" + requirement
            },
            effect() { return !hasMilestone("sys", 5) ? 2 : 3 },
            canAfford:() => {
                let staticMult = 5
                if (hasMilestone("a", 6)) staticMult = staticMult * 1.6
                let cost = decimalOne.mul(staticMult**(player.e.upgrades.length-15)).max(decimalOne).mul(20000).min(new Decimal(81920000))
                return player.e.penny_expansions.points.gte(cost) //&& (hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))
            },
            onPurchase() {
                if (!hasUpgrade("p", 45)) player.p.upgrades.push(45)
            },
            currencyDisplayName: "Penny Expansion",
            currencyInternalName: "points",
            currencyLocation:() => player.e.penny_expansions,
            unlocked:() => hasUpgrade("e", 35)
        },
        // 55: {
        //     fullDisplay:() => {
        //         let title = "<h3></b>QOL 5</h3></b>"
        //         let description = "Unlock auto-investment and "
        //         let requirement = "Requires: " + formatWhole(decimalOne.mul(2**(player.e.upgrades.length-15)).max(decimalOne).mul(16000)) + " Penny Expansion"
        //         if (!(hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))) requirement = requirement + ", 4 upgrades in this row"
        //         return title + "<br>" + description + "<br><br>" + requirement
        //     },
        //     canAfford:() => {
        //         return false
        //         let cost = decimalOne.mul(2**(player.e.upgrades.length-15)).max(decimalOne).mul(20000)
        //         return player.e.penny_expansions.points.gte(cost) && (hasUpgrade("e", 41) && hasUpgrade("e", 42) && hasUpgrade("e", 43) && hasUpgrade("e", 44))
        //     },
        //     onPurchase() {
        //         if (!hasUpgrade("p", 45)) player.p.upgrades.push(45)
        //     },
        //     currencyDisplayName: "Penny Expansion",
        //     currencyInternalName: "points",
        //     currencyLocation:() => player.e.penny_expansions,
        //     unlocked:() => false && hasUpgrade("e", 45)
        // }
    },
    clickables: {
        11: {
            title: "Respec Upgrades",
            tooltip: "Does NOT return spent currency and forces an investment reset",
            onClick() {
                let confirmText = "Are you sure you want to respec? This does NOT return spent currency, forces an investment reset "
                    + "without rewarding currency, and could unnecessarily slow down progression if done at the wrong time!"
                let respecConfirm = confirm(confirmText)
                if (!respecConfirm) return
                investmentReset(false, false)
                function removeUpgrades(index) {
                    return index == 33 || index == 43
                }
                player.e.upgrades = player.e.upgrades.filter(removeUpgrades)
                if (!hasMilestone("sys", 0)) {
                    player.p.autoUpgCooldown = -1
                    player.p.autoBuyableCooldown = -1
                }
            },
            canClick() {
                return player.e.upgrades.length > 0
            }
        },
        21: {
            title: "Focused Expansion",
            display() {
                let ret = "Multiplies Expansion gain by " + format(clickableEffect("e", 21), 1) + ", but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 21) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 21, !getClickableState("e", 21)),
            canClick:() => getClickableState("e", 21) || getClickableState("e", 21) != !getClickableState("e", 22),
            effect() {
                let ret = 1.5
                if (hasUpgrade("e", 45)) ret *= upgradeEffect("e", 45)
                return ret
            }
        },
        22: {
            title: "Focused Penny Expansion",
            display() {
                let ret = "Multiplies Penny Expansion gain by " + format(clickableEffect("e", 21), 1) + ", but divides other currencies' gain by 5"
                ret = ret + "<br>Currently: " + (getClickableState("e", 22) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 22, !getClickableState("e", 22)),
            canClick:() => getClickableState("e", 22) || getClickableState("e", 21) != !getClickableState("e", 22),
            effect() {
                let ret = 1.5
                if (hasUpgrade("e", 45)) ret *= upgradeEffect("e", 45)
                return ret
            }
        },
        31: {
            title: "Focused Points",
            display() {
                let ret = "Multiplies Point gain and WNPB limit by " + formatWhole(clickableEffect("e", 31), 1) + ", but divides Penny gain by 10"
                ret = ret + "<br>Currently: " + (getClickableState("e", 31) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 31, !getClickableState("e", 31)),
            canClick:() => getClickableState("e", 31) || getClickableState("e", 31) != !getClickableState("e", 32),
            effect() {
                let ret = 3
                if (hasUpgrade("e", 45)) ret *= upgradeEffect("e", 45)
                return ret
            },
            unlocked:() => hasAchievement("a", 63)
        },
        32: {
            title: "Focused Pennies",
            display() {
                let ret = "Multiplies Penny gain by " + formatWhole(clickableEffect("e", 32), 1) + ", but divides Point gain and WNBP limit by 10"
                ret = ret + "<br>Currently: " + (getClickableState("e", 32) ? "Active" : "Inactive")
                return ret
            },
            onClick:() => setClickableState("e", 32, !getClickableState("e", 32)),
            canClick:() => getClickableState("e", 32) || getClickableState("e", 32) != !getClickableState("e", 31),
            effect() {
                let ret = 5
                if (hasUpgrade("e", 45)) ret *= upgradeEffect("e", 45)
                return ret
            },
            unlocked:() => hasAchievement("a", 63)
        }
    },
    tabFormat: {
        "Info": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points)}</span></h2> Expansion<br><br>
                        `
                    }
                ],
                ["display-text",
                    function() { 
                        let gen = getResetGain("e")
                        let genText = gen.lt(10) ? format(gen, 4) : format(gen)
                        return `You are gaining ${genText} Expansion per second
                        and losing .3% of your current Expansion per second<br><br>`
                    }
                ],
                ["microtabs", "info"]
            ]
        },
        "Penny Expansion": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points)}</span></h2> Expansion and
                        <h2><span style="color: #AD6F69; text-shadow: 0px 0px 10px #AD6F69; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.penny_expansions.points)}</span></h2> Penny Expansion<br><br>
                        `
                    }
                ],
                ["display-text",
                    function(){
                        let gen = tmp.e.penny_expansions.getResetGain
                        let genText = gen.lt(10) ? format(gen, 4) : format(gen)
                        let ret = "You are gaining " + genText + " Penny Expansion per second and losing "
                        ret += format(tmp.e.penny_expansions.lossRate * 100) + "% of your current Penny Expansion per second"
                        ret += "<br>Purchasing all upgrades in a row unlocks the next row of upgrades"
                        ret += "<br>Purchasing <i>any</i> upgrade multiplies the cost of other upgrades by a static value"
                        ret += "<br><br><h3>The static multiplier is currently " 
                        ret += (!hasUpgrade("e", 35) ? 2 : (!hasMilestone("a", 6) ? 5 : 8)) + "</h3>"
                        return ret
                    }
                ],
                "blank",
                ["clickables", [1]],
                "upgrades", 
                "blank",
            ],
            unlocked(){
                return player.e.points.gte(".1") || player.s.unlocked || player.sys.unlocked
            },
        },
        "Focused Production": {
            content: [
                ["display-text",
                    function(){
                        return `You have 
                        <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                            ${format(player.e.points)}</span></h2> Expansion`
                    }
                ], "blank",
                ["display-text", "These boosts are not <b>mandatory</b> for progression, but can certainly help you progress faster when used at the right time" 
                    + ". You can only have one active in each row. These apply as <b>direct multipliers</b> after nerfs/boosts."],
                "blank",
                ["clickables", [2, 3, 4]]
            ],
            unlocked() {
                return player.e.points.gte(".1") || player.s.unlocked || player.sys.unlocked
            }
        }
    },
    microtabs: {
        info: {
            "Basics": {
                content: [
                    ["display-text", function() {
                        let ret = `<br>Expansion point generation is based on your highest points ever achieved`
                        if (!hasMilestone("sys", 4)) ret+=`, <b>which is only calculated when Penny upgrade WNBP is purchased</b>`
                        ret += `. Penny Expansion begins generating when Expansion surpasses a value of 1 and is directly based 
                        on its value.<br><br> Autobuyers unlocked by QOL (Quality-Of-Life) upgrades
                        typically purchase things <b>at no cost</b> once they can be afforded.<br><br>`

                        return ret
                    }]
                ]
            },
            "Formulas": {
                content: [
                    ["display-text", function() { 
                        let divisor = new Decimal(200)
                        if (hasMilestone("s", 4)) {
                            let limitingValue = 190 // 190 --> min divisor of 10
                            let k = Math.log(18)/(12-6) // spreads out inputs --> output = 10 at 10^6, 95 at 10^12
                            let constantShift = 12*k // moves midpoint (subtract 95) to 10^12 stored exp
                            let exp = -k*player.s.stored_expansion.points.log10() + constantShift
                            let scaling = 1 + Math.pow(Math.E, exp)
                            divisor = divisor.sub(limitingValue/scaling)
                        }
                        return `<br>Highest Points Ever: ${format(player.highestPointsEver)}  
                        <br><br>Expansion base gain:<br>max(0, log10(log10(Highest Points Ever)) - 1)<br><br>
                        Penny Exp. base gain:<br>Expansion / ${format(divisor)}<br><br>
                        Dollar Exp. base gain:<br>max(0, floor(log10(Expansion))/10 - 1) * 1.1<sup>Best Zone - 30</sup>
                            * 3<sup>Factory Components<br><br>`}
                ]
                ]
            }
        }
    }
})