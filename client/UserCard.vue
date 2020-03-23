<template>
<b-card :img-src="imgUrl" img-height="200px" :class="'user-card' + (user.online ? '' : ' text-muted') + (active ? ' user-card-active' : '')">
    <b-card-sub-title v-if="self">Du</b-card-sub-title>
    <b-card-sub-title v-else>{{user.username}}</b-card-sub-title>

    <b-card-title v-if="self">???</b-card-title>
    <b-card-title v-else>
        {{user.alias}} 
    </b-card-title>

    <div class="mt-2">
        <b-input-group v-if="edit">
            <b-form-input inline label="alias" v-model="newAlias" @keydown.enter="changeAlias()"></b-form-input>
            <b-input-group-append>
                <b-button variant="outline-secondary" @click="getRandomAlias()"><font-awesome-icon :icon="['fas', 'random']"></font-awesome-icon></b-button>
                <b-button variant="outline-danger" @click="dismissAlias()"><font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon></b-button>
                <b-button variant="primary" @click="changeAlias()"><font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon></b-button>
            </b-input-group-append>
        </b-input-group>
        <b-input-group v-else>
            <b-button-group v-if="!self">
                <b-button variant="outline-primary" @click="edit = true" v-if="!self" :disabled="!user.online"><font-awesome-icon :icon="['fas', 'edit']"></font-awesome-icon></b-button>
                <b-button variant="outline-primary" @click="openUrl(googleUrl)"><font-awesome-icon :icon="['fab', 'google']"></font-awesome-icon></b-button>
            </b-button-group>
             <span class="mt-2 ml-3" v-if="!user.online">{{ countdown }}</span>
        </b-input-group>
    </div>
</b-card>
</template>

<script>
import moment from 'moment'
import unknownAvatar from './avatar-questionmark.png'
export default {

    props: ['user', 'self', 'active'],

    data() {
        return {
            edit: false,
            countdown: '',
            newAlias: this.user.alias,
            imgUrl: unknownAvatar,
        }
    },

    methods: {
        changeAlias() {
            this.edit = false
            this.user.alias = this.newAlias
            this.setImageUrl()
            this.$socket.emit('changeAlias', this.user)
            this.$ga.event('game', 'change alias', `${this.user.username}:${this.user.lobby}:${this.user.alias}`, 1)
        },
        getRandomAlias() {
            fetch('/alias')
                .then(response => response.json())
                .then(json => this.newAlias = json[0])
                this.$ga.event('game', 'random alias', `${this.user.username}:${this.user.lobby}:${this.user.newAlias}`, 1)
        },
        openUrl(url) {
            window.open(url, '_blank')
        },
        dismissAlias() {
            this.newAlias = this.user.alias
            this.edit = false
            this.$ga.event('game', 'dismiss alias', `${this.user.username}:${this.user.lobby}:${this.user.alias}`, 1)
        },
        setImageUrl() {
            if(this.self) {
                return
            }
            fetch(`/image?q=${encodeURI(this.user.alias)}`)
            .then(res => {
                if(!res.ok)
                    throw Error()
                return res
            })
            .then(res => res.json())
            .then(json => json[0])
            .then(imageUrl => this.imgUrl = imageUrl)
            .catch(() => {
                this.imgUrl = unknownAvatar
            })
        }
    },

    created() {
        setInterval(() => { this.countdown = moment(this.user.lastSeen).add(30, 'minutes').subtract(moment.now()).format('mm:ss') }, 1000)
        this.setImageUrl()
    },

    sockets: {
        aliasChange(user) {
            if(this.self)
                return
            if(user.username != this.user.username)
                return
            this.user.alias = user.alias
            this.setImageUrl()
        },
    },

    computed: {
        googleUrl() {
            return 'https://www.google.com/search?q=' + encodeURI(this.user.alias)
        }
    }
}
</script>

<style>
.user-card {
    min-height: 335px;
}
.user-card .card-img {
    object-fit: cover;
}
.user-card-active {
    box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
}
</style>
