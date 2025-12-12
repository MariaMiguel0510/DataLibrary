function check_screen_size() {
    let screen_message = document.getElementById("screen_message");
    let main_content = document.querySelector("main");

    if (window.innerWidth <= 950) {
        screen_message.classList.remove("invisible"); // show message
        main_content.style.visibility = "hidden"; // hide main content
    } else {
        screen_message.classList.add("invisible"); // hide message
        main_content.style.visibility = "visible"; // show main content
    }
}

// verify window size when loading page
window.addEventListener("load", check_screen_size);
// verify window size when resizing page
window.addEventListener("resize", check_screen_size);