Hier die Standard Index für die Weiterleitung, falls gewünscht: 

root@termine:/var/www/html# cat index.html 
<meta HTTP-EQUIV="REFRESH" content="0; url=https://termine-visio.balnova.de/portal/planer.html“> 


Den Inhalt der angehängten ZIP Datei am Besten in das Verzeichniss „portal“ kopieren 
mkdir /var/www/html/portal 


Im Apache bitte einen ProxyPass und ProxyPassreverse konfigurieren. 
Hier das VHost Beispiel für Ihr Setup unter Apache 2: 


root@termine:/etc/apache2/sites-available# cat 000-default.conf 
<VirtualHost *:443> 
    # The ServerName directive sets the request scheme, hostname and port that 
    # the server uses to identify itself. This is used when creating 
    # redirection URLs. In the context of virtual hosts, the ServerName 
    # specifies what hostname must appear in the request's Host: header to 
    # match this virtual host. For the default virtual host (this file) this 
    # value is not decisive as it is used as a last resort host regardless. 
    # However, you must set it for any further virtual host explicitly. 
    #ServerName www.example.com

    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html 

    # Beispiel Name 
    ServerName termine-visio.balnova.de

    SSLEngine on 
     
    SSLCertificateFile /etc/ssl/certs/server.cer 
    SSLCertificateKeyFile /etc/ssl/private/server.key 


    SSLProxyEngine on 
    #SSLEngine on 
    SSLProxyVerify none 
    SSLProxyCheckPeerCN off 

    ProxyRequests On 
    ProxyPreserveHost On 
    ProxyPass /core/portalservice/msg https://portal-visio.balnova.de:8444/core/portalservice/msg
    ProxyPassReverse /core/portalservice/msg https://portal-visio.balnova.de:8444/core/portalservice/msg


    ErrorLog ${APACHE_LOG_DIR}/error.log 
    CustomLog ${APACHE_LOG_DIR}/access.log combined 
</VirtualHost> 
