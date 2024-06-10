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
                applesBar: 0,
                smackBar: 0
            },
            hideCompleted: false
        }
    },
    tooltip: "Quests",
    layerShown() { return player.quests.unlocked },
    bars: {
        pointsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Points Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.pointsBar}/5 times,
                penny gain is multiplied by ${format(tmp.quests.bars.pointsBar.reward)}`,
            display() { return `${format(player.points)}/${format(this.goal())} Points` },
            progress() { return this.completed() || player.points.add(1).log10().div(this.goal().log10()) },
            goal() {
                let baseExp = 20
                let scaling = 40 * Math.min(4, player.quests.completions.pointsBar)
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
                else if (timeLeft <= 60) timeLeftText = `(${format(timeLeft)} seconds left)`
                else if (timeLeft <= 3600) timeLeftText = `(${format(timeLeft/60, 2)} minutes left)`
                else timeLeftText = `(${format(timeLeft/3600, 2)} hours left)`


                if (goal <= 60) return `Perform a Dollar reset in under ${goal} seconds ` + timeLeftText
                else if (goal <= 3600) return `Perform a Dollar reset in under ${goal/60} minutes ` + timeLeftText
                else return `Perform a Dollar reset in under ${goal/3600} hours ` + timeLeftText
            },
            progress() { return this.completed() || Math.max(0, this.goal() - player.sys.resetTime) / this.goal() },
            //     if (this.completed()) return 1
            //     //console.log(Math.max(0, this.goal() - player.sys.resetTime) / this.goal())
            //     return Math.max(0, this.goal() - player.sys.resetTime) / this.goal()
            // },
            goal() {
                let completions = player.quests.completions.dollarResetBar
                if (completions == 0) return 10800
                else if (completions == 1) return 3600
                else if (completions == 2) return 1800
                else if (completions == 3) return 600
                else if (completions >= 4) return 300
            },
            textStyle: {'color' : 'blue'},
            baseStyle: {'background-color' : 'red'},
            completed:() => player.quests.completions.dollarResetBar >= 5,
            unlocked() { return !this.completed() || !player.quests.hideCompleted},
            reward:() => 1 + .04 * (player.quests.completions.dollarResetBar ** 2)
        },
        applesBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Apples Quest",
            effectDisplay:() => `Because you have completed this quest ${player.quests.completions.applesBar}/5 times,
                you have ${tmp.quests.bars.applesBar.reward} more effective Apple Pickers`,
            display() { return `${format(player.sys.apples.points)}/${this.goal()} Apples` },
            progress() { return this.completed() || player.sys.apples.points.div(this.goal()) },
            goal() {
                let base = 25
                let scaling = 5 ** player.quests.completions.applesBar

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
                you do ${format(tmp.quests.bars.smackBar.reward)}x more damage per smack`,
            display() { return `${format(player.sys.bills.totalSmackDamage)}/${format(this.goal())} Damage from Smack Attacks`},
            progress() { return this.completed() || player.sys.bills.totalSmackDamage.div(this.goal()) },
            goal() {
                let base = 50
                let scaling = 10 ** player.quests.completions.smackBar

                return base * scaling
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.smackBar >= 10,
            unlocked() { return hasUpgrade("sys", 111) && (!this.completed() || !player.quests.hideCompleted) },
            reward:() => 1 + player.quests.completions.smackBar ** 2 / 4
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
            
            let timeBasedBars = ["dollarResetBar"]
            for (const bar of timeBasedBars) {
                let quest = tmp.quests.bars[bar]
                if (!quest.completed && quest.progress > 0) {
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
                ]] : ""
            ]
        },
        "Info": {
            content: [
                ["display-text", `Quests are mini-challenges/milestones that provide unique boosts once completed. Some Quests are repeatable,
                    and will provide a compounding effect based on how many times they are completed, while others can only be done once.
                    <br><br>The requirements for these Quests vary, and some may not be feasible depending on your progression, but in time,
                    you will be able to complete every Quest. More Quests will unlock as you progress through the game.`
                ]
            ]
        }
    },
})