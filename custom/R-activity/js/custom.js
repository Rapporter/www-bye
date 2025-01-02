$(document).ready(function() {

    // remove placeholder if we are in a browser
    if (Modernizr.svg) {
	$('#placeholder').hide();
    } else {
	$('.warning').show();
	$('.warning').animate({top:"0"}, 500).click(function(){
	    $('.warning').hide();
	});
	$('#header, #info-container, #container, #overlay').hide();
	$('#info-button a').css('right', '-175px').text('!');
    }
    
    $(window).on('load resize', function(evt){
	updateWindow();
    });
    
    // slider
    var slider_value = location.hash.substr(1).split("/")[1];
    if (slider_value === undefined || !$.isNumeric(slider_value) || parseInt(slider_value) < 1 || parseInt(slider_value) > 8) {
	slider_value = 3;
    };
    $("#slider").slider({
	value: slider_value,
	min: 1,
	max: 8,
	step: 1
    })
	.each(function() {
	    var opt = $(this).data().uiSlider.options;
	    var vals = opt.max - opt.min;
	    for (var i = 0; i <= vals; i++) {
		var el = $('<label>'+(i+1)+'</label>').css('left',(i/vals*100)+7+'%');
		$("#slider").append(el);
	    }
	});

    // hash or default value
    if (location.hash == '') {
	location.hash = "#score/6";
	$('#dropdown option[value="score"]').attr('selected', 'selected');
    } else {
	var field = lookup[location.hash.substr(1).split("/")[0]];
	if (field === undefined) {
	    field = lookup['n'];
	};
	$('#dropdown option[value="' + field.id + '"]').attr('selected', 'selected');
    };

    // dropdown menu
    $("#scale").select2({
	placeholder: "Choose a scale!",
        allowClear: true,
	width: "200px"
    });
    // $("#scale").on("change", function(e) {
    // 	closeMenu();
    // });

    // verify that everything is kind of OK
    if ($("#scale").select2("val") == '')
	$("#scale").select2("val", "score");
    updateHash();

    // tooltips
    $('.form').tooltip({position: {my: "right-10 center+25", at: "left center"}});
    $('#logo').tooltip({position: {my: "bottom+30 center+50", at: "bottom center"}});
    $('#aboutlogo').tooltip({position: {my: "top-30 center-40", at: "top center"}});
    $('#variable-label').tooltip({position: {my: "top+20"}});

    // open/close menu
    $('#header').on("click mouseenter", function() {
	if (typeof(closeMenuTimer) !== 'undefined')
	    clearTimeout(closeMenuTimer);
	openMenu();
    });
    $('#header').on("mouseleave", function() {
	if ($('.select2-drop').css('display') == 'none')
	    closeMenuTimer = setTimeout(function(){
		closeMenu();
	    }, 300);
    });

    // btn
    $('#header .button').click(function(e){
	e.preventDefault();
	closeMenu();
    });
    $('#variable-label').click(function(e){
	e.preventDefault();
	$('#variable-label').css('display', 'none');
    });

    // info modal
    $('.info').on("click", function(e){
	e.preventDefault();
	$("#overlay").css('display', 'block');
	$("#overlay img").css('display', 'none');
	$("#about").css('display', 'block');
	ga('send', 'pageview',{'page': location.pathname + '#about'});
    });
    $('.close').on("click", function(e){
	e.preventDefault();
	$("#overlay").css('display', 'none');
	$("#overlay img").css('display', '');
	$("#about").css('display', 'none');
	ga('send', 'pageview',{'page': location.pathname + location.hash});
    });
    $('#overlay').on("click", function(e){
	e.preventDefault();
	if ($("#about").css('display') == 'block') {
	    $("#overlay").css('display', 'none');
	    $("#overlay img").css('display', '');
	    $("#about").css('display', 'none');
	    ga('send', 'pageview',{'page': location.pathname + location.hash});
	}
    });
    
    // do the magic
    window.onhashchange = function() {
	closeMenu();
    	parseHash();
    };

    // callback handler for form submit
    $("#subscribe-form").submit(function(e)
    {
	$('#visits').val(cread()[0]);
	$('#clicks').val(cread()[1]);
	$('#time').val(((Date.now() - start) / 1000).toFixed(0));

        var postData = $(this).serializeArray();
        var formURL = $(this).attr("action");
        var required_ele = document.getElementsByClassName('required');
        var parsley_error = document.getElementsByClassName('parsley-error-list');
        var allfilled = true;
        for (var i = 0; i < required_ele.length; ++i) {
            var item = required_ele[i];
            if(item.value.length==0){
                allfilled = false;
            }
        }
        if (allfilled && parsley_error.length === 0) {
	    $('#form-submit').prop('disabled', true);
	    $('#form-submit').addClass('btn-disabled');
            $.ajax(
                {
                    url : formURL,
                    type: "POST",
                    data : postData
                })
                .done(function() {
                    $('form#subscribe-form').animate({
                        opacity: 0,
                        marginTop: "-550px"
                    }, 500, function() {
                        $('.thanks').show();
                    });
                    setTimeout(function () {
                        $('#modal-subscribe').modal('hide');
                    }, 4000);
		    ga('send', 'pageview',{'page': location.pathname + '#register-complete'});
		    ga('send', 'pageview',{'page': location.pathname + location.hash});
                })
		.fail(function() {
                    $('form#subscribe-form').animate({
                        opacity: 0,
                        marginTop: "-550px"
                    }, 500, function() {
                        $('.ajaxerror').show();
                    });
                    setTimeout(function () {
                        $('#modal-subscribe').modal('hide');
			setTimeout(function () {
			    $('#form-submit').prop('disabled', false);
			    $('#form-submit').removeClass('btn-disabled');
			    $('form#subscribe-form').css('margin-top', 0).css('opacity', 1);
                            $('.ajaxerror').hide();
			}, 1000);
		    }, 4000);
		    ga('send', 'pageview',{'page': location.pathname + '#register-failed'});
		    ga('send', 'pageview',{'page': location.pathname + location.hash});
		});
        } else {
	    ga('send', 'pageview',{'page': location.pathname + '#register-error'});
	}
        e.preventDefault(); //STOP default action
    });
    $('.modal').on('click', function(e) {
	if (e.target === this) {
	    ga('send', 'pageview',{'page': location.pathname + '#register-cancel'});
	    setTimeout(function () {
		ga('send', 'pageview',{'page': location.pathname + location.hash});
	    }, 1000);
	}
    });
    $('.modal-header .close').on('click', function(e) {
	ga('send', 'pageview',{'page': location.pathname + '#register-cancel'});
	setTimeout(function () {
	    ga('send', 'pageview',{'page': location.pathname + location.hash});
	}, 1000);
    });

    // visits, clicks
    cvisit();
    $(document).click(function() {
	cclick();
    });
    start = Date.now();

});

