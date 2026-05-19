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
        maxLevels: 2, title: "TM ADV", 
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

// function getQuestShopData(id) {
//     let max; let title; let display; let cost; let type; let effect
//     switch (id) {
//         case 101:
//             max = 3; title = "BEGINNER PACK"; cost = 1
//             display = `Multiply post-nerf Penny gain, Expansion gain, effective Apple Trees, 
//                         Time Flux, Global ELO, and loot gain by 1.2x per level, 
//                         and max TSLS (see Info) is reduced by 20 seconds per level`
//             effect = 1.2; effectType = "compounding"; break
//         case 102:
//             max = 5; title = "STO EX"; cost = 3
//             display = `The Stored Investment/Expansion gain softcap exponents
//                 are increased by .02 per level
//                 <br>(Softcap exponents start at .2/.5 respectively)`
//             effect = .02; effectType = "additive"; break
//         case 103:
//             max = 5; title = "EXP INV EX"; cost = 3
//             display = `Raise the Expansion Investment hardcap by ^1.01 per level`
//             effect = 1.01; effectType = "compoundingExp"; break
//         case 104:
//             max = 10; title = "CONV EX"; cost = 5
//             display = `Multiply the conversion rate by 1.05x per level`
//             effect = 1.05; effectType = "compounding"; break
//         case 105:
//             max = 10; title = "SPECK EX"; cost = 5
//             display = 'Gain 1.25x more specks per level'
//             effect = 1.25; effectType = "compounding"; break
//         case 106:
//             max = 2; title = "TM ADV"; cost = 10
//             display = `Level 1: Unlock Flux Capacitors in the Time Machine<br>
//                        Level 2: Unlock a new Quest and the Sluggish 4 challenge`; 
//             effectType = "unlock"; break
//         case 205:
//             max = 2; title = "SPECK EX 2"; cost = 10
//             display = `Level 1: Unlock Flux Capacitors<br>
//                        Level 2: Unlock a new Quest and the Sluggish 4 challenge in the Time Machine`; 
//             effect = "1.01"; effectType = "compounding"; break
//         default: throw Error(`Missing Shop grid case for id: ${id}`)
//     }
//     return {
//         maxLevels: max, title: title, 
//         shopDisplay: display, cost: cost,
//         effect: effect, effectType: effectType
//     }
// }

const sluggishShopItems = {
    101: {
        maxLevels: 10000, title: "VIVACIOUS", 
        cost: 10, costType: "compounding",
        shopDisplay: "Multiply Temporal Energy gain by 1.01x per upgrade",
        effect: 1.01, effectType: "compounding"
    }
}

// function getSluggishShopData(id) {
//     let max; let title; let display; let cost; let type; let effect
//     switch (id) {
//         case 101:
//             max = 3; title = "UPDATE THIS NERD"; cost = 1
//             display = `Multiply post-nerf Penny gain, Expansion gain, effective Apple Trees, 
//                         Time Flux, Global ELO, and loot gain by 1.2x per level, 
//                         and max TSLS (see Info) is reduced by 20 seconds per level`
//             effect = 1.2; effectType = "compounding"; break
//         case 102:
//             max = 5; title = "STO EX"; cost = 3
//             display = `The Stored Investment/Expansion gain softcap exponents
//                 are increased by .02 per level
//                 <br>(Softcap exponents start at .2/.5 respectively)`
//             effect = .02; effectType = "additive"; break
//         case 103:
//             max = 5; title = "EXP INV EX"; cost = 3
//             display = `Raise the Expansion Investment hardcap by ^1.01 per level`
//             effect = 1.01; effectType = "compoundingExp"; break
//         case 104:
//             max = 10; title = "CONV EX"; cost = 5
//             display = `Multiply the conversion rate by 1.05x per level`
//             effect = 1.05; effectType = "compounding"; break
//         case 105:
//             max = 10; title = "SPECK EX"; cost = 5
//             display = 'Gain 1.25x more specks per level'
//             effect = 1.25; effectType = "compounding"; break
//         case 106:
//             max = 2; title = "TM ADV"; cost = 10
//             display = `Level 1: Unlock Flux Capacitors in the Time Machine<br>
//                        Level 2: Unlock a new Quest and the Sluggish 4 challenge`; 
//             effectType = "unlock"; break
//         case 205:
//             max = 2; title = "SPECK EX 2"; cost = 10
//             display = `Level 1: Unlock Flux Capacitors<br>
//                        Level 2: Unlock a new Quest and the Sluggish 4 challenge in the Time Machine`; 
//             effect = "1.01"; effectType = "compounding"; break
//         default: throw Error(`Missing Shop grid case for id: ${id}`)
//     }
//     return {
//         maxLevels: max, title: title, 
//         shopDisplay: display, cost: cost,
//         effect: effect, effectType: effectType
//     }
// }

function getShopData(layer, id) {
    switch (layer) {
        case "quests": return questShopItems[id]
        case "tm": return sluggishShopItems[id] 
    }
}

function getShopItemEffect(layer, id, data) {
    let shopData = getShopData(layer, id)
    switch (shopData.effectType) {
        case "compounding": return shopData.effect ** data
        case "compoundingExp": return shopData.effect ** data
        case "additive": return shopData.effect * data
        case "unlock": return 0
        case "other":
            //if (id == ...) return thing
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
        case "factorial": return factorial(shopData.cost + data * shopData.factorialGrowth)
        case 104: return getShopData(this.layer, id).cost * (data + 1)
        default: return getShopData(this.layer, id).cost
    }
}

function shopRowsAvailable(layer) {
    switch (layer) {
        case "quests":
            if (player.tm.challenges[22] >= 1) return 2
            return 1
        case "tm": 
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

    switch (effType) {
        case "compounding":
            if (compoundingOverrides[layerid])
                return "Current effect: " + compoundingOverrides[layerid](effVal, levels);
            return "Current effect: " + effVal + "x"

        case "compoundingExp":
            return "Current effect: ^" + effVal

        case "additive":
            return "Current effect: +" + effVal

        case "unlock":
            if (unlockOverrides[layerid])
                return unlockOverrides[layerid](effVal, levels)
            return "Placeholder"

        case "other":
            // For special cases that can't be as easily handled
        default:
            throw Error("Shop item has invalid type: " + effType)
    }

    // switch (effType) {
    //     case "compounding":
    //         switch (layerid) {
    //             case "quests|101": eff += effVal + "x, -" + timeDisplay(levels * 20, false); break;
    //             // Future special cases will be added here
    //             default: eff += effVal + "x"
    //         }
    //         break;
    //     case "compoundingExp": eff += "^" + effVal; break;
    //     case "additive": eff += "+" + effVal; break;
    //     case "unlock": 
    //         switch (layerid) {
    //             case "quests|106": eff = ""; break;
    //             default: eff = "Placeholder"
    //         }
    //         break;
    //     case "other":
    //         // For special cases that can't be as easily handled
    //     default: throw Error("Shop item has invalid type: " + effType)
    // }
}

function updateShopDisplay(layer, id, exit=false) {
    let displayLocation = {
        quests: player.quests.specks,
        tm: player.tm.sluggish
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
    let cost = `Cost: ${tmp[layer].grid.getCost(levels, id)} ${tmp[layer].grid.resource}`
    let desc = shopData.shopDisplay

    let effVal = toPlaces(gridEffect(layer, id), 2)
    let eff = buildShopEffectDisplay(layerid, shopData.effectType, effVal, levels)

    displayLocation.shopDisplay = 
        `<h3>${title}</h3><br><br>${cost}<br><br>${desc}<br><br>${eff}`
}