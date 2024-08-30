function factoryBarDisplay(obj) {
    let amt = formatWhole(player.factory.amounts[obj.id])
    let supers = player.factory.supervisors[obj.id]
    let maxTime = obj.maxTimer()
    let prodName = obj.id == "0" ? "toys" : tmp.factory.bars[obj.id-1].name
    let ret = `${amt} ${obj.name} (${supers}): Producing `
    if (maxTime > 1) {
        let time = timeDisplay(Math.max(0, obj.maxTimer() - player.factory.timers[obj.id]))
        return ret + `${format(obj.production())} ${prodName} in ${time}`
    } else {
        let perSecond = obj.production().div(maxTime)
        return ret + `${format(perSecond)} ${prodName} per second`
    }
}

function factoryTabFormat() {
    if (typeof tmp.factory == "undefined") return [
        ["display-text", "uh-oh --> factory tab format (call the dev if you see this for more than a single tick)"]
    ]
    let ret = []
    ret = ret.concat([
            "main-display", 
            ["display-text", `You have ${player.factory.availableSupervisors}/${player.factory.totalSupervisors} supervisors
                awaiting assignment`],
            "blank"
        ])
    for (const id of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        if (typeof tmp.factory.bars[id] == "undefined" || !tmp.factory.bars[id].unlocked) {
            ret.push(["buyable", 0])
            ret.push("blank")
            break
        }


        ret.push(["row", [["bar", id], "blank", ["clickables", [id+1]]]])
        ret.push("blank")
    }
    ret.push("grid")
    return ret
        // ["row", [["bar", 0], "blank", ["clickables", [1]]]],
        // ["row", [["bar", 1], "blank", ["clickables", [2]]]],
        // ["row", [["bar", 2], "blank", ["clickables", [3]]]],
    
}

// supervisors assigned to 1 business at a time
// start with 1 worker, 3 producers

// sell toys --> gain dollars --> necessary for dollar challenge to progress further

