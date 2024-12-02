let denominationValues = {
    10: -1,
    9: 1000000000000,
    8: 10000000000,
    7: 100000000, 
    6: 5000000, 
    5: 200000, 
    4: 10000, 
    3: 500, 
    2: 20, 
    1: 1
}

function logarithmicSoftcap(value, initSoftcap, softcapMult, maxIter, basePow, powModification = 0) {
    let ret = value
    let i = 0
    while (i < maxIter) {
        let softcapStart = Decimal.pow(softcapMult, i).mul(initSoftcap)
        if (ret.lte(softcapStart)) break
        let pow = basePow - (powModification ? i * powModification : 0)
        ret = softcap(ret, softcapStart, pow)
        i += 1
    }
    return ret
}

function timeDisplay(time, showDecimal=true) {
    if (showDecimal) funct = format
    else funct = formatWhole
    if (time < 60) return `${funct(time)} second` + (time != 1 ? "s" : "")
    else if (time < 3600) return `${funct(time/60, 2)} minute` + (time/60 > 1 ? "s" : "")
    else if (time < 86400) return `${funct(time/3600, 2)} hour` + (time/3600 > 1 ? "s" : "")
    else return `${funct(time/86400, 2)} day` + (time/86400 > 1 ? "s" : "")
}

function factorial(x) {
    if (x < 0 || x % 1 != 0) throw Error("lol factorial " + x)
    if (x == 0) return 1
    if (x == 1 || x == 2) return x
    
    let ret = x
    for (let i = x - 1; i > 1; i--) {
        ret *= i
    }
    return ret
}

function basicUpgradeFormat(title, desc, req, eff = "") {
    return `<h3>${title}</h3><br>${desc}${eff != "" ? "<br>Currently: " + eff : ""}<br><br>${req}`
}

function getLogisticTimeConstant(current, gain, loss){
    // stolen from @pg132's Tree of Life
    if (current.eq(gain.div(loss))) return Infinity
    if (current.gt(gain.div(loss))) return current.times(loss).sub(gain).ln().div(-1).div(loss)
    return current.times(loss).sub(gain).times(-1).ln().div(-1).div(loss)
}

function getLogisticAmount(current, gain, loss, diff){
    // stolen from @pg132's Tree of Life
    if (current.eq(gain.div(loss))) return current
    if (gain.gte("ee10")) return gain.div(loss)
    if (current.lt(gain.div(loss))) {
            c = getLogisticTimeConstant(current, gain, loss)
            
            val1 = c.plus(diff) // t+c
            val2 = val1.times(-1).times(loss) // -B(t+c)
            val3 = Decimal.exp(val2) // this should be A-Bx
            val4 = gain.sub(val3) // should be A-(A-Bx) = Bx
            val5 = val4.div(loss) // should be x

            return val5.max(0)
    } else {
            c = getLogisticTimeConstant(current, gain, loss)
            
            val1 = c.plus(diff) // t+c
            val2 = val1.times(-1).times(loss) // -B(t+c)
            val3 = Decimal.exp(val2) // this should be Bx-A
            val4 = gain.plus(val3) // should be (Bx-A)+A
            val5 = val4.div(loss) // should be x

            return val5.max(0)
    }
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
    return exp
}

function upgrade23EffBase() {
    let base = new Decimal("10")
    if (hasMilestone("a", 7)) base = base.add(1)
    if (hasAchievement("a", 104)) base = base.add(9)

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
    if (hasUpgrade("sys", 22)) exp = exp.mul(upgradeEffect("sys", 22))
    if (hasUpgrade("bills", 15)) exp = exp.mul(upgradeEffect("bills", 15))
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
    taxFactor = taxFactor.add(.5)
    return taxFactor.pow(pte)  // returns (.5 + pennies / 1e6)^2.5 initially
}

function pennyTaxStart() {
    let ret = new Decimal("1e6")
    if (player.p.points.gte(1e90)) {
        let scaling = player.p.points.div(1e90).log10().pow_base(1.5)
        if (player.p.points.gte(1e95)) scaling = scaling.pow(1.5)
        ret = ret.div(scaling)
    }

    if (hasUpgrade("p", 45)) ret = ret.mul(upgradeEffect("p", 42))
    if (hasMilestone("s", 2)) ret = ret.mul(tmp.s.stored_expansion.effects[4])
    if (inChallenge("s", 11)) ret = ret.div(1e4)
    return ret.max(1)
}

