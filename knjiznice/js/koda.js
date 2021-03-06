
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

var uporabnik1 = "";
var uporabnik2 = "";
var uporabnik2 = "";

function generirajPodatke(stPacienta) {
    ehrId = "";
    sessionId = getSessionId();
    
    var ime; var priimek; var datumRojstva; var telesnaTeza; var telesnaVisina; 
    var mascoba; var komentar; var obsegPasu; var datumInUra; var ciljSave;
    
    //fit uporabnik
    if (stPacienta == 1) {
        ime = "Ragnar";
        priimek = "Lodbrok";
        datumRojstva = "1980-05-04";
        telesnaTeza = numGen(80, 100);
        telesnaVisina = numGen(190, 200);
        mascoba = numGen(10, 15);
        obsegPasu = numGen(90, 110);
        komentar = "Posameznik je fizično zelo fit in zdrav. Njegov cilj je vzdrževanje njegove forme, poleg tega pa pridobitev še dodatne mišične mase.";
        datumInUra = getDate;
        ciljSave = ciljiArray;
        ciljiArray = ["Pridobitev mišične mase", "Pridobitev vzdržlivosti"];
    }
    else if (stPacienta == 2) {
        ime = "Lagertha";
        priimek = "Ingstad";
        datumRojstva = "1990-11-23";
        telesnaTeza = numGen(45, 50);
        telesnaVisina = numGen(170, 185);
        mascoba = numGen(6, 12);
        obsegPasu = numGen(50, 60);
        komentar = "Uporabnica je visoke in (pre)vitke postave. Svetuje se ji, naj se zredi in pridobi na gibljivosti in mišičnemi tkivu.";
        datumInUra = getDate;
        ciljSave = ciljiArray;
        ciljiArray = ["Rridobitev mišične mase", "Pridobitev vzdržlivosti"];
    }
    else if (stPacienta == 3) {
        ime = "Hodor";
        priimek = "Hodor";
        datumRojstva = "1975-01-01";
        telesnaTeza = numGen(134, 173);
        telesnaVisina = numGen(200, 250);
        mascoba = numGen(25, 40);
        obsegPasu = numGen(150, 183);
        komentar = "Posameznik je zelo močne postave. Ima poškodovano hrbtenico in hrbtne mišice, zaradi stalnega vlečenja takih in drugačnih uteži. Po telesu ima tudi več prask in modric. Priporočen počitek, hujšanje in nasploh krepitev telesa.";
        datumInUra = getDate;
        ciljSave = ciljiArray;
        ciljiArray = ["Okrevanje poškodbe", "Izguba teže", "Rridobitev mišične mase", "Pridobitev vzdržlivosti"];
    }

    $.ajax({
        headers: {"Ehr-Session": sessionId},
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function (data) {
            var ehrId = data.ehrId;
            if(stPacienta == 1) {
                uporabnik1 = ehrId;
                $('#get1').attr("disabled", false);
            }
            else if (stPacienta == 2) {
                uporabnik2 = ehrId;
                $('#get2').attr("disabled", false);
            }
            else if (stPacienta == 3) {
                uporabnik3 = ehrId;
                $('#get3').attr("disabled", false);
            }
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                partyAdditionalInfo: [{
                    key: "ehrId",
                    value: ehrId}]
            };
            $.ajax({
                headers: {"Ehr-Session": sessionId},
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        console.log(ehrId);
                        document.getElementById('EHRid').innerHTML = ehrId;
                        
                        console.log("Uporabnik kreiran");
                        // nalaganje podatkov v bazo 
                        ciljiArray.push(komentar);
                        localStorage[ehrId] = JSON.stringify(ciljiArray);
                        console.log("local saved: " +  JSON.stringify(ciljiArray));
                        
                        writeData(sessionId, ehrId, stPacienta, 1);
                        
                        ciljiArray = ciljSave;                            
                        document.getElementById('EHRid').innerHTML = "";

                    }
                },
                error: function(err) {
                    $("#GENfeedback").html('<div class="panel panel-default"><div class="panel-body">' +
                JSON.parse(err.responseText).userMessage + "</div></div>!");
                }
            });
        }
    });
}

