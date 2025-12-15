

/*  */

var EXATREE;
var EXAHM;

var SEARCHTREE = {};

function initBase( includeExaTree ){
    
    
    if( includeExaTree == undefined ){
        includeExaTree = false;
    }
    
    oc_callService( "getPortalConf", {"includeExaTree": includeExaTree }, 
        
        function( resp ){
            
            initBaseGUI( resp );
            
            if( resp.getPortalExaTree != undefined ){
                EXATREE = resp.getPortalExaTree;
                /*alert("RESP EXATREE:\n" + jstr( EXATREE ) );  */
                
                initExaSelector( );
            }
        }
    
    
    );
    
}

function initBaseGUI( baseConf ){
    
   
    if( baseConf.baseInfo != undefined ){
        var bi = baseConf.baseInfo;
        
        setGUI( ".map-title", "html", bi.title );
        setGUI( ".map-phone", "html", bi.phone );
        setGUI( ".map-phoneHref", "href", bi.phoneHref );
        setGUI( ".map-urlImpressum", "href", bi.urlImpressum );
        setGUI( ".map-urlDatenschutz", "href", bi.urlDatenschutz );
    }
    
    if( baseConf.locInfo != undefined ){
        LOCINFO = baseConf.locInfo;
    }
    
}


function setGUI( sel, mode, val ){
    try{
        
        
        switch( mode ){
            
            case "href":
                $( sel ).attr( "href", val );
                break;
            
            default:
                $( sel ).html( val );
        }
        
        
        
        
        
    }
    catch(err){
        console.log("setGUI ERROR: " + err );
        
    }
    
}




var LOCINFO = {
    "PAF":{
        "name": "MVZ Kompetenzzentrum für Radiologie und Nuklearmedizin boos-moog GmbH",
        "street": "Krankenhausstraße 70",
        "zip": "85276",
        "city": "Pfaffenhofen a.d.Ilm",
        "phone": "084 41 / 79 12-00",
        "fax": "084 41 / 79 12-15",
        "mail": "rad.info@boos-moog.de"
    },
    "SOB":{
        "name": "MVZ Kompetenzzentrum für Radiologie und Nuklearmedizin boos-moog GmbH",
        "street": "Högenauer Weg 5",
        "zip": "86529",
        "city": "Schrobenhausen",
        "phone": "082 52 / 880 50-0",
        "fax": "082 52 / 880 50-28",
        "mail": "srad.info@boos-moog.de"
    },
    "MAN":{
        "name": "MVZ Kompetenzzentrum für Radiologie und Nuklearmedizin boos-moog GmbH",
        "street": "Grasweg 7",
        "zip": "85077",
        "city": "Manching",
        "phone": "084 41 / 79 12-00",
        "fax": "084 41 / 79 12-15",
        "mail": "rad.info@boos-moog.de"
    }   
 
    
};



/*
 * Standort Infos
 */
function getLocationData( location ){
    if( LOCINFO[ location ] != undefined ){
        return LOCINFO[ location ];
    }
    else{
        return {
                "name": "",
                "street": "",
                "zip": "",
                "city": "",
                "phone": "",
                "fax": "",
                "mail": ""
        };                 

        
    }
    
}

/* Such Thesaurus */
 var thesaurusA = [
    ["Kopf","Schädel","Neurocranium", "AKN", "Kleinhirnbrückenwinkel"],
    ["HWS", "Halswirbel", "Halswirbelsäule"],
    ["AKN","Akustikusneurinom","Kleinhirnbrückenwinkel"],
    ["BWS", "Brustwirbel", "Brustwirbelsäule"],
    ["LWS","Lendenwirbel", "Lendenwirbelsäule"],
    ["OBB","Oberbauch"],
    ["Thorax","Lunge"],
    ["Schulter", "ACG Gelenk"],
    ["Rippen","Hemithorax", "Sternum", "Thorax (knöcherne Teile)"],
    ["Hand", "Handgelenk", "Finger" ],
    ["Becken", "Hüfte", "ISG"],
    ["Knie","Patella"],
    ["Fuß", "Mittelfuß", "Fußwurzel", "Zehe" ],
    ["MDP", "Magendarmpassage", "Magen-Darm-Passage"],
    ["DL","Durchleuchtung"],
    ["AUG","Ausscheidungsurogramm"],
    ["Klavikula", "Schulter", "Clavikula"],
    ["SD","Schilddrüsen"],
    ["MR","MRT"],
    ["RSO","Radiosinoviarthese"],
    ["NNH","Nasennebenhöhlen"],
    ["Myocard","Herz" ],
    ["Knochen", "Skelett"],
    ["OSG", "Sprunggelenk"],
    ["PRT", "Periradikuläre Therapie"],
    ["FAC", "Facettentherapie"]
 ];

function generateThesaurusHM(){
    
    var thesHM = {};
    for( var t = 0; t < thesaurusA.length; t++ ){
        
        var wordsA = thesaurusA[ t ];
        
        for( var w = 0; w < wordsA.length; w++ ){
            
            var hmwordsA = new Array();
            for( var w2 = 0; w2 < wordsA.length; w2++ ){
                if( w2 != w ){
                    hmwordsA.push( wordsA[ w2 ])
                }
            }
            thesHM[ wordsA[w] ] = hmwordsA;
        }
    }
    return thesHM;
}


/*
 * 
 * U-Baum
 */


function initExaTree(){
    
    oc_callService( "getPortalExaTree", {}, 
        
        function( resp ){
            /* alert("RESP:\n" + jstr( resp ) ); */
            if( resp.getPortalExaTree != undefined ){
                EXATREE = resp.getPortalExaTree;
                
                alert("initExaTree:\n" + jstr( EXATREE ) );
                
                initExaSelector( );
            }
        }
    
    
    );
    
}