function pennyTaxExp() {
    let exp = new Decimal("2.5")
    if (player.p.points.gte(1e90)) {
        let mult = player.p.points.div(1e90).log10().add(1).log10().div(50).add(1)
        exp = exp.mul(mult)
    }
    if (inChallenge("s", 11)) exp = exp.sub(1)
    if (hasMilestone("s", 5)) exp = exp.sub(tmp.s.stored_investment.effects[7])
    if (hasUpgrade("p", 62)) exp = exp.sub(upgradeEffect("p", 62))
    return exp.max(1)
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

function expansionUpgradeCost(id) {
    let row = Math.floor(id / 10)
    if (row < 10) {
        let boughtAfterInclRowPE = player.e.upgrades.filter(
            (index) => index < 100 && Math.floor(index / 10) >= row
        ).length
        let staticMultPE = tmp.e.penny_expansion.staticMult

        switch (row) {
            case 1:
                return Math.min(Math.pow(staticMultPE, boughtAfterInclRowPE), 16)
            case 2:
                return Math.min(Math.pow(staticMultPE, boughtAfterInclRowPE - 1) * 16, 256)
            case 3:
                return Math.min(Math.pow(staticMultPE, boughtAfterInclRowPE - 2) * 256, 4096)
            case 4:
                return Math.min(Math.pow(staticMultPE, boughtAfterInclRowPE) * 20000, 81920000)
            default: throw Error(`Invalid row supplied to expansionUpgradeCost ${row}`)
        }
    } else if (row < 20) {
        if (row > 13) throw Error(`Invalid row supplied to expansionUpgradeCost ${row}`)

        row -= 11 // 0-indexed for additional column multiplier

        // let boughtSE = tmp.e.system_expansion.upgCount - 1 // -1 for first upgrade
        // let staticMultSE = tmp.e.system_expansion.staticMult

        // return staticMultSE ** (boughtSE) * (5 ** row)

        let boughtSE = tmp.e.system_expansion.upgCount
        let rowScaling = 5 ** row

        // Math Nonsense (stems from product of algebraic progression)
        // Prod of algebraic progression = d^n * Gamma(a/d + n) / Gamma(a/d)
        let base = .1 ** boughtSE
        for (let i = 1; i <= boughtSE; i++) {
            base *= 17 + i
        }
        // Math Nonsense done
        return base * rowScaling
    } else { // else if (row < 30) {
        throw Error(`Invalid row supplied to expansionUpgradeCost ${row}`)
    }
}

function timeFlux() {
    let ret = 1
    if (hasMilestone("a", 8)) ret *= (1 + (player.a.achievements.length**1.5)/1000)
    ret *= tmp.quests.bars.dollarResetBar.reward
    ret *= tmp.quests.bars.zoneBar.reward
    if (hasUpgrade("bills", 21)) ret *= upgradeEffect("bills", 21)
    ret *= shopEffect(101)
    return ret
}

function conversionRate() {
    let base = baseConversionRate()

    let mul = 1
    if (hasMilestone("a", 9)) mul *= 1.01 ** Math.max(0, player.a.achievements.length - 35)
    if (hasUpgrade("sys", 14)) mul *= upgradeEffect("sys", 14)
    if (hasUpgrade("sys", 114)) mul *= upgradeEffect("sys", 114)
    mul *= tmp.quests.bars.penniesBar.reward
    mul *= shopEffect(104)

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
    if (tmp.s.challenges[12].unlocked && hasMilestone("s", 6)) baseAdd += challengeEffect("s", 12)[1]
    if (hasUpgrade("e", 113)) baseAdd += upgradeEffect("e", 113)

    return ret + baseAdd
}

function systemUpgradeCost(row) {
    let boughtInRow = player.sys.upgrades.filter(
        (index) => Math.floor(index / 10) == row
    ).length

    switch (row) {
        case 1: return new Decimal(.15 + .15 * boughtInRow)
        case 2: return new Decimal(1 + .5 * boughtInRow)
        default: throw Error(`Invalid row supplied to systemUpgradeCost ${row}`)
    }
}

function updateBills(spent) {
    let billsData = player.bills
    billsData.points = billsData.points.add(spent)
    // spent > 0 --> adding spent dollars, can be from convert clickable, closer to next denomination
    // spent < 0 --> from buying buyable
    if (spent > 0) {
        billsData.total = billsData.total.add(spent)
        billsData.best = billsData.best.max(billsData.points)
        
        if (billsData.highestDenominationIndex == 9) return
        for (let i = 9; i >= 1; i--) {
            let value = denominationValues[i]
            if (billsData.total.gte(value) && billsData.highestDenominationIndex <= i) {
                billsData.highestDenominationIndex = i
                return
            }
        }
    }
}

function attackEnemy(damage) {
    let enemyHP = player.bills.enemyHealth
    if (damage.gte(enemyHP)) {
        // kill the enemy, and potentially more if you have enough damage
        let remainder = damage.sub(enemyHP)
        let maxHP = layers.bills.bars.enemyBar.maxHealth()
        let bulk = remainder.div(maxHP).floor()
        bulk = Number(bulk)
        // if not enough damage to kill multiple, bulk = 0
        // if can kill current + 1 more enemy, bulk = 1
        // etc
        let kills = 1 + bulk // thus, kills = 1 + bulk
        updateBills(tmp.bills.bars.enemyBar.loot.mul(kills))
        if (player.bills.zone == player.bills.highestZone) player.bills.highestZoneKills += kills
        player.bills.totalEnemyKills += kills
        player.bills.currentEnemyKills += kills
        player.bills.enemyHealth = maxHP.mul(kills).sub(remainder)
        // player.bills.enemyHealth = maxHp.sub(remainder % maxHp) equivalent expression(?)
    } else {
        player.bills.enemyHealth = enemyHP.sub(damage)
    }
}

function updateZone(zone) {
    //if (dx == 0) throw Error("updateZone() took in a dx of 0")
    player.bills.zone = zone
    tmp.bills.effLvl = layers.bills.effLvl()
    tmp.bills.isEnemyBoss = layers.bills.isEnemyBoss()
    player.bills.enemyHealth = layers.bills.bars.enemyBar.maxHealth()
    player.bills.currentEnemyKills = 0
    if (player.bills.zone > player.bills.highestZone) {
        player.bills.highestZone = player.bills.zone
        player.bills.highestZoneKills = 0
    }
}

function isZoneAvailable(zone) {
    if (zone < 0) return false
    if (zone <= player.bills.highestZone) return true
    // edge cases taken care of: go backwards at zone 0, go within inclusive range of 0 and highest zone

    // last case: currently at highest zone; player.bills.highestZone + 1 == zone
    // want to have enough zone kills in highestZone to move on to new zone
    return player.bills.highestZoneKills >= (tmp.bills.isEnemyBoss ? 3 : 10)
}