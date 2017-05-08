<template>
  <main>
    <div id="page">
      <nav :class="isOnMobile ? 'mobile' : ''">
        <div class="container">
          <h1 @click="trendingClick">GifBase</h1>
          <div class="input-bg" v-if="!isOnMobile">
            <i class="fa fa-search"></i>
            <input id="search" type="search" v-model="search" name="search" placeholder="Type in keywords to search"/>
          </div>
          <ul>
            <li v-show="category === 'stickers'" @click="gifsClick">Gifs</li>
            <li v-show="category === 'gifs'" @click="stickersClick">Stickers</li>
            <li v-show="search !== ''" @click="trendingClick">Trending</li>
            <li v-if="isOnMobile" class="icon" @click="settingsActive = !settingsActive"><i class="fa fa-cog"></i></li>
          </ul>
        </div>
        <button v-if="!isOnMobile" class="icon" @click="settingsActive = !settingsActive"><i class="fa fa-cog"></i></button>
      </nav>

      <transition name="slide" v-if="!isOnMobile">
        <section class="settings" v-if="settingsActive">
          <div class="container">
            <div class="h-right">
              <input type="checkbox" id="nsfw-input" value="!nsfw" v-model="nsfw" @click="buildUrl">
              <label for="nsfw-input">NSFW</label>
            </div>
          </div>
        </section>
      </transition>

      <section class="settings" v-if="settingsActive && isOnMobile">
        <div class="container">
          <div class="h-right">
            <input type="checkbox" id="nsfw-input" value="!nsfw" v-model="nsfw" @click="buildUrl">
            <label for="nsfw-input">NSFW</label>
          </div>
        </div>
      </section>

      <!--         <ul class="emotion-list">
        <li v-for="emotion in emotions" :class="emotion.color" @click="handleEmotion(emotion.name)">{{ emotion.name }}</li>
      </ul> -->

      <section class="input-bg-mobile" v-if="isOnMobile">
        <input id="search" type="search" v-model="search" name="search" placeholder="Type in keywords to search"/>
      </section>

      <grid :gifs="gifs" :history="historyList" :store="canStore"></grid>
      <div class="container h-center">
        <button v-if="offset >= limit" @click="offset -= limit">Previous Page</button>
        <button v-else class="disabled">Previous Page</button>
        <button @click="offset += limit">Next Page</button>
      </div>
    </div>
    <history v-if="!isOnMobile" :data="historyList"></history>

    <transition name="slide-up">
      <div class="scroll-to-top" v-if="isOnMobile && isBelowNav" @click="scrollToTop()">
        <i class="fa fa-arrow-up"></i>
        <br />
        <p>TOP</p>
      </div>
    </transition>
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
      settingsActive: false,
      isOnMobile: true,
      isBelowNav: false,
      // isOnMobile: window.isOnMobile,
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
    window.addEventListener('scroll', () => {
      if (!this.backToTop && document.getElementById('grid').offsetTop < window.pageYOffset) {
        this.isBelowNav = true;
      } else {
        this.isBelowNav = false;
      }
    });
  },
  beforeUpdate() {
    if (!this.isOnMobile) {
      document.getElementById('history').style.height = document.getElementById('grid').style.height;
    }
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
      this.resetPage();
    },
    limit() {
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
    },
    gifsClick() {
      this.category = 'gifs';
    },
    gifClicked(gif) {
      this.historyList.push(gif);
      if (this.canStore) {
        localStorage.setItem('gifshistory', this.historyList);
      }
    },
    resetPage() {
      this.pageNum = 1;
      this.offset = 0;
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
    buildAndReset() {
      this.buildUrl();
      this.resetPage();
    },
    scrollToTop() {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
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

div.scroll-to-top {
  background-color: darken($green, 5%);
  border-radius: 100%;
  bottom: 15px;
  box-shadow: 0 1px 1.5px 0 rgba(0,0,0,.12), 0 1px 1px 0 rgba(0,0,0,.24);
  color: white;
  font-size: 1.8rem;
  height: 60px;
  left: 15px;
  position: fixed;
  text-align: center;
  text-shadow: 0 0 4px rgba(0, 0, 0, .4);
  width: 60px;
  z-index: 10;

  i {
    font-size: 3rem;
    left: 1px;
    position: relative;
    top: 5px;
  }

  p {
    font-weight: 700;
    position: relative;
    top: 10px;
  }
}

.slide-up-enter-active {
  transition: transform .3s ease-out;
}

.slide-up-leave-active {
  transition: transform .3s ease-in;
}

.slide-up-enter {
  transform: translateY(100%);
}

.slide-up-leave {
  transform: translateY(0);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

section {
  background-color: darken($green, 5%);
  color: white;
  font-family: 'Montserrat', sans-serif;
  height: 30px;
  line-height: 30px;
  padding: 15px;

  label {
    display: inline-block;
    font-size: 1.3em;
    vertical-align: top;
  }

  input[type="checkbox"] {
    appearance: none;
    background-color: lighten($green, 5%);
    border-radius: 15px;
    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, .2);
    clear: both;
    display: inline-block;
    height: 22px;
    outline: none;
    overflow: hidden;
    transition: background-color .3s;
    vertical-align: top;
    width: 45px;

    &:hover {
      background-color: lighten($green, 5%);
    }

    &:checked {
      background-color: lighten($blue, 5%);
    }

    &:after {
      background-color: white;
      border-radius: 50%;
      content: '';
      cursor: pointer;
      display: block;
      float: left;
      height: 22px;
      width: 22px;
    }

    &:checked:after {
      float: right;
    }
  }
}

.input-bg {
  background-color: $green;
  border-radius: 3px;
  display: inline-block;
  float: left;
  padding-left: 30px;
  position: relative;
  top: 4px;
  width: 70%;

  @supports (display: flex) {
    flex: 4;
  }

  input[type="search"] {
    background-color: $green;
    border: none;
    color: white;
    display: inline-block;
    font-weight: 300;
    font: 2.4rem/1 'Roboto';
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
    font-size: 2.6rem;
    position: relative;
    right: -40px;
    top: -3px;
  }
}

.input-bg-mobile {
  display: block;
  height: auto;
  padding: 0;
  width: 100%;

  @supports (display: flex) {
    display: flex;
  }

  input[type="search"] {
    background-color: $green;
    border: none;
    color: white;
    display: block;
    flex: 1;
    float: left;
    font-weight: 300;
    font: 2.4rem/1 'Roboto';
    outline: none;
    padding: 15px;
    text-align: center;
    width: 100%;

    &:hover {
      background-color: lighten($green, 5%);
    }

    &:focus,
    &:active {
      text-align: left;
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
  font: 1.6rem/1 'Roboto';
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
    cursor: initial;
    opacity: .5;

    &:hover {
      background-color: lighten(rgba(226, 122, 63, 1.00), 5%);
    }
  }

  &.small {
    background-color: transparent;
    border: 1px solid rgba(0, 0, 0, .2);
    box-shadow: none;
    color: white;
    cursor: pointer;
    display: block;
    font-weight: 500;
    height: 32px;
    margin: 5px auto;
    opacity: .8;
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
  font-weight: 700;
  padding: 10px 0 0;
  text-transform: uppercase;
}

.h-center {
  text-align: center;
}

.slide-enter-active {
  transition: transform .3s ease-out;
}

.slide-leave-active {
  transition: transform .3s ease-in;
}

.slide-enter {
  transform: translateY(-100%);
}

.slide-leave {
  transform: translateY(0);
}

.slide-leave-to {
  transform: translateY(-100%);
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
  text-shadow: 0 0 2px rgba(0, 0, 0, .3);
  z-index: 1;

  @supports (display: flex) {
    div.container {
      display: flex;
    }
  }

  &.mobile {
    height: 50px;
    line-height: 50px;

    ul > li {
      text-align: right;
    }
  }

  h1 {
    cursor: pointer;
    display: inline;
    float: left;
    font-size: 2.3rem;
    font-weight: bold;

    @supports (display: flex) {
      flex: .5;
    }
  }

  ul {
    display: inline;
    float: right;

    @supports (display: flex) {
      display: flex;
      flex: 1;
    }
  }

  li {
    cursor: pointer;
    display: inline;
    font-size: 18px;
    list-style: none;
    padding: 0 10px;

    @supports (display: flex) {
      flex: 2;

      &.icon {
        flex: .4;
      }
    }

    &:hover {
      color: darken(white, 5%);
    }

    a {
      color: white;
      display: inline;
      text-decoration: none;

      &:hover {
        color: white;
      }
    }
  }

  button {
    background: none;
    border: none;
    box-shadow: none;
    margin: 0;
    outline: none;
    padding: 0;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);

    &:hover {
      background: none;
      color: none;
    }

    .fa-cog {
      font-size: 2.5rem;
      position: relative;
      top: 2px;
      transform: rotate(0);

      @keyframes spin {
        from {
          transform: rotate(0);
        }
        to {
          transform: rotate(360deg);
        }
      }

      -webkit-animation: 5s linear 0s infinite both spin;
      -moz-animation: 5s linear 0s infinite both spin;
      -o-animation: 5s linear 0s infinite both spin;
      animation: 5s linear 0s infinite both spin;
      animation-play-state: paused;

      &:hover {
        animation-play-state: running;
      }
    }
  }
}

ul.emotion-list {
  float: left;
  height: 85%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 15px 0;
  transform-origin: right top;
  transform:rotate(-90deg) translateY(-100px);
  width: 30px;

  li {
    color: white;
    display: block;
    height: 100px;
    list-style: none;
    transform-origin: right top;
    transform: rotate(90deg);
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
