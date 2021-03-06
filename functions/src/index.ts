//import libraries

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

//initialize firebase indorder to access its services
admin.initializeApp(functions.config().firebase);


//initialize express server
const app = express();
const main = express();

//add the path to resive resuest and set json as bodyPaser to process the body

main.use('/api/v1',app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended :  false}));

//initalize the database and the collection
const db = admin.firestore();
const userCollection = 'users';

//define google cloud function name
export const webapi = functions.https.onRequest(main);

interface User {
    FirstName : String,
    Last_name: String,
    email: String,
    Phone: String,
    Address: String,
    id: String,

}

//create new user
app.post('/users',async(req,res) =>{
    try{
        const user: User = {
            FirstName: req.body['FirstName'],
            Last_name: req.body['LastName'],
            email: req.body['email'],
            Phone: req.body['Phone'],
            Address: req.body['Address'],
            id: req.body['id'],

        }

        const newDoc = await db.collection(userCollection).add(user);
        res.status(201).send(`Created a new user: ${newDoc.id}`);


    }catch(error){
    res.status(400).send('User should cointain firstName, LastName , email,Phone,  Address and id')
    }
    
});

//get all users
app.get('/users ', async (req, res) =>{
   try{
      const userQuerySnapshot = await db.collection(userCollection).get();
      const users: any[]= [];
      userQuerySnapshot.forEach(
          (doc)=>{
              users.push({
               id: doc.id,
               data: doc.data()

              });
          }
      );
  res.status(200).json(users);

   }catch(error){
       res.status(500).send(error);

   }
});


//get a single contact
app.get('/users/:userId',(req,res) =>{
    const userId = req.params.userId;
    db.collection(userCollection).doc(userId).get()
    .then(user => {
        if(!user.exists) throw new Error('User not found');
        res.status(200).json({id:user.id, data:user.data()})})
        .catch(error => res.status(500).send(error));
})


//Delete a user
app.delete('/users/:userId',(req, res) => {
    db.collection(userCollection).doc(req.params.userId).delete()
    .then(()=>res.status(204).send("Document sueccfully deleted!"))
    .catch(function (error){
        res.status(500).send(error);
    });
});

//Update user
app.put('users/:userId',async(req,res) =>{
    await db.collection(userCollection).doc(req.params.userId).set(req.body, {merge:true})
    .then(()=> res.json({id:req.params.userId}))
    .catch((error)=> res.status(500).send(error))
});