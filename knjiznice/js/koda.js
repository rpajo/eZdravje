
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
  sessionId = getSessionId();
  
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
  var ime = $("#newIme").val();
	var priimek = $("#newPriimek").val();
	var datumRojstva = $("#newDatumRojstva").val();
  var teza = $("#newTeza").val();
  var visina = $("#newVisina").val();
  var misicnaMasa = $("#newMisicnaMasa").val();
  var kometar = $("newComment")
}

function BMI() {
  var teza = document.getElementById("teza").value;
  var visina = document.getElementById("visina").value/100;
  var bmi = teza/(visina*visina);
  if (!isNaN(bmi)) {
    bmi = bmi.toFixed(2);
    console.log(bmi);
    document.getElementById("bmi").value = bmi;
  }
}

FusionCharts.ready(function(){
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
          "data": [
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
           ]
        }
    });

    chartTeza.render();
})
// graf prikaza mišične mase
FusionCharts.ready(function(){
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
        "data": [{
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
        }]
    }
}
);
    fusioncharts.render();
});

// graf rutine
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
        "data": [{
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
        }]
    }
}
);
    fusioncharts.render();
});