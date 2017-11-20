function myFunction() {
    var x = document.getElementById("side-bar");
    if (x.className === "option-box") {
        x.className += " responsive";
    } else {
        x.className = "option-box";
    }
}