// cookie helpers
function ccheck() {
    if (jQuery.cookie('www-cartogram') === undefined)
	jQuery.cookie('www-cartogram', '0|0', {expires: 7});
}
function cread() {
    return jQuery.cookie('www-cartogram').split("|");
}
function cwrite(r) {
    jQuery.cookie('www-cartogram', r);
}
function cvisit() {
    ccheck();
    var c = cread();
    cwrite([parseInt(c[0]) + 1, c[1]].join('|'));
}
function cclick() {
    ccheck();
    var c = cread();
    cwrite([c[0], parseInt(c[1]) + 1].join('|'));
}

//navigation helpers
function openMenu() {
    $('#header').stop()
	.animate(
	    {marginTop: 0},
	    300,
	    "easeInCirc",
	    function() {
		$('#logo').html('<a href="http://rapporter.net" target="_blank"><img src="http://rapporter.net/assets/powered-by.png" width="150px" alt="rapporter.net" title="This project was sponsored by Rapporter."></a>');
	    }).addClass('animated');
};
function closeMenu() {
    updateHash();
    $('#header').stop().animate(
	{marginTop: -165},
	300,
	"easeInCirc",
	function() {
	    $('#logo').html('<div class="triangle-with-shadow"></div>');
	}).addClass('animated');
};

