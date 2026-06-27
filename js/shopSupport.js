const questShopItems = {
    101: {
        maxLevels: 3, title: "BEGINNER PACK", 
        cost: 1, costType: "factorial", factorialGrowth: 2,
        shopDisplay: `Multiply post-nerf Penny gain, Expansion gain, effective Apple Trees, 
                    Time Flux, Global ELO, and loot gain by 1.2x per level, 
                    and max TSLS (see Info) is reduced by 20 seconds per level`,
        effect: 1.2, effectType: "compounding",
    },
    102: {
        maxLevels: 5, title: "STO EX", 
        cost: 3, costType: "static",
        shopDisplay: `The Stored Investment/Expansion gain softcap exponents
                are increased by .02 per level
                <br>(Softcap exponents start at .2/.5 respectively)`,
        effect: .02, effectType: "additive"
    },
    103: {
        maxLevels: 5, title: "EXP INV EX", 
        cost: 3, costType: "static",
        shopDisplay: `Raise the Expansion Investment hardcap by ^1.01 per level`,
        effect: 1.01, effectType: "compoundingExp"
    },
    104: {
        maxLevels: 10, title: "CONV EX", 
        cost: 5, costType: "compounding",
        shopDisplay: `Multiply the conversion rate by 1.05x per level`,
        effect: 1.05, effectType: "compounding"
    },
    105: {
        maxLevels: 10, title: "SPECK EX", 
        cost: 5, costType: "static",
        shopDisplay: 'Gain 1.25x more specks per level',
        effect: 1.25, effectType: "compounding"
    },
    106: {
        maxLevels: 2, title: "SL ADV", 
        cost: 10, costType: "static",
        shopDisplay: `Level 1: Unlock Flux Capacitors in the Time Machine<br>
                    Level 2: Unlock a new Quest and the Sluggish 4 challenge`, 
        effectType: "unlock"
    },
    205: {
        maxLevels: 2, title: "SPECK EX 2", 
        cost: 1e100, costType: "static",
        shopDisplay: `Level 1: Unlock Flux Capacitors<br>
                    Level 2: Unlock a new Quest and the Sluggish 4 challenge in the Time Machine`, 
        effect: 1.01, effectType: "compounding"
    }
}

const MAX_SLUGGISH = 2

const sluggishShopItems = {
    101: {
        maxLevels: 1000, title: "RIGOROUS", 
        cost: 30, costType: "exponential", base: 1.1,
        shopDisplay: "Multiply Temporal Energy gain by 1.01x per level",
        effect: 1.01, effectType: "compounding"
    },
    102: {
        maxLevels: MAX_SLUGGISH * 5, title: "ECSTATIC",
        cost: 100, costType: "exponential", base: 3,
        shopDisplay: "Levels boost various stats<br>Enable an additional effect every 5 levels",
        effectType: "other",
        formulaTexts: [
            (eff) => `Multiply Penny/Temporal Energy gain by 1 + x<sup>2</sup>/100: ${format(eff)}x`,
            (eff) => `Reduce Education I amount for cost purposes by (x - 4): -${eff}`
        ],
        formulas: [
            (levels) => 1 + (levels ** 2) / 100, 
            (levels) => 1 + levels - 5
        ],
        unlockWhenTexts: [
            "Unlock at >= 1 levels",
            "Unlock at >= 5 levels and highest SL ever >= 2"
        ],
        unlocks: [
            (levels) => levels >= 1,
            (levels) => levels >= 5 && player.sl.maxLayer >= 2
        ]
    }
}

const ecstaticUpg = sluggishShopItems[102]

function getShopData(layer, id) {
    switch (layer) {
        case "quests": return questShopItems[id]
        case "sl": return sluggishShopItems[id] 
    }
}

function getShopItemEffect(layer, id, data) {
    let shopData = getShopData(layer, id)
    let layerid = layer + "|" + id
    switch (shopData.effectType) {
        case "compounding": return shopData.effect ** data

        case "compoundingExp": return shopData.effect ** data

        case "additive": return shopData.effect * data

        case "unlock": return 0

        case "other":
            if (layerid == "sl|102") {
                // let forms = ecstaticUpg.formulas
                // return [forms[0](data), forms[1](data)]
                return ecstaticUpg.formulas.map(formula => formula(data))
            }

        default: throw Error("Invalid shop effect type: " + id + " " + shopData.type)
    }
}

function getShopItemDisplay(layer, id, data) {
    return `${data}/${getShopData(layer, id).maxLevels}`
}

function getShopItemCost(layer, id, data) {
    let shopData = getShopData(layer, id)
    switch (shopData.costType) {
        case "static": return shopData.cost

        case "compounding": return shopData.cost * (data + 1)

        case "compoundingExp": return shopData.cost * (data + 1) ** shopData.costExp

        case "exponential": return shopData.cost * (shopData.base ** data)

        case "factorial": return factorial(shopData.cost + data * shopData.factorialGrowth)
                
        default: throw Error("Missing cost type: " + id)
    }
}

function shopRowsAvailable(layer) {
    switch (layer) {
        case "quests":
            if (player.tm.challenges[22] >= 1) return 2
            return 1
        case "sl": 
            return 1
    }
}

// Special-case overrides for compounding effects
const compoundingOverrides = {
    "quests|101": (effVal, levels) =>
        `${effVal}x, -${timeDisplay(levels * 20, false)}`
};

// Special-case overrides for unlock effects
const unlockOverrides = {
    "quests|106": () => ""
};

function buildShopEffectDisplay(layerid, effType, effVal, levels) {
    if (effType == "other") {
        switch (layerid) {
            case "sl|102": 
                let ret = `Current Effects<br><span style="color:pink">`
                // for (let i = 0; i < 1 + Math.floor(levels / 5); i++) {
                for (let i = 0; i < ecstaticUpg.maxLevels / 5; i++) {
                    ret += `<br>${i+1}. `
                    ret += ecstaticUpg.unlocks[i](levels)
                        ?   `${ecstaticUpg.formulaTexts[i](effVal[i])}`
                        :   `${ecstaticUpg.unlockWhenTexts[i]}`
                }
                return ret + "</span>"
            default:
                throw Error("Case not handled: " + layerid)
        }
    }

    effVal = toPlaces(effVal, 2)

    switch (effType) {
        case "compounding":
            if (compoundingOverrides[layerid])
                return "Current effect: " + compoundingOverrides[layerid](effVal, levels);
            return "Current effect: " + effVal + "x"

        case "compoundingExp": return "Current effect: ^" + effVal

        case "additive": return "Current effect: +" + effVal

        case "unlock":
            if (unlockOverrides[layerid])
                return unlockOverrides[layerid](effVal, levels)
            return "Placeholder"

        default:
            throw Error("Shop item has invalid type: " + effType)
    }
}

function updateShopDisplay(layer, id, exit=false) {
    let displayLocation = {
        quests: player.quests.specks,
        sl: player.sl
    }[layer]

    if (exit) { 
        displayLocation.shopDisplay = 
            "Hover over a shop item for more information" 
        return 
    }

    let shopData = getShopData(layer, id)
    let levels = getGridData(layer, id)
    let layerid = `${layer}|${id}`

    let title = shopData.title
    let cost = `Cost: ${format(tmp[layer].grid.getCost(levels, id))} ${tmp[layer].grid.resource}`
    let desc = shopData.shopDisplay

    let effVal = gridEffect(layer, id)
    let eff = buildShopEffectDisplay(layerid, shopData.effectType, effVal, levels)

    displayLocation.shopDisplay = 
        `<h3>${title}</h3><br><br>${cost}<br><br>${desc}<br><br>${eff}`
}