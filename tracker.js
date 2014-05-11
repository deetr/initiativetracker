function getCharacterTable() {
	return document.getElementById("characterTable");	
}

function getCombatTable() {
	return document.getElementById("combatTable");
}

var characters = [];

function Character(name, picture, currentHP, maxHP, surges) {
	this.name = name;
	this.picturePath = picture;
	this.hp = new ValueWithMax(currentHP, maxHP);
	
	var maxSurges = Math.max(Math.floor(maxHP / 2), 1);
	this.surges = new ValueWithMax(surges, this.maxSurges);
	this.temporaryEffects = [];
}

Character.prototype.toString = function() {
	return this.name;
}

function ValueWithMax(currentValue, maxValue) {
	this.currentValue = currentValue;
	this.maxValue = maxValue;
}

ValueWithMax.prototype.toString = function() {
	if (this.currentValue == this.maxValue) {
		return "<u><b>" + this.currentValue + "</b></u>";
	} else if (this.currentValue <= this.maxValue / 2) {
		return "<font color=\"red\"><b>" + this.currentValue + "</b></font>";
	}
	return this.currentValue;
}

function TemporaryEffect(name, turns) {
	console.log("name: " + name + ", turns: " + turns);
	this.name = name;
	this.turns = parseInt(turns);
}

TemporaryEffect.prototype.toString = function() {
	return "(" + this.name + ", " + this.turns + ")";
}

function addCharacterToTable(character) {
	var characterTable = getCharacterTable();
	var row = characterTable.insertRow(-1);

	var pictureCell = row.insertCell(0);
	pictureCell.innerHTML = "<img src=" + character.picturePath + ">";
	
	var nameCell = row.insertCell(1);
	nameCell.innerHTML = "(" + character.name + "):";
	
	var hpCell = row.insertCell(2);
	hpCell.innerHTML = character.hp + " HP";
	
	var surgesCell = row.insertCell(3);
	surgesCell.innerHTML = character.surges + " surges";
}

function addCharacter() {
	var picturePath = document.getElementById("picture").files[0].name;
	var charName = document.getElementById("name").value;
	var maxHP = parseInt(document.getElementById("maxhp").value);
	var hp = parseInt(document.getElementById("currentHp").value);
	var surges = parseInt(document.getElementById("currentSurges").value);

	var character = new Character(charName, picturePath, hp, maxHP, surges);
	characters.push(character);
	addCharacterToTable(character);
}


function printCharacterArray() {
	var str = "";
	for (var i = 0; i < characters.length; i++) {
		str += "picPath: " + characters[i].picturePath + ", " +
		       "charName: " + characters[i].name + ", " +
		       "mapHP: " + characters[i].hp.maxValue + ", " +
		       "hp: " + characters[i].hp.currentValue + ", " +
		       "maxSurges: " + characters[i].surges.maxValue + ", " +
		       "surges: " + characters[i].surges.currentValue + ", " +
		       "initiative: " + characters[i].initiative +
		       "\n";
	}
	return str;
}

function saveState() {
	var table = getCharacterTable();
	var saveString = "";
	for (var i = 0; i < table.rows.length; i++) {
		console.log(i);
		var row = table.rows[i];
		for (var j = 0; j < row.cells.length; j++) {
			saveString += row.cells[j].innerHTML;
			saveString += ",";
		}
		saveString += "|";
	}
	alert(saveString);
	document.cookie = saveString + "; path=/";
}

function readState() {
	alert(document.cookie);
}

var numMonsters = 0;

function addCombatButtons() {
	var combatButtonsTable = document.getElementById("combatButtons");
	var submitRow = combatButtonsTable.insertRow(-1);
	var addMonsterButtonCell = submitRow.insertCell(0);
	addMonsterButtonCell.innerHTML = "<button onclick=\"addMonster()\">" + "Add Monster" + "</button>";
	var submitInitiativesCell = submitRow.insertCell(1);
	submitInitiativesCell.innerHTML = "<button onclick=\"submitInitiatives()\">" + "START" + "</button>";
}

