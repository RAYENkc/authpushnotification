const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var msgData;

exports.nodif = functions.firestore.document(
    'Notification/{NotificationId}'
).onCreate((snapshot, context)=>{
       msgData = snapshot.data();

       admin.firestore().collection('pushtokens').get().then((snapshot)=>{
           var tokens = [];
           if(snapshot.empty) {
               console.log('No divices'); 
           }
           else{
               for(var token of snapshot.docs){
                   tokens.push(token.data().devtoken);
               }
               var payload = {
                   "notification" : {
                       //"title" : "New prospect ",// + msgData.Title,
                       "title" : "Title : " + msgData.Title,
                       //"body" : "le commercial x a ajouter "+msgData.First_name +" "+msgData.Last_name+"  email :  "+msgData.Mail+" son adress :"+msgData.adress,// + msgData.desc,
                       "body" :"body :" + msgData.desc,
                       "sound" : "default"
                   },
                   "data":{
                       "sendername":  msgData.Title,
                       "message": msgData.desc,
                       "click_action" : 'FLUTTER_NOTIFICATION_CLICK'
                   }

               }

               return admin.messaging().sendToDevice(tokens, payload).then((response)=>{
                   console.log('Pushed them all');
               }).catch((err)=>{
                   console.log(err);
               })
           }

       })
});
