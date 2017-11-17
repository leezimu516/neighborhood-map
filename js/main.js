// model
var locations = [
    {title: 'University of Montreal', location: {lat: 45.504543, lng: -73.613359}},
    {title: 'Concordia University', location: {lat: 45.457843, lng: -73.641568}},
    {title: 'Université du Québec à Montréal', location: {lat: 45.512884, lng:-73.558306}}
];

// global variable
var map;
var markers = [];
var largeInfowindow;
var bounds;

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

        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        


        markers.push(marker);

        // add click listener
        marker.addListener('click', function() {
            populateInfowindow(this, largeInfowindow);
        });
    }      

};


function populateInfowindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.marker = marker;
        // infowindow.setContent(marker.title);
        // infowindow.open(map,marker);

        // make sure the marker property is clearly if the infowindow is closed
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
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

// viewmodel
var ViewModel = function() {
    var self = this;
    
    this.locationList = ko.observableArray([]);

    locations.forEach(function(loc) {
        self.locationList.push(new Location(loc));
    });
    
    this.currentLocation = ko.observable(this.locationList()[0]);

    
}

// list the location title for side bar
var Location = function(data) {
    this.title = ko.observable(data.title);
}

ko.applyBindings(new ViewModel());