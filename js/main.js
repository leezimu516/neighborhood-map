// global variable
var map;
var markers = [];
var marker;
var largeInfowindow;
var bounds;
var wikiElem;
// function to initialize the map
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: locations[0].location,
        zoom: 12
    });

    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // create the marker array
    for (var i = 0; i < locations.length; i++) {
        
        var position = locations[i].location;
        var title = locations[i].title;

        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        
        // bind location with marker--bind the object created in vm
        // locations[i].marker = marker;
        vm.locationList()[i].marker = marker;
        
        
        markers.push(marker);

        // add click listener
        // marker.addListener('click', function() {
        //     populateInfowindow(this, largeInfowindow);    
        // });

        marker.addListener('click', function() {
            wikiInfo(this, largeInfowindow);    
        });



        
    } 




};

// wiki info
function wikiInfo(marker, infowindow) {
    
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        wikiElem = "failed to get wikipedia resources";
        createInfowindow(marker, infowindow);
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            var introduction = response[2][0];
            wikiElem = 
                "<h3>"+ marker.title +"</h3>" + 
                "<h5>"+ introduction +"</h5>" + 
                "<a href='https://en.wikipedia.org/wiki/" + marker.title +"'>Link to Wikipedia Page</a>";
            
            createInfowindow(marker, infowindow);
            clearTimeout(wikiRequestTimeout);
        }
    });

    
}

// open infowindow for wiki
function createInfowindow(marker, infowindow) {
    infowindow.setContent(wikiElem);
    infowindow.open(map, marker);
}
//google street view
function populateInfowindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.marker = marker;
        // infowindow.setContent(marker.title);
        // infowindow.open(map,marker);

        // make sure the marker property is clearly if the infowindow is closed
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });


        // add street view
        var streetViewService =  new google.maps.StreetViewService();
        var radius = 50;

        function getStreetView(data, status) {
            if (status === 'OK') {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);

                infowindow.setContent('<div>' + marker.title +'</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,

                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };

                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div' + 
                      '<div>No Street View Found</div>');
                
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
    }
}


// list the location title for side bar
var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);


}


// viewmodel
var ViewModel = function() {
    var self = this;
    
    this.locationList = ko.observableArray([]);

    locations.forEach(function(loc) {
        self.locationList.push(new Location(loc));
    });

    this.currentLocation = ko.observable(this.locationList()[0]);
    
    self.showMarker = function(clickedLocation) {     
        google.maps.event.trigger(clickedLocation.marker, 'click');
        

    }
    
}

var vm  = new ViewModel();
ko.applyBindings(vm);