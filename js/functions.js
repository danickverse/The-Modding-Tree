function timeDisplay(time, showDecimal=true) {
    if (showDecimal) funct = format
    else funct = formatWhole
    if (time < 60) return `${funct(time)} second` + (time > 1 ? "s" : "")
    else if (time < 3600) return `${funct(time/60, 2)} minute` + (time/60 > 1 ? "s" : "")
    else if (time < 86400) return `${funct(time/3600, 2)} hour` + (time/3600 > 1 ? "s" : "")
    else return `${funct(time/86400, 2)} day` + (time/86400 > 1 ? "s" : "")
}

function factorial(x) {
    if (x < 0 || x % 1 != 0) throw Error("lol factorial " + x)
    if (x == 0 || x == 1) return 1
    let ret = x
    for (let i = x - 1; i > 1; i--) {
        ret *= i
    }
    return ret
}

function upgrade23Limit() {
    let base = player.p.points.mul(100).pow(upgrade23LimitExp()).add(100)
    if (hasMilestone("a", 0) && base.lt(new Decimal("9.99e9"))) {
        let limit = new Decimal("1e10")
        let newValFactor = limit.sub(base).log10().div(20).add(1) // 1 + log10(L-B)/20
        base = base.mul(newValFactor) // max(limit, base * (1 + log10(limit-base)/20))
    }
    if (getClickableState("e", 21) || getClickableState("e", 22)) base = base.div(5)
    if (getClickableState("e", 31)) base = base.mul(clickableEffect("e", 31))
    if (getClickableState("e", 32)) base = base.div(10)
    return base.max(100)
}

function upgrade23LimitExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 34)) exp = exp.add(upgradeEffect("p", 34))
    if (hasUpgrade("e", 12)) exp = exp.add(upgradeEffect("e", 12))
        if (hasAchievement('a', 35) && (!hasAchievement('a', 81) || hasAchievement("a", 94))) exp = exp.add(.01)
    if (hasMilestone("s", 1)) exp = exp.add(tmp.s.stored_investment.effects[3][0])
    if (hasUpgrade("sys", 22)) exp = exp.mul(upgradeEffect("sys", 22))
    return exp
}

function upgrade23EffBase() {
    let base = new Decimal("10")
    if (hasMilestone("a", 7)) base = base.add(1)

    return base
    // let exp = decimalOne
    // if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
    // if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(30))
    // if (hasUpgrade("e", 42)) exp = exp.add(upgradeEffect("e", 12).mul(6))

    // return base.pow(exp)
}

function upgrade23EffExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
    if (hasMilestone("s", 1)) exp = exp.add(tmp.s.stored_investment.effects[3][1])
    if (hasUpgrade("e", 42)) exp = exp.add(upgradeEffect("e", 12).mul(6))
    return exp
}

function upgrade14Limit() {
    let limit = new Decimal("1e6")
    if (hasUpgrade("p", 33)) limit = limit.mul(upgradeEffect("p", 33))
    return limit
}

function penniesTaxFactor() {
    let pts = pennyTaxStart()
    let pte = pennyTaxExp()
    if (player.p.points.lt(pts) && player.p.best.lt(pts)) return decimalOne
    let taxFactor = player.p.best.div(2).max(player.p.points).div(pts) // base tax factor = pennies/1e6
    taxFactor = taxFactor.add(.5).pow(pte) // returns (.5 + pennies / 1e6)^2.5 initially
    return taxFactor
}

function pennyTaxStart() {
    let baseTaxes = new Decimal("1e6")
    if (hasUpgrade("p", 45)) baseTaxes = baseTaxes.mul(upgradeEffect("p", 42))
    if (hasMilestone("s", 2)) baseTaxes = baseTaxes.mul(tmp.s.stored_expansion.effects[4])
    if (inChallenge("s", 11)) baseTaxes = baseTaxes.div(1e4)
    return baseTaxes
}

function pennyTaxExp() {
    let baseExp = new Decimal("2.5")
    if (inChallenge("s", 11)) baseExp = baseExp.sub(1)
    if (hasMilestone("s", 5)) baseExp = baseExp.sub(tmp.s.stored_investment.effects[7])
    if (hasUpgrade("p", 62)) baseExp = baseExp.sub(upgradeEffect("p", 62))
    return baseExp.max(1)
}

