$(init);
var mainContentBox;
var user = null;

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
		$("#characterlist").append("<div class='characterinfo' id='char" + data[i].id + "'>");
		$(".characterinfo").append(data[i].info.name);
		
		if(data[i].assignedGame == -1)
		{
			$("#characterlist").append(" - Available");
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
					$("#char" + charId).append(" - Quest: " + data.name);
					console.log(charId + ", " + data.name);
				}
			});
		}
		
		$("#characterlist").append("</div>");
		
	}
}