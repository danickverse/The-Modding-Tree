function questTabFormat() {
    // content: [
    //     ["display-text", function() { return `You have completed 
    //         <h2><span style="color: blue; text-shadow: 0px 0px 10px blue; font-family: Lucida Console, Courier New, monospace">
    //         ${formatWhole(player.quests.points)}</span></h2> quests`
    //     }],
    //     "blank",
    //     ["row", [
    //         ["display-text", "Hide completed Quests:&ensp;"], 
    //         ["toggle", ["quests", "hideCompleted"]]
    //     ]],
    //     "blank",
    //     () => tmp.quests.bars["pointsBar"].unlocked ? ["column", [
    //         ["bar", "pointsBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars["pointsBar"].effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.penniesBar.unlocked ? ["column", [
    //         ["bar", "penniesBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.penniesBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.dollarResetBar.unlocked ? ["column", [
    //         ["bar", "dollarResetBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.dollarResetBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.dollarGainBar.unlocked ? ["column", [
    //         ["bar", "dollarGainBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.dollarGainBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.wnbpBar.unlocked ? ["column", [
    //         ["bar", "wnbpBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.wnbpBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.applesBar.unlocked ? ["column", [
    //         ["bar", "applesBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.applesBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.acceleratorBar.unlocked ? ["column", [
    //         ["bar", "acceleratorBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.acceleratorBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.smackBar.unlocked ? ["column", [
    //         ["bar", "smackBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.smackBar.effectDisplay()], 
    //         "blank"
    //     ]] : "",
    //     () => tmp.quests.bars.enemyKillsBar.unlocked ? ["column", [
    //         ["bar", "enemyKillsBar"],
    //         "blank",
    //         ["display-text", tmp.quests.bars.enemyKillsBar.effectDisplay()], 
    //         "blank"
    //     ]] : ""
    // ]

    if (typeof tmp.quests == "undefined") return [
        ["display-text", "uh-oh --> quest tab format (call the dev if you see this for more than a single tick)"]
    ]
    let ret = []
    ret.push(["display-text", `You have completed 
        <h2><span style="color: blue; text-shadow: 0px 0px 10px blue; font-family: Lucida Console, Courier New, monospace">
        ${formatWhole(player.quests.points)}</span></h2> quests`
    ])
    ret.push("blank")
    ret.push(["row", [
        ["display-text", "Hide completed Quests:&ensp;"], 
        ["toggle", ["quests", "hideCompleted"]]
    ]])
    ret.push("blank")
    
    for (barId in tmp.quests.bars) {
        if (barId == "quests") continue

        if (tmp.quests.bars[barId].unlocked) {
            ret.push(["column", [
                ["bar", barId],
                "blank",
                ["display-text", tmp.quests.bars[barId].effectDisplay()], 
                "blank"
            ]])
        }
    }
    return ret
}

