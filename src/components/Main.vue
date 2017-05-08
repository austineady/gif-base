<template>
  <main>
    <div id="page">
      <nav>
        <div class="container">
          <h1 @click="trendingClick">GifBase</h1>
          <ul>
            <li v-show="category === 'stickers'" @click="gifsClick">Gifs</li>
            <li v-show="category === 'gifs'" @click="stickersClick">Stickers</li>
            <li v-show="search !== ''" @click="trendingClick">Trending</li>
          </ul>
          <div class="input-bg">
            <i class="fa fa-search"></i>
            <input id="search" type="search" v-model="search" name="search" placeholder="Type in keywords to search"/>
          </div>
        </div>
      </nav>
      <section>
        <div class="container">
  <!--         <ul class="emotion-list">
    <li v-for="emotion in emotions" :class="emotion.color" @click="handleEmotion(emotion.name)">{{ emotion.name }}</li>
  </ul> -->
          <div class="h-right">
            <input type="checkbox" id="one" value="!nsfw" v-model="nsfw">
            <label for="one">NSFW</label>
          </div>
        </div>
      </section>
      <grid :gifs="gifs" :history="historyList" :store="canStore"></grid>
      <div class="container h-center">
        <button v-if="offset >= limit" @click="offset -= limit">Previous Page</button>
        <button v-else class="disabled">Previous Page</button>
        <button @click="offset += limit">Next Page</button>
      </div>
    </div>
    <history :data="historyList"></history>
  </main>
</template>

<script>
import Grid from './Grid';
import History from './History';
import cache from '../cache';
import emotions from '../../static/emotions';

