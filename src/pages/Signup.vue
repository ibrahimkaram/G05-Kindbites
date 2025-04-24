<script setup>

  import {ref , watch} from "vue";
  const accountType = ref("Personal")
  const pageIndex = ref(0)
  const visible = ref(false) ;
  const isDisabled = ref(false);
  const selected = ref('')
  const dietaryPreferences = ref(['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Gluten-Free', 'Dairy-Free', 'Low-Carb'])

  const dietaryList = ref([])
  const timeItems = ref([
    "12:00 AM", "12:30 AM",
    "01:00 AM", "01:30 AM",
    "02:00 AM", "02:30 AM",
    "03:00 AM", "03:30 AM",
    "04:00 AM", "04:30 AM",
    "05:00 AM", "05:30 AM",
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


  const  account = reactive({
    name: "",
    email : "",
    password: "",
    accountType : accountType.value,
    zip:"",
    city:"",
    website:"",
    foodType : [],
    address: "",
    openingTime: "",
    closingTime:""

  })


  import personalImage  from "../assets/personal-signup.png";
  import signupScreen  from "../assets/signup-screen.png";
  import {createUserWithEmailAndPassword, getAuth} from "firebase/auth";


  const dynamicPlaceHolder =  () => {
      if(accountType.value === "Personal"){
        return "Enter name"
      }
      else return "Enter business name"
  }

  const dynamicImagepath =  () => {
    if(accountType.value === "Personal"){
      return personalImage
    }
    else return signupScreen
  }
  const progvalue = ref(20)


  const addSelection =  (value, oldval) => {
    console.log('value:' , value)
    dietaryList.value.push(value)
    account.foodType = dietaryList.value
  }
  const resetList =  () => {
    dietaryList.value = []
    account.foodType = []
  }
  const auth = getAuth();
  import {getFirestore, doc, updateDoc, setDoc} from "firebase/firestore";
  const db = getFirestore();

  const loading = ref(0);

  const registerUser = ( ) =>{
    createUserWithEmailAndPassword(auth,account.email, account.password)
      .then((userCredential) => {
        // Signed up
        const uid = userCredential.user.uid;
        const userRef = doc(db, "users", uid);
        const accData =  {... account} ;
        delete  accData.password;
        accData.accountType = accountType.value;
        console.log("Account: " ,accData )

        setDoc(userRef, accData);

        console.log("User account created successfully! " , userCredential );
        loading.value = 2;

      })
      .catch((error) => {
        console.log(error)
        loading.value = 1;
      })
  }


  function navigateNext() {

    if(accountType.value === "Personal"){
      pageIndex.value = 1;
      isDisabled.value = false;
    }
    else if(accountType.value === "Business"){
      pageIndex.value = 2;
    }

  }




  watch( account , ()=>{

    if(pageIndex.value == 0 ){
      if(account.name.trim().length > 0 && account.email.trim().length > 5  && account.password.trim().length > 5){
       isDisabled.value = true;
      }
      else {
        isDisabled.value = false;
      }
    }

    if(pageIndex.value == 1 ){

      if(account.zip.toString().trim().length === 5  && account.city.length > 2  ){
        isDisabled.value = true;
      }
      else {
        isDisabled.value = false;
      }
    }

  })


  watch(selected, addSelection)


</script>

<template>


  <div class="d-flex justify-start pa-4">
    <img src="../assets/kindbiteslogo.svg" height="60" />
  </div>

  <v-container    class="mx-auto pa-10" max-width="1200">
    <v-row class=" justify-center align-center" >
      <v-col cols="12" md="6">
        <v-container
          class="mx-auto pa-12 pb-8"
          max-width="448"
        >
          <h2 class="mt-4 ">Create {{ accountType }} Your Account</h2>
          <v-progress-linear color="green-lighten-1" class="my-4 rounded" :model-value="progvalue" :height="7"></v-progress-linear>
          <div class="my-6"></div>
          <div v-if="pageIndex === 0" >
            <v-btn-toggle  v-model="accountType" color="green-lighten-1"  mandatory>
              <v-btn value="Personal">Personal</v-btn>
              <v-btn value="Business">Business</v-btn>

            </v-btn-toggle>
            <div class="my-8"/>
            <div class="text-subtitle-1 text-medium-emphasis">{{ (accountType == "Personal" ) ?  "" : "Business " }}Name</div>
            <v-text-field
              v-model="account.name"
              density="default"
              :placeholder="dynamicPlaceHolder()"
              variant="outlined"
              :rules="[v => !!v || 'Name is required']"
            ></v-text-field>

            <div class=" mt-2 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Email address
            </div>

            <v-text-field
              v-model="account.email"
              type="email"
              density="default"
              placeholder="Enter your email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"

              :rules="[v => !!v || 'Email is required' , v=> /.+@.+\..+/.test(v) || 'Email must be valid']"
            ></v-text-field>


            <div class="mt-2 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Password
            </div>

            <v-text-field
              v-model="account.password"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'"
              density="default"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              :rules="[v => !!v || 'Password is required']"
              @click:append-inner="visible = !visible"
            ></v-text-field>

            <v-card
              class="mb-6"
              color="surface-variant"
              variant="tonal"
            >

            </v-card>


            <v-btn
              class="mb-8"
              color="green-lighten-1"
              size="large"
              :disabled="!isDisabled"
              block
              @click="() => {  navigateNext()  ; progvalue=60}"
            >
              Next
            </v-btn>



          </div>

          <div v-if="pageIndex === 1" >

             <h3>
               Personalize Your Experience
             </h3>
            <div class="my-8"/>
            <div class="text-subtitle-1 text-medium-emphasis">Zip Code</div>
            <v-text-field
              v-model="account.zip"
              density="default"
              placeholder="Enter your zip code"
              variant="outlined"
              type="number"
              maxlength="5"
              counter
              :rules="[v => !!v || 'Zip code is required',
                       v => v.length == 5 || 'Zip not valid']"
            ></v-text-field>

            <div class=" mt-1 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              City
            </div>

            <v-text-field
              v-model="account.city"
              density="default"
              placeholder="Enter your city name"

              variant="outlined"
              :rules="[v => !!v || 'City name is required']"
            ></v-text-field>


            <div class=" mt-1 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Dietary Preferences (Optional)
            </div>

          <v-select
            variant="outlined"
            :items="dietaryPreferences"
            v-model="selected"
            placeholder="Select dietary preference"

          >


          </v-select>

            <v-row class="my-1">
              <v-chip
                v-for="(tag, index) in dietaryList"
                :key="index"
                class="ma-1"
                color="green"
              >
                {{ tag }}
              </v-chip>
              <v-btn v-if="dietaryList.length > 0" density="compact" icon="mdi-restore"  variant="tonal" @click="resetList" ></v-btn>

            </v-row>







            <v-dialog max-width="500"  persistent>
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  class="mb-8 mt-4"
                  color="green-lighten-1"
                  size="large"
                  :disabled="!isDisabled"
                  @click ="()=>{
                    console.log('clicked');
                    registerUser()
                  }"
                  block
                >
                  Submit
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <div v-if="loading === 2">
                  <v-card title="Gongrats!">
                    <v-card-text>
                      Your account has been created successfully!
                      You can now log in and start using all the features.  </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        text="Log In"
                        to="/"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>

                </div>
                <div v-if="loading === 0" >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="40"
                  />
                </div>
                <div v-if="loading === 1" >
                  <v-card title="Error!">
                    <v-card-text>
                      Your account has not been created !
                       </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        text="Try again"
                        to="/"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>
                </div>

              </template>
            </v-dialog>

          </div>


          <div v-if="pageIndex === 2" >

            <h3>
              Tell Us About Your Business
            </h3>
            <div class="my-8"/>
            <div class="text-subtitle-1 text-medium-emphasis">Zip Code</div>
            <v-text-field
              density="default"
              placeholder="Enter your zip code"
              variant="outlined"
              type="number"
              maxlength="5"
              v-model="account.zip"
              counter
              :rules="[v => !!v || 'Zip code is required',
                       v => v.length == 5 || 'Zip not valid']"
            ></v-text-field>

            <div class=" mt-1 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Physical Address
            </div>

            <v-text-field
              density="default"
              placeholder="Enter your business address "
              v-model="account.address"
              variant="outlined"
              :rules="[v => !!v || 'Address is required']"
            ></v-text-field>


            <div class=" mt-1 mb-3 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Business Hours
            </div>

            <v-row>
              <v-col cols="6">
