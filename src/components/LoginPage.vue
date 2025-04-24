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
          <h2 class="mt-4 ">Welcome to Kindbites!</h2>
          <p class="text-sm-body-1">Please sign-in to your account</p>
          <div class="my-8"/>
          <div class="text-subtitle-1 text-medium-emphasis">Account</div>
          <v-text-field
            v-model = "email"
            type="email"
            density="default"
            placeholder="Email address"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
          ></v-text-field>

          <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
            Password

            <a
              class="text-caption text-decoration-none text-light-green"
              href="#"
              rel="noopener noreferrer"
              target="_blank"
            >
              Forgot login password?</a>
          </div>

          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
            :type="visible ? 'text' : 'password'"
            density="default"
            placeholder="Enter your password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"

            @click:append-inner="visible = !visible"

          ></v-text-field>

          <v-card
            class="mb-12"
            color="surface-variant"
            variant="tonal"
          >

          </v-card>

          <h2 class="text-red-accent-2">{{ errorMessageText }}</h2>
          <v-btn
            class="mb-8"
            color="green"
            size="large"
            variant="tonal"
            block
            @click="login"
          >
            Log In
          </v-btn>


          <v-card-text class="text-center text-lg">
            <a
              class="text-light-green text-decoration-none"
              @click="() => {
               router.push('/signup');
              }"
              rel="noopener noreferrer"
              target="_blank"
            >
              Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
            </a>
          </v-card-text>
        </v-container>
      </v-col>
      <v-col cols="12" md="6" class="d-none d-md-block">
        <v-img style="min-height: 650px"  src="../assets/login-image.png"    height="600"
               contain  ></v-img>
      </v-col>


    </v-row>

    </v-container>

</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import {useRouter} from "vue-router";

const router = useRouter()

const email = ref("")
const password = ref("")
const errorMessageText = ref("")

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {doc, getDoc, getFirestore} from "firebase/firestore";


const auth = getAuth();

const login = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (userCredential) => {
      // Signed in
      const db = getFirestore();
      const user = userCredential.user;
      console.log(user);
      const docRef = doc(db, "users", user.uid);
      const myinfo = await getDoc(docRef)
      const accountType = myinfo.data().accountType;
      console.log("UserInfo", myinfo.data());
      if(accountType === "Business") {
        router.push("/mainbus");
      }else{
        router.push("/mainui");
      }

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      password.value = ""
      errorMessageText.value = "Your email or password are incorrect";

    });

}
onMounted(() => {

})


const visible = ref(false)

</script>