function initExaSelector( ){
    
    EXAHM = {};
    
    /* Thesaurus HM erzeugen */
    var thesHM = generateThesaurusHM();

    
    
    /* Struktur bauen modId > organ > exas */
    for( var modKey in EXATREE ){
        var modHM = EXATREE[ modKey ];
        
        var orgHM = {};
        
        for( var exaKey in modHM ){
            var exa = modHM[ exaKey ];
            
            /* suchtext direkt erzeugen TODO Hier evtl erweitern! */
            exa.search = exa.anf.toLowerCase();
            
            
            
            /* Suchfed um thesaurus begriffe erweitern */
            var addThesA = [];
            for( var tWord in thesHM ){

                if( exa.anf.indexOf( tWord ) != -1 ){

                    //alert("tWord hit:" + tWord + " concat: " + JSON.stringify(thesHM[ tWord ]) );
                    for( var addWordI in thesHM[ tWord ] ){
                        addThesA.push( thesHM[ tWord ][addWordI].toLowerCase() );
                    }

                }
            }
            
            if( addThesA.length > 0 ){
                exa.search += " " + addThesA.join( " " );
            }
            
            /* nur Unts keine Knoten rein! Acuntg. Kann auch 4 sein! */
            if( "0" == exa.nodeType || (exa.code != undefined && exa.code.length > 2 ) ){
                EXAHM[ exa._duuid ] = exa;
            }
            
            
            var organ = exa.organ;
            if( organ == undefined || organ.length == 0 ){
                organ = "_";
            }
            
            /* Organ übersetzen */
            /* var organTransl = translOrgan( organ ); */
            
            if( orgHM[ organ ] != undefined ){
                orgHM[ organ ].push( exaKey );
            }
            else{
                orgHM[ organ ] = [];
                orgHM[ organ ].push( exaKey );
            }
        }
        SEARCHTREE[ modKey ] = orgHM;
        
        
        
        
    }
    
    /* Mod Selector füllen */
    /*
    <select id="pl_modSel" class="rp-form__data" required>
        <option value="" disabled selected>Modalität auswählen</option>
    */
    var modOpt = {};
    for( var mod in SEARCHTREE ){
        
        /* keine mod angabe erstmal skippen! */
        if( "_" == mod ){ continue; }
        
        var modTransl = translMod( mod );
        
        modOpt[ modTransl ] = '<option value="' + mod + '">' + modTransl + '</option>';
    }
    
    /* abc sort */
    var sortA = getSortedKeysByStringComp( modOpt );
    
    /* alert("initExaSelector: sortA:\n" + jstr(sortA) ); */
    
    var oA = [];
    oA.push( '<option value="" disabled selected>Modalität auswählen</option>' );
    for( var sx in sortA ){
        
        oA.push( modOpt[ sortA[sx].key ] );
    }
    
    $("#pl_modSel").html( oA.join("") );
    
    
    
    
    
}

function modChanged( srcE ){
    var mod = $(srcE).val();
    
    /* alert("modChanged: " + mod ); */
    
    /* Organe für mod holen */
    
    var opt = {};
    for( var organ in SEARCHTREE[ mod ] ){
        
        /* keine organ angabe erstmal skippen! */
        if( "_" == organ ){ continue; }
        
        var organTransl = translOrgan( organ );
        
        opt[ organTransl ] = '<option value="' + organ + '">' + organTransl + '</option>';
    }
    
    /* abc sort */
    var sortA = getSortedKeysByStringComp( opt );
    
    /* alert("initExaSelector: sortA:\n" + jstr(sortA) ); */
    
    var oA = [];
    oA.push( '<option value="" disabled selected>Körperregion auswählen</option>' );
    for( var sx in sortA ){
        
        oA.push( opt[ sortA[sx].key ] );
    }
    
    $("#pl_organSel").html( oA.join("") );
       
}

function organChanged( srcE ){
    
    try{

        var organ = $(srcE).val();
        var mod = $("#pl_modSel").val();

        /* Alle exas anzeigen */
        showEtns(
            SEARCHTREE[ mod ][ organ ], true
        );
    }
    catch( err ){
        console.log( err );
        
    }
    
}

function showEtns( exaDuuidA, displayMod ){
    /* alert("showEtns:\n" + jstr( exaDuuidA) ); */
    
    var dispExas = [];
    
    
    for( var ex in exaDuuidA ){
        if( EXAHM[ exaDuuidA[ ex ] ] != undefined ){
            dispExas.push( EXAHM[ exaDuuidA[ ex ] ] );
        }
    }
    
    /* alert("dispExas:\n" + jstr( dispExas) ); */
    
    /* abc sort nach anf name */
    var sortA = getSortedKeysByStringComp( dispExas, "anf" );    
    
    var liA = [];
    
    for( var sx in sortA ){
        var exa = dispExas[ sortA[sx].key ];
        
        /* alert("exa:\n" + jstr(exa) ); */
        var exaCode = exa.code;
        if( exaCode == undefined ){
            exaCode = "";
        }
        
        /* mod mit angeben */
        if( true == displayMod ){
            liA.push( '<li class="rp-list__item" onclick="selectExa( this )" data-exaCode="' + exaCode + '" data-exaDuuid="' + exa._duuid + '">' + exa.anf + ' [' + translMod( exa.modId ) + ']</li>' );    
            
        }
        else{
            liA.push( '<li class="rp-list__item" data-exaDuuid="' + exa._duuid + '">' + exa.anf + '</li>' );    
            
        }
        
    }    
    
    
    $("#pl_exaList").html( liA.join("") );
    $("#pl_exaList").show();
    
    /* Unt Wähen Hinweis einblenden */
    if( liA.length > 0 ){
        $( "#pl_lblChooseExa" ).show();
    }
    else{
        $( "#pl_lblChooseExa" ).hide();
    }
    

    
}