export default {
  data() {
    return {
      search: '',
      query: '',
      gifs: [],
      url: '',
      hash: '',
      category: 'gifs',
      endpoint: 'trending',
      limit: 25,
      offset: 0,
      pageNum: 1,
      nsfw: false,
      cacheStore: cache,
      historyList: [],
      canStore: false,
      emotions,
    };
  },
  created() {
    if (this.storageAvailable('localStorage')) {
      this.canStore = true;

      if (localStorage.getItem('gifshistory')) {
        this.history = localStorage.getItem('gifshistory');
      }
    }
  },
  mounted() {
    document.getElementById('search').select();
    this.handlePage();
    if (this.$route.query !== undefined) {
      this.search = this.$route.query.q !== undefined ? this.$route.query.q : '';
    }
  },
  beforeUpdate() {
    document.getElementById('history').style.height = document.getElementById('grid').style.height;
  },
  watch: {
    search() {
      if (this.search === '') {
        this.$router.push({ path: '/' });
      } else if (this.search.match(/[+]/) !== null) {
        this.search = this.search.replace('+', ' ');
      } else {
        this.query = this.search.replace(' ', '+');
      }
    },
    query() {
      const self = this;
      this.endpoint = 'search';
      window.setTimeout(() => {
        self.$router.push({ path: 'search', query: { q: this.query } });
      }, 2000);
    },
    url(url) {
      if (cache.cacheList.indexOf(this.url) === -1) {
        // new search
        cache.cacheList.push(this.url);
        this.fetchData(url);
        console.log('New Search');
      } else {
        // duplicate search
        this.gifs = cache.gifCache[cache.cacheList.indexOf(this.url)];
        console.log('Cache Used');
      }
    },
    offset() {
      if (this.search !== '') {
        this.endpoint = 'search';
      } else {
        this.endpoint = 'trending';
      }
      const pageCalc = Math.round(this.offset / this.limit);
      if (pageCalc > 0 && this.query !== '') {
        this.$router.push({ path: this.endpoint, query: { q: this.query, page: pageCalc } });
      } else if (pageCalc > 0 && this.query === '') {
        this.$router.push({ path: this.endpoint, query: { page: pageCalc } });
      } else if (pageCalc <= 0 && this.query !== '') {
        this.$router.push({ path: this.endpoint, query: { q: this.query } });
      } else {
        this.$router.push({ path: this.endpoint });
      }
    },
    category() {
      this.buildUrl();
    },
    limit() {
      this.buildUrl();
    },
    nsfw() {
      this.buildUrl();
    },
    $route: 'handlePage',
  },
  methods: {
    buildUrl() {
      const rtng = this.nsfw ? 'r' : 'pg';
      if (this.search !== '') {
        // const query = this.search.split(' ').join('+');
        this.url = 'https://api.giphy.com/v1/' + this.category + '/search?q=' + this.search + '&limit=' + this.limit + '&offset=' + this.offset + '&rating=' + rtng + '&api_key=dc6zaTOxFJmzC';
      } else {
        this.endpoing = 'trending';
        this.search = '';
        this.query = '';
        this.url = 'https://api.giphy.com/v1/' + this.category + '/trending?limit=' + this.limit + '&offset=' + this.offset + '&rating=' + rtng + '&api_key=dc6zaTOxFJmzC';
      }
    },
    fetchData(url) {
      const self = this;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = () => {
        let res = JSON.parse(xhr.responseText);
        res = res.data;
        self.gifs = [];
        self.gifs = res;
        cache.gifCache.push(res);
      };
      xhr.send();
    },
    increaseLimit() {
      this.offset += this.limit;
      this.buildUrl();
    },
    resetSearch() {
      this.offset = 0;
      this.limit = 25;
    },
    handlePage() {
      if (this.$route.query !== undefined) {
        if (this.$route.query.q !== undefined) {
          this.search = this.$route.query.q !== undefined ? this.$route.query.q : '';
        }
        if (this.$route.query.page !== undefined) {
          this.offset = this.$route.query.page * this.limit;
        } else {
          this.offset = 0;
        }
      } else {
        this.$router.push({ path: '/' });
      }
      this.buildUrl();
    },
    trendingClick() {
      this.search = '';
      this.query = '';
      this.$router.push({ path: 'trending' });
    },
    stickersClick() {
      this.category = 'stickers';
      this.pageNum = 1;
      this.offset = 0;
    },
    gifsClick() {
      this.category = 'gifs';
      this.pageNum = 1;
      this.offset = 0;
    },
    gifClicked(gif) {
      this.historyList.push(gif);
      if (this.canStore) {
        localStorage.setItem('gifshistory', this.historyList);
      }
    },
    storageAvailable(type) {
      try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  components: {
    grid: Grid,
    history: History,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '../global.scss';

section {
  background-color: darken($green, 5%);
  padding: 15px;
  height: 30px;
  font-family: 'Montserrat', sans-serif;
  color: white;
  line-height: 30px;

  label {
    display: inline-block;
    vertical-align: top;
  }

  input[type="checkbox"] {
    display: inline-block;
    vertical-align: top;
    background-color: lighten($green, 15%);
    height: 22px;
    width: 45px;
    border-radius: 15px;
    appearance: none;
    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, .2);
    clear: both;
    overflow: hidden;
    outline: none;
    transition: background-color .3s;

    &:hover {
      background-color: lighten($green, 5%);
    }

    &:checked {
      background-color: lighten($blue, 5%);
    }

    &:after {
      content: '';
      display: block;
      height: 22px;
      width: 22px;
      border-radius: 50%;
      cursor: pointer;
      background-color: white;
      float: left;
    }

    &:checked:after {
      float: right;
    }
  }
}

.input-bg {
  background-color: $green;
  display: inline-block;
  float: left;
  position: relative;
  width: 70%;
  padding-left: 30px;

  input[type="search"] {
    background-color: $green;
    border: none;
    color: white;
    display: inline-block;
    font: 32px/1 'Roboto';
    font-weight: 300;
    outline: none;
    padding: 22px 15px 20px 50px;
    width: 90%;

    &:hover {
      background-color: lighten($green, 5%);
    }

    &::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: rgba(255, 255, 255, .6);
      font-weight: 300;
    }
    &::-moz-placeholder { /* Firefox 19+ */
      color: rgba(255, 255, 255, .6);
      font-weight: 300;
    }
    &:-ms-input-placeholder { /* IE 10+ */
      color: rgba(255, 255, 255, .6);
      font-weight: 300;
    }
    &:-moz-placeholder { /* Firefox 18- */
      color: rgba(255, 255, 255, .6);
      font-weight: 300;
    }
  }

  .fa {
    color: white;
    display: inline;
    font-size: 26px;
    position: relative;
    right: -40px;
    top: -3px;
  }
}

.button-group {
  float: right;
  margin: 0 10px;
  position: relative;
  width: 100px;
  z-index: 2;
}

button {
  background: lighten(rgba(226, 122, 63, 1.00), 5%);
  border-radius: 5px;
  border: none;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, .2);
  color: white;
  cursor: pointer;
  display: inline;
  font-weight: 300;
  font: 16px/1 'Roboto';
  margin: 0 auto 30px;
  outline: none;
  padding: 12px 25px;
  text-align: center;
  text-shadow: inset 2px 2px 2px rgba(0, 0, 0, .4);
  text-transform: uppercase;
  transition: box-shadow .5s;

  &:hover {
    background-color: lighten(rgba(226, 122, 63, 1.00), 8%);
    box-shadow: none;
  }

  .fa {
    margin-left: 5px;
    text-shadow: inset 2px 2px 2px rgba(0, 0, 0, .4);
  }

  &.disabled {
    opacity: .5;
    cursor: initial;
    &:hover {
      background-color: lighten(rgba(226, 122, 63, 1.00), 5%);
    }
  }

  &.small {
    background-color: transparent;
    border: 1px solid rgba(0, 0, 0, .2);
    box-shadow: none;
    opacity: .8;
    color: white;
    cursor: pointer;
    display: block;
    font-weight: 500;
    height: 32px;
    margin: 5px auto;
    padding: 0;
    text-align: center;
    width: 90%;

    &.active {
      background-color: white;
      box-shadow: 0 0 2px 1px rgba(0, 0, 0, .2);
      color: $green;
      opacity: 1;
    }
  }
}

a {
  text-decoration: none;
}

h4,
h4 .fa {
background: linear-gradient(to top right, rgba(221, 221, 221, 1), #e27a3f);
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: rgba(255,255,255,0.5) 0px 3px 3px;
font-size: 30px;
margin: 0;
}

h4 {
  font-family: 'Roboto';
  font-weight: 700;
  padding: 10px 0 0;
  text-transform: uppercase;
}

.h-center {
  text-align: center;
}

$nav-height: 80px;

nav {
  background-color: $green;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, .3);
  clear: both;
  color: white;
  display: block;
  font-family: 'Montserrat', sans-serif;
  height: $nav-height;
  line-height: $nav-height;
  overflow: hidden;
  padding: 0 15px;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 2px rgba(0, 0, 0, .3);

  h1 {
    cursor: pointer;
    display: inline;
    float: left;
    font-size: 25px;
    font-weight: bold;
  }

  ul {
    display: inline;
    float: right;
  }

  li {
    cursor: pointer;
    display: inline;
    font-size: 18px;
    list-style: none;
    padding: 0 10px;

    &:hover {
      color: darken(white, 5%);
    }

    a {
      display: inline;
      color: white;
      text-decoration: none;
      &:hover {
        color: white;
      }
    }
  }
}

ul.emotion-list {
  float: left;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 15px 0;
  height: 85%;
  width: 30px;
  transform:rotate(-90deg) translateY(-100px);
  transform-origin: right top;

  li {
    list-style: none;
    display: block;
    color: white;
    transform: rotate(90deg);
    transform-origin: right top;
    height: 100px;
    width: 30px;
  }

  li.red {
    background-color: $red;

  }

  li.orange {
    background-color: $orange;
  }

  li.pink {
    background-color: $pink;
  }

  li.yellow {
    background-color: $yellow;
    color: #282c34;
  }

  li.grey {
    background-color: $grey;
    color: #282c34;
  }
}
</style>
