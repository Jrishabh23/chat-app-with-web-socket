//Perform CRUD operation
const users = [];
//Add User in list
const addUser = (id, username, room) => {
    //Check username is available or not
    if (!username || !room) {
        return { error: "Please provide Username or Room" };
    }
    //check username is exist or not
    let existingUser = users.find(
        (user) => user.room === room && user.username === username
    );
    if (existingUser) {
        return { error: "Username is already exist" };
    }
    let user = { id, username, room };
    users.push(user);
    return { user };
};
//Remove user in List
const removeUser = (id) => {
    //Check if Id is exist or not
    let user = getUser(id);
    let index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return user;
    }
    return { error: "User not found" };
};
// Get user Details
const getUser = (id) => {
    return users.find((user) => user.id === id);
};
//Get user-list in room
const getUserInRoom = (room) => {
    room = room;
    return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUserInRoom };
