<template>
<b-card :title="self ? 'Du' : user.username" :sub-title="self ? '???' : user.alias" :class="'user-card' + (user.online ? '' : ' text-muted') + (active ? ' user-card-active' : '')">
    <b-input-group v-if="edit">
        <b-form-input inline label="alias" v-model="user.alias" @keydown.enter="changeAlias()"></b-form-input>
        <b-input-group-append>
            <b-button variant="primary" @click="changeAlias()">Speichern</b-button>
        </b-input-group-append>
    </b-input-group>
    <b-form-input-group v-else>
        <b-button variant="primary" @click="edit = true" v-if="!self" :disabled="!user.online">Ändern</b-button> <span v-if="!user.online">{{ countdown }}</span>
    </b-form-input-group>
</b-card>
</template>

<script>
import moment from 'moment'
export default {

    props: ['user', 'self', 'active'],

    data() {
        return {
            edit: false,
            countdown: ''
        }
    },

    methods: {
        changeAlias() {
            this.edit = false
            this.$socket.emit('changeAlias', this.user)
        },
    },

    created() {
        setInterval(() => { this.countdown = moment(this.user.lastSeen).add(30, 'minutes').subtract(moment.now()).format('mm:ss') }, 1000)
    }
}
</script>

<style>
.user-card {
    min-height: 140px;
}
.user-card-active {
    box-shadow: 0 0 0 0.2rem rgba(38, 143, 255, 0.5);
}
</style>
