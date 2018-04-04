<template>
  <div id="app">
    <v-app>
      <h1>Take home client</h1>
      <div class="app-data">

        <div id="lists">
          <v-toolbar color="teal" dark>
            <v-toolbar-title>Playlists</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="createPlaylist">
              <v-icon class="material-icons">playlist_add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-form v-if="newPL">
            <v-text-field
              v-model="newPlaylist.title"
              label="Title">
            </v-text-field>
            <v-text-field
              v-model="newPlaylist.subtitle"
              label="Subtitle">
            </v-text-field>
            <v-btn color="primary" dark @click="newPL = false; newPlaylist.songs = []" flat>Cancel
            </v-btn>
            <v-btn color="primary" dark @click="uploadList">Create
              <v-icon dark right class="material-icons">check</v-icon>
            </v-btn>
          </v-form>
          <v-list two-line v-else>
            <template v-for="(item, index) in playlists">
            <v-list-tile
              avatar
              ripple
              @click="selectedPlaylist = playlists[index]"
              :key="item.title"
              v-bind:class="{isselected: item.id === selectedPlaylist.id}">
              <v-list-tile-content>
                <v-list-tile-title class="list-title">{{ item.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="index + 1 < playlists.length" :key="index"></v-divider>
          </template>
          </v-list>
        </div>

        <div id="songs">
          <v-toolbar color="teal" dark>
            <v-toolbar-title>Songs</v-toolbar-title>
          </v-toolbar>
          <v-list>
            <template v-for="(item, index) in filteredSongs">
            <v-list-tile
              avatar
              ripple
              @click="toggleSong(item.id)"
              :key="item.title"
              v-bind:class="{isselected: newPlaylist.songs.indexOf(item.id) > -1}">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="index + 1 < filteredSongs.length" :key="index"></v-divider>
          </template>
          </v-list>
        </div>
      </div>
    </v-app>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',

  data () {
    return {
      newPL: false,
      songs: [],
      playlists: [],
      selectedPlaylist: {},
      newPlaylist: {
        title: '',
        songs: [],
        subtitle: ''
      }
    }
  },

  computed: {
    filteredSongs: function () {
      return this.songs.filter(song => {
        return this.selectedPlaylist.songs.indexOf(song.id) > -1
      })
    }
  },

  methods: {
    createPlaylist: function () {
      this.newPL = true
      this.newPlaylist.songs = []
    },

    toggleSong: function (songID) {
      if (!this.newPL) {
        return
      }

      let index = this.newPlaylist.songs.indexOf(songID)

      if (index > -1) {
        this.newPlaylist.songs.splice(index, 1)
      } else {
        this.newPlaylist.songs.push(songID)
      }
    },

    uploadList: function () {
      axios
        .post(
          'https://uuptxxp1w1.execute-api.us-west-2.amazonaws.com/dev/create-playlist',
          this.newPlaylist
        )
        .then(response => {
          this.playlists.push(response.data)
          this.newPL = false
          this.newPlaylist.title = ''
          this.newPlaylist.subtitle = ''
          this.newPlaylist.songs = []
        })
        .catch(error => {
          console.log(error)
          this.newPL = false
          this.newPlaylist.title = ''
          this.newPlaylist.subtitle = ''
          this.newPlaylist.songs = []
          this.updateData()
        })
    },

    updateData: function () {
      axios
        .get(
          'https://uuptxxp1w1.execute-api.us-west-2.amazonaws.com/dev/list-songs'
        )
        .then(response => {
          this.songs = response.data
        })
        .catch(error => {
          console.log(error)
        })

      axios
        .get(
          'https://uuptxxp1w1.execute-api.us-west-2.amazonaws.com/dev/list-playlists'
        )
        .then(response => {
          console.log(response.data)
          this.playlists = response.data
          this.selectedPlaylist = this.playlists[0]
        })
        .catch(error => {
          console.log(error)
        })
    }
  },

  created: function () {
    // Get the files and lists
    this.updateData()
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h1 {
  margin-top: 1em;
}

.app-data {
  display: flex;
  flex-grow: 1;
  margin-top: 2em;
  margin-left: 1em;
  margin-right: 1em;
}

.isselected {
  background-color: #a1cec9;
}

.list-title {
  font-weight: bold;
}

#lists {
  flex-basis: 30%;
  margin-right: 1em;
}

#songs {
  flex-basis: 60%;
  flex-grow: 1;
}
</style>
