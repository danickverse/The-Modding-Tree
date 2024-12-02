function getShopData(id) {
    let max; let title; let display; let cost; let type; let effect
    switch (id) {
        case 101:
            max = 3; title = "BEGINNER PACK"; cost = 1
            display = `Multiply post-nerf Penny gain, Expansion gain, effective Apple Trees, 
                        Time Flux, Global ELO, and loot gain by 1.2x per level, 
                        and max TSLS (see Info) is reduced by 50 seconds per level`
            effect = 1.2; type = "compounding"; break
        case 102:
            max = 5; title = "STO INV EX"; cost = 2
            display = `The Stored Investment softcap is increased by .02 per level (starts at .2)`
            effect = .02; type = "additive"; break
        case 103:
            max = 5; title = "EXP INV EX"; cost = 2
            display = `Raise the Expansion Investment hardcap by ^1.01 per level`
            effect = 1.01; type = "compoundingExp"; break
        case 104:
            max = 10; title = "CONV EX"; cost = 2
            display = `Multiply the conversion rate by 1.05x per level`
            effect = 1.05; type = "compounding"; break
        case 105:
            max = 10; title = ""
        // auto-skip stages
        default: throw Error(`Missing Shop grid case for id: ${id}`)
    }
    return {
        maxLevels: max, title: title, 
        shopDisplay: display, cost: cost,
        effect: effect, type: type
    }
}

function shopEffect(id) {
    return gridEffect("quests", id)
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
            if (id == 101) eff += effVal + "x, -" + timeDisplay(levels * 50, false);
            else eff += effVal + "x"
            break
        case "compoundingExp": eff += "^" + effVal; break;
        case "additive": eff += "+" + effVal; break;
        case "other":
            
            // do others
        default: throw Error("Shop item has invalid type: " + shopData.type)
    }

    player.quests.specks.shopDisplay = `${cost}<br><br>${dis}<br><br>${eff}`
}