<!--                <v-text-field-->
<!--                  density="default"-->
<!--                  placeholder="Enter your business address "-->
<!--                  type="time"-->
<!--                  variant="outlined"-->
<!--                  :rules="[v => !!v || 'opening time is required']"-->
<!--                ></v-text-field>-->
                <v-select
                  v-model="account.openingTime"
                  label="Open Time:"
                  class="mt-2"
                  :items="timeItems"
                  variant="outlined"
                ></v-select>

              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="account.closingTime"
                  label="Closing Time:"
                  class="mt-2"
                  :items="timeItems"
                  variant="outlined"
                ></v-select>


              </v-col>
            </v-row>

            <v-btn
              class="mb-8"
              color="green-lighten-1"
              size="large"
              block
              @click="() => {  pageIndex = 3 ; progvalue=80}"
            >
              Next
            </v-btn>








          </div>

          <div v-if="pageIndex === 3" >

            <h3>
              Tell Us About Your Business
            </h3>
            <div class="my-8"/>
            <div class="text-subtitle-1 text-medium-emphasis">Business WebSite</div>
            <v-text-field
              v-model = "account.website"
              density="default"
              placeholder="Enter your website"
              variant="outlined"
              type="text"
            ></v-text-field>






            <div class=" mt-1 text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
              Food Type (Optional)
            </div>

            <v-select
              variant="outlined"
              :items="dietaryPreferences"
              v-model="selected"
              placeholder="Select dietary preference"

            >


            </v-select>

            <v-row class="my-1">
              <v-chip
                v-for="(tag, index) in dietaryList"
                :key="index"
                class="ma-1"
                color="green"
              >
                {{ tag }}
              </v-chip>
              <v-btn v-if="dietaryList.length > 0" density="compact" icon="mdi-restore"  variant="tonal" @click="resetList" ></v-btn>

            </v-row>

          <div class="mt-16"/>




            <v-dialog max-width="500"  persistent>
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  class="mb-8 mt-4"
                  color="green-lighten-1"
                  size="large"
                  :disabled="!isDisabled"
                  @click ="()=>{
                    console.log('clicked');
                    registerUser()
                  }"
                  block
                >
                  Submit
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <div v-if="loading === 2">
                  <v-card title="Gongrats!">
                    <v-card-text>
                      Your account has been created successfully!
                      You can now log in and start using all the features.  </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        text="Log In"
                        to="/"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>

                </div>
                <div v-if="loading === 0" >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="40"
                  />
                </div>
                <div v-if="loading === 1" >
                  <v-card title="Error!">
                    <v-card-text>
                      Your account has not been created !
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        text="Try again"
                        to="/"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>
                </div>

              </template>
            </v-dialog>

          </div>


        </v-container>
      </v-col>
      <v-col cols="12" md="6" class="d-none d-md-block">
        <v-img style="min-height: 650px"  :src="dynamicImagepath()"  height="600"
               contain  ></v-img>
      </v-col>


    </v-row>

  </v-container>



</template>

<style scoped lang="sass">

</style>
