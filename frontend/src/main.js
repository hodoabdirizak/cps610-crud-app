import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import vuetify from './plugins/vuetify'
import 'vuetify/styles';  // Make sure to import the Vuetify styles

const vuetifyInstance = createVuetify()  // This is the correct way to create Vuetify instance

const app = createApp(App)
app.use(vuetifyInstance)
app.mount('#app')
