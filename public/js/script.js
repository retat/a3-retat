const submit = function (e) {
    e.preventDefault()
    const inputText = $('#inputAssignment').val()
    const inputDate = $('#inputDate').val()
    const json = {Note: inputText, Date: inputDate}
    postData(json, 'submit')
}

function postData(json, path) {
    (async () => {
        const rawResponse = await fetch(path, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
        const content = await rawResponse.json()
        handleData(content)
    })()
}

function handleData(data) {
    $("#notesContainer").empty()
    let id = 1
    data.forEach(function (item, index, array) {
        let note = document.createElement("li")
        note.innerHTML = createInnerHTML(item, id)
        note = setClassName(note, item, id)
        id++
        $("#notesContainer").append(note)
    })
}

function setClassName(note, item, id) {
    if (item.Days <= 5) {
        note.className = "list-group-item d-flex list-group-item-danger item-" + id + " justify-content-between"
    } else {
        note.className = "list-group-item d-flex list-group-item-success item-" + id + " justify-content-between"
    }
    return note
}

function createInnerHTML(item, id) {
    let itemId = "\"" + item._id + "\""
    return "<p class='p-0 m-0 flex-grow-1' id='item-" + id + "'>" +
        item.Note +
        " due: " + item.Date +
        " days: " + item.Days +
        "</p>" +
        "<button class='btn btn-success mr-1' onClick='editItem(" + id + "," + itemId + ")'>edit</button>" +
        "<button class='btn btn-danger' onClick='deleteItem(" + itemId + ")'>delete</button>"
}

function editItem(id, itemId) {
    let elems = document.getElementsByTagName('*'), i
    for (i in elems) {
        if ((' ' + elems[i].className + ' ').indexOf(' ' + "item-" + id + ' ')
            > -1) {
            elems[i].innerHTML = createInnerEditHTML(id, itemId)
        }
    }
}

function createInnerEditHTML(id, itemId) {
    itemId = "\"" + itemId + "\""
    return "<input type='text' class='form-control col-4' id='newAssignment-" + id + "' value='" + getOldAssignmnet(id) + "'>" +
        "<input type='date' class='form-control col-4' id='newDate-" + id + "' >" +
        "<button class='btn btn-success col-2' onClick='saveItem(" + id + "," + itemId + ")'>save</button>" +
        "</div"
}

function saveItem(id, itemId) {
    const newAssignment = $('#newAssignment-' + id).val()
    const newDate = $('#newDate-' + id).val()
    const json = {Id: itemId, Note: newAssignment, Date: newDate}
    postData(json, 'update')
}

function getOldAssignmnet(id) {
    let innerHTML = $('#item-' + id).html()
    console.log(innerHTML)
    return innerHTML.split("due:", 1)
}

function deleteItem(id) {
    const json = {Item: id}
    postData(json, 'delete')
}

function createDate(date) {
    let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
    let dateArray = date.split('-')
    return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString("en-US", options)
}

(function getUsername() {
    (async () => {
        const rawResponse = await fetch("/username", {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const content = await rawResponse.json()
        console.log(content)
        $("#navbarDropdown").html("User " + content)
    })()
})()

window.onload = function () {
    $("#add").click(submit)
}
document.onload = postData({}, 'refresh')