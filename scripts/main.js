$(init);
var mainContentBox;
var user = null;
var characters = [];
var allCharacterData = null;
var clipboard = null;

function init()
{
	mainContentBox = $("#content");
	goToLogin();
}

function goToLogin()
{
	$(mainContentBox).html("");
	$(mainContentBox).append("Log in!<br>");
	$(mainContentBox).append($("<input class='loginScreenInput' type='email' id='emailLogin' placeholder='email'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='password' id='passwordLogin' placeholder='password'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='button' id='loginButton' value='Log In'/>"));
	
	$("#loginButton").on("click", doLogin);
	
	$(mainContentBox).append("<br><br>Register!<br>");
	$(mainContentBox).append($("<input class='loginScreenInput' type='text' id='nameRegister' placeholder='name'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='email' id='emailRegister' placeholder='email'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='password' id='passwordRegister' placeholder='password'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='password' id='passwordRegister2' placeholder='password again'/>"));
	$(mainContentBox).append($("<input class='loginScreenInput' type='button' id='registerButton' value='Register!'/>"));
	$(mainContentBox).append("<br>");
	$("#registerButton").on("click", doRegister);
}

function refreshUserData()
{
	var email = user.email;
	var password = user.password;

	$.ajax({
		dataType: "json",
		data: "",
		url: "scripts/php/login.php?email=" + email + "&password=" + password,
		success: function(data){if(data != null)user = data;}
	});
}

function doLogin()
{
	var email = $("#emailLogin").val();
	var password = $("#passwordLogin").val();

	$.ajax({
		dataType: "json",
		data: "",
		url: "scripts/php/login.php?email=" + email + "&password=" + password,
		success: function(data){loginSuccess(data);}
	});
}

function loginSuccess(data)
{
	if(data != null)
	{
		user = data;
		goToMainPage();
	}
}

function doRegister()
{
	var name = $("#nameRegister").val();
	var email = $("#emailRegister").val();
	var password = $("#passwordRegister").val();
	var password2 = $("#passwordRegister2").val();
	
	console.log(password + "--" + password2 + "--" + (password == password2));
	
	var filledIn = name != "" && email != "" && password != "";
	
	if(password == password2 && filledIn)
	{
		$.ajax({
			dataType: "json",
			data: "",
			url: "scripts/php/register.php?name=" + name + "&email=" + email + "&password=" + password,
			complete: function(data){registerSuccess(data);}
		});
	}
	else if(password != password2)
	{
		console.log("failed");
		$("#passwordRegister").attr("style", "{outline-color: red;outline-style: solid;outline-width: 1px;color:red;}");
		$(mainContentBox).append("<br>Passwords did not match! Please try again.");
	}
	else if(!filledIn)
	{
		$(mainContentBox).append("<br>You forgot to fill in some of the fields. We need these to spy on you.");
	}
}

function registerSuccess(data)
{
	console.log("attempted, result: " + data);
	console.log(data);
	console.log(data.responseText);

	if(data.responseText == "1")
	{
		goToLogin();
		$(mainContentBox).append("<br><br>Registration complete! Log in using the stuff above!<br>");
	}
	else
	{
		$(mainContentBox).append("<br><br>A user with this e-mail already exists! Try logging in!<br>");
	}
}

function goToMainPage()
{
	$(mainContentBox).html("");
	
	$(mainContentBox).append($("<div id='characterlist'></div>"));
	
	$.ajax({
			dataType: "json",
			data: "",
			url: "scripts/php/getcharactersfromuser.php?id=" + user.id,
			success: function(data){addAllUserCharacters(data);}
		});
}

function saveAll()
{
	for(var i = 0; i < characters.length; i++)
	{
		characters[i].saveInServer();
	}
	
	refreshAllUserCharacters();
}	

