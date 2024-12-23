let modInfo = {
	name: "Universal Expansion",
	id: "danickversetree", // never change, used to store saves
	author: "@.danick",
	pointsName: "points",
	modFiles: [
		"functions.js",
		"tree.js", "achievements.js", "penny.js", 
		"expansion.js", "storage.js", "system.js",
		"bills.js", "banks.js", //"factory.js",
		// remember to uncomment statement in getPointGen() when uncomment factory.js
		"quests.js", "shopSupport.js", "effects.js"],
	allowSmall: false,

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit:() => {
		let ret = 2
		return ret
	},  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2.3.2",
	name: "Oh, Right, This is a Tree",
}

let changelog = `<h1>Changelog:</h1><br><br>
	<h3>v0.2.3.2</h3><br>
		- Emergency patch for endgame bug<br><br>

	<h3>v0.2.3.1</h3><br>
		- Rebalancing for early Bills content (that should also help later Bills content run smoother)<br>
		- Completely changed Battery Pack upgrade (Businesses), introducing a new currency and 3 buyables<br>
		- Land effect on Tree Cost is reduced (scales 4x slower)<br><br>

	<h3>v0.2.3</h3><br>
		- Added Banks/Capital, System Expansion, and Specks<br>
		- Added a new Industry in Businesses<br>
		- A bunch of upgrades and a few milestones<br>
		- 4 Achievements (48 -> 52) and 1 Achievement milestone<br>
		- Actually implemented Education III's effect on Investment gain (i forgor even though its been out for so long :/)<br>
		- BTS cleanup of Expansion layer code for readability and future content<br>
		- A bunch of other things I forgot to write down, this update has been in progress for quite some time<br><br>

	<h3>v0.2.2</h3><br>
		- Added 1 System milestone, 5 upgrades for Businesses, a new Business in the Apple industry (purchasable in next update)<br>
		- Added Bills layer, connected to the System, with 6 upgrades and 3 related Quests (for now)<br>
		- Added a few achievements but removed others (46 -> 48) and 1 achievement milestone (10 --> 11)<br>
		- Accelerator Power effect majorly buffed (^.02 -> ^.05 in its formula)<br>
		- Changed effect of System upgrade Witchcraft<br>
		- WNBP quest completion requirements increased past 2 completions, 3rd completion reward implemented<br>
		- Reduced offline time limit from 8 hrs to 2 hrs (can be increased in the future)<br>
		- Expansion layer resource generation is finally as accurate and fast as possible, credit to @pg132<br>
		- Various minor bug fixes and rebalancing<br>
		- Probably a bunch of other stuff<br>
		- Definitely a bunch of more other stuff<br>
		- im so lazy this took so long im so dead or something<br><br>

	<h3>v0.2.1.4/v0.2.1.5</h3><br>
		- Added toggles to System milestone 1 to avoid locking the player out of Ach 9<br>
		- QOL 2 autobuyer no longer autobuys the WNBP upgrade, only affects gameplay after the 1st System reset<br>
		- Bug fixes and attempted to fix upgrade purchasing for mobile<br><br>
	
	<h3>v0.2.1.3</h3><br>
		- Added one achievement (45 -> 46)<br>
		- Further improved offline expansion calculations for as clean/precise of results as I could hope for.
			May introduce some lag (let me know if it sucks for you)<br>
		- Several bug fixes and visual updates, as well as behind-the-scenes preparation for upcoming features<br><br>

	<h3>v0.2.1.2</h3><br>
		- ACTUALLY fixed offline expansion calculations with a formula that ACTUALLY makes sense, credit to
			@pimgd for making me see the error of my ways<br><br>

	<h3>v0.2.1.1</h3><br>
		- Fixed bug where buyable autobuyer would buy more buyables than you could afford due to a timer having a large value<br>
		- Fixed incredibly stupid code that would cause NaN errors with sufficiently large values of
			"highest points ever" stat<br>
		- Used stronger duct tape to patch up a bug with the Expansion layer. Offline gains are affected, but
			should generally be in a positive way rather than negative (I think). Offline gains are no
			longer limited (except in the negative direction :/)<br><br>

	<h3>v0.2.1 (mostly clean up)</h3><br>
		- Added a Dollar milestone<br>
		- Added 2 Quests; one of them is only implemented up to 2 completions<br>
		- Added 3 achievements (42 -> 45)<br>
		- Storing dollars no longer doesn't increase reset count (it was dumb)<br>
		- Can now hold down and drag mouse to buy upgrades, inspiration from @pg132<br>
		- Reduced base requirement and scaling for both Points and Pennies Quest<br>
		- Tweaked rewards of some Quests and several System upgrades for the future (it's not a big deal)<br>
		- 4th System Milestone also keeps Expansion Investment at the same rate<br>
		- Added the other, intended effects of the 4th Storage upgrade (i forgor)<br>
		- Implemented the 3rd Stored Dollars effect (i forgor)<br>
		- Fixed the prestige process of storing Dollars<br>
		- Made Achievement 42 easier<br>
		- Other minor balances, fixes, changes, and visual updates
			(WNBP and Storage are <i>much</i> cleaner code-wise)<br>
	
	<br><h3>v0.2.0.1</h3><br>
		- The Dollars effect is now based on total Dollars<br>
		- Moved one effect of the 2nd Dollar milestone to the 3rd Dollar milestone,
			and gave the 2nd Dollar milestone a new effect in its place<br>
		- Buffed QOL 1's autobuyer speed by 2x<br>
		- Added a placeholder milestone to the Quests layer (this very likely won't be touched for a while)<br>

	<br><h3>v0.2.0</h3><br>
		- The System layer is implemented, along with 1 new feature and upgrades/milestones<br>
		- The Quest side layer is implemented, along with 5 quests (more will be added soon!)<br>
		- Moar Storage (but no milestones)!!! Also, Storage upgrades no longer reset currencies, it was a lame mechanic<br>
		- Added 7 achievements (35 -> 42) and 1 achievement milestone (9 -> 10)<br>
		- Offline generation works for the Expansion layer (i think)! However, if your ticks last over a minute, 
			the Expansion layer will not function (dont ask why). Don't lag!<br>
		- Achievement display moderately revamped to help for future updates<br>
		- Penny Upgrade 21 was rebalanced to provide a more substantial boost<br>
		- Nerfed Penny Upgrade 25's cost for taking long to obtain for no real reason<br>
		- Buffed Expansion Challenge reward to make it more meaningful as the game progresses, and made it easier<br>
		- Buffed 9th Achievement Milestone for the same reason<br>
		- Slightly buffed QOL 4 just because<br>
		- A lot of other stuff, like rebalancing, bug fixes, visual changes, and cleaner code<br>

	<br><h3>v0.1.9.1</h3><br>
		- Helper function works as intended, affects Penny upgrades 18/23<br>
		- 9th Achievement milestone effect cut in half<br>
	
	<br><h3>v0.1.9</h3><br>
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
		- Probably a bunch more stuff I didn't keep track of<br>
	
	<br><h3>v0.1.8.2</h3><br>
		- Updated programmed Achievement 25 condition to match description<br>
	
	<br><h3>v0.1.8.1</h3><br>
		- Buffed Stored Investment effect 5<br>
		- Focused Production is always accessible after unlocking Storage layer<br>
		- Fixes: Storage milestone 4 kept (milestones+1) upgrades, which also revealed a bug
			which occurs when it keeps QOL 1/2. Both issues are fixed now<br>

	<br><h3>v0.1.8</h3><br>
		- IITU is now based on current expansion investment, not best expansion investment (it was a dumb idea). 
			Stored Expansion effect 3 (secondary effect) buffed to compensate<br>
		- 2 more Focused Production Clickables (2 --> 4)<br>
		- 4 more Achievements (27 --> 31, 30 implemented)<br>
		- 1 Achievement milestone (6 --> 7)<br>
		- Investment Challenge (Storage layer) is implemented<br>
		- Stored Expansion effect 4 and Storage milestone 4 are implemented<br>
		- Slight rebalancing to Storage milestone requirements<br>
		- Probably more stuff that I can't remember<br>

	<br><h3>v0.1.7.4</h3><br>
		- Added new minor layer to display investment effects rather than place them in Info tab of Penny layer<br>

	<br><h3>v0.1.7.3</h3><br>
		- Light balance changes (expansion upgrades --> row 4, col 1/2)
		- Light visual updates
		- You can finally see what your investment does in one place (Penny layer --> Info tab)<br>

	<br><h3>v0.1.7.2</h3><br>
		- Fixed accidental softlock brought on by new feature<br>
		- Correctly implemented the 3rd Stored Investment effect<br>
		- Fixed minor visual mistakes<br>
	
	<br><h3>v0.1.7.1</h3><br>
		- Quick change to the intended requirement for a new clickable<br>
	
	<br><h3>v0.1.7</h3><br>
		- Added Storage layer: two clickables and three milestones<br>
		- Expanded Expansions layer: 5 upgrades (15 -> 20), not yet balanced<br>
		- 7 more achievements (20 -> 27), 6 of which are implemented<br>
		- 2 achievement milestones (4 -> 6)<br>
		- Microtabs now used for information to clean up tabs<br><
		- Balance changes: QOL 2 now applies to the first three rows, row 3 expansion upgrades buffed
			to make them more worthwhile<br>
		- Various minor fixes (mainly visual inconsistencies), 
			including one improperly implemented upgrade that could cause NaN errors<br>

	<br><h3>v0.1.5</h3><br>
		- Added Expansions layer: 15 upgrades and two clickables<br>
		- Expanded Penny layer: 5 upgrades (15 -> 20), 2 buyables (2 -> 4)<br>
		- 9 more achievements (11 -> 20)<br>
		- 4 achievement milestones (0 -> 4)<br>
		- Balance changes: Finishing v0.11 content is much faster in slow spots and game supports (encourages?) idle style to limited extent. 
			Implemented softcaps to stop inflation<br>

	<br><h3>v0.1.1</h3><br>
		- quick balance patch to stop big number do thing<br>
		- like one person played before this so nothing happened<br>
		- <s>exponentials are funny</s><br>

	<br><h3>v0.1</h3><br>
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

	let baseGain = decimalOne
	if (hasUpgrade('p', 12)) baseGain = baseGain.add(upgradeEffect('p', 12))
	if (hasAchievement('a', 35) && (!hasAchievement('a', 81) || hasAchievement("a", 94))) baseGain = baseGain.add(1)
	if (hasUpgrade("sys", 23)) baseGain = baseGain.add(upgradeEffect("sys", 23))

	let gainMult = decimalOne
	if (hasUpgrade('p', 11)) gainMult = gainMult.mul(upgradeEffect('p', 11))
	if (hasUpgrade('p', 15)) gainMult = gainMult.mul(upgradeEffect('p', 15))
	if (hasUpgrade('p', 21)) gainMult = gainMult.mul(upgradeEffect('p', 21))
	if (hasUpgrade('p', 22)) gainMult = gainMult.mul(upgradeEffect('p', 22))
	if (hasUpgrade('p', 23)) gainMult = gainMult.mul(upgradeEffect('p', 23))
	if (hasUpgrade('p', 25)) gainMult = gainMult.mul(upgradeEffect('p', 25))
	if (hasUpgrade('p', 42)) gainMult = gainMult.mul(upgradeEffect('p', 42))
	if (hasMilestone('s', 3)) gainMult = gainMult.mul(tmp.s.stored_investment.effects[5])
	if (hasUpgrade("p", 61)) gainMult = gainMult.mul(upgradeEffect('p', 61))

	let gainExp = decimalOne
	if (hasUpgrade("p", 52)) gainExp = gainExp.add(upgradeEffect("p", 52))
	if (hasUpgrade("sys", 11)) gainExp = gainExp.mul(upgradeEffect("sys", 11))
	if (inChallenge("s", 11)) gainExp = gainExp.div(2)
	if (inChallenge("s", 12)) gainExp = gainExp.div(4)

	// direct effects to gain
	let directMult = decimalOne
	if (inChallenge("s", 11) && hasUpgrade("s", 11)) directMult = directMult.mul(5)

	if (getClickableState("e", 21)) directMult = directMult.div(5)
	if (getClickableState("e", 31)) directMult = directMult.mul(clickableEffect("e", 31))
	if (getClickableState("e", 32)) directMult = directMult.div(10)

	directMult = directMult.mul(buyableEffect("p", 23))

	//if (player.factory.unlocked) directMult = directMult.mul(tmp.factory.effect)

	let ret = baseGain.mul(gainMult).pow(gainExp).mul(directMult)
	return ret
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	highestPointsEver: new Decimal("0"),
	resetTime: 0,
	shiftDown: false,
	particles: {},
	particleID: 0
}}

// Display extra things at the top of the page
var displayThings = [
	() => timeFlux() != 1 || player.sys.unlocked ? 
		(player.shiftDown ? `Your current reset time is ${timeDisplay(player.resetTime)}`
			: `Time Flux: ${format(timeFlux(), 4)}x`)
	: "",
	"Current endgame: 1 Bank, HZC 30, Specks Unlocked",
	() => isEndgame() ? `<p style="color: #5499C7">You are past the endgame.
		<br>The game is not balanced here, and is subject to bugs and inflation.
		<br>Content may be scrapped/rebalanced in the future.
		<br>Be careful.</p>` : ""
]

// Determines when the game "ends"
function isEndgame() {
	return player.banks.points.gte(1) && tmp.bills.highestZoneCompleted >= 30 && tmp.quests.specks.unlocked
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
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
	if (oldVersion < "0.2.0") {
		player.resetTime = player.p.resetTime
		if (player.a.achievements.indexOf(65) > -1) player.a.achievements[player.a.achievements.indexOf(65)] = "65"
	}
	if (oldVersion < "0.2.1") {
		if (typeof player.sys.bills != "undefined") delete player.sys.bills
		if (!player.sys.milestones.includes('3')) player.sys.acceleratorPower.points = decimalZero
		if (typeof player.sys.acceleratorPower != "undefined") {
			player.sys.businesses.acceleratorPower.points = new Decimal(player.sys.acceleratorPower.points)
			delete player.sys.acceleratorPower
		}
		if (typeof player.sys.appleTimer != "undefined") delete player.sys.appleTimer
	}
	if (oldVersion < "0.2.1.1") {
		if (typeof player.sys.bills != "undefined") delete player.sys.bills
	}
	if (oldVersion < "0.2.1.3") {
		if (player.quests.grid != "undefined") player.quests.grid = getStartGrid("quests")
	}
	if (oldVersion < "0.2.1.5") {
		player.sys.autoWNBP = false
	}
	if (oldVersion < "0.2.2") {
		player.sys.buyables[11] = player.sys.buyables[11].min(10)
		player.sys.buyables[12] = player.sys.buyables[12].min(20)
		player.sys.buyables[13] = player.sys.buyables[13].min(15)
		
		delete player.bills.maxEnemyKills
		delete player.bills.timers
		delete player.bills.highestDenomination
		delete player.bills.nextDenominationUnlock
		delete player.bills.killsByZone
		delete player.bills.enemyLevel
		delete player.bills.elo

		player.quests.completions.wnbpBar = Math.min(2, player.quests.completions.wnbpBar)
	}
	if (oldVersion < "0.2.3") {
		player.e.penny_expansion.points = new Decimal(player.e.penny_expansions.points)
		delete player.e.penny_expansions
		delete player.sys.buyables[14]
		player.quests.completions.wnbpBar = Math.min(3, player.quests.completions.wnbpBar)
	}
	if (oldVersion < "0.2.3.1") {
		if (hasMilestone("bills", 0)) {
			player.bills.milestones.pop()
		}
	}
	if (oldVersion < "0.2.3.2") {
		if (!player.bills.milestones.includes('1')) {
			player.bills.milestones = []
		} else {
			player.bills.milestones = ['1']
		}
	}
}