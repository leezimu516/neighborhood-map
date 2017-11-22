function myFunction() {
    var x = document.getElementById("side-bar");
    if (x.className === "aside") {
        x.className += " responsive";
    } else {
        x.className = "aside";
    }
}