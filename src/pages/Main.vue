<script setup>

import { getAuth, onAuthStateChanged } from "firebase/auth";
import {ref , onMounted} from 'vue'
import {
  doc,
  orderBy,
  setDoc,
  query,
  getDoc,
  serverTimestamp,
  getDocs,
  getFirestore,
  collection,
  addDoc,
  onSnapshot
  ,where,
  updateDoc
} from "firebase/firestore";


const user = ref()
const userInfo = ref({
  imageUrl: ""
})

const db = getFirestore();
const postList = ref([])

onMounted(async () => {

  const auth =  getAuth()

  onAuthStateChanged(auth, async  myuser => {

    console.log("hello ",myuser);

    user.value = myuser.uid
    const docRef = doc(db, "users",myuser.uid );
    const mydoc =  await getDoc(docRef)
    userInfo.value = mydoc.data()
    console.log("Page ref")

    // const querySnapshot = await getDocs(collection(db, "posts"));
    // querySnapshot.forEach((doc) => {
    //   // doc.data() is never undefined for query doc snapshots
    //   console.log(doc.id, " => ", doc.data());
    //   postList.value.push({
    //     id: doc.id,
    //     data: doc.data()
    //   });
    // });
    // console.log("my data list: " , querySnapshot);

    const q = query(collection(db, "posts") , orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        postList.value = []
      querySnapshot.forEach((doc) => {
        postList.value.push({
              id: doc.id,
              data: doc.data()
            });
      });

    });

    const q3= query(collection(db, "posts") ,where("claimedBy", "array-contains", user.value));
    const unsubscribe3 = onSnapshot(q3, (querySnapshot) => {
      myClaimes.value = []
      querySnapshot.forEach((doc) => {
        myClaimes.value.push({
          id: doc.id,
          data: doc.data()
        });
      });

    });
  })



})
import axios from 'axios'
import router from "@/router/index.js";


const file = ref(null)
const imageUrl = ref('')
const isFormValid = ref(false)
const uploading = ref(false)
const fileProfile = ref(null)

const myClaimes = ref([])

const name = ref("")


const fileRules = [
  v => !!v || 'Image is required',
  v => !v || v.size < 2 * 1024 * 1024 || 'Max 2MB file size',
]

const handleUpload = async () => {
  if (!file.value) return
  uploading.value = true

  const formData = new FormData()
  formData.append('image', file.value)

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=b2315e0ba16da3958b748d57ccc8cab5`,
      formData
    )

    imageUrl.value = res.data.data.url
    console.log('Uploaded to:', imageUrl.value)
  } catch (err) {
    console.error('Upload failed:', err)
    alert('Image upload failed!')
  } finally {
    uploading.value = false
// Add a new document in collection "cities"

    const colRef = collection(db, 'posts');

    addDoc(colRef, {
      name: name.value,
      disc: "Product disc",
      urlImage: imageUrl.value,
      author: user.value,
      createdAt: serverTimestamp() ,
      active : true,
      claimedBy: [],
      servingSize: 10 ,
      claimedSize : 0
    })


  }
}

const logout = async () => {

  const auth =  getAuth()
   auth.signOut().then(() => {
     router.push('/')
   });

}

const UploadProfile = async () => {
  const formData = new FormData()
  formData.append('image', fileProfile.value)
  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=b2315e0ba16da3958b748d57ccc8cab5`,
    formData
  )
  const imageUrl =  res.data.data.url
  await updateDoc(doc(db, "users", user.value), {imageUrl: imageUrl})


}

const claim = async (idpost) => {

  const mydoc =   doc(db,"posts",idpost)
  const docSnap = await getDoc(mydoc);
  console.log("post", docSnap.data())
  const data = docSnap.data()
  if(data.claimedSize  < data.servingSize){
    let myclaimedBy = data.claimedBy
    myclaimedBy.push(user.value)
    updateDoc(mydoc , {
      claimedSize: data.claimedSize + 1,
      claimedBy: myclaimedBy,
    })
  }

//  await updateDoc(doc(db, "users", user.value), {imageUrl: imageUrl})

}




</script>

<template>
 <h1>Welcome Adam Smith!</h1>
  <p>{{user}}</p>
  <p>{{userInfo}}</p>
  <v-img
    v-if="userInfo.imageUrl"
    :src="userInfo.imageUrl"
    alt="Uploaded Image"
    class="mt-4"
    max-width="50"
  />
  <v-btn color="green" @click="logout">Log out</v-btn>
  <v-file-input
    v-model="fileProfile"
    label="Select Image"
    accept="image/*"
    show-size
    prepend-icon="mdi-image"
  ></v-file-input>
  <v-btn @click="UploadProfile">Upload Logo</v-btn>
  <v-card class="mt-3 "  v-for="item in myClaimes" :key="item.id">
    <v-card-title>{{item.data.name}}</v-card-title>
    <v-img
      :src="item.data.urlImage"
      alt="Uploaded Image"
      class="mt-4"
      max-width="150"
    />
    <p>{{item.data.claimedSize}} / {{item.data.servingSize}}</p>
    <p>{{item.data}}</p>
  </v-card>
  <v-container>
    <v-card class="px-6">
      <v-card-title>Create a post</v-card-title>
      <v-text-field label="Product name:"  v-model="name"/>
      <v-textarea label="Product description:" />
      <v-checkbox label="Checkbox"></v-checkbox>
      <v-file-input
        v-model="file"
        label="Upload File"
        accept=".jpg,.png,.pdf"
        show-size
        prepend-icon="mdi-paperclip"
        required
      ></v-file-input>
    </v-card>
    <v-form ref="form" v-model="isFormValid" @submit.prevent="handleUpload">
      <v-file-input
        v-model="file"
        label="Select Image"
        :rules="fileRules"
        accept="image/*"
        show-size
        prepend-icon="mdi-image"
        required
      ></v-file-input>

      <v-btn type="submit" :disabled="!isFormValid || uploading">
        <v-progress-circular
          v-if="uploading"
          indeterminate
          size="20"
          color="white"
          class="mr-2"
        ></v-progress-circular>
        Upload
      </v-btn>

<!--      <v-img-->
<!--        v-if="imageUrl"-->
<!--        :src="imageUrl"-->
<!--        alt="Uploaded Image"-->
<!--        class="mt-4"-->
<!--        max-width="300"-->
<!--      />-->
    </v-form>

    <v-card class="mt-3 "  v-for="item in postList" :key="item.id">
        <v-card-title>{{item.data.name}}</v-card-title>
            <v-img
              :src="item.data.urlImage"
              alt="Uploaded Image"
              class="mt-4"
              max-width="150"
            />
      <p>{{item.data.claimedSize}} / {{item.data.servingSize}}</p>
      <p>{{item.data}}</p>
      <v-btn color="blue" @click="claim(item.id)">
        Claim post
      </v-btn>

    </v-card>


  </v-container>
</template>

<style scoped lang="sass">

</style>
