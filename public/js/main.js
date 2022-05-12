const chatForm = document.getElementById('chat')
const roomName = document.getElementById('roomName')
const roomUsers = document.getElementById('roomUsers')
const chatMessages = document.querySelector('.chat-messages')
const isTyping = document.getElementById('isTyping')

document.querySelector("#createRoomForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createRoom();
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const msg = e.target.elements.msg.value

    if (currentRoom !== null) {
    // Emit message to server
    socket.emit('chatMessage', msg);
    }


    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()

    timeoutFinish();
})

// get username from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

let currentUser = null;
let currentRoom = null;

let typingTimer = null;

const socket = io({ autoConnect: false });

socket.auth = { username };
socket.connect();

socket.on("connect_error", (err) => {
    console.log(err);
})

socket.on("disconnect", () => {
    // window.location = "index.html";
    currentRoom = null;
})

socket.on("connect", () => {
    socket.emit("joinRoom", room);
})

socket.on("successLogin", (user) => {
    currentUser = user; 

    updateRoomList();

    document.querySelector("#username").innerHTML = user.username; 
})

socket.on("joinedRoom", (room) => {
    currentRoom = room;
    
    updateUserList();
    updateRoomList();
});

socket.on("noRoom", () => {
    // NOTE: Error failed to join room
    // window.location = "index.html";
    currentRoom = null;
});

socket.on("updateRoomList", () => {
    updateRoomList();
});

socket.on("updateUserList", () => {
    updateUserList();
});

socket.on("userTyping", (user) => {
    if (user.id !== currentUser.id) {
        isTyping.classList.add('isTyping')
        isTyping.innerHTML = `<p>${user.username} is typing</p>`
    }
    // console.log(`${user.username} is typing`);
});

socket.on("userStoppedTyping", (user) => {
    isTyping.classList.remove('isTyping')

    // console.log(`${user.username} stopped typing`);
});

socket.on('message', message => {
    outputMessage(message)

    //Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight
})

function timeoutFinish() {
    socket.emit("endTyping");

    clearTimeout(typingTimer);
    typingTimer = null;
}

function inputChange() {
    if(!typingTimer) {
        typingTimer = setTimeout(timeoutFinish, 1000);

        socket.emit("startTyping");
    } else {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(timeoutFinish, 1000);
    }
}

function createUserList(users) {
    let userList = document.querySelector("#users");
    userList.innerHTML = "";

    users.forEach(user => {
        let listItem = document.createElement("li");
        listItem.classList.add("sidebar-item");
        listItem.innerHTML = user.username;

        userList.appendChild(listItem);
    });
}

function createRoomList(rooms) {
    let roomList = document.querySelector("#rooms");
    roomList.innerHTML = "";

    rooms.forEach(room => {
        let listItem = document.createElement("li");
        listItem.innerHTML = room.name;
        listItem.classList.add("sidebar-item");

        if(currentRoom && (currentRoom.id === room.id)) {
            listItem.classList.add("selected");
        } else {
            listItem.classList.add("clickable");
            listItem.addEventListener("click", () => {
                socket.emit("joinRoom", room.id);
            });
        } 

        /*
        if(currentRoom && (currentRoom.id === room.id)) {
            let button = document.createElement("p");
            button.innerHTML = room.name;
            listItem.dataset.id = room.id;
            listItem.appendChild(button);
        } else {
            let button = document.createElement("button");
            button.addEventListener("click", () => { 
                socket.emit("joinRoom", room.id);
            });

            button.innerHTML = room.name;

            listItem.dataset.id = room.id;
            listItem.appendChild(button);
        }
        */

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
    // console.log(name);

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

            updateRoomList();
        });
}

function outputMessage(message){
    const div = document.createElement('div')

    div.classList.add('message')
    div.innerHTML = `
    <p class="message-name"> ${message.username} </p>
    <p class="message-time"> ${message.time} </p>
    <p class="message-content">${message.content}</p>
    `;
    document.querySelector('.chat-messages').appendChild(div)
}

function updateRoomList() {
    let origin = window.location.origin;
    fetch(`${origin}/api/rooms`)
        .then(res => res.json())
        .then(data => createRoomList(data));
}

function updateUserList() {
    let origin = window.location.origin;
    fetch(`${origin}/api/users/${currentRoom.id}`)
        .then(res => res.json())
        .then(data => createUserList(data));
}