function updateHash() {
    var v = $('#scale').select2("val");
    if (v === undefined || v == '')
	v = 'n';
    var s = $('#slider').slider('value');
    location.hash = "#" + v + '/' + s;
};

var width = parseInt(d3.select('#map').style('width'))
, mapRatio = 0.42
, height = width * mapRatio;

function updateWindow(){

    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    d3.select("#map").attr("viewBox", '0 0 ' + width + ' ' + height);
    d3.select("#background-map").attr("viewBox", '0 0 ' + width + ' ' + height);

    d3.select("#bg").style("margin-top", ((y - $('#map').height())/2 + 20) + "px");
    d3.select("#map-container").style("margin-top", '-' + $('#map-container').css('height'));

    $('#header').css({ marginLeft : ($(window).width() - 286) / 2 });
    $('#info-button').css('top', (y - 275)/2+'px');
}

var percent = (function() {
    var fmt = d3.format(".2f");
    return function(n) { return fmt(n) + "%"; };
})();

// fields definition
var fields = [
    {name: "Default scale", id: "default", key: "default", format: percent},
    {name: "Land (ha)", id: "land", key: "land"},
    {name: "Land total (ha)", id: "land_total", key: "land_total"},
    {name: "Population", id: "population", key: "population"},
    // scores
    {name:  "<b>Population weighted global R score</b>: the scaled average of the number of R conference attendees, R Foundation and RUG members, R-bloggers.com visits and CRAN downloads per 1,000 people. ", id: "score", key: "score"},
    {name:  "<b>Population weighted R Foundation score</b>: the number of ordinary,<br>supporting, donor and benefactor members per 1,000 people.", id: "score_rfoundation", key: "score_rfoundation"},
    {name:  "<b>Population weighted conference activity score</b>: the number of attendees <br>at the annual useR! conferences per 1,000 people.", id: "score_user", key: "score_user"},
    {name:  "<b>Population weighted R User Group activity score</b>:<br>the number of R meetup members per 1,000 people.", id: "score_meetup", key: "score_meetup"},
    {name:  "<b>Population weighted CRAN activity score</b>:<br>the number of package downloads from the RStudio CDN per 1,000 people.", id: "score_cran", key: "score_cran"},
    {name:  "<b>Google Trends search activity</b>:<br>the average of the relative percent of search activities on various R-related keywords.", id: "score_search", key: "score_search"},
    {name:  "<b>Population weighted R-bloggers activity</b>:<br>the number of page visits  per 1,000 people.", id: "score_rbloggers", key: "score_rbloggers"},
    {name:  "<b>R programming activity</b>:<br>the proportion of the most active 1,000 GitHub users with at least one R repository per country.", id: "score_programmers", key: "score_programmers"},
    // G trends
    {name: "Google Trends search activity on <b>R</b> as a programming language.<br>Google return these values as percentages relative to the country with the most search queries.", id: "gtrends_R", key: "gtrends_R"},
    {name: "Google Trends search activity on <b>CRAN</b>.<br>Google return these values as percentages relative to the country with the most search queries.", id: "gtrends_CRAN", key: "gtrends_CRAN"},
    {name: "Google Trends search activity on <b>ggplot</b>.<br>Google return these values as percentages relative to the country with the most search queries.", id: "gtrends_ggplot", key: "gtrends_ggplot"},
    {name: "Google Trends search activity on <b>R graphics</b>.<br>Google return these values as percentages relative to the country with the most search queries.", id: "gtrends_R_graphics", key: "gtrends_R_graphics"},
    {name: "Google Trends search activity on <b>R books</b>.<br>Google return these values as percentages relative to the country with the most search queries.", id: "gtrends_R_books", key: "gtrends_R_books"},
    // RUG
    {name: "R User Group activity based on the <b>number of R meetup</b>(s).", id: "meetup_n", key: "meetup_n"},
    {name: "R User Group activity based on the <b>number of members</b> at the R meetup(s).", id: "meetup_members", key: "meetup_members"},
    // useR!
    {name: "Conference activity based on the number of attendees at <b>useR! 2004</b> (Vienna, Austria).", id: "user_2004", key: "user_2004"},
    {name: "Conference activity based on the number of attendees at <b>useR! 2006</b> (Vienna, Austria).", id: "user_2006", key: "user_2006"},
    {name: "Conference activity based on the number of attendees at <b>useR! 2008</b> (Dortmund, Germany).", id: "user_2008", key: "user_2008"},
    {name: "Conference activity based on the number of attendees at <b>useR! 2009</b> (Rennes, France).", id: "user_2009", key: "user_2009"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2010</b> (Gaithersburg, MD, USA).", id: "user_2010", key: "user_2010"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2011</b> (Coventry, UK).", id: "user_2011", key: "user_2011"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2012</b> (Nashville, TN, USA).", id: "user_2012", key: "user_2012"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2013</b> (Albacete, Spain).", id: "user_2013", key: "user_2013"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2014</b> (Los Angeles, USA).", id: "user_2014", key: "user_2014"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! 2015</b> (Aalborg, Denmark).", id: "user_2015", key: "user_2015"},
    {name: "Conference activity based on the number of attendees at<br><b>useR! conferences</b> (All time).", id: "user_all", key: "user_all"},
    // R Foundation
    {name: "Number of <b>Benefactors</b> in the R Foundation.", id: "rfoundation_Benefactors", key: "rfoundation_Benefactors"},
    {name: "Number of <b>Donors</b> in the R Foundation.", id: "rfoundation_Donors", key: "rfoundation_Donors"},
    {name: "Number of <b>Supporting Institutions</b> in the R Foundation.", id: "rfoundation_Supporting-Institutions", key: "rfoundation_Supporting-Institutions"},
    {name: "Number of <b>Supporting Members</b> in the R Foundation.", id: "rfoundation_Supporting-Members", key: "rfoundation_Supporting-Members"},
    {name: "Number of <b>Ordinary Members</b> in the R Foundation.", id: "rfoundation_Ordinary-Members", key: "rfoundation_Ordinary-Members"},
    // CRAN
    {name: "Number of <b>packages</b> downloaded from the cloud CRAN servers.", id: "CRAN_all", key: "CRAN_all"},
    {name: "Number of times <b>ggplot2</b> was downloaded from the cloud CRAN servers.", id: "CRAN_ggplot2", key: "CRAN_ggplot2"},
    {name: "Number of times <b>devtools</b> was downloaded from the cloud CRAN servers.", id: "CRAN_devtools", key: "CRAN_devtools"},
    {name: "Number of times <b>knitr</b> was downloaded from the cloud CRAN servers.", id: "CRAN_knitr", key: "CRAN_knitr"},
    {name: "Number of times <b>RODBC</b> was downloaded from the cloud CRAN servers.", id: "CRAN_RODBC", key: "CRAN_RODBC"},
    {name: "Number of times <b>Rcmdr</b> was downloaded from the cloud CRAN servers.", id: "CRAN_Rcmdr", key: "CRAN_Rcmdr"},
    // other
    {name: "The proportion of the most active 1,000 <b>GitHub</b> users with at least one R repository per country.", id: "github", key: "github"},
    {name: "The number of page visits on <b>R-bloggers.com</b>.", id: "R-bloggers", key: "R-bloggers"}
];

