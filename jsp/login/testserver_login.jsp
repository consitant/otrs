<!DOCTYPE HTML>

<%@ page language="java" pageEncoding="utf8" contentType="text/html;charset=UTF-8" %>




<html>
<head>
<title>RAD+ Login</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />

<style>

	@font-face {
	    font-family: 'Roboto';
	    src: url('../open/fonts/roboto/Roboto-Regular-webfont.eot');
	    src: url('../open/fonts/roboto/Roboto-Regular-webfont.eot?#iefix') format('embedded-opentype'),
	         url('../open/fonts/roboto/Roboto-Regular-webfont.woff') format('woff'),
	         url('../open/fonts/roboto/Roboto-Regular-webfont.ttf') format('truetype'),
	         url('../open/fonts/roboto/Roboto-Regular-webfont.svg#robotoregular') format('svg');
	    font-weight: 400;
	    font-style: normal;
	}

	@font-face {
	    font-family: 'Roboto';
	    src: url('../open/fonts/roboto/Roboto-Bold-webfont.eot');
	    src: url('../open/fonts/roboto/Roboto-Bold-webfont.eot?#iefix') format('embedded-opentype'),
	         url('../open/fonts/roboto/Roboto-Bold-webfont.woff') format('woff'),
	         url('../open/fonts/roboto/Roboto-Bold-webfont.ttf') format('truetype'),
	         url('../open/fonts/roboto/Roboto-Bold-webfont.svg#robotobold') format('svg');
	    font-weight: 700;
	    font-style: normal;
	}

	* {
		-moz-box-sizing: border-box;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;	
		margin: 0;
		padding: 0;	
		font-weight: normal;
		outline: none;
	}

	html {
		height: 100%;
	}

	body {
		background: #fff;
		font-family: 'Roboto', sans-serif;
		font-size: 14px;
		line-height: 20px;
		font-weight: 400;
		color: #262626;
		letter-spacing: 0.01em;
		background: #fff url('../open/bg.jpg') no-repeat center center;
		background-size: cover;
		height: 100%;
	}

	.wrapper {
		width: 380px;
		height: 432px;
		position: absolute;
		left: 50%;
		top: 50%;
		margin-left: -190px;
		-webkit-transform: translateY(-50%);
		transform: translateY(-50%);  
	}

	.login {
		width: 340px;
		margin: 50px auto 0;
		overflow: hidden;
	}

	h1 {
		width: 340px;
		height: 89.5px;
		text-indent: -9999px;
		/* background: url('../open/RADplus_Logo.png') no-repeat center center;*/
		background: url('../open/RADplus_Logo_Login_Test.png') no-repeat center center;
		background-size: 100%;
		margin: 0 auto;
	}

	h2 {
		font-size: 20px;
		font-weight: 700;
		line-height: 24px;
		color: #262626;
		margin-bottom: .5em;
	}

	hr {
		border: 0;
		border-top: 1px solid #d9d9d9;
		margin-bottom: 1.5em;
		width: 100%;
		clear: both;
	}

	label {
		width: 130px;
		line-height: 30px;
		float: left;
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 0.05em;
		color: #737373;
	}

	input[type="text"], input[type="password"], input[type="button"] {
		border-radius: 0;
		border: 0;
		display: block;
		text-decoration: none;
		font-size: 14px;
		-moz-appearance: none;
		-webkit-appearance: none;
		appearance: none;
	}

	input[type="text"], input[type="password"] {
		background: #f2f2f2;
		width: 210px;
		height: 30px;
		margin: 0 0 .5em;
		padding: 0 8px;
	}

	input[type="button"] {
		height: 40px;
		padding: 9px 30px 11px;
		background: #262626;
		color: #fff;
		float: right;
		margin-top: -2.2em;
		font-weight: 700;
	}

	input[type="button"]:hover {
		background: #737373;
		cursor: pointer;
	}

	input[type="button"]:focus {
		background: #737373;
	}

	a:link, a:visited {
		color: #262626;
		text-decoration: none;
		font-family: 'Roboto';
		display: block;
		margin-top: 2em;
	}

	a:hover, a:active, a:focus {
		color: #737373;
		text-decoration: none;
	}

	.error {
		clear: both;
		color: #D81629;
		margin: 3em 0;
	}

	footer {
		position: absolute;
		bottom: 20px;
		left: 0;
		width: 100%;
		text-align: center;
		color: #737373;
	}

</style>

<script>

    /* vor submit auf mailadressen endung achten, falls sie fehlt, ein "@boos-moog.de" anhängen */


    function init(){
        /* 2017-03-08: ENTER in Loginname/Passwortfeld löst login aus */
/*
        document.getElementById("j_password").addEventListener("keydown", function(event) {
                event.preventDefault();

                if (event.keyCode == 13) {
                        submitForm();
                }
        });
 */       
        
    }



    /* vor submit auf mailadressen endung achten, falls sie fehlt, ein "@boos-moog.de" anhängen */

    function submitForm(){
        
        var loginName = document.getElementById("j_username").value;

        if( loginName.indexOf("@") == -1 ){
            loginName += "@boos-moog.de";
            
            document.getElementById("j_username").value = loginName;
        }

        document.loginform.submit();

    }


    /* 2019-02-25: HTTPS Umleitung */
    /* FLAG einbauen: KEINE UMLEITUNG wg NUANCE */
    
    var nohttps = '<%= request.getParameter("nohttps") %>';
    var forceHTTP = false;

    try{
        if( "true" == nohttps ){
            forceHTTP = true;
            console.log("logn.jsp: NO HTTPS!");
        }
    }catch(err){

    }
    
    
/*

    if (!forceHTTP && location.protocol != "https:")
    {
        location.href = "https://radplus-test.boos-moog.de:7443/core/radplaner/index.html";
    }	

  */

</script>


</head>

<body onload="init();">

	<div class="wrapper">
		
		<h1>RADplaner</h1>

		<form name="loginform" method="POST" action='<%= response.encodeURL("j_security_check") %>' class='login'>

			<h2>Anmelden</h2>
			<hr />

			<label for="username">E-Mail</label>
			<input type="text" name="j_username" id="j_username" tabindex="1">
			
			<label for="password">Passwort</label>
			<input type="password" name="j_password" id="j_password" tabindex="2">
			
			<input type="hidden" name="hiddenPara1" value="TEST123" >
			
			

			<a href="#">Passwort vergessen?</a>
<!--			
                        <input type="submit" value="Anmelden" tabindex="3">
-->

                        <input type="button" value="Anmelden" onclick="submitForm();" tabindex="3">

		</form>

                





	</div>

	<footer>
		Version 1.38 © 2021 RAD+ GmbH & Co. KG auf Aktien
	</footer>

</body>

<script>
    /* 2017-03-08: ENTER in Loginname/Passwortfeld löst login aus */
/*
    document.getElementById("j_password")
            .addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                    submitForm();
            }
    });
*/
  

</script>

</html>
