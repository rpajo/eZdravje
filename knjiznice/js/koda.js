
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
function generirajPodatke(stPacienta) {
  ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
function addCilj(){
  
  var li = document.createElement("li");
  var input = document.getElementById("ciljiInput");
  li.innerHTML = input.value;
  li.className = "list-group-item";
  if (true) {
    input.value = "";
    $("#cilji").append(li);
  }
}

function addUser() {
    sessionId = getSessionId();
    
    var ime = $("#newIme").val();
    var priimek = $("#newPriimek").val();
    var datumRojstva = $("#newDatumRojstva").val();
    var teza = $("#newTeza").val();
    var visina = $("#newVisina").val();
    var mascoba = $("#newMascoba").val();
    var kometar = $("newComment").val();
    
    if (!ime || !priimek || !datumRojstva || !teza || !visina || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#saveFeedback").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
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
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                //     $("#kreirajSporocilo").html("<span class='obvestilo " +
                        //   "label label-success fade-in'>Uspešno kreiran EHR '" +
                        //   ehrId + "'.</span>");
		                   document.getElementById('newEHR').innerHTML = ehrId;
                            console.log(ehrId);
                            document.getElementById('upload').disabled = false;
                            document.getElementById('create').disabled = true;
		                }
		            },
		            error: function(err) {
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
    console.log(ehrId.length);
	if (!ehrId || ehrId.trim().length == 0) {
		$("#saveFeedback").html("<span class='obvestilo label " +
      "label-warning fade-in'>Naložite uporabnika z ustreznim erhId</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
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
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#saveFeedback").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
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
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
                //.firstNames = ime; .lestNames = priimek; dateOfBirth = rojstvo;
				uporabnik = data.party;
                console.log(uporabnik);
				$("#saveFeedback").html('<div class="alert alert-success" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Uporabnik se je uspešno naložil</div>');
			   document.getElementById('EHRid').value = ehrId;
               document.getElementById('ime').value = uporabnik.firstNames;
               document.getElementById('priimek').value = uporabnik.lastNames;
               document.getElementById('datumRojstva').value = uporabnik.dateOfBirth.substring(0,10);
            },
			error: function(err) {
				$("#saveFeedback").html('<div class="alert alert-danger" style=" margin-bottom:0px; padding-bottom:5px; padding-top:5px" role="alert">Napaka: ' +
          JSON.parse(err.responseText).userMessage + "'!</div>");
			}
		});
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
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var uporabnik = data.party;

                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/" + "weight",
                    type: 'GET',
                    headers: {"Ehr-Session": sessionId},
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
                    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
                    type: 'GET',
                    headers: {"Ehr-Session": sessionId},
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
                    url: baseUrl + "/view/" + ehrId + "/" + "height",
                    type: 'GET',
                    headers: {"Ehr-Session": sessionId},
                    success: function (res) {
                        if (res.length > 0) {
                            dataHeight = res;
                            document.getElementById('visina').value = dataHeight[0].height;
                            document.getElementById('datum').value = dataHeight[0].time.substring(0,10);
                            BAI();
                            BMI();
                            // console.log(dataHeight);
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

	    	},
	    	error: function(err) {
	    		$("#saveFeedback").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
	    	}
		});
	}
}

function normalize(data, type) {
    console.log("Obdelujem podatke");
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
    
    console.log(output);
    return output;
   
}

function clearCreate() {
    document.getElementById('newIme').value = '';
    document.getElementById('newPriimek').value = '';
    document.getElementById('newDatumRojstva').value = '';
    document.getElementById('newTeza').value = '';
    document.getElementById('newMascoba').value = '';
    document.getElementById('newVisina').value = '';
    document.getElementById('newObsegPasu').value = '';
    document.getElementById('newComment').value = '';
    
    $('#newUser').on('hidden', function() {
        $(this).removeData('modal');
    });
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
    console.log(bmi);
    document.getElementById("bmi").value = bmi;
    
    if(bmi < 18.5) {
        document.getElementById('BMIfeedback').innerHTML = '<div class="alert alert-danger" style="margin-top:10px; margin-bottom:0px; padding-bottom:10px; padding-top:10px" role="alert">Sodeč po BMI ste podhranjeni</div>';
    }
    else if (bmi < 30) {
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
    console.log(bai);
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
    FusionCharts.ready(function(){
        var podatki = [{
                "label": "Trening z utežmi",
                "value": "20"
            }, {
                "label": "Fizioterapija",
                "value": "30"
            }, {
                "label": "Vaje za motoriko",
                "value": "10"
            }, {
                "label": "Počitek",
                "value": "40"
            }];
            
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