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

	$("#char" + charData.id).html("");
	
	$("#char" + charData.id).append("<div id='char" + charData.id + "info'></div>")
	$("#char" + charData.id + "info").append(charData.info.name);
	
	console.log("starting chartest");
	$("#char" + charData.id).append("<br>");
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
	//character.saveInServer(); //TODO: REMOVE THIS WHEN NO LONGER NEEDED
	console.log("ending chartest");
	
	if(charData.assignedGame == -1)
	{
		$("#char" + charData.id + "info").append(" - Available");
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
				$("#char" + charId + "info").append(" - On Quest: " + data.name);
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

function addslashes(string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
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
		$(baseElement).append($("<div class='inventoryItemField' id='name'>" + this.name + " x" + this.quantity + "</div>"));
		
		if(!this.isRoot)
		{
			$(baseElement).append($('<input type="text" class="inventoryItemField", id="nameEditable" value="' + this.name.replace('"', "'") + '"/>'));
			$(baseElement).children("#nameEditable").hide();
			
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
			$(baseElement).append($("<input type='button' id='addOneBtn' charId='" + this.ownerId + "' value='+'/>"));
			$(baseElement).find("#addOneBtn").on("click", {obj: this}, function(event)
			{
				console.log("Increasing item quantity by one");
				console.log(event.data.obj);
				
				event.data.obj.quantity++;
				saveAll();
				
				event.stopImmediatePropagation()
				return false;
			});
			
			$(baseElement).append($("<input type='button' id='remOneBtn' charId='" + this.ownerId + "' value='-'/>"));
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