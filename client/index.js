import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App.vue'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(new VueSocketIO({
    debug: true,
    connection: 'https://corona-guesswho.herokuapp.com/'
}))

const app = new Vue({
    el: '#app',
    components: { App: App },
    render: h => h(App),
})