function selectExa( ele ){
    
    removeErrorClass("pl_chooseExaLbl");
    
    $("#pl_exaList li").removeClass( "rp-active" );
    $(ele).addClass( "rp-active" );
    
    try{
        /* war davor schon andere Unt gewählt? Dann evtl vorhandenen tmpLock weg, falls da! */
        var selEtnDuuid = getSelectedEtnDuuid();

        if( selEtnDuuid.length > 0 && pl_selectedSugg != undefined && selEtnDuuid != pl_selectedSugg.exaList[0].etnDuuid ){
            exaChanged( pl_selectedSugg.exaList[0].etnDuuid, selEtnDuuid, pl_selectedSugg );
        }
    
    }
    catch(err){
        console.log("selectExa: ERR: " + err );
        
    }
    
  
    
    
}

function exaChanged( oldEtnDuuid, newEtnDuuid, pl_selectedSugg ){
    /* alert("exaChanged: oldEtnDuuid: " + oldEtnDuuid + " newEtnDuuid: " + newEtnDuuid + "\npl_selectedSugg:\n" + jstr(pl_selectedSugg) ); */
    try{
        pl_deSelectSugg();
    }
    catch(err){
        console.log("exaChanged: ERR: " + err );
        
    }
}




function getSelectedEtnDuuid( defVal ){
    
    try{
        var sli = $("#pl_exaList li.rp-active");
        
        if( sli.length > 0 ){
            return sli.attr( "data-exaDuuid" );
        }
        else{
            return defVal;
            
        }
        
    }
    catch(err){
        console.log( err );
        
    }
    return defVal;
}

function getSelectedEtnCode( defVal ){
    
    try{
        var sli = $("#pl_exaList li.rp-active");
        
        if( sli.length > 0 ){
            return sli.attr( "data-exaCode" );
        }
        else{
            return defVal;
            
        }
        
    }
    catch(err){
        console.log( err );
        
    }
    return defVal;
}

function getSelectedEtn( defVal ){
    
    try{
        return EXAHM[getSelectedEtnDuuid( defVal )];
        
    }
    catch(err){
        console.log( err );
        
    }
    return defVal;
}


function searchExas( srcE ){
    
    var st = $(srcE).val();
    
    /* alert("searchExas: " + st ); */
    
    /* ab 3 zeichen suchen */
    st = st.trim().toLowerCase();
    
    if( st.length < 3 ){
        /* clear */
        showEtns( [], true );
        return;
    }
    
    /* multi suche */
    var sA = st.split( " " );
    
    
    var hitA = [];
    
    /* suchen! */
    for( var eduuid in EXAHM ){
        
        /*  */
        var hit = true;
        for( var sx in sA ){
            if( EXAHM[ eduuid ].search.indexOf( sA[ sx ] ) == -1 ){
                hit = false;
                break;
            }
            
        }
        
        if( hit ){
            hitA.push( eduuid );
        }

    }
    
    //if( hitA.length > 0 ){
        showEtns( hitA, true );
        
    //}
    
    
}






function translMod( mod ){
    
    switch( mod ){
        case "CT": return "CT";
        case "MR": return "MRT";    
        case "NM": return "Nuklearmedizin";    
        case "CR": return "Röntgen";
        case "US": return "Ultraschall";
        default: return mod;
    }
    
    
}


function translOrgan( organ ){
   
    organ = organ.toUpperCase();

    switch( organ ){
        case "ABDOMEN": return "Abdomen";
        case "ANKLE": return "Sprunggelenk";
        case "ARM": return "Arm";
        case "BODY": return "Körper";
        case "BREAST": return "Brust";
        case "CHEST": return "Thorax";
        case "CLAVICLE": return "Clavicula";
        case "COCOYX": return "Steißbein";
        case "CSPINE": return "HWS";
        case "ELBOW": return "Ellenbogen";
        case "FOOT": return "Fuß";
        case "HAND": return "Hand";
        case "HEART": return "Herz";
        case "HIP": return "Hüfte";
        case "KNEE": return "Knie";
        case "LEG": return "Bein";
        case "LSPINE": return "LWS";
        case "NECK": return "Hals";
        case "PELVIS": return "Becken";
        case "SHOULDER": return "Schulter";
        case "SKULL": return "Schädel";
        case "SPINE": return "WS";
        case "SSPINE": return "Rückgrat";
        case "TSPINE": return "BWS";
        case "WS": return "WS";            

        default:
            return organ;
    }    
    
    
}








/*
 * 
 * Kalender
 */

function initCalendar( monthMap,dayMap,alternateDayMap ){
    try{
        
        
        /* deutsche Monatsnamen und Tagesnamen einsetzen */
        /* Namen aus moment.js nehmen */
        
        /* Werte in monthMap von calendar überschreiben */
        var mA = moment.months();
        
        for( var m = 0; m < mA.length; m++ ){
            monthMap[ (m + 1).toString() ] = mA[ m ];
        }
      
        /* TAgesnamen dayMap von So bis Mo, alternateDayMap von Mo bis So */
        var dA = moment.weekdays();
        
        for( var d = 0; d < dA.length; d++ ){
            dayMap[ m.toString() ] = dA[ d ];
            
            if( d == 0 ){
                alternateDayMap[ "7" ] = dA[ d ];
            }
            else{
                alternateDayMap[ ( d % 7  ).toString() ] = dA[ d ];
            }
        
        }
        
    }
    catch(cerr){
        console.log("initCalendar ERROR: " + cerr );
        
    }
    
    
    
}

function pl_kalHighlightDay( calId, isoDate ){
     try{
         $("#" + calId + " span.kalDayHighlight").removeClass( "kalDayHighlight" );
         $("#" + calId + " div[data-date='" + isoDate + "'] span").addClass( "kalDayHighlight" );
     }
     catch(err){}


 }

    
    
