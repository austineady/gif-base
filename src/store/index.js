import { EventEmitter } from 'events';
import Firebase from 'firebase';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCZN8HXazfKkI1r4fIavtSS5AvBd6cObow",
  authDomain: "gifapp-d240b.firebaseapp.com",
  databaseURL: "https://gifapp-d240b.firebaseio.com",
  projectId: "gifapp-d240b",
  storageBucket: "gifapp-d240b.appspot.com",
  messagingSenderId: "975424041306"
};
firebase.initializeApp(config);

// Set Database Ref
//const db = new Firebase.database()
//const categoriesRef = db.child('categories')
//const store = new EventEmitter()

//var categories = {};
//var gifs = {};

// db.on('value', (snapshot) => {
//   var bookmarkData = snapshot.val()
//   if (bookmarkData) {
//     categories = bookmarkData.categories
//     bookmarks = bookmarkData.bookmarks
//     store.emit('data-updated', categories, bookmarks)
//   }
// })
