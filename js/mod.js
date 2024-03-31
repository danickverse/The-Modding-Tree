let modInfo = {
	name: "Universal Expansion",
	id: "danickversetree", // never change, used to store saves
	author: "@.danick",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "achievements.js", "effects.js"],
	allowSmall: true,

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 12,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.8.2",
	name: "Who Wants To Be A Trillionaire?",
}

let changelog = `<h1>Changelog:</h1><br><br>
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

	let ret = baseGain.mul(gainMult)

	if (inChallenge("s", 11)) ret = ret.pow(.5)

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
	"Current endgame: 30 achievements, 4 Storage milestones"
]

// Determines when the game "ends"
function isEndgame() {
	return player.a.achievements.length >= 30 && player.s.milestones.length >= 4
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
}