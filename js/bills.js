addLayer("bills", {
    symbol: "B",
    row: 1,
    position: 3,
    type: "none",
    color: "#C0C0C0",
    startData() { 
        return {
            unlocked: false,
            points: decimalZero,
            total: decimalZero,
            elo: decimalZero,
            highestDenomination: 0,
            highestDenominationIndex: 0,
            nextDenominationUnlock: 1,
            timers: new Array(9).fill(0),
            currentEnemyKills: 0,
            maxEnemyKills: 100,
            totalEnemyKills: 0,
            enemyLevel: 0,
            enemyHealth: new Decimal(100),
            totalSmackDamage: decimalZero
        }
    },
    tooltip: "Bills",
    layerShown() {
        let visible = false
        if (player.bills.unlocked || hasMilestone("sys", 5)) {
            player.bills.unlocked = true
            visible = true
        }
        return visible
    },
    upgrades: {
        11: {
            title: "Buy-in",
            description: "Unlock the Bills minigame and a new Quest, and gain 1 spent dollar",
            cost:() => decimalOne,
            onPurchase() {
                player.bills.highestDenomination = 1
                player.bills.highestDenominationIndex = 1
                player.bills.nextDenominationUnlock = 20
                updateBills(1)
                
            },
            currencyDisplayName: "dollars",
            currencyInternalName: "points",
            currencyLayer: "sys"

        }
    },
    buyables: {
        11: {
            title: "1 Dollar Bill",
            denomination: 1,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 11)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[0])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cooldown() {
                let ret = 1

                return ret
            },
            cost(x) { return x.pow_base(1.1).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 11, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 1}
        },
        12: {
            title: "2 Dollar Bill",
            denomination: 2,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 12)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[1])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(1.2).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 12, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 2}
        },
        13: {
            title: "5 Dollar Bill",
            denomination: 5,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 13)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[2])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(1.3).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 13, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 3}
        },
        21: {
            title: "10 Dollar Bill",
            denomination: 10,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 21)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[3])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(1.5).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 21, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 4}
        },
        22: {
            title: "20 Dollar Bill",
            denomination: 20,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 22)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[4])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(1.8).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 22, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 5}
        },
        23: {
            title: "50 Dollar Bill",
            denomination: 50,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 23)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[5])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(2).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 23, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 6}
        },
        31: {
            title: "100 Dollar Bill",
            denomination: 100,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 31)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[6])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(2.4).mul(this.denomination) },
            canAfford() {return player.bills.points.gte(this.cost())},
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 31, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 7 }
        },
        32: {
            title: "1000 Dollar Bill",
            denomination: 1000,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 32)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[7])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(3).mul(this.denomination) },
            canAfford() {  return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 32, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 8 }
        },
        33: {
            title: "10000 Dollar Bill",
            denomination: 10000,
            display() {
                let levels = `<h3><b>Levels:</h3></b> ${getBuyableAmount("bills", 33)}`
                let effect = `Deal ${this.effect()} damage in ${format(this.cooldown() - player.bills.timers[8])} seconds`
                let cost = `<h3><b>Cost:</h3></b> ${this.cost()} spent dollars`

                return `${levels}\n${effect}\n${cost}`
            },
            effect(x) { return x.mul(this.denomination) },
            cost(x) { return x.pow_base(5).mul(this.denomination) },
            canAfford() { return player.bills.points.gte(this.cost()) },
            buy() {
                updateBills(this.cost().neg())
                addBuyables("bills", 33, 1)
            },
            style() {
                return {'height':'100px'}
            },
            unlocked() { return player.bills.highestDenominationIndex >= 9}
        }
    },
    clickables: {
        11: {
            title: "Spend Dollars",
            display() {
                return "Contribute some of your current dollars to spent dollars"
            },
            onClick() {
                let inp = prompt(`Enter the amount of dollars you would like to contribute into the field. To enter a percentage, use the % symbol; e.g, 25%.`)
                if (!inp) return
                let isPercent = false

                if (inp.endsWith("%")) {
                    inp = inp.slice(0, inp.length - 1)
                    isPercent = true
                }

                inp = Number(inp)

                if (Number.isNaN(inp)) {
                    alert("Invalid input, nothing has occurred")
                    return
                } else if (inp <= 0) {
                    alert("You must enter a positive non-zero number")
                    return
                } else if ((isPercent && inp > 100) || (!isPercent && player.sys.points.lt(inp))) {
                    alert("You cannot spend more dollars than you have, nothing has occurred")
                    return
                }

                let toSpend
                if (isPercent) toSpend = player.sys.points.mul(inp / 100)
                else toSpend = inp
                player.sys.points = player.sys.points.sub(toSpend)
                updateBills(toSpend)
            },
            canClick() { return player.sys.points.gt(0) }
        },
        12: {
            title: "Smack Attack",
            display() {
                if (player.shiftDown) return "You can hold this button to attack 20 times/s!"
                return `Gather your spent dollars in a leather bag and smack the enemy!<br>
                    ${format(this.effect())} damage per click<sup>*</sup>`
            },
            onClick() { 
                player.bills.totalSmackDamage = player.bills.totalSmackDamage.add(this.effect())
                attackEnemy(this.effect()) 
            },
            onHold() {
                this.onClick()
                // player.bills.totalSmackDamage = player.bills.totalSmackDamage.add(this.effect())
                // attackEnemy(this.effect())
            },
            canClick: true,
            effect() {
                let ret = player.bills.points.mul(.04)
                ret = ret.mul(tmp.quests.bars.smackBar.reward)
                return ret
            },
        }
    },
    bars: {
        enemyBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            progress() {
                return player.bills.enemyHealth.div(this.maxHealth())
            },
            display() {
                return `${format(player.bills.enemyHealth)}/${format(this.maxHealth())} HP`
            },
            name() {
                let names = ["Orphan", "Homeless Man", "Hobo", "Weary Traveler", "Bandit"]
                let index = Math.floor(player.bills.enemyLevel / 10)
                return names[index]
            },
            maxHealth() {
                return new Decimal((1 + player.bills.enemyLevel) * 100)
            },
            loot() {
                let base = .1
                let mul = 1
                let exp = 1

                return (base * mul) ** exp
            },
            textStyle() { return {'color':'gray'} }
        }
    },
    update(diff) {
        if (!player.bills.unlocked) return

        for (i = 0; i <= 8; i++) {
            // map iteration index to buyable index
            let buyableIndex = 10 * (1 + Math.floor(i/3)) + (i % 3) + 1
            if (getBuyableAmount("bills", buyableIndex).gt(0)) {
                player.bills.timers[i] += diff
                let cooldown = tmp.bills.buyables[buyableIndex].cooldown
                if (player.bills.timers[i] > cooldown) {
                    let dmg = buyableEffect("bills", buyableIndex)
                    let timeMultiplier = Math.floor(player.bills.timers[i] / cooldown)
                    dmg = dmg.mul(timeMultiplier)
                    player.bills.timers[i] -= cooldown * timeMultiplier
                    attackEnemy(dmg)
                }
            }

        }
    },
    tabFormat: {
        "Bills": {
            content: [
                ["display-text", function() { let ret = `You have 
                    <h2><span style="color: #C0C0C0; text-shadow: 0px 0px 10px #C0C0C0; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.bills.points)}</span></h2> spent dollars and
                    <h2><span style="color: gray; text-shadow: 0px 0px 10px gray; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.sys.points)}</span></h2> dollars<br><br>`
                    
                    ret += `Because you have a total of <h3><span style="color: #C0C0C0; text-shadow: 0px 0px 10px #C0C0C0; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.bills.total)}</h3></span> spent dollars, the highest denomination available to you is 
                    the <h3>${player.bills.highestDenomination}</h3> dollar bill`
                    
                    if (!Number.isNaN(player.bills.nextDenominationUnlock)) ret += `. Next denomination unlocks at
                    <h3><span style="color: #C0C0C0; text-shadow: 0px 0px 10px #C0C0C0; font-family: Lucida Console, Courier New, monospace">
                        ${player.bills.nextDenominationUnlock}</span></h3> total spent dollars`
                    return ret + "<br><br>" 
                }],
                () => hasUpgrade("bills", 11) ? ["column", [
                    ["display-text", `Your current ELO is ${player.bills.elo}`]
                    ["bar", "enemyBar"],
                    "blank",
                    ["display-text", `The level ${player.bills.enemyLevel} ${tmp.bills.bars.enemyBar.name} 
                        will drop ${tmp.bills.bars.enemyBar.loot} Spent Dollars when defeated`],
                    ["display-text", `You have defeated this enemy 
                        ${player.bills.currentEnemyKills}/${player.bills.maxEnemyKills} times`],
                    "blank",
                    "buyables",
                    "clickables"
                ]] : "",
                "blank",
                "upgrades"
            ]
        },
        "Info": {
            content: [

            ]
        }
    }
})