function populateCharacterDiv(charData)
{
	$("#characterlist").append("<div class='characterinfo' id='char" + charData.id + "'></div>");
	var character = new Character(charData);
	characters.push(character);
	console.log(character);
	
	$("#char" + character.data.id).html("");
	$("#char" + character.data.id).append($("<div class=charLabel id='nameLabel'>" + character.data.info.name + " </div>"));
	
	$("#char" + character.data.id).append($("<input type='button' value='Refresh' id='refreshMainPage'/>"));
	$("#refreshMainPage").on("click", goToMainPage);
	
	$("#char" + character.data.id).append($("<input type='button' id='delete1' charId='" + charData.ownerId + "' value='Delete " + charData.info.name + "'/>"));
	$("#char" + character.data.id).find("#delete1").on("click", {obj: character}, function(event)
	{
		$("#char" + character.data.id).find("#delete2").slideDown();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append($("<input type='button' id='delete2' charId='" + charData.ownerId + "' value='Are you sure?' style='display: none;'/>"));
	$("#char" + character.data.id).find("#delete2").on("click", {obj: character}, function(event)
	{
		$("#char" + character.data.id).find("#delete3").slideDown();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append($("<input type='button' id='delete3' charId='" + charData.ownerId + "' value='Really sure?' style='display: none;'/>"));
	$("#char" + character.data.id).find("#delete3").on("click", {obj: character}, function(event)
	{
		$("#char" + character.data.id).find("#delete4").slideDown();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append($("<input type='button' id='delete4' charId='" + charData.ownerId + "' value='PERMANENTLY DELETE' style='display: none;'/>"));
	$("#char" + character.data.id).find("#delete4").on("click", {obj: character}, function(event)
	{
		$.ajax({url: "scripts/php/deletecharacter.php?id=" + charData.id, success:function(){goToMainPage();}});
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append($('<div id="basicInfo"></div>'));
	
	//begin edit
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='name'>Name: " + character.data.info.name + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='text' class=charField id='nameEditable' style='display: none;' value='" + character.data.info.name + "'/>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#name").append($("<input type='button' id='editnameBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editnameBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#name").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#nameEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#name").children("#editnameBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#savenameBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='savenameBtn' charId='" + this.ownerId + "' value='Save' style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#savenameBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.name = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#nameEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	//begin edit
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='exp'>Experience: " + character.data.info.experience + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='number' class=charField id='expEditable' style='display: none;' value='" + character.data.info.experience + "'/>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#exp").append($("<input type='button' id='editexpBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editexpBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#exp").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#expEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#exp").children("#editexpBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#saveexpBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='saveexpBtn' charId='" + this.ownerId + "' value='Save' style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#saveexpBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.experience = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#expEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	//begin edit
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='hp'>Current Health: " + character.data.status.currentHealth + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='number' class=charField id='hpEditable' style='display: none;' value='" + character.data.status.currentHealth + "'/>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#hp").append($("<input type='button' id='edithpBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#edithpBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#hp").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#hpEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#hp").children("#edithpBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#savehpBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='savehpBtn' charId='" + this.ownerId + "' value='Save' style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#savehpBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.currentHealth = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#hpEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	/*
	//begin edit
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='chp'>Maximum Health: " + character.data.status.maxHitPoints + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='number' class=charField id='chpEditable' style='display: none;' value='" + character.data.status.maxHitPoints + "'/>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#chp").append($("<input type='button' id='editchpBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editchpBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#chp").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#chpEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#chp").children("#editchpBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#savechpBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='savechpBtn' charId='" + this.ownerId + "' value='Save' style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#savechpBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.maxHitPoints = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#chpEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	*/
	
	character.openInventory();
	$("#char" + charData.id).append(character.tempInventory.toHTML());
	
	$("#char" + charData.id).children(".inventoryItem").attr("class", "inventoryItem inventory");
	
	character.openSpells();
	$("#char" + charData.id).append(character.tempSpells.toHTML());
	
	//New Item
	$("#char" + charData.id).children(".inventoryItem").append("<br>");
	$("#char" + charData.id).children(".inventoryItem").append($("<div class='inventoryItem newItem' id='newItemFor" + charData.id + "'></div>"));
	
	$("#newItemFor" + charData.id).append("<br>New Item Parameters<br>");
	$("#newItemFor" + charData.id).append("Name: ");
	$("#newItemFor" + charData.id).append($("<input type='text' placeholder='Name' id='name'/>"));
	$("#newItemFor" + charData.id).append("<br>Quantity: ");
	$("#newItemFor" + charData.id).append($("<input type='number' placeholder='Quantity' id='quantity' value='1'/>"));
	$("#newItemFor" + charData.id).append("<br>Weight: ");
	$("#newItemFor" + charData.id).append($("<input type='number' placeholder='Weight' id='weight' value='0'/>"));
	$("#newItemFor" + charData.id).append("<br>Description: ");
	$("#newItemFor" + charData.id).append($("<input type='text' placeholder='Description and Effects' id='description'/>"));
	$("#newItemFor" + charData.id).append("<br>Is a container?: ");
	$("#newItemFor" + charData.id).append($("<input type='checkbox' id='container'/>"));
	
	console.log("ending chartest");
}

function refreshAllUserCharacters()
{
	$("#characterlist").html("");
	
	characters = [];
	
	for(var i = 0; i < allCharacterData.length; i++)
	{
		populateCharacterDiv(allCharacterData[i]);
	}
	
	$("#characterlist").append($("<input type='button' id='newChar' value='New Character'/>"));
	$("#characterlist").find("#newChar").on("click", function(event)
	{
		$.ajax({url: "scripts/php/createcharacter.php?id=" + user.id, success:function(){saveAll(); goToMainPage();}});
		event.stopImmediatePropagation()
		return false;
	});
}

function addAllUserCharacters(data)
{
	allCharacterData = data;
	refreshAllUserCharacters();
}

function Character(json)
{
	this.data = json;
	this.tempInventory = null;
	this.tempSpells = null;
	
	this.saveInServer = function()
	{
		/*var thisAsJson = JSON.stringify(this);
		
		var request = new XMLHttpRequestObject();
		request.open("POST", "savecharacter.php", true);
		request.setRequestHeader("Content-type", "application/json");

		request.send(thisAsJson);
		console.log("SAVING TO SERVER");
		console.log(thisAsJson);*/
		this.saveInventory();
		this.saveSpells();
		var thisAsJson = JSON.stringify(this);
		
		$.ajax
		({
			type: 'POST',
			url: 'scripts/php/savecharacter.php',
			data: {json: thisAsJson},
			dataType: 'json',
			complete: function(data){console.log(data);}
		});
		
		//console.log(thisAsJson);
	}
	
	this.calculateStatModifier = function(statValue)
	{
		switch(statValue)
		{
			case 1: return -5;
			case 2: case 3: return -4;
			case 4: case 5: return -3;
			case 6: case 7: return -2;
			case 8: case 9: return -1;
			case 10: case 11: return 0;
			case 12: case 13: return 1;
			case 14: case 15: return 2;
			case 16: case 17: return 3;
			case 18: case 19: return 4;
			case 20: case 21: return 5;
			case 22: case 23: return 6;
			case 24: case 25: return 7;
			case 26: case 27: return 8;
			case 28: case 29: return 9;
			case 30: return 10;
		}
	}
	
	this.saveInventory = function()
	{
		console.log("Saving inv");
		
		this.tempInventory.removeDeleted();
		
		var invAsJson = JSON.stringify(this.tempInventory)
		this.data.inventory = invAsJson;//btoa(invAsJson);
	}
	
	this.saveSpells = function()
	{
		console.log("Saving spells");
		
		//this.tempInventory.removeDeleted();
		
		var spellsAsJson = JSON.stringify(this.tempSpells)
		this.data.spells = spellsAsJson;//btoa(invAsJson);
	}
	
	this.openInventory = function()
	{
		console.log("Opening inventory of character: " + this.data.name);
		
		if(this.data.inventory == "")
		{
			console.log("No saved inventory exists, making one now.");
			this.tempInventory = new InventoryObject(this.data.id, "Inventory", "Everything you have with you!", 1, 0, true);
			this.tempInventory.isRoot = true;
			console.log(this.tempInventory);
			this.saveInventory();
		}
		
		console.log("Existing inventory found. Opening...");
		this.tempInventory = JSON.parse(this.data.inventory);//atob(this.data.inventory));
		this.tempInventory = $.extend(true, new InventoryObject(), this.tempInventory);
		this.tempInventory.isRoot = true;
		
		this.tempInventory.fixItemTypes();
		
		console.log(this.tempInventory);
	}
	
	this.openSpells = function()
	{
		console.log("Opening spellbook of character: " + this.data.name);
		
		if(this.data.spells == "")
		{
			console.log("No saved spellbook exists, making one now.");
			this.tempSpells = new SpellBookObject(this.data.id);
			this.saveSpells();
		}
		
		console.log("Existing inventory found. Opening...");
		this.tempSpells = JSON.parse(this.data.spells);//atob(this.data.inventory));
		this.tempSpells = $.extend(true, new SpellBookObject(), this.tempSpells);
		
		this.tempSpells.fixSpellTypes();
		
		console.log(this.tempSpells);
	}
	
	this.openInventory();
	this.openSpells();
}

function SpellBookObject(ownerId, contents)
{
	this.ownerId = ownerId;
	
	this.sorceryPoints = 0;
	this.lvl1slots = 0;
	this.lvl2slots = 0;
	this.lvl3slots = 0;
	this.lvl4slots = 0;
	this.lvl5slots = 0;
	this.lvl6slots = 0;
	this.lvl7slots = 0;
	this.lvl8slots = 0;
	this.lvl9slots = 0;
	
	this.fixSpellTypes = function()
	{
		if(this.contents != null)
		{
			for(var i = 0; i < this.contents.length; i++)
			{
				this.contents[i] = $.extend(true, new SpellObject(), this.contents[i]);
			}
		}
	}
	
	this.toHTML = function()
	{
		var baseElement = $('<div id="spellBook"></div>');
		
		$(baseElement).append('<div id="sorcPoints">Sorcery Points: ' + this.sorceryPoints + '</div>');
		$(baseElement).children("#sorcPoints").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#sorcPoints").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.sorceryPoints++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#sorcPoints").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#sorcPoints").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.sorceryPoints--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		if(this.contents == null)
			this.contents = [];
		
		$(baseElement).append('<div id="lvl0"><div class="inventoryItemNameLabel">Cantrips</div></div>');
		$(baseElement).children("#lvl0").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 0)
				$(baseElement).children("#lvl0").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl0").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl0").append("<br>");
		$(baseElement).children("#lvl0").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 0;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl1"><div class="inventoryItemNameLabel">Level 1 Slots: ' + this.lvl1slots + '</div></div>');
		$(baseElement).children("#lvl1").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl1").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl1slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl1").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl1").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl1slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl1").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 1)
				$(baseElement).children("#lvl1").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl1").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl1").append("<br>");
		$(baseElement).children("#lvl1").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 1;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl2"><div class="inventoryItemNameLabel">Level 2 Slots: ' + this.lvl2slots + '</div></div>');
		$(baseElement).children("#lvl2").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl2").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl2slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl2").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl2").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl2slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl2").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 2)
				$(baseElement).children("#lvl2").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl2").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl2").append("<br>");
		$(baseElement).children("#lvl2").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 2;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl3"><div class="inventoryItemNameLabel">Level 3 Slots: ' + this.lvl3slots + '</div></div>');
		$(baseElement).children("#lvl3").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl3").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl3slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl3").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl3").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl3slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl3").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 3)
				$(baseElement).children("#lvl3").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl3").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl3").append("<br>");
		$(baseElement).children("#lvl3").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 3;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl4"><div class="inventoryItemNameLabel">Level 4 Slots: ' + this.lvl4slots + '</div></div>');
		$(baseElement).children("#lvl4").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl4").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl4slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl4").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl4").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl4slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl4").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 4)
				$(baseElement).children("#lvl4").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl4").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl4").append("<br>");
		$(baseElement).children("#lvl4").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 4;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl5"><div class="inventoryItemNameLabel">Level 5 Slots: ' + this.lvl5slots + '<div></div>');
		$(baseElement).children("#lvl5").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl5").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl5slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl5").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl5").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl5slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl5").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 5)
				$(baseElement).children("#lvl5").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl5").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl5").append("<br>");
		$(baseElement).children("#lvl5").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 5;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl6"><div class="inventoryItemNameLabel">Level 6 Slots: ' + this.lvl6slots + '</div></div>');
		$(baseElement).children("#lvl6").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl6").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl6slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl6").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl6").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl6slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl6").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 6)
				$(baseElement).children("#lvl6").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl6").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl6").append("<br>");
		$(baseElement).children("#lvl6").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 6;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl7"><div class="inventoryItemNameLabel">Level 7 Slots: ' + this.lvl7slots + '</div></div>');
		$(baseElement).children("#lvl7").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl7").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl7slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl7").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl7").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl7slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl7").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 7)
				$(baseElement).children("#lvl7").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl7").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl7").append("<br>");
		$(baseElement).children("#lvl7").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 7;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl8"><div class="inventoryItemNameLabel">Level 8 Slots: ' + this.lvl8slots + '</div></div>');
		$(baseElement).children("#lvl8").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl8").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl8slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl8").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl8").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl8slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl8").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 8)
				$(baseElement).children("#lvl8").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl8").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl8").append("<br>");
		$(baseElement).children("#lvl8").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 8;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="lvl9"><div class="inventoryItemNameLabel">Level 9 Slots: ' + this.lvl9slots + '</div></div>');
		$(baseElement).children("#lvl9").append('<input type="button" id="addSlot" value="+"/>');
		$(baseElement).children("#lvl9").find("#addSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl9slots++;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl9").append('<input type="button" id="remSlot" value="-"/>');
		$(baseElement).children("#lvl9").find("#remSlot").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.lvl9slots--;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		$(baseElement).children("#lvl9").append('<div id="spellContainer"></div>');
		for(var i = 0; i < this.contents.length; i++)
		{
			if(this.contents[i].level == 9)
				$(baseElement).children("#lvl9").children("#spellContainer").append(this.contents[i].toHTML());
		}
		$(baseElement).children("#lvl9").append($("<input type='button' id='addSpell' charId='" + this.ownerId + "' value='New Spell'/>"));
		$(baseElement).children("#lvl9").append("<br>");
		$(baseElement).children("#lvl9").find("#addSpell").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			var spell = new SpellObject();
			spell.level = 9;
			event.data.obj.contents.push(spell);
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		return $(baseElement);
	}
	
	this.removeDeleted = function()
	{
		if(this.contents != null)
		{
			var newContents = [];
			
			for(var i = 0; i < this.contents.length; i++)
			{
				if(!this.contents[i].isDeleted)
					newContents.push(this.contents[i]);
			}
			
			this.contents = newContents;
		}
	}
}

