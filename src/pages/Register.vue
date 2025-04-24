<template>

  <v-container>
    <h3 class="mb-10">Register page</h3>
    <v-text-field v-model="email" max-width="300" label="email" type="email" placeholder="Enter your email" variant="outlined" />
    <v-text-field v-model="password" max-width="300" label="password" type="password" variant="outlined" />
    <v-btn color="green" @click="register">Submit</v-btn>
  </v-container>

  <v-container>
    <p>{{user.email}}</p>
    <h3 class="mb-10">Log in</h3>
    <v-text-field v-model="emailSign" max-width="300" label="email" type="email" placeholder="Enter your email" variant="outlined" />
    <v-text-field v-model="passwordSign" max-width="300" label="password" type="password" variant="outlined" />
    <v-btn color="green" @click="signin">Log in </v-btn>
  </v-container>

    <v-btn @click="testfuct">Click</v-btn>
  <v-container>
    <v-row  >
    <v-text-field label="note"  v-model="note" max-width="300"/>

    <v-btn @click="addnote">add</v-btn>
  </v-row>
  </v-container>
  <li v-for="item in items">
    {{ item.data.note }} <br>  {{ item.id }}
    <v-icon @click="deletePoint(item.id)" icon="mdi-cancel" ></v-icon>
    <v-icon @click="upPoint(item.id)" icon="mdi-update" ></v-icon>
  </li>

</template>

<script setup>

import { ref  ,reactive } from 'vue'
import { getAuth, createUserWithEmailAndPassword  , signInWithEmailAndPassword} from "firebase/auth";


import { useRouter } from 'vue-router'


// import router
const email = ref('')
const password = ref('')

const emailSign = ref('')
const passwordSign= ref('')

const list = ref([])
const router = useRouter()
const user = ref({})
const auth = getAuth();

const  register = () => {

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log("User account created successfully! " + user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorCode, errorMessage);
      // ..
    });

}

const  signin = () => {

  const auth = getAuth();
  signInWithEmailAndPassword(auth, emailSign.value, passwordSign.value)
    .then((userCredential) => {
      // Signed in
       user.value = userCredential.user;

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error:" ,errorMessage)
    });

}
import { onMounted } from 'vue'



const testfuct = () => {
  const auth = getAuth();
  const usercurrent = auth.currentUser;
  if(usercurrent) {
    user.value = usercurrent;
  }
  console.log("User account created successfully! " , user);
  addDetails()
}


onMounted( async () => {
  const auth = getAuth();
  const usercurrent = auth.currentUser;
  if(usercurrent) {
    user.value = usercurrent;
  }
  console.log("User account created successfully! " , user.value);
  await testfuct()
})


import { getFirestore, doc, setDoc , addDoc , collection, onSnapshot ,deleteDoc , updateDoc} from "firebase/firestore";


const db = getFirestore();

function  addDetails(){



  const uid = user.value.uid // Get the user's UID

  // Create a new document in Firestore for the user
  const userDocRef = doc(db, "users", uid); // "users" is your collection name

  setDoc(userDocRef, {
    // Add your custom data here
    displayName: "myname",
    userType: "individual",
    profilePicture: 'URL',
    address: "123 address toranto",
    city:"hello"
    // ... other custom fields
  })
    .then(() => {
      console.log("User data stored in Firestore!");
    })
    .catch((error) => {
      console.error("Error storing user data in Firestore:", error);
    });
}
 const note = ref('')

function addnote(){

   addDoc(collection(db, "notes"), {
    note : note.value,
    country: user.value.email
  });
}
const items = ref([])
const unsubscribe = onSnapshot(collection(db, "notes"), (data) => {
  items.value = [];
  data.forEach((doc) => {console.log(doc.id)
   items.value.push({ data :doc.data(), id:doc.id });
  })
})

function deletePoint(id){

   deleteDoc(doc(db, "notes", id));
}
function upPoint(id){

  updateDoc(doc(db, "notes", id), {
    note: items.value.find(doc => doc.id === id).data.note.toUpperCase()
  });
}





</script>

<style scoped lang="sass">

</style>
