<%--
 Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
--%>
<html>
<head>
<title>core - Login</title>

<%--
	HTTPS per JS erzwingen
--%>


<body bgcolor="white">
<form method="POST" action='<%= response.encodeURL("j_security_check") %>' >
  <center>
  <hr/>
  	core Login
  <hr/>
  <table border="0" cellspacing="5">
    <tr>
      <th align="right">Benutzername:</th>
      <td align="left"><input type="text" name="j_username"></td>
    </tr>
    <tr>
      <th align="right">Passwort:</th>
      <td align="left"><input type="password" name="j_password"></td>
    </tr>
    <tr>
      <td align="right"><input type="submit" value="einloggen"></td>
      <td align="left"><input type="reset"></td>
    </tr>
  </table>
  </center>
</form>

<%--
	Autologin Block
--%>
  	<form method="POST" name="autologin" action='<%= response.encodeURL("j_security_check") %>'>
        <input type="hidden" name="j_username">
        <input type="hidden" name="j_password">
    </form>
    <script type="text/javascript">
        //alert("Test: <%= request.getParameter("_username") %>"  );
		if ( "<%= request.getParameter("_username") %>" != "null" ) {
            //alert("autologin: <%= request.getSession().getValue("_username") %>");
            document.autologin.j_username.value = "<%= request.getParameter("_username") %>";
            document.autologin.j_password.value = "<%= request.getParameter("_password") %>";
            document.autologin.submit();
        }
    </script>  

</body>
</html>