function SpellObject()
{
	this.name = "New Spell";
	this.prepared = false;
	this.isDeleted = false;
	this.level = 0;
	
	this.V = false;
	this.S = false;
	this.M = "";
	
	this.allowRitual = false;
	
	this.toHTML = function()
	{
		var baseElement = $('<div class="spellObject"></div>');
		$(baseElement).append('<input type="button" id="prepared" style="' + (this.prepared? "background-color: green;" : "background-color: red;") + '"/>');
		$(baseElement).find("#prepared").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.prepared = !event.data.obj.prepared;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append('<div id="spellName">' + this.name + '</div>');
		$(baseElement).append('<div id="spellComponents">(' + (this.V? "V" : "") + (this.S? "S" : "") + (this.M != ""? "M:[" + this.M + ']' : "") + (this.allowRitual? "(ritual)" : "") + ')</div>');
		
		$(baseElement).append('<div id="editFields"></div>');
		
		$(baseElement).children("#editFields").append('<input type="text" id="editedName" value="' + this.name + '"/><br>');
		$(baseElement).children("#editFields").append('<input type="checkbox" id="editedV"' + (this.V? "checked" : "") + '/>V<br>');
		$(baseElement).children("#editFields").append('<input type="checkbox" id="editedS"' + (this.S? "checked" : "") + '/>S<br>');
		$(baseElement).children("#editFields").append('<input type="text" id="editedM" value="' + this.M + '"/>M<br>');
		$(baseElement).children("#editFields").append('Ritual: <input type="checkbox" id="editedRitual"' + (this.allowRitual? "checked" : "") + '/>Ritual<br>');
		
		$(baseElement).children("#editFields").append($("<input type='button' id='saveBtn' charId='" + this.ownerId + "' value='Save'/>"));
		$(baseElement).children("#editFields").append("<br>");
		$(baseElement).children("#editFields").find("#saveBtn").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.name = $(event.data.baseE).children("#editFields").children("#editedName").val();
			event.data.obj.V = $(event.data.baseE).children("#editFields").children("#editedV")[0].checked;
			event.data.obj.S = $(event.data.baseE).children("#editFields").children("#editedS")[0].checked;
			event.data.obj.M = $(event.data.baseE).children("#editFields").children("#editedM").val();
			event.data.obj.allowRitual = $(event.data.baseE).children("#editFields").children("#editedRitual")[0].checked;
			saveAll();
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).children("#editFields").hide();
		
		$(baseElement).append($("<input type='button' id='editBtn' charId='" + this.ownerId + "' value='Edit'/>"));
		$(baseElement).append("<br>");
		$(baseElement).find("#editBtn").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			$(event.data.baseE).children("#spellName").hide();
			$(event.data.baseE).children("#spellComponents").hide();
			$(event.data.baseE).children("#editFields").show();
			
			$(event.data.baseE).children("#editBtn").hide();
			
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).append($("<input type='button' id='saveNameBtn' charId='" + this.ownerId + "' value='Save'/>"));
		$(baseElement).find("#saveNameBtn").on("click", {obj: this, baseE: baseElement}, function(event)
		{
			event.data.obj.name = $(event.data.baseE).children("#nameEditable").val(); 
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
		
		$(baseElement).children("#saveNameBtn").hide();
		
		return $(baseElement);
	}
}

