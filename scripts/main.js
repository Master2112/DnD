$(init);
var mainContentBox;
var user = null;
var character = null;

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

function addAllUserCharacters(data)
{
	for(var i = 0; i < data.length; i++)
	{
		var character = new Character(data[i]);
		console.log(character);
	
		$("#characterlist").append("<div class='characterinfo' id='char" + data[i].id + "'>");
		$("#char" + charId).append("<div id=char" + charId + "info></div>")
		$("#char" + charId + "info").append(data[i].info.name);
		
		console.log("starting chartest");
		$("#char" + charId).append("<br>");
		character.openInventory();
		$("#char" + charId).append(character.tempInventory.toHTML());
		
		character.saveInServer();
		console.log("ending chartest");
		
		$("#char" + charId).append("</div>");
		
		if(data[i].assignedGame == -1)
		{
			$("#char" + charId + "info").append(" - Available");
		}
		else
		{
			var charId = data[i].id;
			
			$.ajax({
				dataType: "json",
				data: "",
				url: "scripts/php/getgamebyid.php?id=" + data[i].assignedGameId,
				success: function(data)
				{
					$("#char" + charId + "info").append(" - On Quest: " + data.name);
					console.log(charId + ", " + data.name);
				}
			});
		}
	}
}

function Character(json)
{
	this.data = json;
	this.tempInventory = null;
	
	this.saveInServer = function()
	{
		var thisAsJson = JSON.stringify(this);
		
		var request = new XMLHttpRequestObject();
		request.open("POST", "savecharacter.php", true);
		request.setRequestHeader("Content-type", "application/json");

		request.send(thisAsJson);
		console.log("SAVING TO SERVER");
		console.log(thisAsJson);
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
	
	this.openInventory = function()
	{
		console.log("Opening inventory of character: " + this.data.name);
		
		if(this.data.inventory == "")
		{
			console.log("No saved inventory exists, making one now.");
			this.tempInventory = new InventoryObject("Inventory", "Everything you have with you!", 1, 0, true);
			this.saveInventory();
		}
		else
		{
			console.log("Existing inventory found. Opening...");
			this.tempInventory = atob(this.data.inventory);
			console.log(this.tempInventory);
		}	
	}
	
	this.addToInventory = function(newObject)
	{
		if(this.tempInventory == null)
			this.openInventory();
			
		tempInventory.push(newObject);
		
		this.saveInventory();
	}
	
	this.saveInventory = function()
	{
		this.data.inventory = btoa(this.tempInventory);
		this.tempInventory = null;
	}
}

function InventoryObject(name, description, quantity = 1, weight = 0, canContain = false, contents = null)
{
	this.name = name;
	this.description = description;
	this.weight = weight;
	this.canContain = canContain;
	this.quantity = quantity;
	
	this.toHTML = function()
	{
		var baseElement = $("<div class='inventoryItem'></div>");
		$(baseElement).append($("<div class='inventoryItemField'>" + this.name + "</div>"));
		$(baseElement).append($("<div class='inventoryItemField'>" + this.quantity + "</div>"));
		$(baseElement).append($("<br>"));
		$(baseElement).append($("<div class='inventoryItemField'>" + this.weight + "kg (total: " + this.getTotalWeight() + "kg)</div>"));
		$(baseElement).append($("<br>"));
		$(baseElement).append($("<div class='inventoryItemField'>" + this.description + "</div>"));
		
		if(this.canContain)
		{
			$(baseElement).append($("<br>"));
			var container = $(baseElement).append($("<div class='inventoryItemContents'></div>"));
			
			for(var i = 0; i < contents.length; i++)
			{
				$(container).append(contents[i].toHTML());
			}
		}
		
		return $(baseElement);
	}
	
	this.addToInventory = function(newObject)
	{	
		if(canContain)
		{
			contents.push(newObject);
		}
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