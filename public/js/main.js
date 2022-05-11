const chatForm = document.getElementById('chat')
const roomName = document.getElementById('roomName')
const roomUsers = document.getElementById('roomUsers')
const chatMessages = document.querySelector('.chat-messages')

document.querySelector("#createRoomForm").addEventListener("submit", (e) => {
    e.preventDefault();
});

// get username from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

let currentUser = null;
let currentRoom = null;

const socket = io({ autoConnect: false });

location.href = "steam://run/1172470"

socket.auth = { username };
socket.connect();

socket.on("connect_error", (err) => {
    console.log("HEHEH");
    console.log(err);
})

socket.on("disconnect", () => {
    window.location = "index.html";
})

socket.on("connect", () => {
    console.log("Connected");

    socket.emit("joinRoom", room);
})

socket.on("noRoom", () => {
    window.location = "index.html";
});

socket.on("successLogin", (user) => {
    currentUser = user; 

    let origin = window.location.origin;
    fetch(`${origin}/api/rooms`)
        .then(res => res.json())
        .then(data => createRoomList(data));
})

function createRoomList(rooms) {
    let roomList = document.querySelector("#rooms");
    roomList.innerHTML = "";

    rooms.forEach(room => {
        let listItem = document.createElement("option");
        listItem.innerHTML = room.name;
        listItem.dataset.id = room.id;
        roomList.appendChild(listItem);
    });
}

function joinRoom() {
    let roomList = document.querySelector("#rooms");
    let item = roomList.options[roomList.selectedIndex];
    let roomId = item.dataset.id;
    socket.emit("joinRoom", roomId);

    chatMessages.innerHTML = "";
}

function createRoom() {
    let name = document.querySelector("#createRoomName").value;

    let obj = {
        name,
    }
    let body = JSON.stringify(obj);

    let origin = window.location.origin;
    fetch(`${origin}/api/rooms`, {
        method: "POST",
        body,
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            document.querySelector("#createRoomName").value = "";

            socket.emit("joinRoom", data.id)
            chatMessages.innerHTML = "";

            let origin = window.location.origin;
            fetch(`${origin}/api/rooms`)
                .then(res => res.json())
                .then(data => createRoomList(data));
        });
}

/*
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
    listOpenRooms(users)
})
*/

socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    //Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const msg = e.target.elements.msg.value

    // Emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

function outputMessage(message){
    const div = document.createElement('div')

    div.classList.add('message')
    div.innerHTML = `
    <p class="meta"> ${message.username} <span> ${message.time} </span></p>
    <p class="content">
        ${message.content}
        </p>`;
    document.querySelector('.chat-messages').appendChild(div)
}

function outputRoomName(room) {
    roomName.innerText = room
}

function outputUsers(users) {
    roomUsers.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}

function listOpenRooms(users) {
    users.map(user => console.log(users))

    let openRooms = [...new Set(users)]
}