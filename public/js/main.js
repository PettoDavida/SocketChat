const chatForm = document.getElementById('chat')
const roomName = document.getElementById('roomName')
const roomUsers = document.getElementById('roomUsers')
const chatMessages = document.querySelector('.chat-messages')

// get username from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

socket.emit('joinRoom', { username, room })

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
    listOpenRooms(users)
})

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