function upgrade23Limit() {
    let base = player.p.points.mul(100).pow(upgrade23LimitExp()).add(10)
    if (hasMilestone("a", 0) && base.lt(new Decimal("9.99e9"))) {
        let limit = new Decimal("1e10")
        let newValFactor = limit.sub(base).log10().div(20).add(1) // 1 + log10(L-B)/20
        base = base.mul(newValFactor) // max(limit, base * (1 + log10(limit-base)/20))
    }
    if (getClickableState("e", 21) || getClickableState("e", 22)) base = base.div(5)
    if (getClickableState("e", 31)) base = base.mul(clickableEffect("e", 31))
    if (getClickableState("e", 32)) base = base.div(10)
    return base.max(new Decimal("10"))
}

function upgrade23LimitExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 34)) exp = exp.add(upgradeEffect("p", 34))
    if (hasUpgrade("e", 12)) exp = exp.add(upgradeEffect("e", 12))
    if (hasAchievement('a', 35) && !hasAchievement("a", 81)) exp = exp.add(.01)
    if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(250))
    if (hasUpgrade("sys", 22)) exp = exp.mul(upgradeEffect("sys", 22))
    return exp
}

function upgrade23EffExp() {
    let exp = decimalOne
    if (hasUpgrade("p", 41)) exp = exp.add(upgradeEffect("p", 41))
    if (hasMilestone("s", 1)) exp = exp.add(player.s.stored_investment.points.add(1).log2().div(30))
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
    if (hasMilestone("s", 2)) baseTaxes = baseTaxes.mul(player.s.stored_expansion.points.add(1).log10().sub(2).max(decimalOne))
    if (inChallenge("s", 11)) baseTaxes = baseTaxes.div(1e4)
    return baseTaxes
}

function pennyTaxExp() {
    let baseExp = new Decimal("2.5")
    if (inChallenge("s", 11)) baseExp = baseExp.sub(1)
    if (hasMilestone("s", 5)) {
        baseExp = baseExp.sub(player.s.stored_investment.points.add(10).log10().div(1000))
    }
    return baseExp.max(decimalOne)
}

function investmentGain() {
    if (inAnyChallenge()) {
        let ret = decimalOne
        if (inChallenge("s", 12)) ret = ret.div(10)
        if (hasMilestone("s", 4)) ret = ret.mul(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1))
        if (hasUpgrade("p", 53)) ret = ret.mul(upgradeEffect("p", 53))
        if (hasUpgrade("sys", 13)) ret = ret.mul(upgradeEffect("sys", 13))    
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
    ret = ret.mul(player.s.stored_investment.points.add(1).log10().div(10).add(1))
    if (hasMilestone("s", 4)) ret = ret.mul(player.s.stored_investment.points.add(1).log10().sub(12).max(0).pow_base(1.1))
    ret = ret.mul(player.sys.points.add(1).pow(1.5))
    if (hasUpgrade("sys", 13)) ret = ret.mul(upgradeEffect("sys", 13))

    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    return ret
}

function investment2Gain() {
    let investmentExponent = new Decimal(".4")
    let ret = player.p.investment.points.div(10000).pow(investmentExponent)
    if (getClickableState("e", 21) || getClickableState("e", 22)) ret = ret.div(5)
    if (hasMilestone("s", 1)) ret = ret.mul(1.03**player.s.stored_expansion.points.log2())
    if (hasMilestone("a", 6)) ret = ret.mul(1.01**(player.a.milestones.length+player.a.achievements.length-28))
    
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
    
    let keepUpgrades = [21, 25, 35, 41, 42, 51, 52, 53, 54, 55]
    if (player.e.everUpg23) keepUpgrades.push(23)
    function removeUpgrades(index) {
        return keepUpgrades.indexOf(index) != -1 // keeps upgrades with indices gte 25 + achievement upgrades
    }
    player.p.upgrades = player.p.upgrades.filter(removeUpgrades)

    let buyableIndices = [21, 22]
    for (const index of buyableIndices) {
        player.p.buyables[index] = decimalZero
    }

    player.points = decimalZero

    if (resetInvestment) player.p.investment.points = decimalZero
    if (resetInvestment2) player.p.investment2.points = decimalZero
}

function boostedTime(diff) {
    let ret = diff
    if (hasMilestone("a", 8)) ret = ret * (1 + (player.a.achievements.length**1.5)/1000)
    ret = ret * tmp.quests.bars.dollarResetBar.reward
    return ret
}

function conversionRate() {
    let base = 1
    let baseAdd = 0
    if (hasAchievement("a", 82)) baseAdd += .01
    if (hasAchievement("a", 83)) baseAdd += .01
    if (hasAchievement("a", 84)) baseAdd += .01
    if (hasAchievement("a", 85)) baseAdd += .02
    baseAdd += Number(player.s.stored_dollars.points.root(3).mul(3).div(100))

    let mul = 1
    if (hasMilestone("a", 9)) mul *= 1.01 ** Math.max(0, player.a.achievements.length - 35)
    if (hasUpgrade("sys", 14)) mul *= upgradeEffect("sys", 14)
    mul *= tmp.quests.bars.penniesBar.reward

    return ((base + baseAdd) * mul) / 100
}