/*
 * Fragen und Heinweise Logik
 */    

    /*
     * FRAGEN UND HINWEISE
     * 
     */    
    
    function pl_validateHintsAnswers(){
        
        try{
            var hans = pl_getHintsAnswers();

            /* alert("pl_validateHintsAnswers:\n" + jstr( hans.answers ) ); */

            /* extract answers */
            var aHM = {};
            for( var ax in hans.answers ){
                aHM[ hans.answers[ax].id ] = hans.answers[ax].answer;
                
                
                /* cancel? */
                if( hans.answers[ax].answer != undefined && hans.answers[ax].answer ==  hans.answers[ax].cancel ){
                    pl_showCancelInfo( hans.answers[ax] );
                    return false;
                }
                
            }
        
            /* Platzangst? Dann MUSS Folgefrage beantwortet werden! */
            if( "Ja" == aHM[ "Platzangst" ] && "" ==  aHM[ "PlatzangstValium" ] ){
                showValiMsg( "Bitte beantworten Sie bei Platzangst, ob Valium benötigt wird." );   
                return false;
            }
        
        }
        catch(err){
            console.log("pl_validateHintsAnswers ERROR: " + err );
        }
        
        return true;
        
    }
    
    
    

    /* Hinweise und Antworten auf Fragen zusammenfassen */
    function pl_getHintsAnswers(){
        
        
        var hans = {
            "hints":[],
            "answers":[]
        };
        
        if( pl_curHQ != undefined ){
            
            if( pl_curHQ.hints != undefined ){
                for( var hx in pl_curHQ.hints ){
                    hans.hints.push( pl_curHQ.hints[ hx ] );
                }
            }
            
            if( pl_curHQ.questions != undefined ){
                for( var qx in pl_curHQ.questions ){
                    var quest = pl_curHQ.questions[ qx ];
                    
                    var qduuid = quest._duuid;
                    if( qduuid == undefined ){ qduuid = ""; }
                    
                    
                    var ans = {
                        "id": quest.id,
                        "duuid": qduuid,
                        "answer": quest.answer,
                        "freetext": quest.freetext
                    };
                    
                    if( quest.cancel != undefined ){
                        ans.cancel = quest.cancel;
                    }
                    
                    
                    hans.answers.push( ans );
                }
            }
        }
        
        /* alert("pl_getHintsAnswers:\n" + jstr(hans) ); */
        
        return hans;
        
    }










    /* Nach Umstellung: */
    function pl_showHintsQuestionsForEtn( etnDuuid, patient ){
        
        
        
        /* var etnDuuid = getSelectedEtnDuuid(""); */
        
        /* alert("pl_showHintsQuestionsForEtn: " + etnDuuid ); */
        
        var etnKey = etnDuuid;
        
                
        /* im cache und passend? */
        if( pl_curHQ != undefined && pl_curHQ.sh == etnKey ){
            /* alert("pl_showHintsQuestionsForSugg: form cache!");  */
            /*alert("pl_getHintsQuestionsForEtn: FROM CACHE!");*/
            pl_renderHintsQuestionsForSugg( pl_curHQ );
        }
        else{
            
            /* alte vorhadnene Hinweise + Fragen löschen */
            
            if( pl_curHQ != undefined ){
                if( pl_curHQ.hints != undefined ){pl_curHQ.hints=[];}
                if( pl_curHQ.questions != undefined ){pl_curHQ.questions=[];}
            }
            
            
            pl_getHintsQuestionsForEtn( etnDuuid, patient, 
                function( hq ){
                    pl_renderHintsQuestionsForSugg( hq );
                }
            );
        }
        return;
        
        
        
        /* im cache und passend? */
        if( pl_curHQ != undefined && sugg.sh == pl_curHQ.sh ){
            /* alert("pl_showHintsQuestionsForSugg: form cache!");  */
            pl_renderHintsQuestionsForSugg( pl_curHQ, sugg, patient );
        }
        else{
            pl_getHintsQuestionsForSugg( sugg,patient,
                function( hq ){
                    
                    pl_renderHintsQuestionsForSugg( hq, patient );
                }
                    
            );
            
        }
        
    } 



    function pl_getHintsQuestionsForEtn( etnDuuid, patient, cbF ){

        var etnKey = etnDuuid;

        oc_callService( "getHintsQuestions", {"etnDuuidA": [etnDuuid] }, 
            function( resp ){


                /* alert("pl_getHintsQuestionsForEtn debug resp:\n" + jstr( resp ) );  */

                /* Filter auf Hinweise und Fragen */
                pl_filterQuestionHintResp( resp, patient );

                resp = pl_convertHQ( resp );

                /* vorhandene Antowrten einmappen, falls schon vorher beantwortet wurden */
                pl_mergeAnswers( resp, pl_curHQ );

                pl_curHQ = resp;
                /* pl_curHQ.sh = sugg.sh;  */
                pl_curHQ.sh = etnKey;


                cbF( pl_curHQ );
            }
        );
        
    }

















    function pl_showHintsQuestionsForSugg( sugg, patient ){
        
        
        
        var etnDuuid = getSelectedEtnDuuid("");
        
        alert("pl_showHintsQuestionsForSugg: " + etnDuuid );
        
        
        /* im cache und passend? */
        if( pl_curHQ != undefined && sugg.sh == pl_curHQ.sh ){
            /* alert("pl_showHintsQuestionsForSugg: form cache!");  */
            pl_renderHintsQuestionsForSugg( pl_curHQ, sugg, patient );
        }
        else{
            pl_getHintsQuestionsForSugg( sugg,patient,
                function( hq ){
                    
                    pl_renderHintsQuestionsForSugg( hq, sugg, patient );
                }
                    
            );
            
        }
        
    } 

 



    function pl_renderHintsQuestionsForSugg( hq, sugg ){
        
        /* alert("pl_renderHintsQuestionsForSugg: " + jstr(hq) ); */
        
        /* Hinweise rendern */
        var hiA = [];
        
        if( hq.hints != undefined ){
            for( var hx in hq.hints ){
                
                var hint = hq.hints[ hx ];
                
                /* Gibt es Mail Text? Dann anzeigen! */
                if( hint.mail != undefined && hint.mail.length > 0 ){
                    hiA.push( "<li class='rp-hint'><p>" );
                    hiA.push( hint.mail );
                    hiA.push( "</p></li>" );
                }
            }
        }
        
        
        $( "#pl_hints" ).html( hiA.join("") );
        
        
        
        // Fragen und Untersuchungen HTML
        var hA = [];
        var prefix = "p1";
        var isGlobal = false;

        // Fragen hinzufügen
        for(var i = 0; i < hq.questions.length; i++ ){

            var quest = hq.questions[ i ];
            
            /* 2021-04-14: duuid von question mit rein */
            var qduuid = quest._duuid;
            if( qduuid == undefined ){ qduuid = "";}
            
            hA.push( "<div id='question_cont_" + quest.id + "' data-qduuid='" + qduuid + "'  data-index='" + i + "' style='display:none;' class='rp-question-wrapper " );

            if( ! quest.isRootQ ){
               hA.push( "rp-subquestion-wrapper" );
                
            }
            
            
            
            // 2017-05-02: readOnly?
            if( true == quest.readOnly ){
                hA.push( " rp-questions-view-mode" );
            }
            
            /*
            if( psDoc != undefined ){
                fhCont += "' data-psUuid='" + psDoc._duuid + "'>";
                
            }
            else{
                hA.push( "'>" );
            }
            */
        
            hA.push( "'>" );
        
            hA.push( "<div class='rp-d-flex'><div class='rp-question" );
            

            if( false === quest.valid ){
                hA.push( " rp-val-error" );
            }

            hA.push( "'  id='question_label_" + quest.id + "'><strong data-prefix='" + prefix + "'>" + quest.question + "</strong></div>" );



            // Antwortmöglichkeiten als einfache radio Buttons anbieten
            if( quest.type == "radio"){

                var radioEleName = "question_" + i;
                
                if( isGlobal ){
                    radioEleName = "g" + radioEleName;
                }
                

                hA.push( "<div class='rp-answer' id='question_radio_wrapper_" + quest.id + "'>" );

                // über options laufen
                for( var o = 0; o < quest.options.length; o++ ){
                    

                    /* Antwort auch in Patient speichern? */
                    var keepAns = false;
                    
                    // 2017-11-14: Bug: keep Antwort NUR holen, wenn Antwort noch leer ist!
                    //if( quest.keep != undefined && true == quest.keep ){
                    /// ALT: if( quest.keep != undefined && true == quest.keep &&  ){
                    
                    /*
                    if( quest.keep != undefined && true == quest.keep && quest.answer.length == 0){
                        keepAns = true;
                        quest.answer = getMakePatientDefAnswer( getPatient( psDoc ), quest.id ).answer;
                    }
                    */
                    
                    /*
                    if( psDoc != undefined ){
                        fhCont += "<div class='rp-radio-wrapper'><input type='radio' class='rp-radio' onchange='" + criticalScriptSet + "pl_mapExaminationAnswer(this);" + criticalScriptUnSet + "' id='" + radioEleName + o + "' name='" + radioEleName + "'  data-psUuid='" + psDoc._duuid + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.options[o ] + "'";
                    }
                    else{
                        hA.push( "<div class='rp-radio-wrapper'><input type='radio' class='rp-radio' onchange='pl_mapExaminationAnswer(this);' id='" + radioEleName + o + "' name='" + radioEleName + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.options[o ] + "'" );
                    }
                    */
                    hA.push( "<div class='rp-radio-wrapper'><input type='radio' class='rp-radio' onchange='pl_mapExaminationAnswer(this);' id='" + radioEleName + o + "' name='" + radioEleName + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.options[o ] + "'" );



                    // 2016-03-03: confirm flag? dann onClick funktion aufrufen
                    if( true == quest.confirm ){
                        hA.push( " onclick='removeConfirm(this);'" );
                        
                    }


                    // checked?                            
                    if( quest.answer == quest.options[o ] ){
                        hA.push( " checked='checked'" );

                    }
                    
                    // NIcht beantwortet? Dann radiobox rot
                    if( false === quest.valid ){
                        hA.push( " class='rp-val-error' " );
                    }



                    hA.push( "/>" );

                    hA.push( "<label for='" + radioEleName + o + "'>" + quest.options[ o ] + "</label></div>" );
                    


                }                    

                hA.push( "</div></div>" );


                var doShow = true;
                /* sichtbar? */
                if( quest.showFreeTextOptions != undefined ){
                    doShow = false;
                    for( var s = 0; s < quest.showFreeTextOptions.length; s++ ){
                        if( quest.answer == quest.showFreeTextOptions[s] ){
                            doShow = true;
                        }
                    }
                }


                /* Genereller Infotext zur Frage unabhängig von Antwort? */
                if( quest.info != undefined && quest.info.length > 0 ){

                    /* Wenn eine an Antwort gebundene Info, dann ausblenden und nur bei "Ja" anzeigen */
                    hA.push( "<div class= id='ftinfo_" + i + "' ");
  
                    hA.push( ">" );
                    hA.push( quest.info );
                    hA.push( "</div>" );
                }

                /* Infotext zur bestimmter Antwort */
                if( quest.optionInfo != undefined  ){
                    
                    var namePrefix = "ftansinfo_";
                    if( isGlobal ){
                        namePrefix = "g" + namePrefix;
                    }
                    

                    for( var answ in quest.optionInfo ){
                        
                        hA.push( "<div class='rp-question__info' data-prefix='" + prefix + "' name='" + namePrefix + i + "_" + answ + "' " );

                        if( ! (answ == quest.answer ) ){
                           hA.push( " style='display:none;'" );
                        }


                        hA.push( ">" );
                        hA.push( quest.optionInfo[answ] );
                        hA.push( "</div>" );

                    }


                }


                /* Freitextmöglichkeit anbieten? Dann noch inputField dazu - 
                 Box kann auch nur bei bestimmten Antworten angeboten werden */
                if( quest.allowFreetext === true ){

                    var namePrefix = "ftquestion_";
                    if( isGlobal ){
                        namePrefix = "g" + namePrefix;
                    }
                    
                    
                    /*
                    if( quest.keep != undefined && true == quest.keep && quest.freetext.length == 0){
                        keepAns = true;
                        quest.freetext = getMakePatientDefAnswer( getPatient( psDoc ), quest.id ).freetext;
                    }                    
                    */
                    
                    /*
                    if( psDoc != undefined ){
                        fhCont += "<input class='rp-question__freetext' type='text' onchange='" + criticalScriptSet + "pl_mapExaminationAnswerFreetext(this);" + criticalScriptUnSet + "' placeholder='' name='" + namePrefix + i + "' data-psUuid='" + psDoc._duuid + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.freetext + "' ";
                    }
                    else{
                        hA.push( "<input class='rp-question__freetext' type='text' onchange='pl_mapExaminationAnswerFreetext(this);' placeholder='' name='" + namePrefix + i + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.freetext + "' " );
                    }
                    */


                    hA.push( "<input class='rp-question__freetext' type='text' onchange='pl_mapExaminationAnswerFreetext(this);' placeholder='' name='" + namePrefix + i + "' data-index='" + i + "' data-global='" + isGlobal + "' data-keep='" + keepAns + "' value='" + quest.freetext + "' " );


                    if( !doShow ){
                       hA.push( " style='display:none;'" );
                    }

                    hA.push( "/>" );


                }

            }
            
            /* div für Frage schliessen */
            hA.push( "</div>" );

        }

        /* alert("qhtml:\n" + hA.join("") ); */

        // Fragen einsetzen
        $( "#pl_quest"  ).html( hA.join("") );        
        pl_toggleQuestions( prefix + "pl_quest", hq.questions);
      
        /* keine Fragen? Block ausblenden! */
        if( hA.length == 0 ){
            
            $( "#pl_questCont"  ).hide();        
        }
        else{
            $( "#pl_questCont"  ).show();        
        }
        
        
    }
    
    
    /* Fragen ein- ausblenden bei verschachtelten Fragen */
    function pl_toggleQuestions( dstContainerId, questions){
        
        var showQ = pl_getActiveQuestions( questions );
        
        for( qId in showQ ){
            if( true == showQ[ qId ] ){
                $("#question_cont_" + qId ).show();
            }
            else{
                $("#question_cont_" + qId ).hide();
            }
        }
     
    }
    
    
    /* Aktive Fragen (=sichtbare und zu validierende) ermittlen */
    function pl_getActiveQuestions( questions ){
        
        var activeQ = {};
        
        for(var i = 0; i < questions.length; i++ ){
            activeQ[ questions[i].id ] = false; 
        }
        
        
        for(var i = 0; i < questions.length; i++ ){
            
           /* Gibt es subQuery anhand von bestimmer Antwort? */
           if( questions[i].subQuestions != undefined && questions[i].subQuestions[ questions[i].answer ] != undefined){
               
               for( var sqid in  questions[i].subQuestions[ questions[i].answer ] ){
                   activeQ[ questions[i].subQuestions[ questions[i].answer ][sqid]  ] = true;
               }
           }
           
           /* root Fragen immer aktiv! */
           if( questions[i].isRootQ == true ){
                activeQ[ questions[i].id ] = true;
           }
        }        
        
        return activeQ;
        
    }
    
    
    
    // Radiobutton  Antwort auf Untersuchungsfrage einmappen
    function pl_mapExaminationAnswer( element ){

            /* console.log("pl_mapExaminationAnswer " + element.name + " val: " + $(element).val() ); */

            //var answerEle = $("input[name=" + element.name + "]:checked" );
            var answerEle = $( element );
            // index von frage ist in data-index kodiert
            var index = parseInt( answerEle.attr("data-index") );
            var isGlobal = answerEle.attr("data-global");
            
            
            var questions = pl_curHQ.questions;
            
            
 
            
         
           
            // Antwort in exaData einmappen
            questions[index].answer = answerEle.val();
            
            
            
            // Gibt es Freitextfeld welches je nach Antwort sichtbar ist?
            if( questions[index].showFreeTextOptions != undefined ){     
                doShow = false;
                for( var s = 0; s < questions[index].showFreeTextOptions.length; s++ ){
                    if( questions[index].answer == questions[index].showFreeTextOptions[s] ){
                        doShow = true;
                    }
                }
                
                var namePrefix = "ftquestion_";
                if( "true" == isGlobal ){
                    namePrefix = "g" + namePrefix;
                }
                
                
                if( doShow ){
                    $("input[name=" + namePrefix + index + "]").show();
                    
                }
                else{
                    $("input[name=" + namePrefix + index + "]").hide();
                }
            }      
            
            
            // Infotext zur bestimmter Antwort anzeigen / verbergen
            if( questions[index].optionInfo != undefined  ){
                
                var namePrefix = "ftansinfo_";
                if( "true" == isGlobal ){
                    namePrefix = "g" + namePrefix;
                }                

                for( answ in questions[index].optionInfo ){

                    if( answ == questions[index].answer ){
                        
                       /* alert("show ans info: name=" + namePrefix + index + "_" + answ );  */
                        
                       $("div[name=" + namePrefix + index + "_" + answ + "]").show();
                       
                       
                       
                    }
                    else{
                       $("div[name=" + namePrefix + index + "_" + answ + "]").hide(); 
                    }

                }
            }            

            
            /* Wenn Frage Kinder hat dann Antworten von Kindern zurücksetzen! */
            if( questions[index].subQuestions != undefined ){
                pl_resetSubQuestions( questions[index], questions, 0 );
            }
            
            /* alert( "questions[index].answer: " + questions[index].answer ); */
            try{
                if( questions[index].answer == questions[index].cancel ){
                    pl_showCancelInfo( questions[index] );
                    
                }
                
            }
            catch( caerr ){
                
            }
            
            
            
            pl_toggleQuestions( "", questions );
            
            
            /* Falls validier klasse error getzt, dann entfernen   */
            $( "#question_cont_" + questions[index].id).find(" .rp-val-error" ).removeClass( "rp-val-error" );
            
        

    }


    /* Wenn Frage Kinder hat dann Antworten von Kindern zurücksetzen! */
    function pl_resetSubQuestions( parentQuestion, allQuestions, recLevel ){
        
        // Rekursions Notbremse!
        if( recLevel > 10 ){
            alert("resetSubQuestions RECURSION LEVEL ALERT: " + recLevel );
            return;
        }
        
        if( parentQuestion.subQuestions != undefined ){
            for( var answ in parentQuestion.subQuestions ){
                
                var subQuestA = parentQuestion.subQuestions[ answ ];
                if( subQuestA != undefined && subQuestA.length > 0 ){
                    
                    for( var subIdx in subQuestA ){
                        var subQuestId = subQuestA[ subIdx ];
                        
                        for( var aidx in allQuestions ){
                            if( allQuestions[ aidx ].id == subQuestId ){
                                
                                allQuestions[ aidx ].answer = "";
                                
                                /*
                                if( true === allQuestions[ aidx ].keep ){
                                    keepAnswerInPatientData( getPatient(), subQuestId, "" );
                                }
                                */
                                /* GUI toogle Antwort reset per jQuery */
                                $("#question_radio_wrapper_" + subQuestId ).find("input[type=radio]").prop('checked', false);
                                
                                /* REKURSION! */
                                if( allQuestions[ aidx ].subQuestions != undefined ){
                                    pl_resetSubQuestions( allQuestions[ aidx ], allQuestions, recLevel + 1 );
                                }
                                
                            }
                        }
                    }
                }
            }
        }
    }





    // Freitext  Antwort auf Untersuchungsfrage einmappen
    function pl_mapExaminationAnswerFreetext( element ){


            //console.log("pl_mapExaminationAnswerFreetext " + element.name );

            /* alt Buggy! 2020-09-10
            var answerEle = $("input[name=" + element.name + "]" );
            */
           
            /* 2020-09-10: Änderung! War evt. der Nerv-Bug!*/
            var answerEle = $( element );

            /* index von frage ist in data-index kodiert */
            var index = parseInt( answerEle.attr("data-index") );
            var isGlobal = answerEle.attr("data-global");        
        
        
            var questions = pl_curHQ.questions;
                        
            questions[index].freetext = answerEle.val();
            
     
    }       
    
    

    function pl_getHintsQuestionsForSugg( sugg, patient, cbF ){
        
        
        /* alert("pl_getHintsQuestionsForSugg: patient:\n" + jstr( patient )+ "\nsugg:\n" + jstr(sugg) ); */
        
        /* Patientendaten mit holen */
       /*  "patient": pl_curPatData, */
        
        
        
        oc_callService( "getHintsQuestions", {"suggestion": sugg }, 
            function( resp ){
                
                
                /* alert("getHintsQuestions debug resp:\n" + jstr( resp.hints ) ); */
                
                /* Filter auf Hinweise und Fragen */
                pl_filterQuestionHintResp( resp, patient );
                
                resp = pl_convertHQ( resp );
                
                
                /* vorhandene Antowrten einmappen, falls schon vorher beantwortet wurden */
                pl_mergeAnswers( resp, pl_curHQ );
                    
                pl_curHQ = resp;
                pl_curHQ.sh = sugg.sh;
                
                
                
                cbF( pl_curHQ );
            }
        );
    }
    
    
    function pl_filterQuestionHintResp( resp, patient ){
        
        if( resp.hints != undefined ){
            /* rückwärts drüberlaufen! */
            for( var i = resp.hints.length - 1; i >= 0; i-- ){
                
                /* alert("hint: " + i + "\n" + jstr(resp.hints[ i ]) ); */
                
                if( ! pl_filterQuestionHint( resp.hints[ i ], patient ) ){
                    /* alert("remove hint:\n" + jstr(resp.hints[ i ]) ); */
                    
                    resp.hints.splice( i, 1 );
                }
            }
        }

        if( resp.questions != undefined ){
            /* rückwärts drüberlaufen! */
            for( var i = resp.questions.length - 1; i >= 0; i-- ){
                if( ! pl_filterQuestionHint( resp.questions[ i ], patient ) ){
                    /* alert("remove question:\n" + jstr(resp.questions[ i ]) ); */
                    resp.questions.splice( i, 1 );
                }
            }
        }
        
        

        
        
    }
    
    
    
    /* Fragen und hinweise filtern  */
    var PREGQUEST_lowerBound = 12;
    var PREGQUEST_upperBound = 55;
    function pl_filterQuestionHint( qhDoc, patient ){
        try{

            /* alert("pl_filterQuestionHint:\n" + jstr( qhDoc ) ); */


            /* ist überhaupt filter gesetzt */
            if( qhDoc.filter == undefined || qhDoc.filter.filterId == undefined || "" == qhDoc.filter.filterId){
                return true;
            }


            /* nicht da? raus!*/
            if( patient == undefined ){
                console.log("filterQuestionHint ERROR: NO PATIENT!" );
                return true;
            }

            /* Alter berechen */
            var patientAge = 17;
            try{
                patientAge = moment().diff(moment(patient.birthdate, "DD.MM.YYYY"), 'years');
            }
            catch( perr ){
                console.log("filterQuestionHint ERROR: patientAge: " + perr );
            }


            /* Welcher Filter? */
            switch( qhDoc.filter.filterId ){
                /* Patient unter 18 */
                case "ageUnder18":
                    if( patientAge < 18 ){
                        return true;
                    }
                    else{
                        return false;
                    }

                /* Schwangerschaft möglich? */
                case "pregnant":
                    if( ( "f" == patient.sex || "W" == patient.sex) && patientAge > PREGQUEST_lowerBound && patientAge < PREGQUEST_upperBound ){
                        return true;
                    }
                    else{
                        return false;
                    }

            }
        }
        catch(err){
            alert("filterQuestionHint ERROR: " + err );
        }
        return true;

    }


    
    
    
    
    
    
    function pl_convertHQ( hq ){
        
        
        
        
        var convHQ = {
            "hints": [],
            "questions":[]
        }
        
        var qLabelHM = {};
        
        for( var hx in hq.questions ){
            qLabelHM[ hq.questions[ hx ]._duuid ] = hq.questions[ hx ].label;
        }
        
        /* alert( jstr(qLabelHM) ); */
        
        
        for( var hx in hq.questions ){
            convHQ.questions.push( convertExaQuestionToOldFormat( hq.questions[ hx ], qLabelHM ) );
        }
        
        for( var hx in hq.hints ){
            
            
            /* Hinweis holen */
            var ehDoc = hq.hints[ hx ];
            
            /* Umwandeln in altes Format */
            oldEhDoc = {};
            
            oldEhDoc.gui = atob(ehDoc.hint.short);
            oldEhDoc.mail = atob(ehDoc.hint.def);
            
            convHQ.hints.push( oldEhDoc );
        }
        
        
        return convHQ;
        
        
    }
    