function InventoryObject(ownerId, name, description, quantity, weight, canContain, contents)
{
	this.isRoot = false;
	this.name = name;
	this.description = description;
	this.weight = weight;
	this.canContain = canContain;
	this.quantity = quantity;
	this.ownerId = ownerId;
	this.isDeleted = false;
	
	this.fixItemTypes = function()
	{
		if(this.contents != null)
		{
			for(var i = 0; i < this.contents.length; i++)
			{
				this.contents[i] = $.extend(true, new InventoryObject(), this.contents[i]);
			}
			
			for(var i = 0; i < this.contents.length; i++)
			{
				this.contents[i].fixItemTypes();
			}
		}
	}
	
	this.removeDeleted = function()
	{
		if(this.contents != null)
		{
			var newContents = [];
			
			for(var i = 0; i < this.contents.length; i++)
			{
				if(!this.contents[i].isDeleted && this.contents[i].quantity > 0)
					newContents.push(this.contents[i]);
			}
			
			this.contents = newContents;
			
			for(var i = 0; i < this.contents.length; i++)
			{
				this.contents[i].removeDeleted();
			}
		}
	}
	
	this.toHTML = function()
	{
		var baseElement = $("<div class='inventoryItem'></div>");
		$(baseElement).append($("<div class='inventoryItemField inventoryItemNameLabel' id='name'>" + this.name + " x" + this.quantity + "</div>"));
		
		if(!this.isRoot)
		{
			$(baseElement).append($('<input type="text" class="inventoryItemField", id="nameEditable" value="' + this.name.replace('"', "'") + '"/>'));
			$(baseElement).children("#nameEditable").hide();
			
			if(!this.canContain)
			{
				$(baseElement).append($("<input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
				$(baseElement).append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
			}
			
			$(baseElement).append($("<input type='button' id='editNameBtn' charId='" + this.ownerId + "' value='Edit Name'/>"));
			$(baseElement).append("<br>");
			$(baseElement).find("#editNameBtn").on("click", {obj: this, baseE: baseElement}, function(event)
			{
				$(event.data.baseE).children("#name").hide();
				$(event.data.baseE).children("#nameEditable").show();
				
				$(event.data.baseE).children("#editNameBtn").hide();
				$(event.data.baseE).children("#saveNameBtn").show();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).append($("<input type='button' id='saveNameBtn' charId='" + this.ownerId + "' value='Save'/>"));
			$(baseElement).find("#saveNameBtn").on("click", {obj: this, baseE: baseElement}, function(event)
			{
				event.data.obj.name = $(event.data.baseE).children("#nameEditable").val(); 
				saveAll();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).children("#saveNameBtn").hide();
		}//end edits
		
		if(!this.canContain)
		{
			$(baseElement).find("#addOneBtn").on("click", {obj: this}, function(event)
			{
				console.log("Increasing item quantity by one");
				console.log(event.data.obj);
				
				event.data.obj.quantity++;
				saveAll();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			
			$(baseElement).find("#remOneBtn").on("click", {obj: this}, function(event)
			{
				console.log("Decreasing item quantity by one");
				console.log(event.data.obj);
				
				event.data.obj.quantity--;
				saveAll();
				
				event.stopImmediatePropagation()
				return false;
			});
		}
		
		if(this.weight > 0)
		{
			$(baseElement).append($("<div class='inventoryItemField'>" + this.weight + "kg (total: " + this.getTotalWeight() + "kg)</div>"));
		}
		
		$(baseElement).append($("<div class='inventoryItemField inventoryItemDescription', id='description'>" + this.description.replace(/\r?\n/g, '<br />') + "</div>"));
		
		if(!this.isRoot)
		{
			$(baseElement).append($('<textarea class="inventoryItemField", id="descriptionEditable">' + this.description + '</textarea>'));
			$(baseElement).children("#descriptionEditable").hide();
			
			$(baseElement).append($("<input type='button' id='editDescrBtn' charId='" + this.ownerId + "' value='Edit Description'/>"));
			$(baseElement).append("<br>");
			$(baseElement).find("#editDescrBtn").on("click", {obj: this, baseE: baseElement}, function(event)
			{
				$(event.data.baseE).children("#description").hide();
				$(event.data.baseE).children("#descriptionEditable").show();
				
				$(event.data.baseE).children("#editDescrBtn").hide();
				$(event.data.baseE).children("#saveDescrBtn").show();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).append($("<input type='button' id='saveDescrBtn' charId='" + this.ownerId + "' value='Save'/>"));
			$(baseElement).find("#saveDescrBtn").on("click", {obj: this, baseE: baseElement}, function(event)
			{
				event.data.obj.description = $(event.data.baseE).children("#descriptionEditable").val(); 
				saveAll();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).children("#saveDescrBtn").hide();
		}
		
		if(this.canContain)
		{
			$(baseElement).append($("<br>"));
			$(baseElement).append($("<div class='inventoryItemContents'></div>"));
			
			var container = $(baseElement).children(".inventoryItemContents");
			
			if(this.contents == null)
				this.contents = [];
				
			for(var i = 0; i < this.contents.length; i++)
			{
				$(container).append(this.contents[i].toHTML());
			}
			
			$(baseElement).append("<br>");
			$(baseElement).append($("<input type='button' id='addBtn' charId='" + this.ownerId + "' value='Add new item here'/>"));
			$(baseElement).find("#addBtn").on("click", {obj: this}, function(event)
			{
				console.log("attempting adding a new item");
				console.log(event.data.obj);
										
				event.data.obj.addNewObject($(this).attr("charId"));
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).append($("<input type='button' id='pasteBtn' charId='" + this.ownerId + "' value='Paste item here'/>"));
			$(baseElement).find("#pasteBtn").on("click", {obj: this}, function(event)
			{
				console.log("attempting pasting an item");
				console.log(event.data.obj);
				
				if(clipboard != null)
					event.data.obj.addToInventory(clipboard);
				
				event.stopImmediatePropagation()
				return false;
			});
		}
		
		if(!this.isRoot)
		{
			$(baseElement).append($("<input type='button' id='removeBtn' charId='" + this.ownerId + "' value='Delete Item'/>"));
			$(baseElement).find("#removeBtn").on("click", {obj: this}, function(event)
			{
				console.log("deleting an item");
				console.log(event.data.obj);
										
				event.data.obj.remove();
				
				event.stopImmediatePropagation()
				return false;
			});
			/*
			$(baseElement).append($("<input type='button' id='cutBtn' charId='" + this.ownerId + "' value='Cut item'/>"));
			$(baseElement).find("#cutBtn").on("click", {obj: this}, function(event)
			{
				console.log("attempting cutting an item");
				console.log(event.data.obj);
				
				clipboard = event.data.obj;
				event.data.obj.remove();
				
				event.stopImmediatePropagation()
				return false;
			});
			*/
			$(baseElement).append($("<input type='button' id='copyBtn' charId='" + this.ownerId + "' value='Copy item'/>"));
			$(baseElement).find("#copyBtn").on("click", {obj: this}, function(event)
			{
				console.log("attempting copying an item");
				console.log(event.data.obj);
				
				clipboard = event.data.obj;
				
				event.stopImmediatePropagation()
				return false;
			});
		}
		/*
		if(clipboard == null)
		{
			$('#pasteBtn').hide();
		}
		else
		{
			$('#pasteBtn').show();
		}*/
		
		return $(baseElement);
	}
	
	this.remove = function()
	{
		this.isDeleted = true;
		saveAll();
	}
	
	this.addNewObject = function(charid)
	{
		var newItemElement = $("#newItemFor" + this.ownerId);
		var newObj = new InventoryObject(charid, //"tempName", "tempDescr", 1, 2, true);
										$(newItemElement).find("#name").val(),
										$(newItemElement).find("#description").val(),
										$(newItemElement).find("#quantity").val(),
										$(newItemElement).find("#weight").val(),
										$(newItemElement).find("#container")[0].checked);
		
		if(newObj.canContain)
			newObj.quantity = 1;
		
		console.log("Toggle value:");
		console.log($(newItemElement).find("#container")[0].checked);
		
		this.addToInventory(newObj);
	}
	
	this.addToInventory = function(newObject)
	{	
		console.log(newObject);
		
		if(this.canContain)
		{
			console.log("Adding to inventory...");
			this.contents.push(newObject);
			saveAll();
		}
		else
			console.log("This object cannot hold other objects");
	}
	
	this.getTotalWeight = function()
	{
		return this.weight * this.quantity;
	}
	
	if(contents != null)
		this.contents = contents;
	else if(canContain)
		this.contents = [];
	else
		this.contents = null;
}