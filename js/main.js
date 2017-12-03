// global variable
var map;
var markers = [];
var marker;
var largeInfowindow;
var bounds;
var wikiElem;



function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: initLocations[0].location,
        zoom: 12
    });

    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();

    // style the marker icon
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('ffff24');

    // create the marker array
    for (var i = 0; i < initLocations.length; i++) {
        
        var position = initLocations[i].location;
        var title = initLocations[i].title;

        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            id: i
        });
        marker.setIcon(defaultIcon);
        
        // bind location with marker--bind the object created in vm
        initLocations[i].marker = marker;
        // vm.locationList()[i].marker = marker;
        
        
        
        markers.push(marker);

        // add click listener
        // marker.addListener('click', function() {
        //     populateInfowindow(this, largeInfowindow);    
        // });

        marker.addListener('click', function() {
            wikiInfo(this, largeInfowindow); 
            // add debounce animation to maker when click
            toggleBounce(this);
        });

        // two listener for changing the marker icon color
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
   
    } 
ko.applyBindings(new ViewModel());
};

// marker bounce animation
function toggleBounce(marker) {
    if (this.marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    setTimeout(function() {
        marker.setAnimation(null)
    }, 3000);
}

// wiki info
function wikiInfo(marker, infowindow) {
    
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
        wikiElem = "failed to get wikipedia resources";
        createInfowindow(marker, infowindow);
    }, 1000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            var introduction = response[2][0];
            wikiElem = 
                "<h3>"+ marker.title +"</h3>" + 
                "<h4>"+ introduction +"</h4>" + 
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


// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));

    return markerImage;
}



// google map error handling
function googleMapError() {
    alert("something goes wrong with Google Maps");
    var mapDiv = document.getElementById('map');
    var errorDiv = document.createElement('p');
    errorDiv.innerHTML = "something goes wrong with Google Maps";
    mapDiv.appendChild(errorDiv);

    sideDiv = document.getElementById("side-bar");
    sideDiv.innerHTML = '';
}

// list the location title for side bar
var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.marker = data.marker;

}


// viewmodel
var ViewModel = function() {
    var self = this;
    
    this.locationList = ko.observableArray([]);

    initLocations.forEach(function(loc) {
        self.locationList.push(new Location(loc));
    });

    this.currentLocation = ko.observable(this.locationList()[0]);
    
    self.showMarker = function(clickedLocation) {     
        google.maps.event.trigger(clickedLocation.marker, 'click');
    }

    
    // search the listview and display corresponding marker
    self.places = ko.observableArray(initLocations);
    self.query = ko.observable('');

    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.places(), function(place) {
            var match = (place.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0);
            if (match) {
                place.marker.setVisible(true);
                return true;
            } else {
                place.marker.setVisible(false);
                return false;
            }
        });
    });


}

// var vm  = new ViewModel();
// ko.applyBindings(vm);