/* */
    function convertExaQuestionToOldFormat( eqDoc, qLabelHM ){


        var ofDoc = {
                "id":"",
                "question": "",
                "keep": true,
                "info": "",
                "type":"radio",
                "allowFreetext":false,
                "showFreeTextOptions":[],
                "optionInfo":{},
                "freetext": "",
                "options":[

                ],
                "optionInfo":{},            
                "optionShortInfo":{},
                "optionMailInfo":{},
                "optionBeforeMin":{},
                "answer":"",
                "subQuestions":{

                }
            };    

        ofDoc.id = eqDoc.label;
        ofDoc.isRootQ = eqDoc.isRootQ;
        ofDoc.question = atob(eqDoc.question.def);

        if( eqDoc.keep != undefined ){
            ofDoc.keep = eqDoc.keep;
        }

        ofDoc.info = btoa(eqDoc.info.def);
        var allowFreetext = false;

        for( var ox in eqDoc.options ){
            var opt = eqDoc.options[ ox ];

            if( opt.sq.length > 0 ){
                ofDoc.subQuestions[ opt.val ] = [];

                for( var sx in opt.sq ){
                    ofDoc.subQuestions[ opt.val ].push( 
                        /* gl_getQuestionByDuuid( opt.sq[ sx ] ).label */
                        
                        qLabelHM[ opt.sq[ sx ] ]
                        
                    );
                }
            }

            ofDoc.options.push( opt.val );

            /* info bei AntwortOption dabei? */
            if( opt.info.def.length > 0 ){
                ofDoc.optionInfo[ opt.val ] = atob( opt.info.def );
            }

            if( opt.info.short.length > 0 ){
                ofDoc.optionShortInfo[ opt.val ] = atob( opt.info.short );
            }

            if( opt.info.mail != undefined && opt.info.mail.length > 0 ){
                ofDoc.optionMailInfo[ opt.val ] = atob( opt.info.mail );
            }

            /* beforeMin - nur wenn gültiger Wert drin! */
            if( opt.beforeMin != undefined ){
                var bf = parseIntSafe( opt.beforeMin, -1 );

                if( bf != -1 ){
                    ofDoc.optionBeforeMin[ opt.val ] = bf;
                }
            }

            if( true === opt.enableFT ){
                ofDoc.showFreeTextOptions.push( opt.val );
                allowFreetext = true;
            }
            
            if( true === opt.cancel ){
                ofDoc.cancel = opt.val;
            }
            
            
            
            
        }

        ofDoc.allowFreetext = allowFreetext;
        return ofDoc;

    }



    function pl_showCancelInfo( quest ){
        /* alert("pl_showCancelInfo!"); */
        try{
            
            
            msg = "<b>Online Planung NICHT möglich!</b><br/>Bitte rufen Sie direkt in der Praxis an, um diesen Termin zu planen:<br/>";
            
            msg += $(".map-phoneHref").html();
            
            showValiMsg( msg );
            
            
            
            
            
        }
        catch(verr){
            console.log("pl_showCancelInfo: ERROR: " + verr )
        }
    }
        

    

    function parseIntSafe( numberStr, defVal ){

        try{
            var parsed = parseInt(numberStr);
            if( isNaN(parsed) ) { 
                return defVal; 
            }else{
                return parsed;
            }
        }
        catch( error ){
            return defVal;
        }

    }   
    
    
    
    
    
    
    
    
    
    
    
    
    
   /* Wenn Termin geändert wird, schon beantwortete Fragen wieder einmappen falls vorhanden */
    function pl_mergeAnswers( hq, pl_curHQ ){
        if( pl_curHQ != undefined ){
            
            try{
            
            /* Bestehende Fragen holen in HM key = duuid */
            var dhm = {};
            for( var qx in pl_curHQ.questions ){
                dhm[ pl_curHQ.questions[ qx ]._duuid ] = pl_curHQ.questions[ qx ];
            }
            
            /* über neue Fragen laufen */
            for( var qx in hq.questions ){
                if( dhm[ hq.questions[ qx ]._duuid ] != undefined ){
                    hq.questions[ qx ] = dhm[ hq.questions[ qx ]._duuid ];
                    
                }
                
            }
                
                
            /*    
            alert("pl_mergeAnswers: hq:\n" + jstr( hq ) );
            alert("pl_mergeAnswers: pl_curHQ:\n" + jstr( pl_curHQ ) );
            */
            }
            catch(qerr){
                console.log("pl_mergeAnswers ERROR: " + qerr );
                
            }
            
            
        }
        
        
    }
    
    function getGenderLabel( gen ){
        
        try{
            switch( gen ){
                case "W": return "weiblich";
                case "M": return "männlich";
                case "U": return "unbekannt";
                case "X": return "unbestimmt";
                case "D": return "divers";
                default: return gen;
            }
        }
        catch( err ){}
        return gen;
        
        
    }