function setupCombat() {
	var combatTable = getCombatTable();
	for (var i = 0; i < characters.length; i++) {
		var row = combatTable.insertRow(-1);
		var nameCell = row.insertCell(0);
		nameCell.innerHTML = characters[i].name;
		var iniativeCell = row.insertCell(1);
		iniativeCell.innerHTML = "Initiative: <input type=\"text\" id=\"" + characters[i].name + "Init\">";
	}
	
	addCombatButtons();
	clearTable(document.getElementById("characterInputTable"));
}

function addMonster() {
	var combatTable = getCombatTable();

	var monsterRow = combatTable.insertRow(-1);
	var monsterName = monsterRow.insertCell(0);
	monsterName.innerHTML = "(" + "<input type=\"text\" id=\"monster" + numMonsters + "Name\">" + ")";
	var monsterInitiative = monsterRow.insertCell(1);
	monsterInitiative.innerHTML = "Initiative: <input type=\"text\" id=\"monster" + numMonsters + "Init\">";
	
	numMonsters++;
}

var monsters = [];

function Monster(name, initiative) {
	this.name = name;
	this.initiative = initiative;
	this.temporaryEffects = [];
}

Monster.prototype.toString = function() {
	return "Name: " + this.name + ", Initiative: " + this.initiative;	
}

function printMonsterArray() {
	var str = "";
	for (var i = 0; i < monsters.length; i++) {
		str += "name: " + monsters[i].name + ", initiative: " + monsters[i].initiative + "\n";
	}
	return str;
}

function printArrayOfNamesAndInitiatives(array) {
	for (var i = 0; i < array.length; i++) {
		console.log(array[i].name + ", " + array[i].initiative);	
	}
}

var combatants = [];

