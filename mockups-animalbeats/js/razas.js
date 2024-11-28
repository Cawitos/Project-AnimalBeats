function openModal(race) {
    document.getElementById(race).style.display = "block";
}

function closeModal(race) {
    document.getElementById(race).style.display = "none";
}

window.onclick = function(event) {
    var modals = document.getElementsByClassName('modal');
    for (var i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            modals[i].style.display = "none";
        }
    }
}