function investmentGain() {
    if (inAnyChallenge()) {
        let ret = decimalOne
        if (inChallenge("s", 12)) ret = ret.div(10)
        if (hasMilestone("s", 4)) ret = ret.mul(tmp.s.stored_investment.effects[6])
        if (hasUpgrade("p", 53)) ret = ret.mul(upgradeEffect("p", 53))
        if (hasUpgrade("sys", 13)) ret = ret.mul(upgradeEffect("sys", 13))
        if (hasAchievement("a", 85)) ret = ret.mul(1.5)
        return ret
    }
    let investmentExponent = new Decimal(".5")
    let ret = player.p.points.div(1000000).pow(investmentExponent)
    if (hasAchievement("a", 25)) ret = ret.mul(2)
    if (hasAchievement("a", 34)) ret = ret.mul(1.1)
    if (hasAchievement("a", 44)) ret = ret.mul(1.2)
    if (hasMilestone("a", 4)) ret = ret.mul(1.1 ** (player.a.milestones.length - 3))
    if (hasUpgrade("p", 43)) ret = ret.mul(upgradeEffect("p", 43))
    if (hasUpgrade("p", 53)) ret = ret.mul(upgradeEffect("p", 53))
    ret = ret.mul(tmp.s.stored_investment.effects[1])
    if (hasMilestone("s", 4)) ret = ret.mul(tmp.s.stored_investment.effects[6])
    ret = ret.mul(player.sys.points.add(1).pow(1.5))
    if (hasUpgrade("sys", 13)) ret = ret.mul(upgradeEffect("sys", 13))
    if (hasMilestone("s", 1) && hasUpgrade("s", 14)) ret = ret.mul(tmp.s.stored_expansion.effects[3][0])
    if (hasAchievement("a", 85)) ret = ret.mul(1.5)

    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    return ret
}

function investment2Gain() {
    let investmentExponent = new Decimal(".4")
    let ret = player.p.investment.points.div(10000).pow(investmentExponent)
    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    if (hasMilestone("s", 1)) ret = ret.mul(tmp.s.stored_expansion.effects[3][0])
    if (hasMilestone("a", 6)) ret = ret.mul(1.01**(player.a.milestones.length+player.a.achievements.length-28))
    if (hasAchievement("a", 85)) ret = ret.mul(1.5)
    
    let softcapStart = tmp.p.buyables[12].softcap
    if (ret.gte(softcapStart)) {
        // EX: 5000 softcap base, 4000 ex inv, 4200 ret --> saved = 1000, ret = 4200 - saved = 3200
        // then, apply softcap to remaining gain (which is stored in ret) --> ret = 3200^.4 = 25.24
        // return saved + ret = 1000 + 25.24
        // if ex inv >= 5000, no tricky business b/c of .max(0), simply apply softcap to ret
        // let saved = softcapStart.sub(player.p.investment2.points).max(decimalZero)
        // ret = ret.sub(saved)
        // return saved.add(ret.pow(.4))

        let excess = ret.sub(softcapStart)
        return softcapStart.add(excess.pow(.4))
    }

    return ret
}

function investmentReset(resetInvestment, resetInvestment2) {
    player.p.points = decimalZero
    player.p.best = decimalZero
    player.p.total = decimalZero
    player.resetTime = 0
    
    let keepUpgrades = [21, 25, 35, 41, 42, 51, 52, 53, 54, 55, 61, 62, 63, 64, 65]
    if (player.e.everUpg23) keepUpgrades.push(23)
    keepUpgrades = keepUpgrades.filter(
        (index) => hasUpgrade("p", index)
    )
    player.p.upgrades = keepUpgrades

    setBuyableAmount("p", 21, decimalZero)
    setBuyableAmount("p", 22, decimalZero)

    player.points = decimalZero

    if (resetInvestment) player.p.investment.points = decimalZero
    if (resetInvestment2) player.p.investment2.points = decimalZero
}

function expanPassGen(diff) {
    if (getResetGain("e").gt(decimalZero)) {
        let eGain = tmp.e.resetGain.times(diff)
        let eLossFactor = (1 - .3/100) ** diff
        player.e.points = player.e.points.add(eGain).mul(eLossFactor)
    }

    let pGain = tmp.e.penny_expansions.getResetGain.times(diff)
    let pLossFactor = (1 - tmp.e.penny_expansions.lossRate) ** diff
    player.e.penny_expansions.points = player.e.penny_expansions.points.add(pGain).mul(pLossFactor)
}

function boostedTime(diff) {
    let ret = diff
    if (hasMilestone("a", 8)) ret *= (1 + (player.a.achievements.length**1.5)/1000)
    ret *= tmp.quests.bars.dollarResetBar.reward
    ret *= gridEffect("quests", 101)
    return ret
}

function conversionRate() {
    let base = baseConversionRate()

    let mul = 1
    if (hasMilestone("a", 9)) mul *= 1.01 ** Math.max(0, player.a.achievements.length - 35)
    if (hasUpgrade("sys", 14)) mul *= upgradeEffect("sys", 14)
    mul *= tmp.quests.bars.penniesBar.reward
    mul *= gridEffect("quests", 101)

    return (base * mul) / 100
}

function baseConversionRate() {
    let ret = 1
    let baseAdd = 0
    if (hasAchievement("a", 82)) baseAdd += .01
    if (hasAchievement("a", 83)) baseAdd += .01
    if (hasAchievement("a", 84)) baseAdd += .01
    if (hasAchievement("a", 85)) baseAdd += .02
    baseAdd += Number(tmp.s.stored_dollars.effects[2])

    return ret + baseAdd
}

