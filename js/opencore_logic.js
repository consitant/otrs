/*
 * open core main logic
 * 
 */


function initOpenCore( forceNewSession ){
    
    if( forceNewSession == undefined ){
        forceNewSession = false;
    }
    
    initOpenSessionId( forceNewSession );
    
     /*initExaTree(); */
    /* heartbeat starten */
    oc_sendHeartbeat();
    
}






var OPENSESID;
function initOpenSessionId( forceNewSession ){
    
    if( forceNewSession == undefined ){
        forceNewSession = false;
    }    
    
    if( forceNewSession ){
        OPENSESID = undefined;
    }
    else{
        OPENSESID = readOsiFromCookie( "osi" );
    }
    /* alert("OPENSESID:" + OPENSESID ); */
    
    if( OPENSESID == undefined || OPENSESID.length == 0 ){
        createOsiCookie();
        
        /* alert("osi created: " + OPENSESID ); */
    }
    
    
}

function createOsiCookie(){
    OPENSESID = "osi_" + generatePseudoDuuid();
    
    document.cookie = "osi=" + OPENSESID + ";";
    
}

function reInitOpenSessionId(){
    try{
        createOsiCookie();
        
    }
    catch( err ){
        
        
    }
    
}




/* Duuid generieren nur per JavaScript clientSide */
function generatePseudoDuuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}    


function readOsiFromCookie( cname ){
   
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";    
    
}








/*
 * Service Call logic
 */


/* lokal David */
var OC_SERVEP = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + "/core/portalservice/msg";




/* Heartbeat alle 5 Minuten an server schicken, damit session nicht ausläuft */
function oc_sendHeartbeat(){
    
    oc_callService( "heartbeat", {}, 
        function(resp){
            console.log("heartbeat resp: " + jstr( resp ) );
        }
    );
            
    /* Nächster Heartbeat */
    setTimeout(
        oc_sendHeartbeat, 
        300000
    );

    
}





function oc_callService( funcName, paras, cbF){
    
    var username = "patportal";
    var password = "pw" + Date.now().toString();
    
    
    var msg = {
             "callService": {
                 "module": "patientPortal",
                 "id": "patientPortalService",
                 "func": {
                     "name": funcName,
                     "paras": paras
                 }
             }
         };
    
    /* alert("oc_callService send msg:\n" + jstr( msg ) ); */
    

    $.ajax({
         type: "POST",
         dataType: "json",
         contentType: "application/json",
         url: OC_SERVEP + "?osi=" + OPENSESID,
         async: false,
         
         beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
         },         
         data: JSON.stringify(msg)
     }).error(
        function(jqXHR, textStatus, errorThrown) {
            console.error("oc_callService Error: " + textStatus
                    + " " + errorThrown);
        }).done(function( resp ) {
            cbF( resp );
            /* alert("test:\n" + JSON.stringify(resp,null,2) );   */
            
            
            
     });    
     
}
   
    
    
/*
 * 
 * HILFSFUNKTIONEN
 * 
 */


function showInfoMsg( msg ){
    alert("INFO: " + msg );
    
}

function showWarnMsg( msg ){
    alert("WARN: " + msg );
    
}


           
// JSON Object zu Base64 String zB für inlining in data Attribute           
function jsonObjToB64( jobj ){
    return btoa( escape(JSON.stringify(jobj) ) );
}

// JSON String zu Base64 String zB für inlining in data Attribute           
function jsonStrToB64( jstr ){
    return btoa( escape( jstr ) );
}

function b64ToJsonObj( b64Str ){
    return JSON.parse( unescape( atob( b64Str ) ));
}

function b64ToJsonStr( b64Str ){
    return unescape( atob( b64Str ) );
}



function jstr( obj ){
    return JSON.stringify( obj,null,2 ); 
}
    
    


/* Assoziatives Array: Keys als sortiertes Array zurückgeben */
function getSortedKeysByStringComp( obj, sortField ) {
    var keys = []; 
    
    
        if( sortField == undefined ){

            for(var key in obj){

                var sortObj = {};
                sortObj.key = key;
                sortObj.sort = key;

                keys.push(sortObj);
            }
    
        return keys.sort(
            function(a,b){
                return a.sort.localeCompare( b.sort );
            }
        );
        
    }
    
    
    for(var key in obj){
        var sortObj = {};
        sortObj.key = key;
        sortObj.sort = obj[ key ][ sortField ];
        
        if( sortObj.sort == undefined ){
            sortObj.sort = "";
        }
        
        keys.push(sortObj);
    }
    
    return keys.sort(
        function(a,b){
            return a.sort.localeCompare( b.sort );
        }
    );
}
     
function getUrlParas(){    
    
    var pMap = {};
    
    try{
        
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            pMap[ sParameterName[0] ] = sParameterName[1];
            
            /*
            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            } */
        }        
        
        
        
    }
    catch( err ){
        
        
    }
    
    return pMap;
    
}
    
    
/*
 * Hilfsfunktionen
 */    

function reformatDate( inDate, inFormat, outFormat, invalidValue){
    
    try{
        var m = moment( inDate, inFormat );

        if( ! m.isValid() ){
            return invalidValue;
        }
        else{
            return m.format( outFormat );
        }
    }
    catch( derr ){
        return invalidValue;
    }
}

    
    