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
	$(mainContentBox).append($("<input type='button' value='Refresh' id='refreshMainPage'/>"));
	$("#refreshMainPage").on("click", goToMainPage);
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
	
	$("#char" + character.data.id).append($("<div class='charCategory' id='name'>Lvl" + character.data.info.level + " " + character.data.info.name + "</div>"));
	
	$("#char" + character.data.id).find("#name").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).find("#name").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.level++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).find("#name").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).find("#name").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.level--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).append($("<div class='charCategory' id='quest'></div>"));
	$("#char" + character.data.id).append("<br><br><br>");
	
	$("#char" + character.data.id).append($("<div class=charCategory id='basicInfo'></div>"));
	
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='class'>Class: " + character.data.info.class + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<textarea class=charField id='classEditable' style='display: none;'>" + character.data.info.class + "</textarea>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#class").append($("<input type='button' id='editClassBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editClassBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#class").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#classEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#class").children("#editClassBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#saveClassBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='saveClassBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#saveClassBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.class = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#classEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='background'>Background: " + character.data.info.background + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<textarea class=charField id='backgroundEditable' style='display: none;'>" + character.data.info.background + "</textarea>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#background").append($("<input type='button' id='editBackgroundBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editBackgroundBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#background").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#backgroundEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#background").children("#editBackgroundBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#saveBackgroundBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='saveBackgroundBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#saveBackgroundBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.background = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#backgroundEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='race'>Race: " + character.data.info.race + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<textarea class=charField id='raceEditable' style='display: none;'>" + character.data.info.race + "</textarea>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#race").append($("<input type='button' id='editRaceBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editRaceBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#race").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#raceEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#race").children("#editRaceBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#saveRaceBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='saveRaceBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#saveRaceBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.race = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#raceEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='alignment'>Alignment: " + character.data.info.alignment + " </div>"));
	$("#char" + character.data.id).children("#basicInfo").append($("<textarea class=charField id='alignmentEditable' style='display: none;'>" + character.data.info.alignment + "</textarea>"));
	
	$("#char" + character.data.id).children("#basicInfo").children("#alignment").append($("<input type='button' id='editAlignmentBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#editAlignmentBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#alignment").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#alignmentEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#alignment").children("#editAlignmentBtn").hide();
		$("#char" + event.data.obj.data.id).children("#basicInfo").children("#saveAlignmentBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#basicInfo").append($("<input type='button' id='saveAlignmentBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#basicInfo").find("#saveAlignmentBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.alignment = $("#char" + event.data.obj.data.id).children("#basicInfo").children("#alignmentEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#basicInfo").append($("<div class=charField id='experience'>Experience Points: " + character.data.info.experience + "</div>"));
	
	$("#char" + character.data.id).find("#experience").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).find("#experience").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.experience++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).find("#experience").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).find("#experience").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.info.experience--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).append($("<div class=charCategory id='stats'></div>"));//TODO (+5)
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='strength'>Strength: " + character.data.stats.strength + "(+" + character.calculateStatModifier(character.data.stats.strength) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#strength").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#strength").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.strength++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#strength").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#strength").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.strength--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='dexterity'>Dexterity: " + character.data.stats.dexterity + "(+" + character.calculateStatModifier(character.data.stats.dexterity) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#dexterity").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#dexterity").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.dexterity++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#dexterity").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#dexterity").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.dexterity--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='constitution'>Constitution: " + character.data.stats.constitution + "(+" + character.calculateStatModifier(character.data.stats.constitution) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#constitution").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#constitution").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.constitution++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#constitution").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#constitution").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.constitution--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='intelligence'>Intelligence: " + character.data.stats.intelligence + "(+" + character.calculateStatModifier(character.data.stats.intelligence) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#intelligence").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#intelligence").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.intelligence++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#intelligence").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#intelligence").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.intelligence--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='wisdom'>Wisdom: " + character.data.stats.wisdom + "(+" + character.calculateStatModifier(character.data.stats.wisdom) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#wisdom").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#wisdom").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.wisdom++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#wisdom").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#wisdom").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.wisdom--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#stats").append($("<div class=charField id='charisma'>Charisma: " + character.data.stats.charisma + "(+" + character.calculateStatModifier(character.data.stats.charisma) + ")</div>"));
	
	$("#char" + character.data.id).children("#stats").find("#charisma").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#stats").find("#charisma").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.charisma++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#stats").find("#charisma").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#stats").find("#charisma").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.charisma--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).append($("<div class=charCategory id='saving'>Saving Throws:<br></div>"));
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='strength'>Strength: +" + (character.calculateStatModifier(character.data.stats.strength) + (character.data.stats.bonusses.savingThrows.strength? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.strength? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#strength").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#strength").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.strength = !event.data.obj.data.stats.bonusses.savingThrows.strength;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='dexterity'>Dexterity: +" + (character.calculateStatModifier(character.data.stats.dexterity) + (character.data.stats.bonusses.savingThrows.dexterity? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.dexterity? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#dexterity").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#dexterity").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.dexterity = !event.data.obj.data.stats.bonusses.savingThrows.dexterity;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='constitution'>Constitution: +" + (character.calculateStatModifier(character.data.stats.constitution) + (character.data.stats.bonusses.savingThrows.constitution? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.constitution? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#constitution").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#constitution").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.constitution = !event.data.obj.data.stats.bonusses.savingThrows.constitution;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='intelligence'>Intelligence: +" + (character.calculateStatModifier(character.data.stats.intelligence) + (character.data.stats.bonusses.savingThrows.intelligence? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.intelligence? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#intelligence").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#intelligence").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.intelligence = !event.data.obj.data.stats.bonusses.savingThrows.intelligence;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='wisdom'>Wisdom: +" + (character.calculateStatModifier(character.data.stats.wisdom) + (character.data.stats.bonusses.savingThrows.wisdom? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.wisdom? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#wisdom").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#wisdom").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.wisdom = !event.data.obj.data.stats.bonusses.savingThrows.wisdom;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#saving").append($("<div class=charField id='charisma'>Charisma: +" + (character.calculateStatModifier(character.data.stats.charisma) + (character.data.stats.bonusses.savingThrows.charisma? character.getProficiencyBonus() : 0)) + (character.data.stats.bonusses.savingThrows.charisma? " (P)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#saving").find("#charisma").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#saving").find("#charisma").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.savingThrows.charisma = !event.data.obj.data.stats.bonusses.savingThrows.charisma;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).append($("<div class=charCategory id='skills'>Skills:<br></div>"));
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='acrobatics'>Acrobatics: +" + (character.calculateStatModifier(character.data.stats.dexterity) + ((character.data.stats.bonusses.skills.acrobatics? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.acrobatics? 2 : 1))) + (character.data.stats.bonusses.skills.acrobatics? " (P)" : "") + (character.data.stats.bonusses.expertise.acrobatics? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#acrobatics").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#acrobatics").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.acrobatics = !event.data.obj.data.stats.bonusses.skills.acrobatics;
		
		if(!event.data.obj.data.stats.bonusses.skills.acrobatics)
			character.data.stats.bonusses.expertise.acrobatics = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.acrobatics)
	{
		$("#char" + character.data.id).children("#skills").find("#acrobatics").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#acrobatics").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.acrobatics = !event.data.obj.data.stats.bonusses.expertise.acrobatics;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='animalHandling'>Animal Handling: +" + (character.calculateStatModifier(character.data.stats.wisdom) + ((character.data.stats.bonusses.skills.animalHandling? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.animalHandling? 2 : 1))) + (character.data.stats.bonusses.skills.animalHandling? " (P)" : "") + (character.data.stats.bonusses.expertise.animalHandling? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#animalHandling").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#animalHandling").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.animalHandling = !event.data.obj.data.stats.bonusses.skills.animalHandling;
		
		if(!event.data.obj.data.stats.bonusses.skills.animalHandling)
			character.data.stats.bonusses.expertise.animalHandling = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.animalHandling)
	{
		$("#char" + character.data.id).children("#skills").find("#animalHandling").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#animalHandling").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.animalHandling = !event.data.obj.data.stats.bonusses.expertise.animalHandling;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='arcana'>Arcana: +" + (character.calculateStatModifier(character.data.stats.intelligence) + ((character.data.stats.bonusses.skills.arcana? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.arcana? 2 : 1))) + (character.data.stats.bonusses.skills.arcana? " (P)" : "") + (character.data.stats.bonusses.expertise.arcana? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#arcana").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#arcana").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.arcana = !event.data.obj.data.stats.bonusses.skills.arcana;
		
		if(!event.data.obj.data.stats.bonusses.skills.arcana)
			character.data.stats.bonusses.expertise.arcana = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.arcana)
	{
		$("#char" + character.data.id).children("#skills").find("#arcana").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#arcana").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.arcana = !event.data.obj.data.stats.bonusses.expertise.arcana;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='athletics'>Athletics: +" + (character.calculateStatModifier(character.data.stats.strength) + ((character.data.stats.bonusses.skills.athletics? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.athletics? 2 : 1))) + (character.data.stats.bonusses.skills.athletics? " (P)" : "") + (character.data.stats.bonusses.expertise.athletics? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#athletics").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#athletics").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.athletics = !event.data.obj.data.stats.bonusses.skills.athletics;
		
		if(!event.data.obj.data.stats.bonusses.skills.athletics)
			character.data.stats.bonusses.expertise.athletics = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.athletics)
	{
		$("#char" + character.data.id).children("#skills").find("#athletics").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#athletics").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.athletics = !event.data.obj.data.stats.bonusses.expertise.athletics;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='deception'>Deception: +" + (character.calculateStatModifier(character.data.stats.charisma) + ((character.data.stats.bonusses.skills.deception? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.deception? 2 : 1))) + (character.data.stats.bonusses.skills.deception? " (P)" : "") + (character.data.stats.bonusses.expertise.deception? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#deception").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#deception").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.deception = !event.data.obj.data.stats.bonusses.skills.deception;
		
		if(!event.data.obj.data.stats.bonusses.skills.deception)
			character.data.stats.bonusses.expertise.deception = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.deception)
	{
		$("#char" + character.data.id).children("#skills").find("#deception").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#deception").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.deception = !event.data.obj.data.stats.bonusses.expertise.deception;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='history'>History: +" + (character.calculateStatModifier(character.data.stats.intelligence) + ((character.data.stats.bonusses.skills.history? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.history? 2 : 1))) + (character.data.stats.bonusses.skills.history? " (P)" : "") + (character.data.stats.bonusses.expertise.history? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#history").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#history").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.history = !event.data.obj.data.stats.bonusses.skills.history;
		
		if(!event.data.obj.data.stats.bonusses.skills.history)
			character.data.stats.bonusses.expertise.history = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.history)
	{
		$("#char" + character.data.id).children("#skills").find("#history").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#history").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.history = !event.data.obj.data.stats.bonusses.expertise.history;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='insight'>Insight: +" + (character.calculateStatModifier(character.data.stats.wisdom) + ((character.data.stats.bonusses.skills.insight? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.insight? 2 : 1))) + (character.data.stats.bonusses.skills.insight? " (P)" : "") + (character.data.stats.bonusses.expertise.insight? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#insight").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#insight").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.insight = !event.data.obj.data.stats.bonusses.skills.insight;
		
		if(!event.data.obj.data.stats.bonusses.skills.insight)
			character.data.stats.bonusses.expertise.insight = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.insight)
	{
		$("#char" + character.data.id).children("#skills").find("#insight").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#insight").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.insight = !event.data.obj.data.stats.bonusses.expertise.insight;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='intimidation'>Intimidation: +" + (character.calculateStatModifier(character.data.stats.charisma) + ((character.data.stats.bonusses.skills.intimidation? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.intimidation? 2 : 1))) + (character.data.stats.bonusses.skills.intimidation? " (P)" : "") + (character.data.stats.bonusses.expertise.intimidation? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#intimidation").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#intimidation").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.intimidation = !event.data.obj.data.stats.bonusses.skills.intimidation;
		
		if(!event.data.obj.data.stats.bonusses.skills.intimidation)
			character.data.stats.bonusses.expertise.intimidation = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.intimidation)
	{
		$("#char" + character.data.id).children("#skills").find("#intimidation").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#intimidation").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.intimidation = !event.data.obj.data.stats.bonusses.expertise.intimidation;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='investigation'>Investigation: +" + (character.calculateStatModifier(character.data.stats.intelligence) + ((character.data.stats.bonusses.skills.investigation? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.investigation? 2 : 1))) + (character.data.stats.bonusses.skills.investigation? " (P)" : "") + (character.data.stats.bonusses.expertise.investigation? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#investigation").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#investigation").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.investigation = !event.data.obj.data.stats.bonusses.skills.investigation;
		
		if(!event.data.obj.data.stats.bonusses.skills.investigation)
			character.data.stats.bonusses.expertise.investigation = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.investigation)
	{
		$("#char" + character.data.id).children("#skills").find("#investigation").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#investigation").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.investigation = !event.data.obj.data.stats.bonusses.expertise.investigation;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='medicine'>Medicine: +" + (character.calculateStatModifier(character.data.stats.wisdom) + ((character.data.stats.bonusses.skills.medicine? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.medicine? 2 : 1))) + (character.data.stats.bonusses.skills.medicine? " (P)" : "") + (character.data.stats.bonusses.expertise.medicine? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#medicine").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#medicine").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.medicine = !event.data.obj.data.stats.bonusses.skills.medicine;
		
		if(!event.data.obj.data.stats.bonusses.skills.medicine)
			character.data.stats.bonusses.expertise.medicine = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.medicine)
	{
		$("#char" + character.data.id).children("#skills").find("#medicine").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#medicine").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.medicine = !event.data.obj.data.stats.bonusses.expertise.medicine;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='nature'>Nature: +" + (character.calculateStatModifier(character.data.stats.intelligence) + ((character.data.stats.bonusses.skills.nature? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.nature? 2 : 1))) + (character.data.stats.bonusses.skills.nature? " (P)" : "") + (character.data.stats.bonusses.expertise.nature? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#nature").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#nature").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.nature = !event.data.obj.data.stats.bonusses.skills.nature;
		
		if(!event.data.obj.data.stats.bonusses.skills.nature)
			character.data.stats.bonusses.expertise.nature = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.nature)
	{
		$("#char" + character.data.id).children("#skills").find("#nature").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#nature").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.nature = !event.data.obj.data.stats.bonusses.expertise.nature;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='perception'>Perception: +" + (character.calculateStatModifier(character.data.stats.wisdom) + ((character.data.stats.bonusses.skills.perception? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.perception? 2 : 1))) + (character.data.stats.bonusses.skills.perception? " (P)" : "") + (character.data.stats.bonusses.expertise.perception? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#perception").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#perception").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.perception = !event.data.obj.data.stats.bonusses.skills.perception;
		
		if(!event.data.obj.data.stats.bonusses.skills.perception)
			character.data.stats.bonusses.expertise.perception = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.perception)
	{
		$("#char" + character.data.id).children("#skills").find("#perception").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#perception").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.perception = !event.data.obj.data.stats.bonusses.expertise.perception;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='performance'>Performance: +" + (character.calculateStatModifier(character.data.stats.charisma) + ((character.data.stats.bonusses.skills.performance? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.performance? 2 : 1))) + (character.data.stats.bonusses.skills.performance? " (P)" : "") + (character.data.stats.bonusses.expertise.performance? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#performance").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#performance").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.performance = !event.data.obj.data.stats.bonusses.skills.performance;
		
		if(!event.data.obj.data.stats.bonusses.skills.performance)
			character.data.stats.bonusses.expertise.performance = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.performance)
	{
		$("#char" + character.data.id).children("#skills").find("#performance").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#performance").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.performance = !event.data.obj.data.stats.bonusses.expertise.performance;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='persuasion'>Persuasion: +" + (character.calculateStatModifier(character.data.stats.charisma) + ((character.data.stats.bonusses.skills.persuasion? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.persuasion? 2 : 1))) + (character.data.stats.bonusses.skills.persuasion? " (P)" : "") + (character.data.stats.bonusses.expertise.persuasion? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#persuasion").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#persuasion").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.persuasion = !event.data.obj.data.stats.bonusses.skills.persuasion;
		
		if(!event.data.obj.data.stats.bonusses.skills.persuasion)
			character.data.stats.bonusses.expertise.persuasion = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.persuasion)
	{
		$("#char" + character.data.id).children("#skills").find("#persuasion").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#persuasion").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.persuasion = !event.data.obj.data.stats.bonusses.expertise.persuasion;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='religion'>Religion: +" + (character.calculateStatModifier(character.data.stats.intelligence) + ((character.data.stats.bonusses.skills.religion? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.religion? 2 : 1))) + (character.data.stats.bonusses.skills.religion? " (P)" : "") + (character.data.stats.bonusses.expertise.religion? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#religion").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#religion").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.religion = !event.data.obj.data.stats.bonusses.skills.religion;
		
		if(!event.data.obj.data.stats.bonusses.skills.religion)
			character.data.stats.bonusses.expertise.religion = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.religion)
	{
		$("#char" + character.data.id).children("#skills").find("#religion").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#religion").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.religion = !event.data.obj.data.stats.bonusses.expertise.religion;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	/*
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='athletics'>Athletics: +" + (character.calculateStatModifier(character.data.stats.strength) + ((character.data.stats.bonusses.skills.athletics? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.athletics? 2 : 1))) + (character.data.stats.bonusses.skills.athletics? " (P)" : "") + (character.data.stats.bonusses.expertise.athletics? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#athletics").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#athletics").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.athletics = !event.data.obj.data.stats.bonusses.skills.athletics;
		
		if(!event.data.obj.data.stats.bonusses.skills.athletics)
			character.data.stats.bonusses.expertise.athletics = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.athletics)
	{
		$("#char" + character.data.id).children("#skills").find("#athletics").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#athletics").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.athletics = !event.data.obj.data.stats.bonusses.expertise.athletics;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	*/
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='sleighOfHand'>Sleigh of Hand: +" + (character.calculateStatModifier(character.data.stats.dexterity) + ((character.data.stats.bonusses.skills.sleighOfHand? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.sleighOfHand? 2 : 1))) + (character.data.stats.bonusses.skills.sleighOfHand? " (P)" : "") + (character.data.stats.bonusses.expertise.sleighOfHand? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#sleighOfHand").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#sleighOfHand").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.sleighOfHand = !event.data.obj.data.stats.bonusses.skills.sleighOfHand;
		
		if(!event.data.obj.data.stats.bonusses.skills.sleighOfHand)
			character.data.stats.bonusses.expertise.sleighOfHand = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.sleighOfHand)
	{
		$("#char" + character.data.id).children("#skills").find("#sleighOfHand").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#sleighOfHand").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.sleighOfHand = !event.data.obj.data.stats.bonusses.expertise.sleighOfHand;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='stealth'>Stealth: +" + (character.calculateStatModifier(character.data.stats.dexterity) + ((character.data.stats.bonusses.skills.stealth? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.stealth? 2 : 1))) + (character.data.stats.bonusses.skills.stealth? " (P)" : "") + (character.data.stats.bonusses.expertise.stealth? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#stealth").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#stealth").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.stealth = !event.data.obj.data.stats.bonusses.skills.stealth;
		
		if(!event.data.obj.data.stats.bonusses.skills.stealth)
			character.data.stats.bonusses.expertise.stealth = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.stealth)
	{
		$("#char" + character.data.id).children("#skills").find("#stealth").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#stealth").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.stealth = !event.data.obj.data.stats.bonusses.expertise.stealth;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='survival'>Survival: +" + (character.calculateStatModifier(character.data.stats.wisdom) + ((character.data.stats.bonusses.skills.survival? character.getProficiencyBonus() : 0) * (character.data.stats.bonusses.expertise.survival? 2 : 1))) + (character.data.stats.bonusses.skills.survival? " (P)" : "") + (character.data.stats.bonusses.expertise.survival? " (E)" : "") + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#survival").append($(" <input type='button' id='togglePBtn' charId='" + this.ownerId + "' value='P'/>"));
	$("#char" + character.data.id).children("#skills").find("#survival").find("#togglePBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.skills.survival = !event.data.obj.data.stats.bonusses.skills.survival;
		
		if(!event.data.obj.data.stats.bonusses.skills.survival)
			character.data.stats.bonusses.expertise.survival = false;
		
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	if(character.data.stats.bonusses.skills.survival)
	{
		$("#char" + character.data.id).children("#skills").find("#survival").append($(" <input type='button' id='toggleEBtn' charId='" + this.ownerId + "' value='E'/>"));
		$("#char" + character.data.id).children("#skills").find("#survival").find("#toggleEBtn").on("click", {obj: character}, function(event)
		{
			event.data.obj.data.stats.bonusses.expertise.survival = !event.data.obj.data.stats.bonusses.expertise.survival;
			
			saveAll();
			
			event.stopImmediatePropagation()
			return false;
		});
	}
	
	$("#char" + character.data.id).children("#skills").append($("<div class=charField id='passiveWisdom'>Passive Wisdom (Perception): " + character.data.stats.bonusses.passiveWisdom + "</div>"));
	
	$("#char" + character.data.id).children("#skills").find("#passiveWisdom").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#skills").find("#passiveWisdom").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.passiveWisdom++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#skills").find("#passiveWisdom").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#skills").find("#passiveWisdom").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.bonusses.passiveWisdom --;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).append($("<div class=charCategory id='status'>Status:<br></div>"));
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='armorClass'>Armor Class: WIP</div>"));
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='initiative'>Initiative: +" + character.data.stats.initiative + "</div>"));
	
	$("#char" + character.data.id).children("#status").find("#initiative").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#status").find("#initiative").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.initiative++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#status").find("#initiative").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#status").find("#initiative").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.initiative--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='speed'>Speed: " + character.data.stats.speed + "</div>"));
	
	$("#char" + character.data.id).children("#status").find("#speed").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#status").find("#speed").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.speed++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#status").find("#speed").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#status").find("#speed").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.stats.speed--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='maxHitPoints'>Max Hit Points: " + character.data.status.maxHitPoints + "</div>"));
	
	$("#char" + character.data.id).children("#status").find("#maxHitPoints").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#status").find("#maxHitPoints").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.maxHitPoints++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#status").find("#maxHitPoints").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#status").find("#maxHitPoints").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.maxHitPoints--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='hitPoints'>Hit Points: " + character.data.status.currentHealth + "</div>"));
	
	$("#char" + character.data.id).children("#status").find("#hitPoints").append($(" <input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
	$("#char" + character.data.id).children("#status").find("#hitPoints").find("#addOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.currentHealth++;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	$("#char" + character.data.id).children("#status").find("#hitPoints").append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
	$("#char" + character.data.id).children("#status").find("#hitPoints").find("#remOneBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.status.currentHealth--;
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#status").append($("<div class=charField id='hitDice'>Hit Dice: " + character.data.hitDice + " </div>"));
	$("#char" + character.data.id).children("#status").append($("<textarea class=charField id='hitDiceEditable' style='display: none;'>" + character.data.hitDice + "</textarea>"));
	
	
	$("#char" + character.data.id).children("#status").children("#hitDice").append($("<input type='button' id='editHitDiceBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#status").find("#editHitDiceBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#status").children("#hitDice").hide();
		$("#char" + event.data.obj.data.id).children("#status").children("#hitDiceEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#status").children("#hitDice").children("#editHitDiceBtn").hide();
		$("#char" + event.data.obj.data.id).children("#status").children("#saveHitDiceBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#status").append($("<input type='button' id='saveHitDiceBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#status").find("#saveHitDiceBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.hitDice = $("#char" + event.data.obj.data.id).children("#status").children("#hitDiceEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append($("<div class=charCategory id='personality'>Personality:<br></div>"));
	$("#char" + character.data.id).children("#personality").append($("<div class=charField id='traits'><b>Traits:</b><br>" + character.data.personality.traits.replace(/\r?\n/g, '<br />') + "</div>"));
	$("#char" + character.data.id).children("#personality").append($("<textarea class=charField id='traitsEditable' style='display: none;'>" + character.data.personality.traits + "</textarea>"));
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='editTraitsBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#personality").find("#editTraitsBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#personality").children("#traits").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#traitsEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#personality").children("#editTraitsBtn").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#saveTraitsBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='saveTraitsBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#personality").find("#saveTraitsBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.personality.traits = $("#char" + event.data.obj.data.id).children("#personality").children("#traitsEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#personality").append($("<div class=charField id='ideals'><b>Ideals:</b><br>" + character.data.personality.ideals.replace(/\r?\n/g, '<br />') + "</div>"));
	$("#char" + character.data.id).children("#personality").append($("<textarea class=charField id='idealsEditable' style='display: none;'>" + character.data.personality.ideals + "</textarea>"));
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='editIdealsBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#personality").find("#editIdealsBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#personality").children("#ideals").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#idealsEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#personality").children("#editIdealsBtn").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#saveIdealsBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='saveIdealsBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#personality").find("#saveIdealsBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.personality.ideals = $("#char" + event.data.obj.data.id).children("#personality").children("#idealsEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#personality").append($("<div class=charField id='bonds'><b>Bonds:</b><br>" + character.data.personality.bonds.replace(/\r?\n/g, '<br />') + "</div>"));
	$("#char" + character.data.id).children("#personality").append($("<textarea class=charField id='bondsEditable' style='display: none;'>" + character.data.personality.bonds + "</textarea>"));
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='editbondsBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#personality").find("#editbondsBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#personality").children("#bonds").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#bondsEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#personality").children("#editbondsBtn").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#savebondsBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='savebondsBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#personality").find("#savebondsBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.personality.bonds = $("#char" + event.data.obj.data.id).children("#personality").children("#bondsEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).children("#personality").append($("<div class=charField id='flaws'><b>Flaws:</b><br>" + character.data.personality.flaws.replace(/\r?\n/g, '<br />') + "</div>"));
	$("#char" + character.data.id).children("#personality").append($("<textarea class=charField id='flawsEditable' style='display: none;'>" + character.data.personality.flaws + "</textarea>"));
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='editflawsBtn' charId='" + this.ownerId + "' value='Edit'/>"));
	$("#char" + character.data.id).children("#personality").find("#editflawsBtn").on("click", {obj: character}, function(event)
	{
		$("#char" + event.data.obj.data.id).children("#personality").children("#flaws").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#flawsEditable").show();
		
		$("#char" + event.data.obj.data.id).children("#personality").children("#editflawsBtn").hide();
		$("#char" + event.data.obj.data.id).children("#personality").children("#saveflawsBtn").show();
		
		event.stopImmediatePropagation()
		return false;
	});
	
	$("#char" + character.data.id).children("#personality").append($("<input type='button' id='saveflawsBtn' charId='" + this.ownerId + "' value='Save'style='display: none;'/>"));
	$("#char" + character.data.id).children("#personality").find("#saveflawsBtn").on("click", {obj: character}, function(event)
	{
		event.data.obj.data.personality.flaws = $("#char" + event.data.obj.data.id).children("#personality").children("#flawsEditable").val(); 
		saveAll();
		
		event.stopImmediatePropagation()
		return false;
	}); //end edit
	
	$("#char" + character.data.id).append("<br>");
	character.openInventory();
	$("#char" + charData.id).append(character.tempInventory.toHTML());
	
	$("#char" + charData.id).children(".inventoryItem").attr("class", "inventoryItem inventory");
	
	//New Item
	$("#char" + charData.id).append("<br>");
	$("#char" + charData.id).append($("<div class='inventoryItem' id='newItemFor" + charData.id + "'></div>"));
	
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
	
	if(charData.assignedGameId == -1)
	{
		$("#char" + charId).children("#quest").append("Available");
	}
	else
	{
		var charId = charData.id;
		
		$.ajax({
			dataType: "json",
			data: "",
			url: "scripts/php/getgamebyid.php?id=" + charData.assignedGameId,
			success: function(data)
			{
				$("#char" + charId).children("#quest").append("On Quest: " + data.name);
				console.log(charId + ", " + data.name);
			}
		});
	}
}

function refreshAllUserCharacters()
{
	$("#characterlist").html("");
	
	characters = [];
	
	for(var i = 0; i < allCharacterData.length; i++)
	{
		populateCharacterDiv(allCharacterData[i]);
	}
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
	
	this.getProficiencyBonus = function()
	{
		return 1 + this.data.info.level;
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
		
		console.log(this.tempInventory);
		
		var invAsJson = JSON.stringify(this.tempInventory)
		this.data.inventory = invAsJson;//btoa(invAsJson);
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
	
	this.openInventory();
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
		
		$(baseElement).append($("<div class='inventoryItemField', id='description'>" + this.description.replace(/\r?\n/g, '<br />') + "</div>"));
		
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