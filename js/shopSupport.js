function getShopData(id) {
    let max; let title; let display; let cost; let type; let effect
    switch (id) {
        case 101:
            max = 3; title = "BEGINNER PACK"; cost = 1
            display = `Multiply post-nerf Penny gain, Expansion gain, effective Apple Trees, 
                        Time Flux, Global ELO, and loot gain by 1.2x per level, 
                        and max TSLS (see Info) is reduced by 20 seconds per level`
            effect = 1.2; effectType = "compounding"; break
        case 102:
            max = 5; title = "STO EX"; cost = 3
            display = `The Stored Investment/Expansion gain softcap exponents
                are increased by .02 per level
                <br>(Softcap exponents start at .2/.5 respectively)`
            effect = .02; effectType = "additive"; break
        case 103:
            max = 5; title = "EXP INV EX"; cost = 3
            display = `Raise the Expansion Investment hardcap by ^1.01 per level`
            effect = 1.01; effectType = "compoundingExp"; break
        case 104:
            max = 10; title = "CONV EX"; cost = 5
            display = `Multiply the conversion rate by 1.05x per level`
            effect = 1.05; effectType = "compounding"; break
        case 105:
            max = 10; title = "SPECK EX"; cost = 5
            display = 'Gain 1.25x more specks per level'
            effect = 1.25; effectType = "compounding"; break
        case 106:
            max = 2; title = "TM ADV"; cost = 10
            display = `Level 1: Unlock Flux Capacitors in the Time Machine<br>
                       Level 2: Unlock a new Quest and the Sluggish 4 challenge`; 
            effectType = "unlock"; break
        case 205:
            max = 2; title = "SPECK EX 2"; cost = 10
            display = `Level 1: Unlock Flux Capacitors<br>
                       Level 2: Unlock a new Quest and the Sluggish 4 challenge in the Time Machine`; 
            effect = "1.01"; effectType = "compounding"; break
        default: throw Error(`Missing Shop grid case for id: ${id}`)
    }
    return {
        maxLevels: max, title: title, 
        shopDisplay: display, cost: cost,
        effect: effect, effectType: effectType
    }
}

function shopEffect(id) {
    return gridEffect("quests", id)
}

function shopRowsAvailable() {
    if (player.tm.challenges[22] >= 1) return 2
    return 1
}

function updateShopDisplay(layer, id, exit=false) {
    if (layer != "quests") return

    if (exit) { player.quests.specks.shopDisplay = "Hover over a shop item for more information"; return }

    let shopData = getShopData(id)
    let levels = getGridData(layer, id)

    let title = shopData.title
    let cost = `Cost: ${tmp.quests.grid.getCost(levels, id)} Specks`
    let dis = shopData.shopDisplay
    let eff = "Current effect: "
    let effVal = toPlaces(gridEffect(layer, id), 2)
    let effType = shopData.effectType

    switch (effType) {
        case "compounding":
            switch (id) {
                case 101: eff += effVal + "x, -" + timeDisplay(levels * 20, false); break;
                default: eff += effVal + "x";
            }
            break;
        case "compoundingExp": eff += "^" + effVal; break;
        case "additive": eff += "+" + effVal; break;
        case "unlock": 
            if (id == 106) eff = ""; 
            break;
        case "other":
            
            // do others
        default: throw Error("Shop item has invalid type: " + effType)
    }

    player.quests.specks.shopDisplay = `<h3>${title}</h3><br><br>${cost}<br><br>${dis}<br><br>${eff}`
}