// read field from hash to provide a lookup array
var lookup = {};
for (var i = 0, len = fields.length; i < len; i++) {
    lookup[fields[i].id] = fields[i];
};
var field = (location.hash == '') ? fields[1] : lookup[location.hash.substr(1)];

// colors
colors = colorbrewer.RdBu[3]
//colors = ["rgb(248,105,77)", "rgb(247,247,247)", "rgb(0,136,204)"]
    .map(function(rgb) { return d3.hsl(rgb); });

var body = d3.select("body"),
stat = d3.select("#status");

var map = d3.select("#map"),
bg = d3.select("#background-map"),
zoom = d3.behavior.zoom()
    .translate([-38, 32])
    .scale(.94)
    .scaleExtent([0.5, 10.0])
    .on("zoom", updateZoom),
layer = map.append("g")
    .attr("id", "layer"),
countries = layer.append("g")
    .attr("id", "countries")
    .selectAll("path"),
bglayer = bg.append("g")
    .attr("id", "background-layer"),
bgcountries = bglayer.append("g")
    .attr("id", "background-countries")
    .selectAll("path");

// tips
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .direction(function(d) {
	if (d.properties.CODE == 840)
	    return 'e';
	if ([36, 598, 392, 540, 90, 729, 148, 548, 242].indexOf(parseInt(d.properties.CODE)) > -1)
	    return 'w';
	if ([554].indexOf(parseInt(d.properties.CODE)) > -1)
	    return 'nw';
	return (d.properties.latitude > 10) ? 's' : 'n';
    })
    .html(function(d) {
	var f = d3.format("0,000");
	var f0 = function(n) { return f(d3.round(n)); };
	var f2 = d3.format(".2f");
	var f4 = d3.format(".4f");
	var f8 = d3.format(".8f");
	var fp = function(n) { return f2(n) + "%"; };
	var estimate_note = (parseInt(d.properties.NA) == 1) ? '<p class="note">Please note that these numbers are not real, but show the average of the nearest 3 countries.</p>' : '';
    	return '<p><strong>' + d.properties.NAME + '</strong> <img src="images/flags/' + d.properties.ISO2C + '.png">' + 
	    // '<p style="color:grey;margin-top:-10px;font-size:85%;line-height:11px;">[' + d3.round(d.properties.latitude, 4) + ', ' + d3.round(d.properties.longitude, 4) + ']</p>' +
	    '<div class="longitude">[ ' + d3.round(d.properties.longitude, 4) + ' ]</div>' + 
	    '<div class="latitude">[ ' + d3.round(d.properties.latitude, 4) + ' ]</div>' + 
	    '</p>' +
	    '<div class="tooltipColumn">' + 
	    
	    '<div class="table">' + 
	    '<span>Population (n)</span><span>' + (d.properties.CODE == 10 ? (f0(Math.random()*5000) + ' penguins') : f(d.properties.population)) + '</span><p class="sep"><br /></p>' +
	    '<span>' + (d.properties.CODE == 10 ? 'Ice' : 'Land') + ' (sq km)</span><span>' + f(d.properties.land)  + '</span><br />' +
	    '<span>' + (d.properties.CODE == 10 ? 'Non-ice' : 'Water') + ' (sq km)</span><span>' + f(d.properties.water)  + '</span><br />' +
	    '<span>Total territory (sq km)</span><span>' + f(d.properties.land_total)  + '</span>' + 
	    '<p class="sep"><br /></p>'+
	    '</div>' +

	    // R Foundation
	    '<p class="subtitle">R Foundation members</p>' +

	    '<div class="table">' + 
	    '<span>Benefactors</span><span>' + f0(d.properties['rfoundation_Benefactors'])  + '</span><br />' +
	    '<span>Donors</span><span>' + f0(d.properties['rfoundation_Donors'])  + '</span><br />' +
	    '<span>Supporting Institutions</span><span>' + f0(d.properties['rfoundation_Supporting-Institutions'])  + '</span><br />' +
	    '<span>Supporting Members</span><span>' + f0(d.properties['rfoundation_Supporting-Members'])  + '</span><br />' +
	    '<span>Ordinary Members</span><span>' + f0(d.properties['rfoundation_Ordinary-Members'])  + '</span><br />' +
	    '</div>' +

	    // useR! attendees
	    '<p class="subtitle">useR! attendees</p>' +

	    '<div class="table">' + 
	    '<span>2004 (Vienna, Austria)</span><span>' + f0(d.properties['user_2004'])  + '</span><br />' +
	    '<span>2006 (Vienna, Austria)</span><span>' + f0(d.properties['user_2006'])  + '</span><br />' +
	    // '<span>2007 (Ames, IA, USA)</span><span>' + f0(d.properties['user_2007'])  + '</span><br />' + // no data for useR! 2007 :(
	    '<span>2008 (Dortmund, Germany)</span><span>' + f0(d.properties['user_2008'])  + '</span><br />' +
	    '<span>2009 (Rennes, France)</span><span>' + f0(d.properties['user_2009'])  + '</span><br />' +
	    '<span>2010 (Gaithersburg, MD, USA)</span><span>' + f0(d.properties['user_2010'])  + '</span><br />' +
	    '<span>2011 (Coventry, UK)</span><span>' + f0(d.properties['user_2011'])  + '</span><br />' +
	    '<span>2012 (Nashville, TN, USA)</span><span>' + f0(d.properties['user_2012'])  + '</span><br />' +
	    '<span>2013 (Albacete, Spain)</span><span>' + f0(d.properties['user_2013'])  + '</span><br />' +
            '<span>2014 (Los Angeles, USA)</span><span>' + f0(d.properties['user_2014'])  + '</span><br />' +
	    '<span>2015 (Aalborg, Denmark)</span><span>' + f0(d.properties['user_2015'])  + '</span><br />' +
	    '</div>' +

	    // RUG-meetups
	    '<p class="subtitle">R User Groups</p>' + 

	    '<div class="table">' + 
	    '<span>R meetups (members)</span><span>' + f0(d.properties['meetup_n']) + ' (' + f0(d.properties['meetup_members']) + ')</span><br />' +
//	    '<span>Members</span><span>' + f0(d.properties['meetup_members'])  + '</span><br />' +
	    '</div>' +

	    // other stats
	    '<p class="subtitle">Other statistics</p>' +

	    '<div class="table">' + 
	    '<span>R-bloggers.com visits</span><span>' + f0(d.properties['R-bloggers'])  + '</span><br />' +
	    '<span>GitHub users</span><span>' + fp(d.properties['github']/10)  + '</span><br />' +
	    '</div>' +

	    '</div>' +
	    '<div class="tooltipColumn">' +
	    
            // scoRe
	    '<div id="rscore">' + 
	    '<img src="images/R.png">ANK: ' + f0(d.properties['rank']) + '.' +
	    '</div>' + 	

	    // scores
	    '<div class="table" style="padding-top:10px;margin-bottom:-7px;">' + 
	    '<span>Population weighted scoRe</span><span>' + f4(d.properties['score'])  + '</span><br />' +
	    '</div>' +

	    '<p class="sep"><br /></p>'+

	    '<p class="subtitle">per 1,000 people</p>' + 
	    '<div class="table">' + 
	    '<span>R Foundation members</span><span>' + f8(d.properties['score_rfoundation'])  + '</span><br />' +
	    '<span>Conference attendees</span><span>' + f8(d.properties['score_user'])  + '</span><br />' +
	    '<span>CRAN downloads</span><span>' + f8(d.properties['score_cran'])  + '</span><br />' +
	    '<span>RUG members</span><span>' + f8(d.properties['score_meetup'])  + '</span><br />' +
	    '<span>R-bloggers visits</span><span>' + f8(d.properties['score_rbloggers'])  + '</span><br />' +
	    '</div>' +

	    '<p class="sep" style="margin-top:-5px;margin-bottom:6px;"><br /></p>'+

	    // CRAN
	    '<p class="subtitle">CRAN ' + (d.properties.CODE == 10 ? 'uploads' : 'downloads') + '</p>' + 

	    '<div class="table">' + 
  	    '<span>2013</span><span>' + f0(d.properties['CRAN_all'])  + '</span><br />' +
	    '<span>2014</span><span>' + f0(d.properties['CRAN_all'])  + '</span><br />' +
	    '<span>ggplot2</span><span>' + f0(d.properties['CRAN_ggplot2'])  + '</span><br />' +
	    '<span>devtools</span><span>' + f0(d.properties['CRAN_devtools'])  + '</span><br />' +
	    '<span>knitr</span><span>' + f0(d.properties['CRAN_knitr'])  + '</span><br />' +
	    '<span>RODBC</span><span>' + f0(d.properties['CRAN_RODBC'])  + '</span><br />' +
	    '<span>Rcmdr</span><span>' + f0(d.properties['CRAN_Rcmdr'])  + '</span><br />' +
	    '</div>' +


	    // Google Trends
	    '<p class="subtitle">Google Trend searches</p>' + 

	    '<div class="table">' + 
	    '<span>Average</span><span>' + fp(d.properties['score_search'])  + '</span><br />' +
	    '<span>R</span><span>' + fp(d.properties['gtrends_R'])  + '</span><br />' +
	    '<span>CRAN</span><span>' + fp(d.properties['gtrends_CRAN'])  + '</span><br />' +
	    '<span>ggplot</span><span>' + fp(d.properties['gtrends_ggplot'])  + '</span><br />' +
	    '<span>R graphics</span><span>' + fp(d.properties['gtrends_R_graphics'])  + '</span><br />' +
	    '<span>R books</span><span>' + fp(d.properties['gtrends_R_books'])  + '</span><br />' +
	    '</div>' +

	    '</div>' +
	    // estimate_note +
	    // '<span style="color:grey;">(' + d.properties.CODE + ')</span>' +
	    // '</div>';
	    '';
    });

