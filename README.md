## Assignment App

With the Assignments Application an easy way is provided to how students keep track of all their assignments and due dates.
For the Assignment 3 I decided to update A2 in multiple ways.
![Application login](https://i.imgur.com/quSk5L4.png)

The application is reachable on https://a3-retat.glitch.me
To login the test user <br>
testAccount <br>
password <br>
can be used, or it's possible to create a new one by using the Sign up button.
![Application login](https://i.imgur.com/iBVQkVt.png)

- The goal of the application is to make the life of students easier by offering an easy solution for keeping track of all the assignments.
- One of the big updates is that now each user has his own set of assignments and cannot access the assignments of a different user.
- During the development of the application for A3 many problems occurred. I wanted to use a secure kind of authentication and therefore
decided to use an external DB (mongoDB) and hash/salt the passwords. The implementation of passport wasn't as straightforward as I expected,
but in the end everything worked out.
- I decided to use the local strategy of passport but save the user credentials in mongoDB. I used mongoDB because I really wanted
to use an external DB for security reasons and because I was interested in using a noSQL DB for the first time.
- I used the bootstrap CSS framework because I already have some experience in it and it offers a very rich feature set
  - I didn't need to do any modifications to bootstrap because it already offers a wide variety of possible styles.
- The five Express middleware packages are the following:
    - passport: Authentication service that makes it easy to authenticate a user and setup stuff like cookies
    - body-parser: Used to parse HTTP request body 
    - serve-favicon: Serves the favicon and avoids 404 error messages
    - compression: To compress HTTP responses
    - serve-static: Serves files from a directory

## Technical Achievements
- **Tech Achievement 1**: User and each users data (the assignments) are stored persistent in a mongoDB. The assignments are linked
to the user by the user id.
- **Tech Achievement 2**: Secure authentication by hashing and salting passwords and using cookies for a convenient login
- **Tech Achievement 3**: With the edit function Assignments get updated directly and not first deleted and then simply added again like
in A2 
```javascript
collection.updateOne({
    _id: new mongodb.ObjectID(parsedData.Id)
}, {
    $set: {
        "Note": parsedData.Note,
        "Date": createDate(parsedData.Date),
        "Days": daysRemaining(parsedData.Date)
    }
}).then(r => collection.find({"UID": currentUser[0]._id}).toArray((err, items) => {
    resolve(items)
}))
```
### Design/Evaluation Achievements
- **Design Achievement 1**: I added a navbar for easy navigation, right now the user can use the logout function, whereas the 
search function and the user Dashboard is still work in progress.
- **Design Achievement 2**: The login and register page are in the same style as the rest of the application.
- **Design Achievement 3**: With multiple users the application is stable and every user can access his own Assignments. Sometime the DB needs up to a second to answer but that's not too bad.
