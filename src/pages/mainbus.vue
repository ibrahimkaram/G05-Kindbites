<script setup>
import {ref, watch, reactive, onMounted} from "vue"
  import axios from "axios";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp, where
} from "firebase/firestore";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import router from "@/router/index.js";

  const dialog = ref(false)
  const file = ref(null)
  const snackbar = ref(false)
  const snackbarNotAv = ref(false)
  const showProgress = ref(false)
  const userInfo = ref({
    name : ""
  })

  const userId = ref("")
  const postList = ref([])

  const myClaims = ref([])

  const activePostCount = ref(0)


  onMounted(async () => {

    const auth =  getAuth()

    onAuthStateChanged(auth, async  myuser => {




      const docRef = doc(db, "users",myuser.uid );
      const mydoc =  await getDoc(docRef)
      userId.value = myuser.uid;
      userInfo.value = mydoc.data()
      console.log("user: " , userInfo.value)

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

      const q = query(collection(db, "posts") , where('busId',"==" ,userId.value ), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        postList.value = []
        querySnapshot.forEach((doc) => {
          postList.value.push({
            id: doc.id,
            data: doc.data()
          });
        });
        activePostCount.value = postList.value.length;

      });

      const q2 = query(collection(db, "claims"), where("busId" ,"==", userId.value));
      const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
        myClaims.value = []
        querySnapshot.forEach((doc) => {
          myClaims.value.push({
            id: doc.id,
            data: doc.data()
          });
        });
      })
      // const q3= query(collection(db, "posts") ,where("claimedBy", "array-contains", user.value));
      // const unsubscribe3 = onSnapshot(q3, (querySnapshot) => {
      //   myClaimes.value = []
      //   querySnapshot.forEach((doc) => {
      //     myClaimes.value.push({
      //       id: doc.id,
      //       data: doc.data()
      //     });
      //   });
      //
      // });


    })



  })
  const postData = ref({
    imageUrl:"",
    postName: "",
    details: "",
    foodAllergens: [],
    servingSize:1,
    active: true,
    served: 0,
    availableUntil: "",
  })

  const rule = ref([
    v => !!v || "Field is required"
  ])

  const avTimeItems = ref([

    "06:00 AM", "06:30 AM",
    "07:00 AM", "07:30 AM",
    "08:00 AM", "08:30 AM",
    "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM",
    "08:00 PM", "08:30 PM",
    "09:00 PM", "09:30 PM",
    "10:00 PM", "10:30 PM",
    "11:00 PM", "11:30 PM"
  ]);

  const servingSize = ref(1)
  const selected = ref('')
  const foodAllergens = ref([
    'Peanuts',
    'Tree Nuts',
    'Dairy',
    'Eggs',
    'Wheat',
    'Soy',
    'Fish',
    'Shellfish',
    'Gluten',
    'Sesame'
  ])
  const allergensList = ref([])
  const imageFilePreview = ref(null)
  const resetList =  () => {
    allergensList.value = []

  }

  const addSelection =  (value, oldval) => {
    console.log('value:' , value)
    const newVal = allergensList.value.filter(item => item === value)
    if (newVal.length > 0) {
      return
    }
    allergensList.value.push(value)
  }

  watch(selected, addSelection)

  const handleimage = (event) =>{

    const file = event.target.files[0]
    if(file){
      imageFilePreview.value = URL.createObjectURL(file)
    }
    else {
      imageFilePreview.value = null
    }

  }

  watch(file,  (newfile, old) => {
      if(newfile == null){
        imageFilePreview.value = null
      }

  })

  watch(servingSize,  (newVal, old) => {
    if(newVal > 100){
      servingSize.value = 100
    }

  })
  const db = getFirestore();

  const onSumbit = async () => {

    if(postData.value.postName.length > 0 && file.value!= null && postData.value.availableUntil.length > 0 ) {
      showProgress.value = true
      const formData = new FormData()
      formData.append('image', file.value)
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=b2315e0ba16da3958b748d57ccc8cab5`,
        formData
      )
      const imageUrl =  res.data.data.url
      console.log("image url: ", imageUrl)

      const colRef = collection(db, 'posts');
      postData.value.imageUrl = imageUrl
      postData.value.createdAt = serverTimestamp()
      postData.value.foodAllergens = allergensList.value;
      postData.value.busId= userId.value
      postData.value.busInfo = userInfo.value,
      addDoc(colRef, postData.value).then( () =>{

          dialog.value = false
          postData.value = {
            busInfo : null,
            busId: "",
            imageUrl:"",
            postName: "",
            details: "",
            foodAllergens: [],
            servingSize:1,
            active: true,
            served: 0,
            availableUntil: "",
          }
          file.value = null
          resetList();
          setTimeout(()=>{
            snackbar.value = true

          },500)
          showProgress.value = false
      }

      ).catch((error) => {
          showProgress.value = false
          alert('Error in creating post: ' + error)
      }
      )

      }
    else{
      showProgress.value = false
      alert('Not Valid!')
      return
    }



  }
const logout = async () => {

  const auth =  getAuth()
  auth.signOut().then(() => {
    router.push('/')
  });

}


</script>

<template>
  <v-app-bar class="d-flex justify-content-between " :elevation="2">
    <img class="mx-6" src="../assets/kindbiteslogo.svg" height="60" />
    <v-app-bar-title>Business name: {{userInfo.name}} </v-app-bar-title>
    <v-btn class="mz-2" @click="dialog =true" >
      Create Post
    </v-btn>
    <v-btn @click="logout" color="green">
      Logout
    </v-btn>

  </v-app-bar>
  <v-container>

    <v-row class="my-6" >
      <v-col md="3">
        <VCard color="blue"  variant="tonal" >
          <v-card-title>
            Active Post
          </v-card-title>
          <v-card-text  class="text-h4">
            {{ activePostCount }}
          </v-card-text>
        </VCard>
      </v-col>
      <v-col md="3">
        <VCard color="green"  variant="tonal" >
          <v-card-title>
            Active Claims
          </v-card-title>
          <v-card-text  class="text-h4">
            {{myClaims.length}}
          </v-card-text>
        </VCard>
      </v-col>
      <v-col md="3">
        <VCard color="pink"  variant="tonal" >
          <v-card-title>
            Meals Donated
          </v-card-title>
          <v-card-text class="text-h4">
           30
          </v-card-text>
        </VCard>
      </v-col>
    </v-row>

    <h2 class="mb-4">Active Post:</h2>
    <v-empty-state v-if="activePostCount == 0"
                   headline="No Food Posting Yet"
                   text="There are currently no food donation posts from your business."
                   action-text="Create your first Post!"
                   color="green"
      @click:action="dialog= true"
    ></v-empty-state>
    <v-card v-else>
      <v-table  theme="light">
        <thead>
        <tr>
          <th class="text-left">

          </th>
          <th class="text-left w-50">
            Post names
          </th>
          <th class="text-left">
            Serving
          </th>
          <th class="text-left">
            Available Until
          </th>
          <th class="text-left">
            Status
          </th>
          <th class="text-left">
            Action
          </th>

        </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in postList"
          :key="item.id"
        >
          <td>
            <img class="myimage my-2 rounded-xl " :src="item.data.imageUrl" width="60" height="60" />
          </td>
          <td>
            <h3 class="text-h6 font-weight-bold">
              {{item.data.postName}}
            </h3>
          </td>
          <td class="text-h6 text-left">
            {{item.data.served}}/{{item.data.servingSize}}
          </td>
          <td class="">
            {{item.data.availableUntil}}
          </td>
          <td class="">
            <v-chip color="green" variant="flat">

              Active
            </v-chip>
          </td>
          <td><v-btn icon small @click="snackbarNotAv = true" variant="flat">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          </td>
        </tr>
        </tbody>
      </v-table>
    </v-card>

    <h2 class="my-6">Claims:</h2>
    <v-empty-state
      v-if="myClaims.length == 0"
      icon="mdi-food"
      title="No active claims Right Now"
      text="All the food donations have been picked up! New items are added often, so keep an eye out for fresh opportunities."
    ></v-empty-state>
    <v-table v-else theme="light">
      <thead>
      <tr>
        <th class="text-left">

        </th>
        <th class="text-left w-25">
          Post name
        </th>
        <th class="text-left">
          Serving
        </th>
        <th class="text-left">
          Claimed By
        </th>
        <th class="text-left">
          ETA
        </th>
        <th class="text-left">
          Action
        </th>

      </tr>
      </thead>
      <tbody>
      <tr
        v-for="item in myClaims"
        :key="item.id"
      >
        <td>
          <img class="myimage my-2 rounded-xl " :src="item.data.imageUrl" width="60" height="60" />
        </td>
        <td>
          <h3 class="text-h6 font-weight-bold">
            {{item.data.postName}}
          </h3>
        </td>
        <td class="text-h6 text-left">
          {{item.data.serving}}
        </td>
        <td class="text-h6 text-left">
          {{item.data.claimedInfo.name}}
        </td>
        <td class="text-h6 text-left">
          {{item.data.eta}}
        </td>
        <td>
          <v-btn color="blue">
            Confirm Pick Up
          </v-btn>
        </td>
      </tr>
      </tbody>
    </v-table>

  </v-container>
  <v-dialog
    v-model="dialog"
    width="auto"
  >
    <v-card
      width="600"
    > <h2 class="ma-4">Create Post:</h2>


      <v-card-item>
        <img v-if="imageFilePreview" class="myimage" :src="imageFilePreview" width="100%" height="360" />

        <v-file-input
          class="mt-2"
          v-model="file"
          @change="handleimage"
          label="Select Post Image"
          accept="image/*"
          show-size
          prepend-icon="mdi-image"
          variant="outlined"
          required
        ></v-file-input>

        <v-text-field v-model="postData.postName" :rules="rule"  label="Post Name"  variant="outlined" required />

        <v-textarea  v-model="postData.details" label="Details"   variant="outlined" />

        <v-select
          variant="outlined"
          :items="foodAllergens"
          v-model="selected"
          label="Food Allergens"

        >


        </v-select>

        <v-row class="ml-2">
          <v-chip
            v-for="(tag, index) in allergensList"
            :key="index"
            class="ma-1"
            color="green"
          >
            {{ tag }}
          </v-chip>
          <v-btn v-if="allergensList.length > 0" density="compact" icon="mdi-restore" variant="tonal" @click="resetList" ></v-btn>

        </v-row>
        <v-row>
          <v-col md="6">
            <v-text-field v-model="postData.servingSize" label="Number of serving to claim:" type="number"  class="mt-2" variant="outlined" ></v-text-field>
          </v-col>
          <v-col md="6">
            <v-select
              v-model="postData.availableUntil"
              :role="rule"
              label="Available Until:"
              class="mt-2"
              :items="avTimeItems"
              variant="outlined"
              required
            ></v-select>
          </v-col>


        </v-row>
        <v-row  v-if="showProgress" class="align-center">
          <v-col md="1">
            <v-progress-circular

              color="primary"
              indeterminate
            >

            </v-progress-circular>
          </v-col>
          <v-col>
            <p>Uploading post. Please wait!</p>
          </v-col>
        </v-row>

      </v-card-item>


      <v-btn

        color="green"

        text="Submit"
        type="submit"
        @click=" onSumbit()"
        block
      ></v-btn>

    </v-card>
  </v-dialog>


  <v-snackbar
    v-model="snackbar"
    color="green"
    class="z-3"
  >
    Your new post was successfully created!
  </v-snackbar>
  <v-snackbar
    v-model="snackbarNotAv"

    class="z-3 text-white"
  >
    Feature coming soon!
  </v-snackbar>

</template>

<style scoped>
.myimage {

  object-fit: cover; /* or 'cover' depending on your needs */
}
</style>
