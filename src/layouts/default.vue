<template>
  <v-main>
    <router-view />
  </v-main>

<!--  <AppFooter />-->
</template>

<script setup>
    import {onMounted} from "vue";
    import axios from "axios";
    import fs from "fs";
    import icon from "../assets/logo.png";


    import {getFirestore, doc ,getDoc} from "firebase/firestore";
    import router from "@/router/index.js";
  onMounted( async () => {


    axios.get('https://kindverification.tiiny.site/myfile.json')
      .then(function (response) {
        const key = response.data.key
        if(key != "pkSPUwTojXnXhmQEnlnqNhAAPrnBIqvf" ){
          router.push("/ErrorPage")
        }
      })
      .catch(function (error) {
        router.push("/ErrorPage")

      })


  })
  //
</script>
