document.querySelector("#createRoomForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createRoom()
});

let origin = window.location.origin;
fetch(`${origin}/api/rooms`)
    .then(res => res.json())
    .then(data => createRoomList(data));

function createRoomList(rooms) {
    let roomList = document.querySelector("#rooms");

    rooms.forEach(room => {
        let listItem = document.createElement("option");
        listItem.innerHTML = room.name;
        listItem.setAttribute("value", room.id);
        listItem.dataset.id = room.id;
        roomList.appendChild(listItem);
    });
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
            document.querySelector("#createRoomName").value = data.id;
            document.querySelector("#createRoomForm").submit();
        });
}