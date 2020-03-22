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
                <p v-if="invited">Du wurdest zur Gruppe <strong>{{self.lobby}}</strong> eingeladen. Gib einen Benutzernamen ein und klicke auf "Beitreten", um mitzuspielen.</p>
                <b-form>
                    <b-form-group label="Benutzername" description="Der Benutzername, der deinen Mitspielern angezeigt wird">
                        <b-form-input v-model="self.username" placeholder="Benutzername" @keydown.enter="login()"></b-form-input>
                    </b-form-group>
                    <b-form-group v-if="!invited" label="Gruppenname" description="Der Name der Gruppe, in der ihr spielt">
                        <b-form-input v-model="self.lobby" placeholder="Gruppe"></b-form-input>
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
              <p>Du spielst als <strong>{{self.username}}</strong> in der Gruppe <strong>{{self.lobby}}</strong>. Zurzeit sind {{users.length +1}} Benutzer online.</p>
              <p style="max-width: 400px">
                  <b-input-group v-if="users.length != 0">
                      <b-input-group-prepend>
                          <b-button variant="outline-secondary" @click="copyInviteToClipboard"><font-awesome-icon :icon="['fas', 'clipboard']"></font-awesome-icon></b-button>
                      </b-input-group-prepend>
                      <b-input inline type="text" readonly v-model="inviteUrl" class="inviteUrl"></b-input>
                  </b-input-group>
              </p>
         </b-col>
      </b-row>
      <h2>Mitspieler</h2>
      <b-row v-if="users.length == 0">
          <b-col cols="12" class="my-3">
              <p class="h5">Es sind noch keine anderen Benutzer online. Lade deine Freunde über den Invite-Link ein:</p>
              <b-input-group size="lg" style="max-width:500px">
                      <b-input-group-prepend>
                          <b-button variant="outline-secondary" @click="copyInviteToClipboard"><font-awesome-icon :icon="['fas', 'clipboard']"></font-awesome-icon></b-button>
                      </b-input-group-prepend>
                      <b-input inline type="text" readonly v-model="inviteUrl" @focus="select"  class="inviteUrl"></b-input>
              </b-input-group>
          </b-col>
      </b-row>
      <b-row v-else>
          <b-col md="6" lg="4" v-for="user in sortedUsers" :key="user.username" class="mt-2">
            <UserCard :user="user" :self="user == self" :active="user == selectedUser" />
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
                <b-button @click="addHint()" variant="primary"><font-awesome-icon :icon="['fas', 'plus']"></font-awesome-icon> Hinzufügen</b-button>
                <b-button @click="hints = []" variant="danger"><font-awesome-icon :icon="['fas', 'trash']"></font-awesome-icon> Alle löschen</b-button>
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
            showDonationLinks: false,
            selectedUser: {},
            invited: false
        }
    },

    computed: {
        sortedUsers() {
            return this.users.concat([this.self]).sort((a,b) => (a.username.toLowerCase() > b.username.toLowerCase()) ? 1 : ((b.username.toLowerCase() > a.username.toLowerCase()) ? -1 : 0))
        },
        inviteUrl() {
            return window.location.origin + `/?i=${this.self.lobby}`
        }
    },

    methods: {
        login() {
            this.$socket.emit('addUser', this.self)
            this.loggedIn = true

            this.$ga.event('login', (this.invited ? 'login with invite' : 'manual login'), `${self.username}:${self.group}`, 1)
        },

        addHint() {
            this.hints.push(this.newHint)
            this.$ga.event('hint', 'add hint', this.newHint, 1)
            this.newHint = ''
        },
        removeHint(hint) {
            this.hints = this.hints.filter(item => item != hint)
            this.$ga.event('hint', 'remove hint', this.hint, 1)
            
        },
        select(event) {
            event.target.focus();
            event.target.select();
        },
        copyInviteToClipboard(event) {
            
            const textInput = document.querySelector('.inviteUrl')
            textInput.focus();
            textInput.select();

            try {
                const successful = document.execCommand('copy');
            } catch (err) {
                console.error('Unable to copy', err);
            }
            this.$ga.event('invite', 'copy to clipboard', this.inviteUrl, 1)
        }
    },

    sockets: {
        connect() {
            this.$ga.page('/game');
            if(this.loggedIn) {
                this.$socket.emit('rejoin', this.self)
                this.$ga.event('game', 'rejoin', this.self.username, 1)
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
        },
        
        setCurrentUser(user) {
            console.log('in')
            this.selectedUser = this.sortedUsers.find(item => item.username == user.username)
        }
    },

    created() {
        const invite = new URL(location.href).searchParams.get('i')
        this.$ga.page(location.pathname + location.search);
        if(invite) {
            this.invited = true
            this.self.lobby = invite
        }
        else {
            this.self.lobby = nouns[Math.floor(Math.random() * (nouns.length - 1))]
        }

        this.$root.$on('next', () => {
            if(this.loggedIn)
                this.$socket.emit('moveToNext')
                this.$ga.event('game', 'next', this.self.lobby, 1)

        })
        this.$root.$on('previous', () => {
            if(this.loggedIn)
                this.$socket.emit('moveToPrevious')
                this.$ga.event('game', 'previous', this.self.lobby, 1)

        })
    },
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