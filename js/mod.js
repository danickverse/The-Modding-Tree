let modInfo = {
	name: "Universal Expansion",
	id: "danickversetree", // never change, used to store saves
	author: "@.danick",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "achievements.js", "effects.js", "functions.js"],
	allowSmall: true,

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 12,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.9.2",
	name: "Clocky Goes Zoomy",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1.9.1</h3><br>
		- Helper function works as intended, affects Penny upgrades 18/23<br>
		- 9th Achievement milestone effect cut in half<br><br>
	
	<h3>v0.1.9</h3><br>
		- Added 4 Penny upgrades and introduced reset time<br>
		- Added 2 Storage milestones (4 --> 6), two Storage upgrades, and one Storage challenge<br>
		- Added 4 achievements (31 --> 35) and 2 achievement milestones (7 --> 9)<br>
		- Achievement 30 completely changed so it is now always doable<br>
		- Removed Achievement 27's effect (originally removed the Now We're Getting Somewhere... exponent), 
		added effect to Achievement 29 to compensate <br>
		- Storage milestone 4 first requirement greatly increased from 5m to 250m and second requirement increased from 50,000 to 300,000<br>
		- IITU effect also buffs stored expansion as well; some values are thus rebalanced<br>
		- Expansion Investment gain exponent decreased from .5 --> .4 and now has both a hardcap that can be reduced through progression & a softcap<br>
		- Buffed 7th Achievement milestone (based on # of milestones and achievements rather than just milestones)<br>
		- Buffed QOL 1 autobuyer (10 seconds --> 5 seconds)<br>
		- Buffed It's Compassion Is Unmatched's first effect by 2.5x<br>
		- Inflation from older saves *should* be fixed, values reset to reasonable v0.1.8.2 endgame values if surpassed<br>
		- Other (mostly minor) visual/balance changes<br>
		- Probably a bunch more stuff I didn't keep track of<br><br>
	
	<h3>v0.1.8.2</h3><br>
		- Updated programmed Achievement 25 condition to match description<br><br>
	
	<h3>v0.1.8.1</h3><br>
		- Buffed Stored Investment effect 5<br>
		- Focused Production is always accessible after unlocking Storage layer<br>
		- Fixes: Storage milestone 4 kept (milestones+1) upgrades, which also revealed a bug
			which occurs when it keeps QOL 1/2. Both issues are fixed now<br><br>

	<h3>v0.1.8</h3><br>
		- IITU is now based on current expansion investment, not best expansion investment (it was a dumb idea). 
			Stored Expansion effect 3 (secondary effect) buffed to compensate<br>
		- 2 more Focused Production Clickables (2 --> 4)<br>
		- 4 more Achievements (27 --> 31, 30 implemented)<br>
		- 1 Achievement milestone (6 --> 7)<br>
		- Investment Challenge (Storage layer) is implemented<br>
		- Stored Expansion effect 4 and Storage milestone 4 are implemented<br>
		- Slight rebalancing to Storage milestone requirements<br>
		- Probably more stuff that I can't remember<br><br>

	<h3>v0.1.7.4</h3><br>
		- Added new minor layer to display investment effects rather than place them in Info tab of Penny layer<br><br>

	<h3>v0.1.7.3</h3><br>
		- Light balance changes (expansion upgrades --> row 4, col 1/2)
		- Light visual updates
		- You can finally see what your investment does in one place (Penny layer --> Info tab)<br><br>

	<h3>v0.1.7.2</h3><br>
		- Fixed accidental softlock brought on by new feature<br>
		- Correctly implemented the 3rd Stored Investment effect<br>
		- Fixed minor visual mistakes<br><br>
	
	<h3>v0.1.7.1</h3><br>
		- Quick change to the intended requirement for a new clickable<br><br>
	
	<h3>v0.1.7</h3><br>
		- Added Storage layer: two clickables and three milestones<br>
		- Expanded Expansions layer: 5 upgrades (15 -> 20), not yet balanced<br>
		- 7 more achievements (20 -> 27), 6 of which are implemented<br>
		- 2 achievement milestones (4 -> 6)<br>
		- Microtabs now used for information to clean up tabs<br><
		- Balance changes: QOL 2 now applies to the first three rows, row 3 expansion upgrades buffed
			to make them more worthwhile<br>
		- Various minor fixes (mainly visual inconsistencies), 
			including one improperly implemented upgrade that could cause NaN errors<br><br>

	<h3>v0.1.5</h3><br>
		- Added Expansions layer: 15 upgrades and two clickables<br>
		- Expanded Penny layer: 5 upgrades (15 -> 20), 2 buyables (2 -> 4)<br>
		- 9 more achievements (11 -> 20)<br>
		- 4 achievement milestones (0 -> 4)<br>
		- Balance changes: Finishing v0.11 content is much faster in slow spots and game supports (encourages?) idle style to limited extent. 
			Implemented softcaps to stop inflation<br><br>

	<h3>v0.1.1</h3><br>
		- quick balance patch to stop big number do thing<br>
		- like one person played before this so nothing happened<br>
		- <s>exponentials are funny</s><br><br>

	<h3>v0.1</h3><br>
		- Added Penny layer: 15 upgrades, Investment (I? likely adding more), Education I<br>
		- Added 11 achievements.<br>
		- Added basic functionality for Expansions layer.<br>
		- Added a few various little things<br>
		(like two or three various little things)<br>
		(they are really little)
	`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let baseGain = new Decimal(1)
	if (hasUpgrade('p', 12)) baseGain = baseGain.add(upgradeEffect('p', 12))
	if (hasAchievement('a', 35)) baseGain = baseGain.add(1)

	let gainMult = new Decimal(1)
	if (hasUpgrade('p', 11)) gainMult = gainMult.mul(upgradeEffect('p', 11))
	if (hasUpgrade('p', 15)) gainMult = gainMult.mul(upgradeEffect('p', 15))
	if (hasUpgrade('p', 21)) gainMult = gainMult.mul(upgradeEffect('p', 21))
	if (hasUpgrade('p', 22)) gainMult = gainMult.mul(upgradeEffect('p', 22))
	if (hasUpgrade('p', 23)) gainMult = gainMult.mul(upgradeEffect('p', 23))
	if (hasUpgrade('p', 25)) gainMult = gainMult.mul(upgradeEffect('p', 25))
	if (hasUpgrade('p', 42)) gainMult = gainMult.mul(upgradeEffect('p', 42))
	if (hasMilestone('s', 3)) gainMult = gainMult.mul(player.s.stored_investment.points.div(1e6).add(1).pow(.4))

	let gainExp = decimalOne
	if (hasUpgrade("p", 52)) gainExp = gainExp.add(upgradeEffect("p", 52))
	if (inChallenge("s", 11)) gainExp = gainExp.div(2)
	if (inChallenge("s", 12)) gainExp = gainExp.div(4)

	let ret = baseGain.mul(gainMult).pow(gainExp)

	// direct effects to gain
	if (inChallenge("s", 11) && hasUpgrade("s", 11)) ret = ret.mul(5)

	if (getClickableState("e", 21)) ret = ret.div(5)
	if (getClickableState("e", 31)) ret = ret.mul(clickableEffect("e", 31))
	if (getClickableState("e", 32)) ret = ret.div(10)

	return ret
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	highestPointsEver: new Decimal("0")
}}

// Display extra things at the top of the page
var displayThings = [
	() => boostedTime(1) != 1 ? "Gaining " + format(boostedTime(1), 4) + "x more reset time" : "",
	"Current endgame: 35 achievements, 1e33 Pennies"
]

// Determines when the game "ends"
function isEndgame() {
	return player.a.achievements.length >= 35 && player.p.points.gte(1e33)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	//return(3600) // Default is 1 hour which is just arbitrarily large
	return(1)
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
	console.log(oldVersion)
	if (oldVersion < "0.1.9") {
		player.p.investment2.points = player.p.investment2.points.min(new Decimal("5000"))
		player.p.investment.points = player.p.investment.points.min(new Decimal("1e11"))
		player.e.points = player.e.points.min(new Decimal("3e6"))
		player.e.penny_expansions.points = player.e.penny_expansions.points.min(new Decimal("5e7"))
		player.s.stored_investment.points = player.s.stored_investment.points.min(new Decimal("1e11"))
		player.s.stored_expansion.points = player.s.stored_expansion.points.min(new Decimal("1e6"))
		player.p.points = player.p.points.min(new Decimal("1e20"))
		player.points = new Decimal("1e50").min(player.points)
		player.highestPointsEver = player.points
		if (player.p.upgrades.indexOf(51) > -1) player.p.upgrades.splice(player.p.upgrades.indexOf(51, 1))
		let buyableIndices = [21, 22]
		for (const index of buyableIndices) {
			player.p.buyables[index] = decimalZero
		}
		player.s.high_scores[11].points = player.s.high_scores[11].points.min(new Decimal("1e15"))
		player.resetTime = 0
	}
}