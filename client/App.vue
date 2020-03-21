<template>
<div>
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
                    <b-form-group label="Benutzername" description="Der Benutzername, der deinen Mitspielern angezeigt wird">
                        <b-form-input v-model="self.username" placeholder="Benutzername" @keydown.enter="login()"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Raum" description="Der Raum, in dem sich deine Mitspieler befinden bzw. dem sie beitreten müssen">
                        <b-form-input v-model="self.lobby" placeholder="Raum"></b-form-input>
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
              <p>Du spielst als <strong>{{self.username}}</strong> im Raum <strong>{{self.lobby}}</strong>. Zurzeit sind {{users.length +1}} Benutzer online.</p>
         </b-col>
      </b-row>
      <h2>Mitspieler</h2>
      <b-row v-if="users.length == 0">
          <b-col cols="12">Es sind noch keine anderen benutzer online</b-col>
      </b-row>
      <b-row v-else>
          <b-col md="6" lg="3" v-for="user in sortedUsers" :key="user.username" class="mt-2">
            <UserCard :user="user" :self="user == self" />
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
  <b-container class="mt-5">
      <b-row>
          <b-col cols="12" class="text-center">
              <b-link to="https://github.com/enbacode/corona-guesswho">Fork mich</b-link> |
              <b-link v-if="!showDonationLinks" @click="showDonationLinks = true">Spendier mir'n Bier</b-link>
              <span class="donate" v-else>
                  Spendier mir'n Bier via
                  <b-link to="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HJYDDRLYEM7P6&source=url">Paypal</b-link> oder
                  <b-link to="bitcoin:1JtHUpgiBaXtsZfXRewND6PQ9TPebY287B">Bitcoin</b-link>
              </span>
          </b-col>
      </b-row>
  </b-container>
  </div>
</template>

<script>
import nouns from './nouns.json'
import UserCard from './UserCard.vue'
export default {

    components: {
        UserCard
    },

    data() { 
        return {
            loggedIn: false,
            self: {
                username: '',
                alias: '',
                online: true,
                lobby: ''
            },
            users: [],
            hints: [],
            newHint: '',
            showDonationLinks: false
        }
    },

    computed: {
        sortedUsers() {
            return this.users.concat([this.self]).sort((a,b) => (a.username.toLowerCase() > b.username.toLowerCase()) ? 1 : ((b.username.toLowerCase() > a.username.toLowerCase()) ? -1 : 0))
        }
    },

    methods: {
        login() {
            this.$socket.emit('addUser', this.self)
            this.loggedIn = true
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
            if(this.loggedIn) {
                this.$socket.emit('rejoin', this.self)
            }
        },

        userJoined(user) {
            if(user.username == this.self.username) return
            user.edit = false
            user.online = true
            this.users.push(user)
        },

        userLost(user) {
            let lostUser = this.users.find(item => item.username == user.username)
            if(lostUser) {
                lostUser.online = false
                lostUser.lastSeen = user.lastSeen
            }
        },

        userRejoined(user) {
            let rejoinedUser = this.users.find(item => item.username == user.username)
            if(rejoinedUser)
                rejoinedUser.online = true
        },

        userLeft(user) {
            this.users = this.users.filter(item => item.username != user.username)
        },

        aliasChange(user) {
            console.log('received new alias', user.username, user.alias)
            if(user.username == this.self.username) return
            let userToChange = this.users.find(item => item.username == user.username)
            if(!userToChange) return
            userToChange.alias = user.alias
        }
    },

    created() {
        this.self.lobby = nouns[Math.floor(Math.random() * (nouns.length - 1))]
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