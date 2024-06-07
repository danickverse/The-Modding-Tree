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
                pointsBar: 0
            },
            showCompleted: false
        }
    },
    tooltip: "Quests",
    layerShown() {
        let visible = false
        if (player.quests.unlocked || hasMilestone("sys", 0)) {
            player.quests.unlocked = true
            visible = true
        }
        return visible
    },
    bars: {
        pointsBar: {
            direction: RIGHT,
            width: 500,
            height: 50,
            title: "Points Quest",
            effectDisplay:() => `(IMPLEMENT THIS!) Because you have completed this quest ${player.quests.completions.pointsBar}/5 times,
                post-nerf penny gain is multiplied by ${format(tmp.quests.bars.pointsBar.reward)}`,
            display() { return `Reach ${this.goal()} Points` },
            progress() { return player.points.log10().div(this.goal().log10()) },
            goal() {
                let base = 20
                let scaling = player.quests.completions.pointsBar
                let exp = base + 40 * scaling

                return new Decimal(10).pow(exp)
            },
            textStyle: {'color' : 'blue'},
            completed:() => player.quests.completions.pointsBar >= 5,
            unlocked() { return !this.completed() || player.quests.showCompleted},
            reward() { return Math.pow(1.2, player.quests.completions.pointsBar) }
        }
    },
    update(diff) {
        for (bar in tmp.quests.bars) {
            let quest = tmp.quests.bars[bar]
            if (typeof quest !== "string" && !quest.completed) {
                if (quest.progress.gte(1)) {
                    console.log(quest.progress.mag)
                    player.quests.completions[bar] += 1
                    player.quests.points = player.quests.points.add(1)
                    doPopup("quest", quest.title, "Quest Complete!", 3, tmp.quests.color)
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
                    ["display-text", "Show completed Quests:&ensp;"], 
                    ["toggle", ["quests", "showCompleted"]]
                ]],
                "blank",
                ["bar", "pointsBar"],
                "blank",
                () => tmp.quests.bars.pointsBar.unlocked ? ["display-text", tmp.quests.bars.pointsBar.effectDisplay()] 
                    : ""
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
    // componentStyles: {
    //     "bars"() { return {'color': 'blue'} }
    // }
})