addLayer("factory", {
    symbol: "F",
    row: 1,
    position: 3,
    type: "none",
    color: "green",
    startData() { 
        return {
            unlocked: false,
            points: new Decimal(5),
            availableSupervisors: 1,
            totalSupervisors: 1,
            supervisors: new Array(9).fill(0),
            amounts: new Array(9).fill(decimalOne),
            timers: new Array(9).fill(0)
        }
    },
    resource: "toys",
    layerShown() {
        player.factory.unlocked = player.factory.unlocked || false
        return player.factory.unlocked
    },
    effect() {
        let base = player.factory.points.div(10).add(1).log2().sqr().add(1)
        let componentsMult = decimalOne
        for (let i = 301; i <= 309; i++) {
            componentsMult = componentsMult.mul(Decimal.pow(1.25, getGridData(this.layer, i)))
        }
        return base.mul(componentsMult)
    },
    effectDescription:() => `which directly multiplies point gain by ${format(tmp.factory.effect)}`,
    shouldNotify:() => tmp.factory.buyables[0].canAfford,
    upgrades: {
        // ADD ACHIEVEMENT --> Unlock a Little Helper
        // longer active = bigger boost (Overdrive)

        // 11: {
        //     fullDisplay() {
        //         let title = "Buy-in"
        //         let description = "Unlock the Bills minigame and two new Quests, and gain 1.25 spent dollars"
        //         let req = "Requires: 1 dollar"

        //         return `<h3><b>${title}</b></h3><br>${description}<br><br>${req}`
        //     },
        //     canAfford() { return player.sys.points.gte(1) },
        //     onPurchase() {
        //         updateBills(1.25)
        //         updateEnemy(0)
        //     },
        //     // currencyDisplayName: "dollars",
        //     // currencyInternalName: "points",
        //     // currencyLayer: "sys"
        // },
    },
    buyables: {
        0: {
            display() {
                let amt = Number(getBuyableAmount(this.layer, this.id))
                if (amt == 3) return "<h2>All factory components unlocked (for now)</h2>"
                let name = tmp.factory.bars[amt].name
                if (typeof name == "undefined") throw Error(`Invalid factory unlock buyable amount in display: ${amt}`)
                let additionalUnlock = ""
                switch (amt) {
                    case 1: additionalUnlock = " and Dollar Expansion"; break
                    case 2: additionalUnlock = " and Overdrive"; break
                }
                return `<h2>Unlock ${name}${additionalUnlock} for ${formatWhole(this.cost())} toys</h2>`
            },
            cost(x) {
                x = Number(x)
                switch (x) {
                    case 0: return new Decimal(5)
                    case 1: return new Decimal(25)
                    case 2: return new Decimal(5e4)
                    case 3: return Decimal.dInf
                    default: throw Error(`Invalid factory unlock buyable amount in cost: ${amt}`)
                }
            },
            canAfford() { return player.factory.points.gte(this.cost()) },
            buy() {
                player.factory.points = player.factory.points.sub(this.cost())
                addBuyables(this.layer, this.id, 1)
            },
            style() { return {"max-height":"50px", "width":"500px"}}
        },
        11: {
            title: "Buy Supervisors with Dollars",
            display() {
                let cost = `<h3>Cost</h3>: ${formatWhole(this.cost())} dollars`
                let curr = `You currently have ${format(player.sys.points)} dollars`
                let eff = `<h3>Effect:</h3> +${this.effect()} Supervisors`
                return `${cost}<br>${curr}<br><br>${eff}`
            },
            effect(x) { return x },
            cost(x) { return x.pow_base(10) },
            canAfford() { return player.sys.points.gte(this.cost()) },
            buy() { 
                player.sys.points = player.sys.points.sub(this.cost()) 
                addBuyables(this.layer, this.id, 1)
                player.factory.availableSupervisors += 1
                player.factory.totalSupervisors += 1
            }
        }
    },
    clickables: {
        11: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[0] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            unlocked() { return tmp.factory.bars[0].unlocked }
        },
        12: {
            title: `-1`,
            onClick() {
                player.factory.availableSupervisors += 1
                player.factory.supervisors[0] -= 1
            },
            canClick() { return player.factory.supervisors[0] >= 1 },
            unlocked() { return tmp.factory.bars[0].unlocked }
        },
        21: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[1] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            unlocked() { return tmp.factory.bars[1].unlocked }
        },
        22: {
            title: `-1`,
            onClick() {
                player.factory.availableSupervisors += 1
                player.factory.supervisors[1] -= 1
            },
            canClick() { return player.factory.supervisors[1] >= 1 },
            unlocked() { return tmp.factory.bars[1].unlocked }
        },
        31: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[2] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            unlocked() { return tmp.factory.bars[2].unlocked }
        },
        32: {
            title: `-1`,
            onClick() {
                player.factory.availableSupervisors += 1
                player.factory.supervisors[2] -= 1
            },
            canClick() { return player.factory.supervisors[2] >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            unlocked() { return tmp.factory.bars[2].unlocked }
        },
        41: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[3] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[3].unlocked }
        },
        51: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[4] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[4].unlocked }
        },
        61: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[5] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[5].unlocked }
        },
        71: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[6] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[6].unlocked }
        },
        81: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[7] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[7].unlocked }
        },
        91: {
            title: `+1`,
            onClick() {
                player.factory.availableSupervisors -= 1
                player.factory.supervisors[8] += 1
            },
            canClick() { return player.factory.availableSupervisors >= 1 },
            style() { return { "min-height":"50px", "width":"50px" } },
            //unlocked() { return tmp.factory.bars[8].unlocked }
        },
    },
    grid: {
        cols: 9,
        rows: 3,
        getStartData(id) {
            return 0
        },
        getUnlocked(id) {
            return getBuyableAmount(this.layer, 0).gte(id % 100)
        },
        getCost(data, id) {
            let res, resDisName
            if (id % 100 == 1) { 
                res = player.factory.points; 
                resDisName = "Toys" 
            } else { 
                res = player.factory.amounts[id % 100 - 2]; 
                resDisName = tmp.factory.bars[id % 100 - 2].name 
            }

            let cst
            switch (Math.floor(id/100)) {
                case 1: cst = 3 ** (data + 1); break
                case 2: cst = 5 ** (data + 1); break
                case 3: cst = 5 ** (data + 1); break
                default: throw Error(`Invalid id in getCost: ${id}`)
            }

            return {resource: res, cost: cst, resourceDisName: resDisName}
        },
        getCanClick(data, id) {
            let costInfo = this.getCost(data, id)
            return costInfo.resource.gte(costInfo.cost)
        },
        onClick(data, id) {
            let costInfo = this.getCost(data, id)
            if (costInfo.resourceDisName == "Toys") 
                player.factory.points = player.factory.points.sub(costInfo.cost)
            else {
                let costId = id % 100 - 2
                player.factory.amounts[costId] = player.factory.amounts[costId].sub(costInfo.cost)
            }
            
            player[this.layer].grid[id]++
        },
        getDisplay(data, id) {
            let row = Math.floor(id / 100)
            let name = tmp.factory.bars[id % 100 - 1].name
            let eff
            switch (row) {
                case 1: eff = `1.2x ${name} power`; break
                case 2: eff = `1.25x ${name} speed`; break
                case 3: eff = `1.25x Toy effect`; break
            }
            let costName = this.getCost(data, id).resourceDisName
            let cost = this.getCost(data, id).cost
            
            return `${eff}<br>Cost: ${formatWhole(cost)} ${costName}`
        }
    },
    bars: {
        0: {
            direction: RIGHT,
            width: 500,
            height: 50,
            name: "Elves",
            progress() {
                return player.factory.timers[this.id] / this.maxTimer()
            },
            maxTimer() {
                return 4
            },
            production() {
                let base = decimalOne
                let supervisorBonus = Math.max(1, player.factory.supervisors[this.id])
                let amt = player.factory.amounts[this.id]
                return base.mul(supervisorBonus).mul(amt)
            },
            display() { return factoryBarDisplay(this) },
            unlocked() {
                return getBuyableAmount(this.layer, 0).gt(this.id)
            },
            fillStyle() { return {'background-color':'green'} },
            textStyle() { return {'color':'#b22222'} }
        },
        1: {
            direction: RIGHT,
            width: 500,
            height: 50,
            name: "Hunters",
            progress() {
                return player.factory.timers[this.id] / this.maxTimer()
            },
            maxTimer() {
                return 60
            },
            production() {
                let base = decimalOne
                let supervisorBonus = Math.max(1, player.factory.supervisors[this.id])
                let amt = player.factory.amounts[this.id]
                return base.mul(supervisorBonus).mul(amt)
            },
            display() { return factoryBarDisplay(this) },
            unlocked() {
                return getBuyableAmount(this.layer, 0).gt(this.id)
            },
            fillStyle() { return {'background-color':'green'} },
            textStyle() { return {'color':'#b22222'} }
        },
        2: {
            direction: RIGHT,
            width: 500,
            height: 50,
            name: "Managers",
            progress() {
                return player.factory.timers[this.id] / this.maxTimer()
            },
            maxTimer() {
                return 360
            },
            production() {
                let base = decimalOne
                let supervisorBonus = Math.max(1, player.factory.supervisors[this.id])
                let amt = player.factory.amounts[this.id]
                return base.mul(supervisorBonus).mul(amt)
            },
            display() { return factoryBarDisplay(this) },
            unlocked() {
                return getBuyableAmount(this.layer, 0).gt(this.id)
            },
            fillStyle() { return {'background-color':'green'} },
            textStyle() { return {'color':'#b22222'} }
        }
    },
    update(diff) {
        for (const id of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
            let supers = player.factory.supervisors[id]
            if (supers < 0 || supers % 1 != 0) throw Error(`Invalid number of supervisors: Bar ${id} -> ${supers}`)
            if (supers == 0) continue

            player.factory.timers[id] += diff
            let maxTimer = tmp.factory.bars[id].maxTimer
            if (player.factory.timers[id] > maxTimer) {
                let gain = tmp.factory.bars[id].production
                let timeMultiplier = Math.floor(player.factory.timers[id] / maxTimer)
                gain = gain.mul(timeMultiplier)
                player.factory.timers[id] -= maxTimer * timeMultiplier
                if (id == 0) addPoints("factory", gain)
                else player.factory.amounts[id-1] = player.factory.amounts[id-1].add(gain)
            }
        }
        
    },
    tabFormat: {
        "Main": {
            content: factoryTabFormat
        },
        "Overdrive": {
            content: [
                ["display-text", "longer active, bigger boost"]
            ],
            unlocked:() => getBuyableAmount("factory", 0).gt(2)
        },
        "Info": {
            content: [
                "main-display",
                ["microtabs", "info"]
            ]
        }
    },
    microtabs: {
        info: {
            "Supervisors": {
                content: [
                    "blank",
                    ["display-text", `Supervisors allow you to activate different "components" of your factory.
                        For example, assigning a supervisor to Elves will allow your Elves to start producing Toys.
                        If no supervisor is assigned to the Elves "component", then their production is halted. 
                        You start with one supervisor at first. It's up to you to choose how to use it. Later on, you 
                        can unlock more supervisors, however. Assigning multiple supervisors to a component will
                        provide a compounding bonus to that component's production; 50% per supervisor past the first.
                        
                        You can always add/remove a supervisor from a component with the +1/-1 buttons.`], "blank"
                ]
            },
            "Overdrive": {

            }
        }
    },
    componentStyles: {
        "clickable"() { return { "min-height":"50px", "width":"50px" } },
    }
})