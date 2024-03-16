let modInfo = {
	name: "Universal Expansion",
	id: "danickversetree",
	author: "@.danick",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "achievements.js"],
	allowSmall: true,

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.15",
	name: "We're getting somewhere...",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.1</h3><br>
		- Added Penny layer: 15 upgrades, Investment (I? likely adding more), Education I<br>
		- Added 11 achievements.<br>
		- Added basic functionality for Expansions layer.<br>
		- Added a few various little things<br>
		(like two or three various little things)<br>
		(they are really little)<br>

	<br><h3>v0.11</h3><br>
		- quick balance patch to stop big number do thing<br>
		- like one person played before this so nothing happened<br>
		- <s>exponentials are funny</s><br>

	<br><h3>v0.15</h3><br>
		- Added Expansions layer: 15 upgrades and two clickables<br>
		- Expanded Penny layer: 5 upgrades (15 -> 20), 2 buyables (2 -> 4)<br>
		- 9 more achievements (11 -> 20)<br>
		- 3 achievement milestones (0 -> 3)<br>
		- Balance changes: Finishing 1.1 content is much faster in slow spots and game supports (encourages?) idle style. 
			Implemented softcaps to stop inflation
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
	if (hasAchievement('a', 33)) baseGain = baseGain.add(1)

	let gainMult = new Decimal(1)
	if (hasUpgrade('p', 11)) gainMult = gainMult.mul(upgradeEffect('p', 11))
	if (hasUpgrade('p', 15)) gainMult = gainMult.mul(upgradeEffect('p', 15))
	if (hasUpgrade('p', 21)) gainMult = gainMult.mul(upgradeEffect('p', 21))
	if (hasUpgrade('p', 22)) gainMult = gainMult.mul(upgradeEffect('p', 22))
	if (hasUpgrade('p', 23)) gainMult = gainMult.mul(upgradeEffect('p', 23))
	if (hasUpgrade('p', 25)) gainMult = gainMult.mul(upgradeEffect('p', 25))

	ret = baseGain.mul(gainMult)

	if (getClickableState("e", 21)) ret = ret.div(5)
	// if (hasUpgrade('p', 23)) {
	// 	let limit = upgrade23Limit()
	// 	if (player.points.gt(limit)) {
	// 		console.log("ow")
	// 		player.points = limit
	// 		return new Decimal("0")
	// 	}
	// }
	return ret

}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	highestPointsEver: new Decimal("0")
}}

// Display extra things at the top of the page
var displayThings = [
	"Current endgame: 11 achievements"
]

// Determines when the game "ends"
function isEndgame() {
	return false
	return hasAchievement("a", 31)
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