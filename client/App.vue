<template>
  <b-container v-if="!loggedIn">
      <b-row>
          <b-col offset-md="3" class="mt-3">
              <h1>🦠 - Wer bin ich?</h1>
         </b-col>
      </b-row>
      <b-row class="mt-3">
          <b-col md="6" offset-md="3">
              <b-card>
                <b-form>
                    <b-form-group label="Benutzername">
                        <b-form-input v-model="username" placeholder="Benutzername"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Raum">
                        <b-form-input v-model="lobbyName" placeholder="Raum"></b-form-input>
                    </b-form-group>
                    <b-form-group>
                        <b-button block variant="primary" class="mt-1" @click="login()">Beitreten</b-button>
                    </b-form-group>
                </b-form>
              </b-card>
          </b-col>
      </b-row>
  </b-container>
  <b-container v-else>
      <b-row>
          <b-col cols="12" class="mt-3">
              <h1>🦠 - Wer bin ich?</h1>
         </b-col>
      </b-row>
      <b-row>
          <b-col cols="12">
              <p>Du spielst als <strong>{{username}}</strong> im Raum <strong>{{lobbyName}}</strong>. Zurzeit sind {{users.length +1}} Benutzer online.</p>
         </b-col>
      </b-row>
      <h2>Mitspieler</h2>
      <b-row v-if="users.length == 0">
          <b-col cols="12">Es sind noch keine anderen benutzer online</b-col>
      </b-row>
      <b-row v-else>
          <b-col md="6" lg="3" v-for="user in sortedUsers" :key="user.username" class="mt-2">
            <b-card :title="user.username">
                <b-input-group>
                    <b-form-input inline label="alias" v-model="user.alias" @change="changeAlias(user)"></b-form-input>
                    <b-input-group-append>
                        <b-button variant="primary" @change="changeAlias(user)">Ändern</b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-card>
          </b-col>
      </b-row>
      <h2 class="mt-3">Notizen</h2>
      <b-row class="mb-3">
          <b-card v-for="hint in hints" :key="hint" class="ml-3 mr-2 mb-2">{{hint}} <b-button class="close hint-close"><b-icon-x @click="removeHint(hint)"></b-icon-x></b-button></b-card>
      </b-row>
      <b-row>
          <b-col cols="12">
              <b-form-group>
                <b-form-input v-model="newHint" placeholder="Neue Notiz" @keydown.enter="addHint()"></b-form-input>
              </b-form-group>
            <b-form-group>
                <b-button @click="addHint()" variant="primary">Hinzufügen</b-button>
                <b-button @click="hints = []" variant="danger">Alle löschen</b-button>
            </b-form-group>
          </b-col>
      </b-row>
  </b-container>
</template>

<script>
import nouns from './nouns.json'
export default {

    data() { 
        return {
            loggedIn: false,
            username: '', 
            users: [],
            hints: [],
            newHint: '',
            lobbyName: ''
        }
    },

    computed: {
        sortedUsers() {
            return this.users.sort((a,b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0))
        }
    },

    methods: {
        login() {
            this.$socket.emit('addUser', {
                username: this.username,
                lobby: this.lobbyName
            })
            this.loggedIn = true
        },

        changeAlias(user) {
            this.$socket.emit('changeAlias', user)
        },

        addHint() {
            this.hints.push(this.newHint)
            this.newHint = ''
        },
        removeHint(hint) {
            this.hints = this.hints.filter(item => item != hint)
        }
    },

    sockets: {
        connect() {
            console.log('connected')
        },

        userJoined(user) {
            if(user.username == this.username) return
            this.users = this.users.filter(item => item.username != user.username)
            this.users.push(user)
        },

        userLeft(user) {
            this.users = this.users.filter(item => item.username != user.username)
        },

        aliasChange(user) {
            console.log('received new alias', user.username, user.alias)
            if(user.username == this.username) return
            this.users = this.users.filter(item => item.username != user.username)
            this.users.push(user)
        }
    },

    created() {
        this.lobbyName = nouns[Math.floor(Math.random() * (nouns.length - 1))]
    }
}
</script>

<style>
.hint-close {
    font-size: 1rem !important;
    margin-top: .25rem !important;
    margin-left: .5rem !important;
}

body {
    background-color: #f0f2f5 !important;
}
</style>