function writeData(sessionId, ehrId, stPacienta, i) {
    var ranData = generateJsons(stPacienta, i);
    console.log(ranData);
    var podatki = {
        // Struktura predloge je na voljo na naslednjem spletnem naslovu:
    // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": ranData[4],
        "vital_signs/height_length/any_event/body_height_length": ranData[1],
        "vital_signs/body_weight/any_event/body_weight": ranData[0],
        //systolic je v mojem primeru obsegPasu
        "vital_signs/blood_pressure/any_event/systolic": ranData[3],
        // diastolic je v mojem primeru mascoba
        "vital_signs/blood_pressure/any_event/diastolic": ranData[2],
    };
    var parametriZahteve = {
        ehrId: ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: "blank blank"
    };
    $.ajax({
        headers: {"Ehr-Session": sessionId},
        url: baseUrl + "/composition?" + $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(podatki),
        success: function (res) {
            document.getElementById('GENfeedback').innerHTML = 'Podatki uspešno naloženi';
            if(i < 11) {
                 writeData(sessionId, ehrId, stPacienta, i+1);
            }
        },
        error: function(err) {
            $("#GENfeedback").html(
        '<div class="panel panel-default"><div class="panel-body">' +
        JSON.parse(err.responseText).userMessage + "</div></div>");
        }
    });
                        
}

function generateJsons(stPacienta, i) {
    var output;
    console.log("Pacient: " +stPacienta);
    if(stPacienta == 1) {
        telesnaTeza = numGen(75, 100);
        telesnaVisina = numGen(190, 200);
        mascoba = numGen(8, 20);
        obsegPasu = numGen(90, 110);
        datumInUra = "2016-"+i+"-"+numGen(1,30);
    }
    else if (stPacienta == 2){
        telesnaTeza = numGen(40, 60);
        telesnaVisina = numGen(190, 200);
        mascoba = numGen(10, 20);
        obsegPasu = numGen(50, 60);
        datumInUra = "2016-"+i+"-"+numGen(1,30);
    }
    
    else if (stPacienta == 3){
        telesnaTeza = numGen(124, 200);
        telesnaVisina = numGen(190, 200);
        mascoba = numGen(25, 50);
        obsegPasu = numGen(120, 190);
        datumInUra = "2016-"+i+"-"+numGen(1,30);
    }
    output = [telesnaTeza, telesnaVisina, mascoba, obsegPasu, datumInUra];
    
    return output;
}

function getGenerated(stPacienta) {
    clearCilj();
    
    if (stPacienta == 1) {
        document.getElementById("searchEHR").value = uporabnik1;
        document.getElementById("EHRid").value = uporabnik1;
    }
    else if (stPacienta == 2) {
       document.getElementById("searchEHR").value = uporabnik2;
       document.getElementById("EHRid").value = uporabnik2;
    }
    else if (stPacienta == 3) {
        document.getElementById("searchEHR").value = uporabnik3;
        document.getElementById("EHRid").value = uporabnik3;
    }
    
    getUser();
    getUserData();
}