function systemUpgradeCost(row) {
    let boughtInRow = player.sys.upgrades.filter(
        (index) => Math.floor(index / 10) == row
    ).length

    switch (row) {
        case 1: return new Decimal(.15 + .15 * boughtInRow)
        case 2: return new Decimal(1 + .25 * boughtInRow)
        default: throw Error("Invalid row supplied to systemUpgradeCost")
    }
}

function updateBills(spent) {
    let billsData = player.bills
    billsData.points = billsData.points.add(spent)
    // spent > 0 --> adding spent dollars, from convert clickable, closer to next denomination
    // spent < 0 --> from buying buyable
    if (spent > 0) {
        billsData.total = billsData.total.add(spent)
        if (billsData.highestDenominationIndex == 9) return
        let denominationValues = {
            9: 10000,
            8: 1000,
            7: 100, 
            6: 50, 
            5: 20, 
            4: 10, 
            3: 5, 
            2: 2, 
            1: 1
        }
        for (let i = 9; i >= 1; i--) {
            let value = denominationValues[i]
            if (billsData.total.gte(value * 10) && billsData.highestDenominationIndex <= i) {
                billsData.highestDenominationIndex = i
                billsData.highestDenomination = value
                billsData.nextDenominationUnlock = denominationValues[i+1] * 10
                return
            }
        }

        // spent dollars < 1
        billsData.highestDenominationIndex = 0
        billsData.highestDenomination = 0
        billsData.nextDenominationUnlock = 1
    } else {
        let ELO = decimalZero
        for (const id of [11, 12, 13, 21, 22, 23, 31, 32, 33]) {
            let amt = getBuyableAmount("bills", id)
            let denomination = tmp.bills.buyables[id].denomination
            ELO = ELO.add(amt * denomination)
        }
        billsData.elo = ELO
    }
}

function attackEnemy(damage) {
    player.bills.enemyHealth = player.bills.enemyHealth.sub(damage)
    if (player.bills.enemyHealth.lte(0)) {
        // player.sys.points = player.sys.points.add(tmp.sys.bars.enemyBar.loot)
        updateBills(tmp.bills.bars.enemyBar.loot)
        player.bills.totalEnemyKills += 1
        player.bills.currentEnemyKills += 1
        if (player.bills.currentEnemyKills < tmp.bills.maxEnemyKills) {
            player.bills.currentEnemyKills = 0
            player.bills.enemyLevel += 1
        }
        player.bills.enemyHealth = layers.bills.bars.enemyBar.maxHealth()
    }
}

function getShopData(id) {
    let max; let title; let display; let cost; let type
    switch (id) {
        case 101:
            max = 3; title = "Beginner Pack"; cost = 3
            display = `Multiply point gain, post-nerf penny gain, expansion gain, 
                        effective Apple Trees, time flux, and the conversion rate by 1.2x per level,
                        and max TSLS (see Info) is reduced by 1 minute and 40 seconds per level`
            effect = 1.2; type = "compounding"; break
        case 102:
            max = 10; title = "Points EX"; cost = 2
            display = `Increase base point gain by 0.5 per level`
            effect = .5; type = "additive"; break
        case 103:
            max = 10; title = "Points EX"; cost = 2
            display = `Multiply penny gain by 1.1x per level`
            effect = 1.1; type = "compounding"; break
        case 104:
            max = 10; title = "Conversion EX"; cost = 2
            display = `Increase the base conversion rate by 5% per level`
            effect = .05; type = "additive"; break
        case 105:
            max = 10; title = ""
        default: throw Error(`Missing Shop grid case for id: ${id}`)
    }
    return {
        maxLevels: max, title: title, 
        shopDisplay: display, cost: cost,
        effect: effect, type: type
    }
}

function updateShopDisplay(layer, id, exit=false) {
    if (exit) { player.quests.specks.shopDisplay = ""; return }
    if (layer != "quests") return

    let shopData = getShopData(id)
    let levels = getGridData(layer, id)

    let cost = `Cost: ${tmp.quests.grid.getCost(levels, id)} Specks`
    let dis = shopData.shopDisplay
    let eff = "Current effect: "
    let effVal = toPlaces(gridEffect(layer, id), 2)

    switch (shopData.type) {
        case "compounding": 
            if (id == 101) eff += effVal + "x, -" + timeDisplay(levels / 3 * 60 * 5, false);
            else eff += effVal + "x"
            break
        case "additive": eff += "+" + effVal; break;
        case "other":
            
            // do others
        default: throw Error("Shop item has invalid type: " + shopData.type)
    }

    player.quests.specks.shopDisplay = `${cost}<br><br>${dis}<br><br>${eff}`
}