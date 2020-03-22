import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faRandom, faEdit, faPlus, faTrash, faClipboard, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

require('dotenv').config()

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

library.add(faCheck, faRandom, faEdit, faPlus, faTrash, faClipboard, faTimes)
library.add(faGoogle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(new VueSocketIO({
    debug: true,
    connection: process.env.CONNECTION
}))

const app = new Vue({
    el: '#app',
    components: { App: App },
    render: h => h(App),
    mounted() {
        const vm = this
        window.addEventListener('keyup', event => {
            if(event.keyCode == 39)
                vm.$emit('next')
            if(event.keyCode == 37)
                vm.$emit('previous')
        })
    }
})