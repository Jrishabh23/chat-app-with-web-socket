const socket = io();
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationMessageTemplate =
    document.querySelector("#location-url").innerHTML;
const loginForm = document.querySelector("#login-from");
const $messages = document.querySelector("#message");

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
//Join the room
socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
// loginForm.addEventListener("submit", (e) => {
//     e.preventDefault();
//     console.log("function call");
//     let userName = e.target.elements.username.value;
//     let roomNo = e.target.elements.room.value;
//     socket.emit("join", userName, roomNo);
//     console.log(userName, roomNo);
// });
//Display log message to client
socket.on("message", (message) => {
    let html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.message,
        created_at: moment(message.created_at).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

/**
 * @desc Send message to all user
 */
document.querySelector("#input-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let name = e.target.elements.name.value;
    socket.emit("sendMessage", name);
    console.log(name);
});
/**
 * @desc Get client Locations
 */
document.querySelector("#btn-location").addEventListener("click", (e) => {
    // It check browser geolocation or not
    if (!navigator.geolocation) {
        return alert("Your browser not support location");
    }
    //Disabled the location Button
    locationButton.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
        let { latitude, longitude } = position["coords"];
        /**
         * Send acknowledge to user
         * message or acknowledge send to own user
         */
        socket.emit(
            "sendLocation",
            { lat: latitude, long: longitude },
            (callback) => {
                console.log(callback);
                locationButton.removeAttribute("disabled");
            }
        );
    });
});

//Display log location message to client
socket.on("locationMessage", (message) => {
    console.log("lom", message);
    let html = Mustache.render($locationMessageTemplate, {
        username: message.username,
        url: message.message,
        created_at: moment(message.created_at).format("h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

document.querySelector("#all-user-list").addEventListener("click", (e) => {
    e.preventDefault();
    socket.emit("allUserList");
});