updateZoom();
function updateZoom() {
    var scale = zoom.scale();
    layer.attr("transform",
               "translate(" + zoom.translate() + ") " +
               "scale(" + [scale, scale] + ")");
    bglayer.attr("transform",
		 "translate(" + zoom.translate() + ") " +
		 "scale(" + [scale, scale] + ")");
}

var proj = d3.geo.equirectangular()
    .scale(width/5.5)
    .translate([width / 2, height / 2])
    .precision(.1);

var topology,
geometries,
rawData,
dataById = {},
carto = d3.cartogram()
    .projection(proj)
    .iterations(6)
    .properties(function(d) {
        return dataById[d.id];
    })
    .value(function(d) {
        return +d.properties[field];
    });
carto1 = d3.cartogram()
    .projection(proj)
    .iterations(1)
    .properties(function(d) {
        return dataById[d.id];
    })
    .value(function(d) {
        return +d.properties[field];
    });

// load data
d3.json("data/world-110m.json", function(topo) {
    topology = topo;
    geometries = topology.objects.countries.geometries;
    d3.csv("data/Rstats_2015.csv", function(data) {
        rawData = data;
        dataById = d3.nest()
            .key(function(d) { return d.CODE; })
            .rollup(function(d) { return d[0]; })
            .map(data);
        init();
    });
});

