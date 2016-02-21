var map;
var event_marker;

var form = {
    assistants:[],
    location:{}
};

function initMap() {
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
        center: {lat: 44.540, lng: -78.546},
        zoom: 8
    });

    google.maps.event.addListener(map, 'click', function(event) {
       placeMarker(event.latLng);
       form.location.lat = event.latLng.lat();
       form.location.lon = event.latLng.lng();
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

/*

<div class="assistant">
    <div class="col-md-3 no-padding profile_pic_container">
        <img src="grumpy.jpeg" class="profile_pic" width="75px" height="75px">
    </div>
    <div class="col-md-5 data1" style="text-align:left;">Name</div>
    <div class="col-md-5 data2" style="text-align:left;">ORI</div>
</div>

*/


$(document).ready(function(){

    $.get("/users", function(data){
        data.forEach(function(el){
            $(".list").append(
                $('<div class="assistant">').html(
                    '<div class="col-md-3 no-padding profile_pic_container">\
                        <img src="'+el.img+'" class="profile_pic" width="75px" height="75px">\
                    </div>\
                    <div class="col-md-9 data1" style="text-align:left;">'+el.name+'</div>\
                    <div class="col-md-9 data2" style="text-align:left;">'+el.location.airport+'</div>'
                ).click(function(){
                    if($(this).hasClass("active")){
                        var found = false;
                        for(var i = 0; i < form.assistants.length && !found; ++i){
                            found = form.assistants[i]._id == el._id;
                            if(found) form.assistants.splice(i,1);
                        }
                        $(this).removeClass("active");
                    } else {
                        $(this).addClass("active");
                        form.assistants.push(el);
                    }
                })
            )
        })
    });



    $("input[type=submit]").click(function(){
        form.name = $("input[name=name]").val();
        form.date = $("input[name=date]").val();
        $.post("/event/create",JSON.stringify(form),function(data){
            console.log(data);
        })
    })

});
