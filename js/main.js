var locations = [
    {title: 'University of Montreal', location: {lat: 45.504543, lng: -73.613359}},
    {title: 'Concordia University', location: {lat: 45.457843, lng: -73.641568}},
    {title: 'Université du Québec à Montréal', location: {lat: 45.512884, lng:-73.558306}}
];


// function to initialize the map
function initMap() {
    // this.map = ko.observable(0);
    // this.marker = ko.observableArray([]);
    var map;
    var markers = [];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 45.501689, lng: -73.567256},
        zoom: 12
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

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
        infowindow.setContent(marker.title);
        infowindow.open(map,marker);

        // make sure the marker property is clearly if the infowindow is closed
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
        });
    }
};

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