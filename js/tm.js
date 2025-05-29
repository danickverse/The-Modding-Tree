addLayer("tm", {
    symbol: "TM",
    row: "side",
    position: 1,
    type: "none",
    color: "magenta",
    tooltip: "The Time Machine",
    resource: "stored time",
    startData() {
        return {
            unlocked: false,
            points: decimalZero,
            minTickLength: 0
        }
    },
    layerShown() { return true || player.tm.unlocked },
    effect() {
        return player.tm.points.mul(this.efficiency()).toNumber()
    },
    effectDescription() {
        return `which converts to ${timeDisplay(this.effect())}`
    },
    efficiency() {
        let ret = decimalZero

        ret += buyableEffect("tm", 11)

        return ret
    },
    stoTimeLimit() {
        let ret = new Decimal(1200)
        return ret.mul(buyableEffect("tm", 12))
    },
    update(diff) {
        let timeFluxFactor = 1//timeFlux() ** .25
        player.tm.points = player.tm.points.add(timeFluxFactor * diff).min(this.stoTimeLimit())
    },
    buyables: {
        11: {
            title: "Temporal Power A",
            cost(x) {
                if (x.eq(0)) return 1e13
                else if (x.eq(1)) return 1e15
                else return x.pow(1.5).add(1).pow_base(1e5)
            },
            maxLevels() { return 25 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Increase the Temporal Converter's efficiency by ${format(this.effect() * 100)}%` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " pennies"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow(.5).div(100).toNumber()
            },
            canAfford() {
                return player.p.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                addBuyables("tm", 11, 1)
            }
        },
        12: {
            title: "Temporal Power B",
            cost(x) {
                return x.pow_base(1.03).mul(100)
            },
            maxLevels() { return 100 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply max Stored Time by ${format(this.effect())}x (based on Stored Time)` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " stored time"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                return x.pow_base(1.02)
            },
            canAfford() {
                return player.tm.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.tm.points = player.tm.points.sub(this.cost())
                addBuyables("tm", 12, 1)
            }
        },
        13: {
            title: "Temporal Power C",
            cost(x) {
                return x.add(1).pow_base(5)
            },
            maxLevels() { return 5 },
            display() {
                let x = getBuyableAmount("tm", this.id)
                let levels = "<b><h3>Levels:</h3></b> "
                let eff = `<b><h3>Effect:</h3></b> Multiply Time Flux by ${format(this.effect())}x (based on Stored Time)` 
                if (x.lt(this.maxLevels())) levels += x + "/" + this.maxLevels()
                else {
                    levels += "MAXED"
                    return levels + "<br>" + eff
                }
                let cost = "<b><h3>Cost:</h3></b> " + format(this.cost()) + " specks"
                return levels + "<br>" + eff + "<br><br>" + cost
            },
            effect(x) {
                if (!this.unlocked()) return decimalOne
                let effX = x.lte(5) ? x : x.sub(5)
                let exp = effX.mul(.04).add(.4)
                return player.tm.points.div(10000).add(1).pow(exp)
            },
            canAfford() {
                return player.quests.specks.points.gte(this.cost()) && getBuyableAmount("tm", 11).lt(this.maxLevels())
            },
            buy() {
                player.quests.specks.points = player.quests.specks.points.sub(this.cost())
                addBuyables("tm", 13, 1)
            },
            unlocked:() => shopEffect(106) >= 1
        }
    },
    clickables: {
        11: {
            title: "Time Warp",
            display() {
                return `Convert your stored time to warp ahead ${formatTime(tmp.tm.effect)} into the future`
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
    tabFormat: {
        "Time Machine": {
            content: [
                "main-display",
                ["display-text", () => `The Temporal Converter is currently working at ${format(tmp.tm.efficiency * 100)}% efficiency`],
                "blank",
                "clickables", "blank", 
                ["row", [
                    ["display-text", "Set minimum simulated tick length (250 = 250ms):&ensp;"],
                    ["slider", ["minTickLength", 0, 250]]
                ]],
                "buyables"
            ]
        },
        "TWS": {

        },
        "Sluggish": {

        },
        "Info": {
            content: [
                ["display-text", ""]
            ]
        }
    }
})