<script setup>
import {onMounted, ref} from "vue"
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import router from "@/router/index.js";
const dialog2 = ref(false)
const  items = ref( [
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
  "09:00 PM"
])

const  userId = ref("")
const userInfo = ref({
  name: ""
})
const postList = ref([
  ])

const myClaims = ref([
])
const selectedPost = ref(null)
const db = getFirestore();


const openPostDetail = (post )=>{
  selectedPost.value = post;
  dialog2.value = true;
  console.log(post);

}

const logout = async () => {

  const auth =  getAuth()
  auth.signOut().then(() => {
    router.push('/')
  });

}

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

    const q2 = query(collection(db, "claims"), where("claimedBy" ,"==", userId.value));
    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      myClaims.value = []
      querySnapshot.forEach((doc) => {
        myClaims.value.push({
          id: doc.id,
          data: doc.data()
        });
      });


    });

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

const claimedSize = ref(1)
const eta = ref("")

const claim = async () => {

  const mydoc =   doc(db,"posts",selectedPost.value.id)
  const docSnap = await getDoc(mydoc);
  console.log("post", docSnap.data())
  const data = docSnap.data()

  const servedPost = Number(data.served)

  const myServing = Number(claimedSize.value)

  if(servedPost + myServing <= Number(data.servingSize) ){

    let newSize = myServing + servedPost

    updateDoc(mydoc , {
      served: newSize,
    })
    const colRef = collection(db, 'claims');
    const newClaim = {
      busId: selectedPost.value.data.busId,
      serving: myServing,
      claimedBy: userId.value,
      busInfo: selectedPost.value.data.busInfo,
      eta:eta.value,
      claimedInfo: userInfo.value,
      postName: selectedPost.value.data.postName,
      imageUrl: selectedPost.value.data.imageUrl,
    }
    addDoc(colRef, newClaim).then( () => {

      dialog2.value = false

    }).catch((error) => {
      claimedSize.value = 1;
        alert('Error in creating post: ' + error)
      } )

  }else{
    alert("The claimed size is larger than what is available!")
  }

//  await updateDoc(doc(db, "users", user.value), {imageUrl: imageUrl})

}
</script>

<template>
  <v-app-bar class="d-flex justify-content-between " :elevation="2">
<!--    <template v-slot:prepend>-->
<!--      <v-app-bar-nav-icon></v-app-bar-nav-icon>-->
<!--    </template>-->


      <img class="mx-6" src="../assets/kindbiteslogo.svg" height="60" />
    <v-app-bar-title>Food Posting List:</v-app-bar-title>
    <v-btn class="mz-2">
      My Claims
    </v-btn>
    <v-btn @click="logout" color="green">
      Logout
    </v-btn>

  </v-app-bar>
  <v-container>
    <h2 class="ma-3">My Claims</h2>
    <v-empty-state
      v-if="myClaims.length === 0"
      icon="mdi-food"
      title="No active claims Right Now"
      text="All the food donations have been picked up! New items are added often, so keep an eye out for fresh opportunities."
    ></v-empty-state>
    <v-card v-else>
      <v-table  theme="light">
        <thead>
        <tr>
          <th class="text-left">

          </th>
          <th class="text-left w-25">
            Post name
          </th>
          <th class="text-left">
            My Serving
          </th>
          <th class="text-left">
            My Eta
          </th>
          <th class="text-left">
            Restaurant Name
          </th>
          <th class="text-left">
            Address
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
          <td class="">
            {{item.data.eta}}
          </td>
          <td class="">
            {{item.data.busInfo.name}}
          </td>
          <td>
            {{item.data.busInfo.address}}
          </td>
        </tr>
        </tbody>
      </v-table>
    </v-card>


    <h2 class="ma-3 my-6">Recently Added</h2>
    <v-row>
      <v-col v-for="item in postList"  :key="item.id" md="3" class="">
        <v-card >
          <img class="myimage" :src="item.data.imageUrl" width="100%" height="200" />

          <v-card-title>{{item.data.postName || 'N/A'}}</v-card-title>

          <v-card-text>Restaurant: {{}}
            <b>{{ item.data.busInfo.name || 'N/A'}}</b><br>Zip: {{item.data.busInfo.zip || 'N/A'}}

            <br>Serving {{item.data.served  }}/{{ item.data.servingSize || 'N/A'}}</v-card-text>
          <v-card-subtitle>Available Unit: {{item.data.availableUntil || 'N/A'}}</v-card-subtitle>
          <v-card-actions >
            <v-btn color="green" @click="openPostDetail(item)">Claim</v-btn>

          </v-card-actions>

        </v-card>
      </v-col>

    </v-row>
    <v-dialog
      v-model="dialog2"
      width="auto"
    >
      <v-card

        width="600"
      > <h2 class="ma-4">{{selectedPost.data.postName}}</h2>
        <img class="myimage" :src="selectedPost.data.imageUrl" width="100%" height="400" />


        <v-card-title > {{selectedPost.data.busInfo.name}}</v-card-title>

        <v-card-item>
          <p><strong>Address:</strong><br>{{selectedPost.data.busInfo.address}}</p>
          <p class="mt-2"><strong>Details:</strong><br>{{selectedPost.data.details}}</p>
        </v-card-item>
        <v-card-text>
          <strong>WebSite:</strong> {{selectedPost.data.busInfo.website}}<br>
          <strong>Serving:</strong> {{selectedPost.data.served}}/{{selectedPost.data.servingSize}}<br>
          <strong>Available Until:</strong> {{selectedPost.data.availableUntil}}

          <br>  <strong>Allergens:</strong>
          <v-chip-group v-if="selectedPost.data.foodAllergens.length>0">
            <v-chip v-for="item in selectedPost.data.foodAllergens" >{{item}}</v-chip>
          </v-chip-group>
          <p v-else>None</p>

        </v-card-text>


        <v-card-item>
          <v-row>
            <v-col md="6">
              <v-text-field v-model="claimedSize" label="Number of serving to claim:" type="number" class="mt-2" variant="outlined" ></v-text-field>
            </v-col>
            <v-col md="6">
              <v-select
                v-model="eta"
                label="Pickup Time:"
                class="mt-2"
                :items="items"
                variant="outlined"
              ></v-select>
            </v-col>

          </v-row>

        </v-card-item>


        <v-btn

          color="green"

          text="Claim"
          @click="claim"
        ></v-btn>

      </v-card>
    </v-dialog>

  </v-container>
  <div class="ma-16"></div>
  <v-footer class=" myFooter w-100 text-center d-flex flex-column ga-2 py-4" color="green-lighten-1">

    <div>
      {{ new Date().getFullYear() }} — <strong>KindBites</strong>
    </div>
  </v-footer>
</template>

<style scoped >
.myimage {

  object-fit: cover; /* or 'cover' depending on your needs */
}
.myFooter {
  position:fixed;
  bottom:0;
}
</style>