function submitInitiatives() {
	var combatTable = getCombatTable();
	// Create monster objects.
	for (var i = 0; i < combatTable.rows.length - characters.length; i++) {
		var monster = new Monster(document.getElementById("monster" + i + "Name").value, 
								  parseInt(document.getElementById("monster" + i + "Init").value))
		console.log(monster);
		console.log("is " + monster.initiative + " NaN?: " + isNaN(monster.initiative));
		if (!isNaN(monster.initiative)) {
			monsters.push(monster);
		}
	}
	console.log(printMonsterArray());
	// Player characters should be in the table in the order they're in the array.
	for (var i = 0; i < characters.length; i++) {
		characters[i].initiative = parseInt(document.getElementById(characters[i].name + "Init").value);
	}
	console.log(printCharacterArray());
	
	// Sort table by initiative.
	for (var i = 0; i < monsters.length; i++) {
		combatants.push(monsters[i]);
	}
	for (var i = 0; i < characters.length; i++) {
		combatants.push(characters[i]);
	}
	// Bubble sort because we don't give a shit.
	for (var i = 0; i < combatants.length; i++) {
		console.log("outer loop");
		printArrayOfNamesAndInitiatives(combatants);
		var maxInit = combatants[i].initiative;
		var maxCombatant = i;
		console.log("maxInit: " + maxInit + ", index: " + maxCombatant);
		for (var j = i + 1; j < combatants.length; j++) {
			console.log("combatants[j].initiative: " + combatants[j].initiative + ", maxInit: " + maxInit);
			if (combatants[j].initiative > maxInit) {
				maxInit = combatants[j].initiative;
				maxCombatant = j;	
			}
			console.log("maxInit: " + maxInit + ", index: " + maxCombatant);
		}
		console.log("maxInit: " + maxInit + ", index: " + maxCombatant);
		// Swap!
		if (i != maxCombatant) {
			var tempCombatant = combatants[i];
			combatants[i] = combatants[maxCombatant];
			combatants[maxCombatant] = tempCombatant;
		}
	}
	
	// Break ties.
	for (var i = 1; i < combatants.length; i++) {
		if (combatants[i].initiative == combatants[i-1].initiative) {
			if (confirm(combatants[i].name + " and " + combatants[i-1].name + " have the same initiative.\n" +
						"Currently " + combatants[i-1].name + " will go first. Swap " + combatants[i].name +
						" and " + combatants[i-1].name + "?")) {
				var tempCombatant = combatants[i];
				combatants[i] = combatants[i-1];
				combatants[i-1] = tempCombatant;				
			}
			
		}
	}
	
	// Clear combatants table.
	clearTable(combatTable);
	// Add combatants in sorted order.
	for (var i = 0; i < combatants.length; i++) {
//		var row = combatTable.insertRow(-1);
//		row.id = combatants[i].name + "Row";
		var row = addRowWithId(combatTable, combatants[i].name + "Row");
		populateCombatantRow(row);
//		var initiativeCell = row.insertCell(0);
		var initiativeCell = row.cells[0];
		initiativeCell.innerHTML = combatants[i].initiative + " - "
//		var nameCell = row.insertCell(1);
		var nameCell = row.cells[1];
		nameCell.innerHTML = "(" + combatants[i].name + ")";
		console.log("combatants[i].surges: " + combatants[i].surges);
		if (combatants[i].surges != null) {
//			var hpCell = row.insertCell(2);
			var hpCell = row.cells[2];
			hpCell.innerHTML = combatants[i].hp + " HP";
//			var hpModifier = row.insertCell(3);
			var hpModifier = row.cells[3];
			hpModifier.innerHTML = "(" + "<button onclick=\"addHP(\'" + combatants[i].name + "\')\">+</button>" +
								   "/" + "<button onclick=\"decreaseHP(\'" + combatants[i].name + "\')\">-</button>" + ")";
//			var surgesCell = row.insertCell(4);
			var surgesCell = row.cells[4];
			surgesCell.innerHTML = combatants[i].surges + " surges";
//			var surgesModifier = row.insertCell(5);
			var surgesModifier = row.cells[5];
			surgesModifier.innerHTML = "(" + "<button onclick=\"addSurge(\'" + combatants[i].name + "\')\">+</button>" +
								   "/" + "<button onclick=\"decreaseSurge(\'" + combatants[i].name + "\')\">-</button>" + ")";

		}
//		var temporaryEffectsCell = row.insertCell(row.cells.length);
		var temporaryEffectsCell = row.cells[6];
		var tempEffStr = ""
		for (var j = 0; j < combatants[i].temporaryEffects.length; j++) {
			tempEffStr += combatants[i].temporaryEffects[j];
		}
		temporaryEffectsCell.innerHTML = "<i>" + tempEffStr + "</i>";
	}

	// Remove buttons, add "next" and "quit".
	var combatButtonsTable = document.getElementById("combatButtons");
	combatButtonsTable.deleteRow();
	var buttonRow = combatButtonsTable.insertRow(-1);
	var nextCell = buttonRow.insertCell(0);
	nextCell.innerHTML = "<button onclick=\"nextTurn()\">" + "Next Turn" + "</button>";
	var tempEffectCell = buttonRow.insertCell(1);
	tempEffectCell.innerHTML = "<button onclick=\"createTemporaryEffectPage()\">" + "Add Temporary Effect" + "</button>";
	var quitCell = buttonRow.insertCell(2);
	quitCell.innerHTML = "<button onclick=\"quitCombat()\">" + "Quit Combat" + "</button>";
}

function addRowWithId(table, id) {
	var row = table.insertRow(-1);
	row.id = id;
	return row;
}