function numGen(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
var ciljiArray = [];
function addCilj(){
  
  var li = document.createElement("li");
  var input = document.getElementById("newCilj");
  var value =  input.options[input.selectedIndex].value;
  li.innerHTML = value;
  li.className = "list-group-item";
  
  ciljiArray.push(value);
  console.log(ciljiArray);
  $("#cilji").append(li);
}

function clearCilj() {
    ciljiArray = [];
    $("#cilji").empty();
}

function getPredloge() {
    $('#predlogi').empty();
    
    for (var i = 0; i < ciljiArray.length; i++) {
        var li = document.createElement("li");
        li.className = "list-group-item";
        if (ciljiArray[i] == "Izguba teže") {
            li.innerHTML = "Dieta";
            $("#predlogi").append(li);
            li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = "Intervalni aerobni trening";
            $("#predlogi").append(li);
        }
        else if (ciljiArray[i] == "Pridobitev mišične mase") {
            li.innerHTML = "Trening z utežmi";
            $("#predlogi").append(li);
            li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = "Hrana bogata z proteini in minerali";
            $("#predlogi").append(li);
        }
        else if (ciljiArray[i] == "Okrevanje poškodbe") {
            li.innerHTML = "Fizioterapija";
            $("#predlogi").append(li);
            li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = "Počitek";
            $("#predlogi").append(li);
        }
        else if (ciljiArray[i] == "Pridobitev vzdržlivosti") {
            li.innerHTML = "Anaerobna vadba";
            $("#predlogi").append(li);
            li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = "Povečevanje intnenzivnosti vaj";
            $("#predlogi").append(li);
        }
    }
}

function addUser() {
    sessionId = getSessionId();
    
    var ime = $("#newIme").val();
    var priimek = $("#newPriimek").val();
    var datumRojstva = $("#newDatumRojstva").val();
    
    if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#saveFeedback").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {

		$.ajax({
            headers: {"Ehr-Session": sessionId},
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
                newEHRid = ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{
                        key: "ehrId",
                        value: ehrId}]
		        };
		        $.ajax({
                    headers: {"Ehr-Session": sessionId},
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                   document.getElementById('newEHR').innerHTML = ehrId;
                            console.log(ehrId);
                            document.getElementById('upload').disabled = false;
                            document.getElementById('create').disabled = true;
		                }
		            },
		            error: function(err) {
                        document.getElementById('upload').disabled = true;
                            document.getElementById('create').disabled = false;
		            	$("#newEHR").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		        });
		    }
		});
	}
    
    document.getElementById('upload').disabled = false;
    document.getElementById('create').disabled = true;
}

