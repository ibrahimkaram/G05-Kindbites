/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA13XTktpRwE9wJ6sqjBhUlkKMiPgZnXhk",
  authDomain: "kindbites-63bc2.firebaseapp.com",
  projectId: "kindbites-63bc2",
  storageBucket: "kindbites-63bc2.firebasestorage.app",
  messagingSenderId: "397027180787",
  appId: "1:397027180787:web:b1002661832f9b4703f786",
  measurementId: "G-PNTKS2KNPE"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

const app = createApp(App)

registerPlugins(app)



app.mount('#app')