function populateCombatantRow(row) {
	var initiativeCell = document.createElement("td");
	initiativeCell.id = "initiative";
	row.appendChild(initiativeCell);
	
	var nameCell = document.createElement("td");
	nameCell.id = "name";
	row.appendChild(nameCell);
	
	var hpCell = document.createElement("td");
	hpCell.id = "hp";
	row.appendChild(hpCell);
	
	var hpModifierCell = document.createElement("td");
	hpModifierCell.id = "hpModifier";
	row.appendChild(hpModifierCell);
	
	var surgesCell = document.createElement("td");
	surgesCell.id = "surges";
	row.appendChild(surgesCell);
	
	var surgesModifierCell = document.createElement("td");
	surgesModifierCell.id = "surgesModifier";
	row.appendChild(surgesModifierCell);
	
	var temporaryEffectsCell = document.createElement("td");
	temporaryEffectsCell.id = "temporaryEffects";
	row.appendChild(temporaryEffectsCell);
}

function nextTurn() {
	var combatTable = getCombatTable();
	var topRow = combatTable.rows[0];
	var rowId = combatTable.rows[0].id;
	console.log("id: " + rowId);
	combatTable.deleteRow(0);
	var newRow = combatTable.insertRow(-1);
	newRow.id = rowId;
	console.log(newRow);
	for (var i = 0; i < topRow.cells.length; i++) {
		var cell = newRow.insertCell(i);
		cell.innerHTML = topRow.cells[i].innerHTML;	
	}
	
	// Update temporary effects vars.
	for (var i = 0; i < combatants.length; i++) {
		for (var j = 0; j < combatants[i].temporaryEffects.length; j++) {
			// Maybe it's worth it to show how long ago a temporary effect expired?
//			if (characters[i].temporaryEffects[j].turns > 1) {
				combatants[i].temporaryEffects[j].turns--;
//			} else if (characters[i].temporaryEffects[j].turns == 1) {
//				characters[i].temporaryEffects.
//			}
		}
		updateCombatantsTable(combatants[i]);
	}
}

function clearTable(table) {
	for (var i = table.rows.length; i > 0; i--) {
		table.deleteRow(i-1);
	}
}

function addHP(charName) {
	for (var i = 0; i < combatants.length; i++) {
		if (combatants[i].name == charName) {
			console.log("found: " + combatants[i]);
			combatants[i].hp.currentValue++;
			updateCombatantsTable(combatants[i]);
		}
	}
}

function decreaseHP(charName) {
	for (var i = 0; i < combatants.length; i++) {
		if (combatants[i].name == charName) {
			combatants[i].hp.currentValue--;
			updateCombatantsTable(combatants[i]);
		}
	}
}

function addSurge(charName) {
	for (var i = 0; i < combatants.length; i++) {
		if (combatants[i].name == charName) {
			console.log("found: " + combatants[i]);
			combatants[i].surges.currentValue++;
			updateCombatantsTable(combatants[i]);
		}
	}
}

function decreaseSurge(charName) {
	for (var i = 0; i < combatants.length; i++) {
		if (combatants[i].name == charName) {
			combatants[i].surges.currentValue--;
			updateCombatantsTable(combatants[i]);
		}
	}
}