addLayer("quests", {
    symbol: "Q",
    row: "side",
    position: 1,
    type: "none",
    color: "blue",
    startData() { 
        return {
            unlocked: false,
            points: decimalZero,
            completions: {
                pointsBar: 0,
                penniesBar: 0,
                dollarResetBar: 0,
                dollarGainBar: 0,
                wnbpBar: 0,
                applesBar: 0,
                acceleratorBar: 0,
                smackBar: 0,
                zoneBar: 0,
                enemyKillsBar: 0,
                fastSpecksBar: 0
            },
            hideCompleted: false,
            specks: {
                points: decimalZero,
                speckCount: 0,
                collected: 0, // just displayed to user, no use, ***does not represent specks resource points***
                fastCollected: 0, // used for Specks Quest
                tsls: 0, // increases every tick, measure of time since last spawn, tsls/maxTsls = base spawn chance
                timer: 0, // maxes at 30, which is when it resets down to 0. used to try to spawn particles every 5 seconds
                shopDisplay: "",
                showPopup: true
            }
        }
    },
    tooltip: "Quests",
    layerShown() { return player.quests.unlocked },
    milestones: {
        0: {
            requirementDescription: "1000 Quests (Placeholder)",
            effectDescription: "Unlock Specks, a new Quest, and more achievements/achievement milestones",
            done() { return false }
        }
    },
    bars: {
        // NOTE: UNLOCKED PROPERTY IS FOR DISPLAY PURPOSES
        // COMPLETED PROPERTY IS FOR IF THE QUEST CAN STILL BE DONE OR IS FINISHED
        pointsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Points Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.pointsBar}/5 times,
                post-nerf penny gain is multiplied by ${format(tmp.quests.bars.pointsBar.reward)}`,
            display() { return this.completed() ? "DONE"
                : `${format(player.points)}/${format(this.goal())} Points` },
            progress() { return this.completed() || player.points.add(1).log10().div(this.goal().log10()) },
            goal() {
                let baseExp = 5
                let scaling = Math.min(5, 1 + player.quests.completions.pointsBar) ** 2
                // let scaling = 45 * Math.min(4, player.quests.completions.pointsBar)
                // let exp = baseExp + scaling
                let exp = baseExp * scaling

                return new Decimal(10).pow(exp)
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.pointsBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => Math.pow(1.2, player.quests.completions.pointsBar) 
        },
        penniesBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Pennies Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.penniesBar}/5 times,
                the conversion rate is multiplied by ${format(tmp.quests.bars.penniesBar.reward)}`,
            display() { return this.completed() ? "DONE"
                : `${format(player.p.points)}/${this.goal()} Pennies` },
            progress() { return this.completed() || player.p.points.add(1).log10().div(this.goal().log10()) },
            goal() {
                let baseExp = 35
                let scaling = 3 * Math.min(4, player.quests.completions.penniesBar)
                let exp = baseExp + scaling

                return new Decimal(10).pow(exp)
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.penniesBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => player.quests.completions.penniesBar == 0 ? 1
                : 1 + .01 * player.quests.completions.penniesBar ** 2
        },
        dollarResetBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Dollar Reset Time Quest",
            special: true,
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.dollarResetBar}/5 times,
                Time Flux is multiplied by ${format(tmp.quests.bars.dollarResetBar.reward)}`,
            display() {
                if (this.completed()) return "DONE"

                let goal = this.goal()
                let timeLeft = this.progress() * goal

                if (timeLeft == 0) timeLeftText = `(Failed)`
                else timeLeftText = `(${timeDisplay(timeLeft)} left)`


                return `Perform a Dollar reset in under ${timeDisplay(goal, false)} ` + timeLeftText
            },
            progress() { 
                return this.completed() ||
                    Math.max(0, this.goal() - player.sys.resetTime) / this.goal() 
            },
            goal() {
                let completions = player.quests.completions.dollarResetBar
                switch (completions) {
                    case 0: return 10800
                    case 1: return 3600
                    case 2: return 1200
                    case 3: return 300
                    case 4:
                    case 5: return 60
                    default: throw Error(`Dollar Reset quest has invalid number of completions: ${completions}`)
                }
            },
            textStyle: {'color' : 'blue'},
            baseStyle: {'background-color' : 'red'},
            completed:() => player.quests.completions.dollarResetBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + .04 * player.quests.completions.dollarResetBar
        },
        dollarGainBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Dollar Gain Quest",
            special: true,
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.dollarGainBar}/6 times,
                the expansion investment hardcap is multiplied by ${format(tmp.quests.bars.dollarGainBar.reward)}`,
            display() { return this.completed() ? "DONE"
                : `Gain ${this.goal()} Dollars on reset` },
            progress() { 
                // 2nd condition used to avoid error from tmp not being initialized yet
                return this.completed() || 
                    (tmp.sys.resetGain instanceof Decimal && tmp.sys.resetGain.div(this.goal())) 
            },
            goal() {
                let completions = player.quests.completions.dollarGainBar
                switch (completions) {
                    case 0: return 0.5
                    case 1: return 1
                    case 2: return 3
                    case 3: return 10
                    case 4: return 20
                    case 5:
                    case 6: return 50
                    default: throw Error(`Dollar Gain quest has invalid number of completions: ${completions}`)
                }
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.dollarGainBar >= 6,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + player.quests.completions.dollarGainBar / 10
        },
        wnbpBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "WNBP Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.wnbpBar}/5 times,
                unlock ${tmp.quests.bars.wnbpBar.reward} Penny upgrades that are kept`,
            display() {
                if (this.completed()) return "DONE"
                if (player.shiftDown) return "Useful toggles in Dollar Milestone 5"
                let ret = `Reach ${format(this.goal())} Pennies without purchasing WNBP`
                if (player.sys.everWNBP) ret = ret + " (Failed)"
                return ret
            },
            progress() { 
                if (player.sys.everWNBP) {
                    return 0
                }
                return this.completed() || player.p.points.add(1).log10().div(this.goal().log10())
            },
            goal() {
                let completions = player.quests.completions.wnbpBar
                switch (completions) {
                    case 0: return new Decimal(1e9)
                    case 1: return new Decimal(1e25)
                    case 2: return new Decimal(1e50)
                    case 3: return new Decimal(1e80)
                    case 4:
                    case 5: return new Decimal(1e105)
                    default: throw Error(`WNBP quest has invalid number of completions: ${completions}`)
                }
            },
            textStyle: {'color' : 'blue'},
            baseStyle:() => player.sys.everWNBP ? {'background-color' : 'red'} : {},
            completed:() => player.quests.completions.wnbpBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted },
            reward:() => player.quests.completions.wnbpBar
        },
        applesBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Apples Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.applesBar}/5 times,
                effective Apple Pickers are multiplied by ${tmp.quests.bars.applesBar.reward}`,
            display() { return this.completed() ? "DONE"
                : `${format(player.sys.businesses.apples.points)}/${this.goal()} Apples` },
            progress() { return this.completed() || player.sys.businesses.apples.points.div(this.goal()) },
            goal() {
                let base = 100
                let scaling = 25 ** Math.min(4, player.quests.completions.applesBar)

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.applesBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + player.quests.completions.applesBar/5
        },
        acceleratorBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Accelerator Power Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.acceleratorBar}/5 times,
                Accelerator Power gain from all sources is multiplied by ${tmp.quests.bars.acceleratorBar.reward}`,
            display() { return this.completed() ? "DONE"
                : `${format(player.sys.businesses.acceleratorPower.points)}/${this.goal()} Accelerator Power` },
            progress() { return this.completed() || player.sys.businesses.acceleratorPower.points.div(this.goal()) },
            goal() {
                let base = 1000
                let scaling = 5 ** Math.min(4, player.quests.completions.acceleratorBar)

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.acceleratorBar >= 5,
            unlocked() { return hasMilestone("sys", 3) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1 + (player.quests.completions.acceleratorBar ** 2) /10
        },
        smackBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Smack Attack Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.smackBar}/10 times,
                pre-scaled damage per smack is multiplied by ${format(tmp.quests.bars.smackBar.reward)}`,
            display() { return this.completed() ? "DONE"
                : `${format(player.bills.totalSmackDamage)}/${format(this.goal())} Damage from Smack Attacks`},
            progress() { return this.completed() || player.bills.totalSmackDamage.div(this.goal()) },
            goal() {
                let base = 50
                let scaling = 100 ** Math.min(9, player.quests.completions.smackBar)

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.smackBar >= 10,
            unlocked() { return hasUpgrade("bills", 11) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1 + (player.quests.completions.smackBar ** 2) / 10
        },
        zoneBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Zone Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.zoneBar}/10 times,
                Time Flux is multiplied by ${format(tmp.quests.bars.zoneBar.reward)}x`,
            display() { return this.completed() ? "DONE"
                : `${tmp.bills.highestZoneCompleted}/${this.goal()} Highest Zone Completed`},
            progress() { return this.completed() || tmp.bills.highestZoneCompleted/this.goal() },
            goal() {
                let completions = player.quests.completions.zoneBar
                return 10 * (completions + 1)
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.zoneBar >= 10,
            unlocked() { return hasUpgrade("bills", 11) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1 + .1 * player.quests.completions.zoneBar
        },
        enemyKillsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Enemy Kills Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.enemyKillsBar}/10 times,
                enemies drop ${format(tmp.quests.bars.enemyKillsBar.reward)}x more spent dollars`,
            display() { return this.completed() ? "DONE"
                : `${player.bills.totalEnemyKills}/${this.goal()} Enemy Kills`},
            progress() { return this.completed() || player.bills.totalEnemyKills / this.goal() },
            goal() {
                let completions = player.quests.completions.enemyKillsBar
                switch (completions) {
                    case 0: return 10
                    case 1: return 500
                    case 2: return 2500
                    case 3: return 5000
                    case 4: return 10000
                    case 5: return 20000
                    case 6: return 50000
                    case 7: return 125000
                    case 8: return 500000
                    case 9:
                    case 10: return 1000000
                    default: throw Error(`Enemy Kills Quest has invalid number of completions: ${completions}`)
                }
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.enemyKillsBar >= 10,
            unlocked() { return hasUpgrade("bills", 11) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1.25 ** player.quests.completions.enemyKillsBar
        },
        fastSpecksBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Fast Specks Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.fastSpecksBar}/10 times,
                max TSLS is decreased by ${timeDisplay(tmp.quests.bars.fastSpecksBar.reward)}`,
            display() { return this.completed() ? "DONE"
                : `Collect ${player.quests.specks.fastCollected}/${this.goal()} Specks within 30 seconds of spawning`},
            progress() { return this.completed() || player.quests.specks.fastCollected/this.goal() },
            goal() {
                let base = 1
                let scaling = factorial(1 + Math.min(4, player.quests.completions.fastSpecksBar))

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.fastSpecksBar >= 5,
            unlocked() { return hasMilestone("quests", 0) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 120 * player.quests.completions.fastSpecksBar // 2 mins per completion
        }
    },
    specks: {
        gain:() => {
            return 1
        },
        maxSpecks:() => {
            return 3
        },
        maxTsls:() => {
            let ret = 3600

            ret -= player.quests.grid[101] / 3 * 60 * 5
            ret -= tmp.quests.bars.fastSpecksBar.reward
            return ret
        },
        maxTimer:() => {
            return 30
        },
        spawnChance:() => {
            let ret = Math.min(player.quests.specks.tsls / tmp.quests.specks.maxTsls, 1) 
            ret *= tmp.quests.specks.spawnChanceMultiplier
            return ret
        },
        spawnChanceMultiplier:() => {
            return .1
        },
        speckDimensions:() => {
            return 15
        }
    },
    grid: {
        rows: 1, // If these are dynamic make sure to have a max value as well!
        cols: 4,
        getStartData(id) {
            if (id === undefined) return 
            // return getStartShopItem(id)
            // THIS SHOULD ONLY REALISTICALLY RETURN LEVELS, THE REST DOESN'T NEED TO BE STORED IN PLAYER DATA

            return 0
        },
        // getUnlocked(id) { // Default
        //     return true
        // },
        getCanClick(data, id) {
            return player.quests.specks.points.gte(this.getCost(data, id)) && data < getShopData(id).maxLevels
        },
        onClick(data, id) {
            player.quests.specks.points = player.quests.specks.points.sub(this.getCost(data, id))
            player.quests.grid[id]++
            updateShopDisplay(this.layer, id)
        },
        getEffect(data, id) {
            if (data === undefined) return
            switch (getShopData(id).type) {
                case "compounding": return getShopData(id).effect ** data
                case "additive": return getShopData(id).effect * data
                case "other":
                    //if (id == ...) return thing
                default: throw Error("Invalid shop effect type: " + getShopData(id).type)
            }
        },
        getTitle(data, id) {
            return getShopData(id).title
        },
        getDisplay(data, id) {
            return `${data}/${getShopData(id).maxLevels}`
        },
        getCost(data, id) {
            switch (id) {
                // case used for special cases (scaling cost)
                case 104: return getShopData(id).cost * (data + 1)
                default: return getShopData(id).cost
            }
        }
    },
    clickables: {
        11: {
            display() { return "Respawn Specks" },
            canClick() { return particles.length > 0 },
            onClick() {
                if (!confirm(`Are you sure you want to respawn the specks in random locations?
                    Their lifespans will be increased by 60 minutes.`)) return
                for (p in particles) {
                    let particle = particles[p]
                    particle.x = Math.random() * (tmp.other.screenWidth - 100) + 50
                    particle.y = Math.random() * (tmp.other.screenWidth - 100) + 50
                    particle.lifespan += 3600
                }
            },
            style() { return {'font-size':'12px', 'min-height':'50px'} }
        },
        12: {
            display() { return player.quests.specks.showPopup ? "Hide popups?" : "Show popups?" },
            //display() { return `Show popups?<br>${player.quests.specks.showPopup}`},
            canClick() { return true },
            onClick() { player.quests.specks.showPopup = !player.quests.specks.showPopup },
            style() { return {'font-size':'12px', 'min-height':'50px'} }
        }
    },
    update(diff) {
        if (!player.quests.unlocked) return

        if (hasMilestone("quests", 0)) {
            let speckData = player.quests.specks
            let tmpSpeckData = tmp.quests.specks
            
            if (speckData.speckCount < tmpSpeckData.maxSpecks) {
                speckData.timer += diff
                speckData.tsls += diff
                if (speckData.timer >= tmpSpeckData.maxTimer) {
                    if (tmpSpeckData.spawnChance >= Math.random()) {
                        console.log(`Spawn chance: ${format(tmpSpeckData.spawnChance * 100, 3)}%`)
                        console.log(`TSLS: ${speckData.tsls}`)
                        makeShinies(speckParticle)
                        if (player.quests.specks.showPopup) 
                            doPopup("quest", "A Speck Spawned", " ", 3, tmp.quests.color)
                        speckData.speckCount++
                        speckData.tsls = 0
                    }
                    speckData.timer -= tmpSpeckData.maxTimer
                }
            }
        }

        for (bar in tmp.quests.bars) {
            let quest = tmp.quests.bars[bar]
            if (isPlainObject(quest) && !quest.completed && quest.progress >= 1 && !quest.special) {
                //console.log(quest.progress.mag)
                player.quests.completions[bar] += 1
                player.quests.points = player.quests.points.add(1)
                doPopup("quest", quest.title, "Quest Complete!", 3, tmp.quests.color)
            }
        }
    },
    doReset(layer) {
        if (layer == "sys") {
            if (!player.quests.unlocked) {
                player.quests.unlocked = true
                return
            }
            
            // 0 <= progress <= 1, moves to 0 due to timer
            let timeBasedBars = ["dollarResetBar"]
            
            // "normal" quests, not affected by time, progress >= 1 for completed quests, activated on resets
            let resetBasedBars = ["dollarGainBar"]

            for (const bar of timeBasedBars) {
                let quest = tmp.quests.bars[bar]
                if (!quest.completed && quest.progress > 0) {
                    player.quests.completions[bar] += 1
                    player.quests.points = player.quests.points.add(1)
                    doPopup("quest", tmp.quests.bars[bar].title, "Quest Complete!", 3, tmp.quests.color)
                }
            }

            for (const bar of resetBasedBars) {
                let quest = tmp.quests.bars[bar]
                if (!quest.completed && quest.progress >= 1) {
                    player.quests.completions[bar] += 1
                    player.quests.points = player.quests.points.add(1)
                    doPopup("quest", tmp.quests.bars[bar].title, "Quest Complete!", 3, tmp.quests.color)
                }
            }
        }
    },
    tabFormat: {
        "Main": {
            content: questTabFormat
        },
        "Milestones": {
            content: [
                ["display-text", function() { return `You have completed 
                    <h2><span style="color: blue; text-shadow: 0px 0px 10px blue; font-family: Lucida Console, Courier New, monospace">
                    ${formatWhole(player.quests.points)}</span></h2> quests`
                }], "blank", "milestones"
            ]
        },
        "Specks": {
            content: [
                ["display-text", function() { return `You have
                    <h2><span style="color: white; text-shadow: 0px 0px 10px white; font-family: Lucida Console, Courier New, monospace">
                    ${format(player.quests.specks.points, 2)}</span></h2> specks`
                }], "blank",
                ["display-text", function() { return `There is currently a ${format(tmp.quests.specks.spawnChance * 100)}% chance
                    that a speck will spawn in ${format(Math.max(0, tmp.quests.specks.maxTimer - player.quests.specks.timer))} seconds.
                    <br>${player.quests.specks.speckCount}/${tmp.quests.specks.maxSpecks} specks are spawned`
                }], "blank", 
                "grid", "blank",
                ["display-text", function() { return player.quests.specks.shopDisplay }], "blank",
                "clickables"
            ],
            unlocked:() => hasMilestone("quests", 0)
        },
        "Info": {
            content: [
                ["display-text", `<h2>Quests</h2><br>Quests are mini-challenges/milestones that provide unique boosts once completed. 
                    Many Quests are repeatable, and will provide an increasing effect based on how many times they are completed, while others can 
                    only be done once.<br><br>The requirements for these Quests vary, and some may not be feasible depending on your progression,
                    but in time, you will be able to complete every Quest. More Quests will unlock as you progress through the game.
                    <br><br>As you progress through most Quests, their bars will fill up with white color to indicate how close you are to the goal.
                    Some quests can be failed, however, and this is indicated by red fill color.<br><br>`
                ], "blank",
                () => hasMilestone("quests", 0) ? ["microtabs", "info"] : ""
            ]
        }
    },
    microtabs: {
        info: {
            "Specks": {
                content: [
                    "blank",
                    ["display-text", `Specks can spawn anywhere on your screen, and will stay there until collected. You can collect specks by
                        hovering your mouse over them (or tapping them on mobile), and will gain a proportional number of Specks as currency.
                        They can hide within any other displayable object, such as buttons, text, or icons, though most will be easy to spot.`],
                    "blank"
                ]
            },
            "Spawning": {
                content: [
                    "blank",
                    ["display-text", `Specks have a chance of spawning that changes based on how much time has passed since the last speck
                        was spawned (TSLS). The code used to implement this is follows:<br><br>
                        IF min(TSLS / maxTSLS, 1) * spawnChanceMultiplier < random(0, 1) THEN spawnSpeck()
                        <br><br>Essentially, the larger the value of TSLS is, the more likely it is that a speck will spawn. maxTSLS is a
                        variable that determines how much time can pass before your spawn chance is capped. It is initially set to 3600,
                        which means that 1 hour can pass before your spawn chance is capped. spawnChanceMultiplier is used to scale your
                        spawn chance. It is initially set to 0.1, which means that your spawn chance is initially capped at 0.1.
                        <br><br>The check displayed above is <h3 style="color: red">not</h3> called every tick. It is called once every 30 
                        seconds, which means that, no matter what your spawn chance is, only one speck can spawn per 30 seconds (at first).`],
                    "blank"
                ]
            }
        }
    },
    componentStyles: {
        "buyable"() { return {'font-size':'12px', 'height':'100px', 'width':'100px'} },
        "grid"() { return {'border-style':'solid', 'border-width':'5px', 'padding':'20px', 'max-width':'fit-content'} }
    }
})

const speckParticle = {
    time: Number.POSITIVE_INFINITY,
    width:() => tmp.quests.specks.speckDimensions,
    height:() => tmp.quests.specks.speckDimensions,
    lifespan: 0,
    onMouseOver() {
        console.log("mouse detected over speck")
        player.quests.specks.points = player.quests.specks.points.add(tmp.quests.specks.gain)
        player.quests.specks.speckCount--
        player.quests.specks.collected++
        if (this.lifespan <= 30) player.quests.specks.fastCollected++
        Vue.delete(particles, this.id)
    },
    onClick() {
        return this.onMouseOver()
    }
}