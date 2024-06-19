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
                smackBar: 0,
                enemyKillsBar: 0
            },
            hideCompleted: false
        }
    },
    tooltip: "Quests",
    layerShown() { return player.quests.unlocked },
    milestones: {
        0: {
            requirementDescription: "1000 Quests (Placeholder)",
            effectDescription: "Unlock Specks, The Shop, and a new Quest",
            done() { return player.quests.points.gte(1000) }
        }
    },
    bars: {
        pointsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Points Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.pointsBar}/5 times,
                post-nerf penny gain is multiplied by ${format(tmp.quests.bars.pointsBar.reward)}`,
            display() { return `${format(player.points)}/${format(this.goal())} Points` },
            progress() { return this.completed() || player.points.add(1).log10().div(this.goal().log10()) },
            goal() {
                let baseExp = 10
                let scaling = 45 * Math.min(4, player.quests.completions.pointsBar)
                let exp = baseExp + scaling

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
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.penniesBar}/6 times,
                the conversion rate is multiplied by ${format(tmp.quests.bars.penniesBar.reward)}`,
            display() { return `${format(player.p.points)}/${this.goal()} Pennies` },
            progress() { return this.completed() || player.p.points.add(1).log10().div(this.goal().log10()) },
            goal() {
                let baseExp = 34
                let scaling = 6 * Math.min(5, player.quests.completions.penniesBar)
                let exp = baseExp + scaling

                return new Decimal(10).pow(exp)
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.penniesBar >= 6,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + .02 * player.quests.completions.penniesBar
        },
        dollarResetBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Dollar Reset Time Quest",
            timeBased: true,
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.dollarResetBar}/5 times,
                reset time gain is multiplied by ${format(tmp.quests.bars.dollarResetBar.reward)}`,
            display() { 
                let goal = this.goal()
                let timeLeft = this.progress() * goal

                if (timeLeft == 0) timeLeftText = `(Failed)`
                else timeLeftText = `(${timeDisplay(timeLeft)} left)`


                return `Perform a Dollar reset in under ${timeDisplay(goal, false)} ` + timeLeftText
                // if (goal <= 60) return `Perform a Dollar reset in under ${goal} seconds ` + timeLeftText
                // else if (goal <= 3600) return `Perform a Dollar reset in under ${goal/60} minutes ` + timeLeftText
                // else return `Perform a Dollar reset in under ${goal/3600} hours ` + timeLeftText
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
                    case 2: return 1800
                    case 3: return 600
                    case 4:
                    case 5: return 300
                    default:  throw Error(`Dollar Reset quest has invalid number of completions: ${completions}`)
                }
                // if (completions == 0) return 10800
                // else if (completions == 1) return 3600
                // else if (completions == 2) return 1800
                // else if (completions == 3) return 600
                // else if (completions >= 4) return 300
            },
            textStyle: {'color' : 'blue'},
            baseStyle: {'background-color' : 'red'},
            completed:() => player.quests.completions.dollarResetBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + .04 * (player.quests.completions.dollarResetBar ** 2)
        },
        dollarGainBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Dollar Gain Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.dollarGainBar}/6 times,
                the expansion investment hardcap and softcap are multiplied by ${format(tmp.quests.bars.dollarGainBar.reward)}`,
            display() { return `Gain ${this.goal()} Dollars on reset` },
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
            title: "Dollar Gain Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.wnbpBar}/4 times,
                the WNBP effect exponent is increased by ${format(tmp.quests.bars.wnbpBar.reward)}`,
            display() { 
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
                let base = new Decimal("1e10")
                
                let completions = player.quests.completions.wnbpBar
                switch (completions) {
                    case 0: return base
                    case 1: return base.pow(1.5)
                    case 2: return base.pow(2.5)
                    case 3: 
                    case 4: return base.pow(4)
                    default: throw Error(`WNBP quest has invalid number of completions: ${completions}`)
                }
            },
            textStyle: {'color' : 'blue'},
            baseStyle:() => player.sys.everWNBP ? {'background-color' : 'red'} : {},
            completed:() => player.quests.completions.wnbpBar >= 4,
            unlocked() { return hasMilestone("sys", 4) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => player.quests.completions.wnbpBar / 10
        },
        applesBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Apples Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.applesBar}/5 times,
                you have ${tmp.quests.bars.applesBar.reward} more effective Apple Pickers`,
            display() { return `${format(player.sys.businesses.apples.points)}/${this.goal()} Apples` },
            progress() { return this.completed() || player.sys.businesses.apples.points.div(this.goal()) },
            goal() {
                let base = 100
                let scaling = 5 ** Math.min(4, player.quests.completions.applesBar)

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.applesBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => player.quests.completions.applesBar
        },
        smackBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Smack Attack Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.smackBar}/10 times,
                damage per smack is multiplied by ${format(tmp.quests.bars.smackBar.reward)}`,
            display() { return `${format(player.sys.bills.totalSmackDamage)}/${format(this.goal())} Damage from Smack Attacks`},
            progress() { return this.completed() || player.sys.bills.totalSmackDamage.div(this.goal()) },
            goal() {
                let base = 100
                let scaling = 10 ** Math.min(9, player.quests.completions.smackBar)

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.smackBar >= 10,
            unlocked() { return hasUpgrade("sys", 211) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1 + player.quests.completions.smackBar ** 2 / 4
        },
        enemyKillsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Enemy Kills Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.enemyKillsBar}/10 times,
                enemies drop ${format(tmp.quests.bars.enemyKillsBar.reward)}x more spent dollars`,
            display() { return `${player.sys.bills.totalEnemyKills}/${this.goal()} Enemy Kills`},
            progress() { return this.completed() || player.sys.bills.totalEnemyKills/this.goal() },
            goal() {
                let base = 10
                let scaling = Math.max(1, 10 * Math.min(9, player.quests.completions.enemyKillsBar))

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.enemyKillsBar >= 10,
            unlocked() { return hasAchievement("a", 94) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1.1 ** player.quests.completions.enemyKillsBar
        }
    },
    update(diff) {
        if (!player.quests.unlocked) return
        for (bar in tmp.quests.bars) {
            let quest = tmp.quests.bars[bar]
            if (typeof quest !== "string" && !quest.completed && quest.progress >= 1 && !quest.timeBased) {
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
            
            // 0 < progress <= 1 due to timer
            let timeBasedBars = ["dollarResetBar"]
            
            // "normal" quests, not affected by time, progress >= 1 for completed quests
            let resetBasedBars = ["dollarGainBar", "wnbpBar"]

            for (const bar of timeBasedBars) {
                let quest = tmp.quests.bars[bar]
                if (!quest.completed && quest.progress > 0) {
                    player.quests.completions.dollarResetBar += 1
                    player.quests.points = player.quests.points.add(1)
                    doPopup("quest", tmp.quests.bars.dollarResetBar.title, "Quest Complete!", 3, tmp.quests.color)
                }
            }

            for (const bar of resetBasedBars) {
                let quest = tmp.quests.bars[bar]
                if (!quest.completed && quest.progress >= 1) {
                    player.quests.completions.dollarResetBar += 1
                    player.quests.points = player.quests.points.add(1)
                    doPopup("quest", tmp.quests.bars.dollarResetBar.title, "Quest Complete!", 3, tmp.quests.color)
                }
            }
        }
    },
    tabFormat: {
        "Main": {
            content: [
                ["display-text", function() { return `You have completed 
                    <h2><span style="color: blue; text-shadow: 0px 0px 10px blue; font-family: Lucida Console, Courier New, monospace">
                    ${formatWhole(player.quests.points)}</span></h2> quests`
                }],
                "blank",
                ["row", [
                    ["display-text", "Hide completed Quests:&ensp;"], 
                    ["toggle", ["quests", "hideCompleted"]]
                ]],
                "blank",
                () => tmp.quests.bars.pointsBar.unlocked ? ["column", [
                    ["bar", "pointsBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.pointsBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.penniesBar.unlocked ? ["column", [
                    ["bar", "penniesBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.penniesBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.dollarResetBar.unlocked ? ["column", [
                    ["bar", "dollarResetBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.dollarResetBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.dollarGainBar.unlocked ? ["column", [
                    ["bar", "dollarGainBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.dollarGainBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.wnbpBar.unlocked ? ["column", [
                    ["bar", "wnbpBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.wnbpBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.applesBar.unlocked ? ["column", [
                    ["bar", "applesBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.applesBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.smackBar.unlocked ? ["column", [
                    ["bar", "smackBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.smackBar.effectDisplay()], 
                    "blank"
                ]] : "",
                () => tmp.quests.bars.enemyKillsBar.unlocked ? ["column", [
                    ["bar", "enemyKillsBar"],
                    "blank",
                    ["display-text", tmp.quests.bars.enemyKillsBar.effectDisplay()], 
                    "blank"
                ]] : ""
            ]
        },
        "Milestones": {
            content: [
                ["display-text", function() { return `You have completed 
                    <h2><span style="color: blue; text-shadow: 0px 0px 10px blue; font-family: Lucida Console, Courier New, monospace">
                    ${formatWhole(player.quests.points)}</span></h2> quests`
                }],
                "blank", "milestones"
            ]
        },
        "Info": {
            content: [
                ["display-text", `Quests are mini-challenges/milestones that provide unique boosts once completed. Many Quests are repeatable,
                    and will provide an increasing effect based on how many times they are completed, while others can only be done once.
                    <br><br>The requirements for these Quests vary, and some may not be feasible depending on your progression, but in time,
                    you will be able to complete every Quest. More Quests will unlock as you progress through the game.
                    <br><br>As you progress through most Quests, their bars will fill up with white color to indicate how close you are to the goal.
                    Some quests can be failed, however, and this is indicated by red fill color.`
                ]
            ]
        }
    },
})