function uploadData(newUser) {
	sessionId = getSessionId();
    
    if(newUser == 1) {
        console.log("new user");
        var ehrId = document.getElementById('newEHR').innerHTML;
        var datumInUra = getDate();
        var telesnaTeza = $("#newTeza").val();
        var obsegPasu = $("#newObsegPasu").val();
        var mascoba = $("#newMascoba").val();
        var telesnaVisina = $("#newVisina").val();
        var komentar = $("#newComment").val();
        console.log(ehrId + ' ' + datumInUra + ' ' + telesnaVisina + 
        ' ' +telesnaTeza + ' '+ obsegPasu + ' ' + mascoba + ' ' + komentar);
    }
    else {
        console.log("existing user");
        var ehrId = $("#EHRid").val();;
        var datumInUra =  $("#datum").val();
        var telesnaTeza = $("#teza").val();
        var mascoba = $("#mascoba").val();
        var telesnaVisina = $("#visina").val();
        var obsegPasu = $("#obsegPasu").val();
        var komentar = $("#comment").val();
    }
    console.log(ehrId);
	if (!ehrId || ehrId.trim().length == 0) {
		$("#saveFeedback").html('<div class="alert alert-warning" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Naložite uporabnika z ustreznim ehrId</div>');
	} else {
        ciljiArray.push(komentar);
        localStorage[ehrId] = JSON.stringify(ciljiArray);
        console.log("local saved: " +  JSON.stringify(ciljiArray));
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
            //systolic je v mojem primeru obsegPasu
		    "vital_signs/blood_pressure/any_event/systolic": obsegPasu,
            // diastolic je v mojem primeru mascoba
		    "vital_signs/blood_pressure/any_event/diastolic": mascoba,
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: komentar
		};
		$.ajax({
            headers: {"Ehr-Session": sessionId},
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#saveFeedback").html('<div class="alert alert-success" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Podatki so uspešno naloženi</div>');
              document.getElementById('newFeedback').innerHTML = 'Podatki uspešno naloženi';
		    },
		    error: function(err) {
		    	$("#saveFeedback").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}

function getUser() {
    sessionId = getSessionId();

	var ehrId = $("#searchEHR").val();
    var uporabnik;
    if (!ehrId || ehrId.trim().length == 0) {
        $("#saveFeedback").html('<div class="alert alert-warning" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Prosim vnesite zahtevan podatek!</div>')
	} else {
		$.ajax({
            headers: {"Ehr-Session": sessionId},
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
	    	success: function (data) {
                //.firstNames = ime; .lestNames = priimek; dateOfBirth = rojstvo;
				uporabnik = data.party;
                console.log(uporabnik);
				$("#saveFeedback").html('<div class="alert alert-success" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Uporabnik se je uspešno naložil</div>');
			   document.getElementById('EHRid').value = ehrId;
               document.getElementById('ime').value = uporabnik.firstNames;
               document.getElementById('imepriimek').innerHTML = uporabnik.firstNames + " " +  uporabnik.lastNames;
               document.getElementById('priimek').value = uporabnik.lastNames;
               document.getElementById('datumRojstva').value = uporabnik.dateOfBirth.substring(0,10);
            //    document.getElementById('visina').value = "";
            //    document.getElementById('teza').value = ""; 
            //    document.getElementById('bmi').value = ""; 
            //    document.getElementById('obsegPasu').value = ""; 
            //    document.getElementById('bai').value = "";     
            //    document.getElementById('mascoba').value = ""; 
            //    document.getElementById('visina').value = "";
            //    document.getElementById('BAIfeedback').innerHTML = ""; 
            //    document.getElementById('BMIfeedback').innerHTML = ""; 
            //    document.getElementById('datum').value = ""; 
            //    document.getElementById('comment').value = ""; 
            //    ciljiArray = [];
            //    $("#cilji").empty();
        },
			error: function(err) {
				$("#saveFeedback").html('<div class="alert alert-danger" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Napaka: ' +
          JSON.parse(err.responseText).userMessage + "'!</div>");
			}
		});
	}
}

var vaje;
var misice;
$.get( "https://wger.de/api/v2/muscle/", function( data ) {
    misice = data.results;
    console.log(misice);
    var select = document.getElementById("skupinaMisic");
    for (var i = 0; i < misice.length; i++) {
        var option = document.createElement('option');
        option.text = misice[i].name;
        select.add(option, i+1);
    }
});

// kreacija seznama ob spremenitvi mišice
$(function() {
  $('#skupinaMisic').on('change', function(){
    var selected = $(this).find("option:selected").val();
    var searchId;
    for (var i = 0; i < misice.length; i++) {
        if(selected == misice[i].name) {
            searchId = misice[i].id;
            break;
        }
    }
    // iskanje vaj te mišice
    $.get( "https://wger.de/api/v2/exercise/?language=2&limit=100&muscles="+searchId, function( data ) {
        vaje = data.results;
        console.log(vaje);
        $('#vaje').empty();
        var select = document.getElementById("vaje");
        var option = document.createElement('option');
        option.text = "Izberite Vajo";
        select.add(option, i+1)
        for (var i = 0; i < vaje.length; i++) {
            option = document.createElement('option');
            option.text = vaje[i].name;
            select.add(option, i+1);
        }
    });
    
  });
});

// prikaz izbrane vaje
$(function() {
    $('#vaje').on('change', function(){
    var imgSrc;
    var selected = $(this).find("option:selected").val();
    console.log(selected);
    var indexVaje;
    var width = $("#isciVajo").width();
    
    for (var i = 0; i < vaje.length; i++) {
        if(selected == vaje[i].name) {
            indexVaje = i;
            break;
        }
    }
    console.log(indexVaje);
    console.log(vaje[indexVaje]);

    if(vaje[indexVaje].name != null && vaje[indexVaje].name.length != 0) {
        document.getElementById("imeVaje").innerHTML = vaje[indexVaje].name;
    }
    else {
        document.getElementById("imeVaje").innerHTML = 'Naslov vaje ni na voljo <i class="fa fa-frown-o" aria-hidden="true"></i>';
    }
    
    if(vaje[indexVaje].description != null && vaje[indexVaje].description.length != 0) {
        document.getElementById("opisVaje").innerHTML = vaje[indexVaje].description;
    }
    else {
        document.getElementById("opisVaje").innerHTML = 'Opis vaje ni na voljo <i class="fa fa-frown-o" aria-hidden="true"></i>';
    }
    
    document.getElementById("slikaVaje").innerHTML = "";
    // iskanje slike
    console.log(vaje[indexVaje]);
    $.ajax({
        url: "https://wger.de/api/v2/exerciseimage/?exercise="+vaje[indexVaje].id,
        success: function( data ) {
            if (data.results.length > 0) {
                imgSrc = data.results[0].image;
                document.getElementById("slikaVaje").innerHTML = ('<img src="'+imgSrc+'" class="img-rounded" alt="Slika vaje" width="' + width + '" height="' + width + '">');
            }
        },
        error: function() { 
            document.getElementById("slikaVaje").innerHTML = ('<i style="right:'+width+'" class="fa fa-file-image-o fa-5x" aria-hidden="true"></i> Slika vaje ni na voljo');
        }
    });
    console.log(imgSrc);
    if(imgSrc == undefined || imgSrc == null) {
        document.getElementById("slikaVaje").innerHTML = ('<i style="right:'+width+'" class="fa fa-file-image-o fa-5x" aria-hidden="true"></i> Slika vaje ni na voljo');
    }
   
  });
});
var vseVaje = [];
function isciVajo() {
    var imeVaje = document.getElementById('isciVajo').value;
    console.log("Iščem: "+ imeVaje);
    if (vseVaje.length == 0) {
        $.ajax({
            url: "https://wger.de/api/v2/exercise/?language=2&limit=400",
            success: function(data) {
                vseVaje = data.results;
                console.log(vseVaje.length);
                search(imeVaje);
            },
            error: function() { 
                document.getElementById("imeVaje").innerHTML = 'Ta vaja ni bila najdena <i class="fa fa-frown-o" aria-hidden="true"></i>';
                document.getElementById("opisVaje").innerHTML = "";
                document.getElementById("slikaVaje").innerHTML = "";
            }
        });
    }
    else {
        search(imeVaje);
    }
}

function search(imeVaje) {
    var indexVaje = -1;
    for (var i = 0; i < vseVaje.length; i++) {
        //console.log(vseVaje[i].name.toLowerCase());
        if(imeVaje.toLowerCase() == vseVaje[i].name.toLowerCase()) {
            indexVaje = i;
            break;
        }
    }
    if (indexVaje != -1) {
        var width = $("#isciVajo").width();
        document.getElementById("imeVaje").innerHTML = vseVaje[indexVaje].name;
        document.getElementById("opisVaje").innerHTML = vseVaje[indexVaje].description;
        //iskanje slike
        $.ajax({
            url: "https://wger.de/api/v2/exerciseimage/"+vseVaje[indexVaje].id,
            success: function( data ) {
            imgSrc = data.image;

            console.log(width);
            document.getElementById("slikaVaje").innerHTML = ('<img src="'+imgSrc+'" class="img-rounded" alt="Slika vaje" width="' + width + '" height="' + width + '">');
            },
            error: function() { 
                document.getElementById("slikaVaje").innerHTML = ('<i style="right:'+width+'" class="fa fa-file-image-o fa-5x" aria-hidden="true"></i> Slika vaje ni na voljo');
            }
        });
    }
    else {
        document.getElementById("imeVaje").innerHTML = 'Ta vaja ni bila najdena <i class="fa fa-frown-o" aria-hidden="true"></i>';
        document.getElementById("opisVaje").innerHTML = "";
        document.getElementById("slikaVaje").innerHTML = "";
    }
}


var dataTeza;
var dataMascobaPas;
var dataHeight;
var normalTeza;
var normalMascoba;
function getUserData() {
    console.log("Fetching data");
    sessionId = getSessionId();

	var ehrId = $("#EHRid").val();
    
    if (!ehrId || ehrId.trim().length == 0) {
        $("#saveFeedback").html('<div class="alert alert-warning" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Prosim vnesite zahtevan podatek!</div>')
    } else {
        var temp = JSON.parse(localStorage.getItem(ehrId));
        //console.log("-------" + temp);
        document.getElementById("comment").value = temp[temp.length-1];
        clearCilj();
        for(var i = 0; i < temp.length-1; i++) {
            ciljiArray[i] = temp[i];
            var li = document.createElement("li");
            var input = document.getElementById("newCilj");
            var value =  temp[i];
            li.innerHTML = value;
            li.className = "list-group-item";
            ciljiArray.push(value);
            // console.log(ciljiArray);
            
            $("#cilji").append(li);
        }
		$.ajax({
            headers: {"Ehr-Session": sessionId},
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	success: function (data) {
				var uporabnik = data.party;

                $.ajax({
                    headers: {"Ehr-Session": sessionId},
                    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
                    type: 'GET',
                    success: function (res) {
                        if (res.length > 0) {
                            dataMascobaPas = res;
                            document.getElementById('obsegPasu').value = dataMascobaPas[0].systolic;
                            document.getElementById('mascoba').value = dataMascobaPas[0].diastolic;
                            // console.log(dataMascobaPas);
                            normalMascoba = normalize(dataMascobaPas, "mascoba");
                        } else {
                            $("#saveFeedback").html(
                            "<span class='obvestilo label label-warning fade-in'>" +
                            "Ni podatkov!</span>");
                        }
                    },
                    error: function() {
                        $("#saveFeedback").html(
                        "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                        JSON.parse(err.responseText).userMessage + "'!");
                    }
                });
                
                $.ajax({
                    headers: {"Ehr-Session": sessionId},
                    url: baseUrl + "/view/" + ehrId + "/" + "weight",
                    type: 'GET',
                    success: function (res) {
                        if (res.length > 0) {
                            dataTeza = res;
                            document.getElementById('teza').value = dataTeza[0].weight;
                            // console.log(dataTeza);
                            normalTeza = normalize(dataTeza, "teza");
                        } else {
                            $("#saveFeedback").html(
                            "<span class='obvestilo label label-warning fade-in'>" +
                            "Ni podatkov!</span>");
                        }
                    },
                    error: function() {
                        $("#saveFeedback").html(
                        "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                        JSON.parse(err.responseText).userMessage + "'!");
                    }
                });
                
                
                $.ajax({
                    headers: {"Ehr-Session": sessionId},
                    url: baseUrl + "/view/" + ehrId + "/" + "height",
                    type: 'GET',
                    success: function (res) {
                        if (res.length > 0) {
                            dataHeight = res;
                            document.getElementById('visina').value = dataHeight[0].height;
                            document.getElementById('datum').value = dataHeight[0].time.substring(0,10);
                            // BAI();
                            // BMI();
                            // console.log(dataHeight);
                        } else {
                            $("#saveFeedback").html(
                            "<span class='obvestilo label label-warning fade-in'>" +
                            "Ni podatkov!</span>");
                        }
                    },
                    error: function() {
                        $("#saveFeedback").html('<div class="panel panel-default"><div class="panel-body">' +
                            JSON.parse(err.responseText).userMessage + "</div></div>!");
                    }
                });

	    	},
	    	error: function(err) {
	    		$("#saveFeedback").html('<div class="panel panel-default"><div class="panel-body">' +
                JSON.parse(err.responseText).userMessage + "</div></div>!");
	    	}
		});
	}
}

function normalize(data, type) {
    console.log("Obdelujem podatke");
    console.log(data);
    var mesci = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
    
    var output = [];
    
    for (var i = 0; i < data.length; i++) {
        output[i] = {"label": null, "value": null};
        var mm = parseInt(data[i].time.substring(5,7))-1;
        output[i].label = mesci[mm];
        if (type == "teza") {
            output[i].value = data[i].weight;
        }
         else if (type == "mascoba") {
             output[i].value = data[i].diastolic;
         }
    }
    
    // console.log(output);
    return output;
   
}

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    
    if(dd<10) {
    dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 
    
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function BMI() {
  var teza = document.getElementById("teza").value;
  var visina = document.getElementById("visina").value/100;
  var bmi = teza/(visina*visina);
  if (!isNaN(bmi)) {
    bmi = bmi.toFixed(2);
    document.getElementById("bmi").value = bmi;
    
    if(bmi < 18.5) {
        document.getElementById('BMIfeedback').innerHTML = '<div class="alert alert-danger" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BMI ste podhranjeni</div>';
    }
    else if (bmi < 25) {
        document.getElementById('BMIfeedback').innerHTML = '<div class="alert alert-success" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BMI ste normalne teže</div>';        
    }
    else {
        document.getElementById('BMIfeedback').innerHTML = '<div class="alert alert-danger" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BMI ste predebeli</div>';          
    }
  }
}

function BAI() {
  var visina = document.getElementById("visina").value/100;
  var pas = document.getElementById("obsegPasu").value;
  var bai = pas/(Math.pow(visina, 1.5))-18;
  if (!isNaN(bai)) {
    bai = bai.toFixed(2);
    document.getElementById("bai").value = bai;
    
    if(bai < 8) {
        document.getElementById('BAIfeedback').innerHTML = '<div class="alert alert-danger" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BAI ste podhranjeni</div>';
    }
    else if (bai < 21) {
        document.getElementById('BAIfeedback').innerHTML = '<div class="alert alert-success" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BAI ste normalne teže</div>';        
    }
    else {
        document.getElementById('BAIfeedback').innerHTML = '<div class="alert alert-danger" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BAI ste predebeli</div>';          
    }
  }
}

function grafTeza() {
    FusionCharts.ready(function(){
        var podatki = [
                {
                    "label": "Jan",
                    "value": "102"
                },
                {
                    "label": "Feb",
                    "value": "101"
                },
                {
                    "label": "Mar",
                    "value": "98"
                },
                {
                    "label": "Apr",
                    "value": "98"
                },
                {
                    "label": "May",
                    "value": "101"
                },
                {
                    "label": "Jun",
                    "value": "98"
                },
                {
                    "label": "Jul",
                    "value": "95"
                },
                {
                    "label": "Aug",
                    "value": "95"
                },
                {
                    "label": "Sep",
                    "value": "92"
                },
                {
                    "label": "Oct",
                    "value": "90"
                },
                {
                    "label": "Nov",
                    "value": "91"
                },
                {
                    "label": "Dec",
                    "value": "87"
                }
            ];
        var chartTeza = new FusionCharts({
            "type": "column2d",
            "renderAt": "chartContainerTeza",
            "width": "500",
            "height": "300",
            "dataFormat": "json",
            "dataSource": {
            "chart": {
                "caption": "Spremembe Teže po mescih",
                "xAxisName": "Mesec",
                "yAxisName": "Teza[kg]",
                "theme": "fint"
            },
            "data": normalTeza
            }
        });

        chartTeza.render();
    })
}
// graf prikaza deleža maščobe
function grafMascoba() {
    FusionCharts.ready(function(){
        var podatki = [{
                "label": "Jan",
                "value": "30.5"
            }, {
                "label": "Feb",
                "value": "30.2"
            }, {
                "label": "Mar",
                "value": "29.8"
            }, {
                "label": "Apr",
                "value": "28.0"
            }, {
                "label": "Maj",
                "value": "28.5"
            }, {
                "label": "Jun",
                "value": "28.1"
            }, {
                "label": "Jul",
                "value": "28.0"
            }, {
                "label": "Aug",
                "value": "27.7"
            }, {
                "label": "Sep",
                "value": "27.2"
            }, {
                "label": "Okt",
                "value": "27.3"
            }, {
                "label": "Nov",
                "value": "27.0"
            }, {
                "label": "Dec",
                "value": "22.0"
            }];
        
        var fusioncharts = new FusionCharts({
        "type": "spline",
        "dataFormat": "json",
        "renderAt": "chartMascoba",
        "width": "500",
        "height": "300",
        "dataSource": {
            "chart": {
                "caption": "Odstotek Masčobe",
                "xAxisName": "Mesec",
                "yAxisName": "Delež Maščobe v %",

                //Cosmetics
                "lineThickness": "3",
                "paletteColors": "#008ee4,#6baa01",
                "baseFontColor": "#333333",
                "baseFont": "Helvetica Neue,Arial",
                "captionFontSize": "14",
                "subcaptionFontSize": "14",
                "subcaptionFontBold": "0",
                "showBorder": "0",
                "showValues": "0",
                "bgColor": "#ffffff",
                "showShadow": "0",
                "canvasBgColor": "#ffffff",
                "canvasBorderAlpha": "0",
                "divlineAlpha": "100",
                "divlineColor": "#999999",
                "divlineThickness": "1",
                "divLineIsDashed": "1",
                "divLineDashLen": "1",
                "divLineGapLen": "1",
                "showXAxisLine": "1",
                "xAxisLineThickness": "1",
                "xAxisLineColor": "#999999",
                "showAlternateHGridColor": "0"
            },
            "data": normalMascoba
        }
    }
    );
        fusioncharts.render();
    });
}
// graf rutine
function grafRutina() {
    // [0] - Cardio vadba; [1] - HIIT trening; [2] - počitek
    // [3] - Trening z utežmi; [4] - Fizioterapija; [5] - Anaerobna vadba;
    // [6] - trening z lastno težo
    var labels = ["Cardio vadba", "HIIT trening", "Počitek", 
                "Trening z utežmi", "Fizioterapija", "Anaerobna vadba", "Trening z lastno težo"];
    var delezi = [0,0,0,0,0,0,0];
    podatki = [];
    for (var i in ciljiArray) {
        
        if (ciljiArray[i] == "Izguba teže") {
            delezi[0] += 100;
            delezi[1] += 50;
            delezi[2] += 50;
        }
        else if (ciljiArray[i] == "Pridobitev mišične mase") {
            delezi[1] += 27;
            delezi[3] += 100;
            delezi[2] += 67;
        }
        else if (ciljiArray[i] == "Okrevanje poškodbe") {
            delezi[2] += 170;
            delezi[3] += 25; 
            delezi[4] += 230;
        }
        else if (ciljiArray[i] == "Pridobitev vzdržlivosti") {
            delezi[1] += 15;
            delezi[6] += 37;
            delezi[5] += 63;
            delezi[2] += 50;
        }
    }
    
    for (var i = 0; i < delezi.length; i++) {
        if(delezi[i] > 0) {
            podatki.push({"label":labels[i], "value": delezi[i]});
        }   
    }
    
    console.log(delezi);
    
    FusionCharts.ready(function(){
            
        var fusioncharts = new FusionCharts({
        type: 'doughnut2d',
        renderAt: 'chartRutina',
        width: '500',
        height: '300',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": "Tednska Rutina",
                "subCaption": "Predlog razdelitve aktivnosti",
                "startingAngle": "20",
                "showPercentValues": "1",
                "showPercentInTooltip": "0",
                "enableSmartLabels": "1",
                "enableMultiSlicing": "0",
                "decimals": "0",
                "useDataPlotColorForLabels": "1",
                //Theme
                "theme": "fint"
            },
            "data": podatki
        }
    }
    );
        fusioncharts.render();
    });
}