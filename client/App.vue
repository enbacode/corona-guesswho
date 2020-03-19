<template>
  <b-container v-if="!loggedIn">
      <b-row>
          <b-col cols="12">
              <h1>guess who</h1>
         </b-col>
      </b-row>
      <b-row class="mt-5">
          <b-col cols="12">
          <b-form>
            <b-form-input v-model="username" placeholder="Benutzername"></b-form-input>
            <b-button block variant="primary" class="mt-1" @click="login()">Beitreten</b-button>
          </b-form>
          </b-col>
      </b-row>
  </b-container>
  <b-container v-else>
      <b-row>
          <b-col cols="12">
              <h1>guess who</h1>
         </b-col>
      </b-row>
      <b-row>
          <b-col cols="12">
              <p>Du spielst als <strong>{{username}}</strong></p>
         </b-col>
      </b-row>
      <b-row v-for="user in users" :key="user.username" class="mt-2">
          <b-col md="6" lg="3">
            <b-card :title="user.username">
                <b-form-group>
                <b-form-input inline v-model="user.alias" @change="changeAlias(user)"></b-form-input>
                </b-form-group>
                <b-button variant="primary" @change="changeAlias(user)">Ändern</b-button>
            </b-card>
          </b-col>
      </b-row>
  </b-container>
</template>

<script>
export default {

    data() { 
        return {
            loggedIn: false,
            username: '', 
            users: []
        }
    },

    methods: {
        login() {
            this.$socket.emit('addUser', this.username)
            this.loggedIn = true
        },

        changeAlias(user) {
            this.$socket.emit('changeAlias', user)
        }
    },

    sockets: {
        connect() {
            console.log('connected')
        },

        userJoined(user) {
            if(user.username == this.username) return
            this.users = this.users.filter(item => item.username != alias.username)
            this.users.push(user)
        },

        userLeft(user) {
            this.users = this.users.filter(item => item.username != user.username)
        },

        aliasChange(user) {
            console.log('received new alias', user.username, user.alias)
            if(user.username == this.username) return
            this.users = this.users.filter(item => item.username != alias.username)
            this.users.push(user)
        }
    },

    created() {
        console.log('created')
    }
}
</script>

<style>

</style>