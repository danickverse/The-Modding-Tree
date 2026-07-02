addLayer("tm", {
    symbol: "TM",
    row: "side",
    position: 1,
    type: "none",
    color: "magenta",
    tooltip: "The Time Machine",
    resource: "temporal power",
    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            best: decimalZero,
            minTickLength: 10,
            notifyForBuyables: true
        }
    },
    layerShown() {
        let visible = false
        if (player.tm.unlocked || hasAchievement("a", 31)) {
            player.tm.unlocked = true
            visible = true
        }
        return visible
    },
    canAffordAnyBuyable() {
        for (id in tmp.tm.buyables){
            if (isPlainObject(layers.tm.buyables[id]) && canBuyBuyable("tm", id))
                return true
        }
        return false
    },
    shouldNotify() {
        if (player.tm.notifyForBuyables && tmp.tm.canAffordAnyBuyable) return true
        return false
    },
    glowColor() {
        if (player.sl.inChallenge && canCompleteChallenge(layer, player.tm.activeChallenge))
		    return "red"
        return "magenta"
    },
    effect() {
        return player.tm.points.mul(this.efficiency()).toNumber()
    },
    effectDescription() {
        return `which converts to ${timeDisplay(this.effect())}, and are gaining ${format(tmp.tm.perSecond)} temporal power per second`
    },
    efficiency() {
        let ret = decimalZero

        ret += buyableEffect("tm", 11)

        return ret
    },
    perSecond() {
        let ret = new Decimal(0.01)
        ret = ret.mul(buyableEffect("tm", 13))
        ret = ret.add(buyableEffect("tm", 22))

        return ret.min(.2)
    },
    stoTimeLimit() {
        let ret = new Decimal(500)
        return ret.mul(buyableEffect("tm", 12))
    },
    update(diff) {
        if (player.tm.isWarping || !player.tm.unlocked) return

        if (player.offTime !== undefined) {
            let gain = tmp.tm.perSecond.mul(buyableEffect("tm", 23)).mul(diff)
            player.tm.points = player.tm.points.add(gain).min(this.stoTimeLimit())
            player.tm.best = player.tm.best.max(player.tm.points)
            return
        }
        
        player.tm.points = player.tm.points.add(tmp.tm.perSecond.mul(diff)).min(this.stoTimeLimit())
        player.tm.best = player.tm.best.max(player.tm.points)
        
    },
    buyables: {
        11: {
            title: "Time Machine A",
            cost(x) {
                if (x.eq(0)) return 1e8
                else if (x.eq(1)) return 1e13
                else return x.pow(1.5).add(1).pow_base(1e4)
            },
            purchaseLimit() { return 20 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        x / 100
                        &#8658; x %`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        If x >= 2, 1e4<sup>x^1.5 + 1</sup> `
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Increase the Temporal Converter's efficiency by ${format(this.effect() * 100)}%` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.div(100).toNumber()
            },
            canAfford() {
                return player.p.points.gte(this.cost())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        12: {
            title: "Time Machine B",
            cost(x) {
                return x.pow_base(1.03).mul(300)
            },
            purchaseLimit() { return 100 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        x<sup>1.02</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        300 * 1.03<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply max Temporal Power by ${format(this.effect())}x` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow_base(1.02)
            },
            canAfford() {
                return player.tm.points.gte(this.cost())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        13: {
            title: "Time Machine C",
            cost(x) {
                return x.pow_base(1.1).mul(x.pow(2).pow_base(1.004)).mul(20)
            },
            purchaseLimit() { return 25 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Completions / 100)<sup>x</sup>
                        &#8658; ${1 + tmp.sl.challenge.completions / 100}<sup>x</sup>
                        (Caps at 12 Completions)`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        20 * 1.1<sup>x</sup> * 1.004<sup>x^2</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Temporal Power gain by ${format(this.effect())}x (based on Sluggish Challenge completions)` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow_base(1 + tmp.sl.challenge.completions / 100)
            },
            canAfford() {
                return player.tm.points.gte(this.cost())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            }
        },
        21: {
            title: "Temporal Powers A",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            purchaseLimit() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        (1 + Temporal Power / 1000)<sup>.04x</sup>
                        ${format(player.tm.points.div(1000).add(1))}<sup>.04x</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x (based on Temporal Power)`
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                let exp = x.mul(.04)
                return player.tm.points.div(1000).add(1).pow(exp)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
        },
        22: {
            title: "Temporal Powers B",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            purchaseLimit() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        .001x`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Increase Temporal Power gain (after boosts) by ${this.effect().toFixed(3)}`
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.mul(.001)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
        },
        23: {
            title: "Temporal Powers C",
            cost(x) {
                return x.pow_base(1.1).mul(100)
            },
            purchaseLimit() { return 25 },
            display() {
                if (this.locked()) { 
                    return `<h3>LOCKED</h3><br>Until 200 best Temporal Energy and Sluggish 2 complete!`
                }

                let x = getBuyableAmount("tm", this.id)
                
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        1 + .02x + .05 * floor(x / 5)`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        100 * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply offline Temporal Power gain by ${format(this.effect())}x`
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " temporal power"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                x = x.toNumber()
                return 1 + .02 * x + .05 * Math.floor(x / 5)
            },
            canAfford() {
                return !this.locked() && player.tm.points.gte(this.cost())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            locked:() => player.tm.best.lt(200) || player.tm.challenges[12] == 0
        },
        31: {
            title: "Flux Capacitor A",
            cost(x) {
                return x.add(1).pow(3).mul(x.pow_base(5))
            },
            purchaseLimit() { return 10 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        Time Flux<sup>x/100</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        5<sup>x</sup> * (x + 1)<sup>3</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply the exponent for each Sluggish challenge reward by ${format(this.effect())}x` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.div(100).pow_base(timeFlux())
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => gridEffect("quests", 106) >= 1
        },
        32: {
            title: "Flux Capacitor B",
            cost(x) {
                return x.pow_base(1.1).mul(x.add(1))
            },
            purchaseLimit() { return 100 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        [Time Played]<sup>x/1000</sup>`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        (x + 1) * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.div(1000).pow_base(player.timePlayed)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => gridEffect("quests", 106) >= 1
        },
        33: {
            title: "Flux Capacitor C",
            cost(x) {
                return x.pow_base(1.1).mul(x.add(1))
            },
            purchaseLimit() { return 120 },
            display() {
                if (player.shiftDown) {
                    let effForm = `<b><h3>Effect Formula:</h3></b>
                        1 + x * (.01 * [Temporal Power]<sup>.2</sup>)
                        1 + x * ${format(player.tm.points.pow(.2).div(100))}`
                    let costForm = `<b><h3>Cost Formula:</h3></b>
                        x * 1.1<sup>x</sup>`
                    return effForm + "<br><br>" + costForm
                }

                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Speck gain by ${format(this.effect())}x (based on Temporal Power)` 
                if (x.lt(this.purchaseLimit())) levels += x + "/" + this.purchaseLimit()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                let factor = player.tm.points.pow(.2).div(100)
                return x.mul(factor).add(1)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", this.id, 1)
            },
            unlocked:() => gridEffect("quests", 106) >= 1
        },
        // 33: {
        //     title: "Flux Capacitor C",
        //     display: "Specks that are auto-collected while offline are worth ",
        //     unlocked:() => shopEffect(106) >= 1
        // }
    },
    clickables: {
        11: {
            title: "Time Warp",
            display() {
                return `Convert your temporal power to warp ahead ${formatTime(tmp.tm.effect)} into the future`
            },
            canClick:() => tmp.tm.effect >= 1,
            onClick() {
                console.log("MAKE MODAL AND PROPER INTERVAL FOR CONTINUOUS CHANGES")
                player.tm.isWarping = true
                let realTime = tmp.tm.effect
                let tickLength = Math.max(player.tm.minTickLength / 1000, realTime / 500)
                while (realTime > tickLength) {
                    realTime -= tickLength
                    updateTemp()
                    gameLoop(tickLength)
                }
                gameLoop(realTime)
                player.tm.points = decimalZero
                player.tm.isWarping = false
            }
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
            requirement: new Decimal(125000)
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
        "Time Machine": {
            content: [
                "main-display",
                ["display-text", () => `The Temporal Converter is currently working at ${format(tmp.tm.efficiency * 100)}% efficiency`],
                "blank",
                ["clickable", 11], "blank", 
                ["row", [
                    ["display-text", "Set minimum simulated tick length (250 = 250ms):&ensp;"],
                    ["slider", ["minTickLength", 10, 250]]
                ]],
                "blank",
                ["row", [
                    ["display-text", "Notify when a buyable is affordable?&ensp;"],
                    ["toggle", ["tm", "notifyForBuyables"]],
                ]],
                "blank",
                ["buyables", [1, 2, 3]]
            ]
        },
        "Challenges": {
            content: [
                ["display-text", () => 
                    `You are currently in Sluggish Layer (SL) <h2 style="color: purple; font-family: Lucida Console, Courier New, monospace; text-shadow: 0px 0px 10px">
                    ${formatWhole(player.sl.layer)}</h2>`
                ], 
                "blank",
                ["display-text", function() { 
                    let x = tmp.sl.challenge.completions
                    return `Each completed challenge increases Time Flux by 5%<br>
                        ${x} challenge completions = ${1 + 5 * x/100}x Time Flux` }
                ], "blank",
                ["display-text", "Entering a challenge grants access to the Sluggish layer, but activates nerfs including those from all previous challenges; Sluggish progress is reset when exiting a challenge"],
                "blank",
                "challenges"
            ]
        },
        "Info": {
            content: [
                ["microtabs", "information"]
            ]
        }
    },
    microtabs: {
        information: {
            "TM": {
                content: [
                    "blank",
                    ["display-text",   
                        `<b>NOTHING</b> in this feature, *including Sluggish*, will update during warp calculation. <B>MOST</b> things in this node will update during
                        offline time. So, features of the Time Machine will only update while the game is open and running normally, except
                        for Temporal Power generation. Temporal Power generates 3x faster during offline time calculations.
                        <br><br>Temporal Power passively generates based on real time scaled down by a factor. Initially, this factor is
                        0.01, so for every 1 real time second, 0.01 Temporal Power are generated. Temporal Power can then be used to purchase
                        buyables for assorted boosts OR to perform a time warp, essentially running the game for an amount of time based on two
                        variables: Temporal Power and Temporal Converter efficiency.
                        <br><br>Temporal Converter efficiency <i>further</i> scales down Temporal
                        Power, then uses the resulting value to determine how long your time warp is. So, if you have 360 Temporal Power and a 
                        Temporal Converter efficiency of 10%, then your time warp would last for 36 seconds.`
                    ],
                    "blank"
                ]
            },
            "Sluggish": {
                content: [
                    "blank",
                    ["display-text", `The Sluggish challenges are unlocked by progressing through the game. 
                        They function as a collection of "minigames" which, upon completion, provide boosts,
                        QoL, and other benefits. Upon entering a Sluggish challenge, several nerfs and/or restrictions
                        will be placed on various features/stats. Your goal is to engage with the minigame to achieve the
                        objective as described in the 'Challenges' tab. The minigame's contents can be found in the
                        'Sluggish' node (purple side node; unlocked when entering Sluggish). 
                        <br><br>Note that any boosts from the minigame
                        itself, unless otherwise specified, <b>do not</b> apply outside of a Sluggish challenge.`
                    ],
                    "blank"
                ]
            }
        }
    }
})