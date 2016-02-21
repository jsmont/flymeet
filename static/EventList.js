var map;
var event_marker;

function initMap() {
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
      center: {lat: 44.540, lng: -78.546},
      zoom: 8
    });
}

function placeMarker(location) {
    if(typeof event_marker == "undefined"){
        event_marker = new google.maps.Marker({
            position: location,
            map: map
        });
    } else {
        event_marker.setPosition(location);
    }
}

$(document).ready(function(){
    $.get("/events", function(data){
        data.forEach(function(el){
            $("#event_list .row").append(
                $('<div class="event">').html(
                    '<div class="event_row col-md-8">'+el.name+'&nbsp;<label class="empty_full">&#989'+ (el.stats.num_assistants == el.stats.num_confirmed? 8 : 9) +'</label></div>\
                    <div class="col-md-4" style="text-align:right;">'+(new Date(el.date)).toLocaleDateString()+'</div>'
                ).click(function(){
                    if(!$(this).hasClass("active")){
                        $(".event.active").removeClass("active");
                        $(this).addClass("active");
                        changeContent(el);
                    }
                })
            )
        });
    });
});


function changeContent(ev){
    $("#main").slideToggle(400,function(){

    $(".event_name").text(ev.name);
    $(".date").text((new Date(ev.date)).toLocaleDateString());

    $(".assistant_list .list").html("");
    ev.assistants.forEach(function(el){
        $(".assistant_list .list").append(
            $('<div class="assistant">').html(
                '<div class="col-md-3 no-padding profile_pic_container">\
                    <img src="'+el.img+'" class="profile_pic" width="75px" height="75px">\
                </div>\
                <div class="col-md-5 data1" style="text-align:left;">'+el.name+'&nbsp<label class="yes_no">&#1000'+(el.meta.status.toLowerCase() != "pending"?4:8)+'</label></div>\
                <div class="col-md-5 data2">'+el.location.airport+'<!-- 00:00 &#9992 DES 00:00--></div>'
            ).click(function(){
                if($(this).hasClass("active")){
                    $(this).removeClass("active");
                } else {
                    $(".assistant.active").removeClass("active");
                    $(this).addClass("active");
                    var p = new google.maps.LatLng(el.location.lat, el.location.lon);
                    placeMarker(p);
                    map.setCenter(p);

                }
            })
        )
    });

    var p = new google.maps.LatLng(ev.location.lat, ev.location.lon);
    placeMarker(p);
    map.setCenter(p);

    $("#main").slideToggle();
});
}