function init() {

    var path = d3.geo.path()
        .projection(proj);
    
    var features = carto1.features(topology, geometries);

    // bg
    var graticule = d3.geo.graticule();
    d3.select('#background-layer').append("path")
        .datum(graticule)
    	.attr("class", "graticule")
        .attr("d", path);
    bgcountries = bgcountries.data(features)
        .enter()
        .append("path")
        .attr("class", "bgcountry")
        .attr("fill", "#ccc")
        .attr("id", function(d) {
            return d.properties.NAME;
        })
        .attr("d", path);

    // map
    countries = countries.data(features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("id", function(d) {
            return d.properties.NAME;
        })
        .attr("fill", "#fafafa")
        .attr("d", path);
    
    parseHash();
    
}

function update() {

    var v = $('#scale').select2("val");
    var s = $('#slider').slider('value');

    var field = lookup[location.hash.substr(1).split("/")[0]];
    var key = field.key;

    // show label
    $('#variable-label').css('display', 'none');
    $('#variable-label').html('<div id="variable-label-close">Click to hide this (x)</div>' + field.name + '<div id="variable-label-legend">Red values indicate low, the intensity of blue refers to high values.</div>').css('display', 'block');
    
    var carto = d3.cartogram()
	.projection(proj)
	.iterations(s)
	.properties(function(d) {
            return dataById[d.id];
	})
	.value(function(d) {
            return +d.properties[field];
	});
    
    var start = Date.now();
    body.classed("updating", true);
    
    var fmt = (typeof field.format === "function")
        ? field.format
        : d3.format(field.format || ","),
    value = function(d) {
        return +d.properties[key];
    },
    values = countries.data()
        .map(value)
        .filter(function(n) {
            return !isNaN(n);
        })
        .sort(d3.ascending),
    lo = values[0],
    hi = values[values.length - 1];

    var color = d3.scale.linear()
        .range(colors)
        .domain([lo, d3.mean(values), hi]);

    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);

    // tell the cartogram to use the scaled values
    carto.value(function(d) {
	// return isNaN(value(d)) ? 60000000 : scale(value(d));
	// return value(d) == 0 ? d3.mean(values) : scale(value(d));
	// return value(d) == 0 ? false : scale(value(d));
        return scale(value(d));
    });
    carto1.value(function(d) {
        return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = (field.id == 'default') ? carto1(topology, geometries).features : carto(topology, geometries).features;

    // fix Russia & others
    features.map(function (o){
        if (o.id == 643 || o.id == 242) {
            for (i = 0; i < o.geometry.coordinates.length; i++) {
		priorLng = 0;
		for (j = 0; j < o.geometry.coordinates[i][0].length; j++) {
                    if (o.geometry.coordinates[i][0][j][0] == 0) {
			o.geometry.coordinates[i][0][j][0] = 1000;
                    } else if (o.geometry.coordinates[i][0][j][0] < 0) {
			o.geometry.coordinates[i][0][j][0] = width-o.geometry.coordinates[i][0][j][0];
                    } else {
			priorLng = o.geometry.coordinates[i][0][j][0];
                    }
		}
            }
        }
    });

    // update the data
    countries.data(features)
        .select("title")
        .text(function(d) {
            return [d.properties.NAME, fmt(value(d))].join(": ") + '\n';
        });
    countries.transition()
        .duration(750)
        .ease("linear")
        .attr("fill", function(d) {
            return color(value(d));
        })
        .attr("d", carto.path);

    $('#overlay').fadeOut(400);

    var delta = (Date.now() - start) / 1000;
    stat.text(["calculated in", delta.toFixed(1), "seconds"].join(" "));
    body.classed("updating", false);
    updateWindow();
    var vl = $('#variable-label').text().length;
    vl = vl < 70 ? 70 : vl;
    // $('#variable-label').fadeOut(vl * 70);
    $('#status').fadeOut(5000);

    // tip
    d3.select('#map').call(tip);
    d3.select('#map').selectAll(".country")
    	.on('mouseover', tip.show)
   	.on('mouseout', tip.hide);

    ga('send', 'pageview',{'page': location.pathname + location.hash});
}

var deferredUpdate = (function() {
    var timeout;
    return function() {
        var args = arguments;
        clearTimeout(timeout);
	$('#status').fadeIn("slow");
        stat.text("calculating...");
        return timeout = setTimeout(function() {
            update.apply(null, arguments);
        }, 10);
    };
})();

var hashish = d3.selectAll("a.hashish")
    .datum(function() {
        return this.href;
    });

function parseHash() {
    $('#overlay').fadeIn(0);
    var parts = location.hash.substr(1).split("/"),
    desiredFieldId = parts[0],
    field = lookup[desiredFieldId] || fields[1];
    deferredUpdate();
    hashish.attr("href", function(href) {
        return href + location.hash;
    });
};