function createTemporaryEffectPage() {
	var effectsWindow = window.open("", "Add Temporary Effects to characters", "width=200,height=100");
	var effectsDocument = effectsWindow.document;
	
	var characterTable = effectsDocument.createElement("table");
	
	var effectRow = effectsDocument.createElement("tr");
	var effectLabel = effectsDocument.createElement("td");
	var effectLabelText = effectsDocument.createTextNode("Effect name:");
	effectLabel.appendChild(effectLabelText);
	effectRow.appendChild(effectLabel);
	var effectInput = effectsDocument.createElement("td");
	var effectInputBox = effectsDocument.createElement("input");
	effectInputBox.setAttribute("type", "text");
	effectInputBox.id = "effectName";
	effectInput.appendChild(effectInputBox);
	effectRow.appendChild(effectInput);
	characterTable.appendChild(effectRow);
	
	var turnsRow = effectsDocument.createElement("tr");
	var turnsLabel = effectsDocument.createElement("td");
	var turnsLabelText = effectsDocument.createTextNode("Length of effect (turns):");
	turnsLabel.appendChild(turnsLabelText);
	turnsRow.appendChild(turnsLabel);
	var turnsInput = effectsDocument.createElement("td");
	var turnsInputBox = effectsDocument.createElement("input");
	turnsInputBox.setAttribute("type", "text");
	turnsInputBox.id = "effectTurns";
	turnsInput.appendChild(turnsInputBox);
	turnsRow.appendChild(turnsInput);
	characterTable.appendChild(turnsRow);
	
	for (var i = 0; i < combatants.length; i++) {
		var charRow = effectsDocument.createElement("tr");
		
		var charName = effectsDocument.createElement("td");
		var charNameText = effectsDocument.createTextNode(combatants[i].name);
		charName.appendChild(charNameText);
		charRow.appendChild(charName);
		
		var charCheckboxCell = effectsDocument.createElement("td");
		var charCheckbox = effectsDocument.createElement("input");
		charCheckbox.setAttribute("type", "checkbox");
		charCheckbox.id = combatants[i].name + "Affected";
		charCheckboxCell.appendChild(charCheckbox);
		charRow.appendChild(charCheckboxCell);
	
		characterTable.appendChild(charRow);	
	}
	
	var submitRow = effectsDocument.createElement("tr");
	var submitCol = effectsDocument.createElement("td");
	var submitButton = effectsDocument.createElement("button");
	var submitButtonText = effectsDocument.createTextNode("Submit");
	submitButton.appendChild(submitButtonText);
	submitButton.onclick = function() {
		var effectName = effectInputBox.value;
		var turns = turnsInputBox.value;
		for (var i = 0; i < combatants.length; i++) {
			if (effectsDocument.getElementById(combatants[i].name + "Affected").checked == true) {
				console.log("giving " + combatants[i].name + " " + effectName + " for " + turns + " turns.");
				var tempEffect = new TemporaryEffect(effectName, turns*combatants.length);
				console.log("tempEffect: " + tempEffect);
				combatants[i].temporaryEffects.push(tempEffect);
			} else {
				console.log("no status effects for: " + combatants[i].name);
			}
		}
	};
	submitCol.appendChild(submitButton);
	submitRow.appendChild(submitCol);
	characterTable.appendChild(submitRow);
	
	effectsDocument.body.appendChild(characterTable);
	effectsDocument.body.onunload = function() {
		for (var i = 0; i < combatants.length; i++) {
			updateCombatantsTable(combatants[i]);	
		}
	};
}

function updateAllCombatants() {
	for (var i = 0; i < combatants.length; i++) {
		updateCombatantsTable(combatants[i]);	
	}
}

function updateCombatantsTable(combatant) {
	// Assign row ids to the combatants table, and operate only on those here.
	console.log("looking for: " + combatant.name + "Row");
	var charRow = document.getElementById(combatant.name + "Row");

	var temporaryEffectsCell = charRow.cells[6];
	if (combatant.surges != null) {
		var hpCell = charRow.cells[2];
		hpCell.innerHTML = combatant.hp + " HP";
		var surgesCell = charRow.cells[4];
		surgesCell.innerHTML = combatant.surges + " surges";
	}
	var tempEffStr = ""
	for (var i = 0; i < combatant.temporaryEffects.length; i++) {
		if (combatant.temporaryEffects[i].turns > 0) {
			tempEffStr += combatant.temporaryEffects[i];
		}
	}
	temporaryEffectsCell.innerHTML = "<i>" + tempEffStr + "</i>";
}

function quitCombat() {
	if (confirm("Is combat really over?")) {
		var combatTable = getCombatTable();
		clearTable(combatTable);
		var combatButtonsTable = document.getElementById("combatButtons");
		clearTable(combatButtonsTable);
	}
	numMonsters = 0;
	monsters = [];
	combatants = [];
}