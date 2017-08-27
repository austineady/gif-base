<template>
  <main class="container">
    <div id="page">
      <Nav
      v-on:search="val => search = val"
      v-on:trending-click="trendingClick"
      v-on:stickers-click="stickersClick"
      v-on:gifs-click="gifsClick"
      />

      <transition name="slide" v-if="!isOnMobile">
        <section class="settings" v-if="settingsActive">
          <label class="checkbox">
            <input type="checkbox" @click="nsfw = !nsfw">
            NSFW
          </label>
        </section>
      </transition>

      <section class="settings" v-if="settingsActive && isOnMobile">
        <div class="container">
          <div class="h-left">
            <i class="fa fa-list" :class="theme === 'list' ? 'active' : ''" @click="theme = 'list'"></i> <i class="fa fa-th" :class="theme === 'grid' ? 'active' : ''" @click="theme = 'grid'"></i>
          </div>

          <div class="h-right">
            <input type="checkbox" id="nsfw-input" value="!nsfw" v-model="nsfw" @click="buildUrl">
            <label for="nsfw-input">NSFW</label>
          </div>
        </div>
      </section>

      <grid :gifs="gifs" :history="historyList" :store="canStore" :theme="theme" :clear="clearGifs"></grid>
      <div class="container h-center">
        <a class="button" :disabled="offset >= limit" @click="offset -= limit">Previous Page</a>
        <a class="button" @click="offset += limit">Next Page</a>
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

    <footer class="footer">
      <div class="container has-text-right">
        Powered by <a href="https://giphy.com">Giphy</a>
      </div>
    </footer>
  </main>
</template>

<script>
import Nav from './Nav';
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
      theme: 'grid',
      clearGifs: false,
      timeout: null,
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
    search(val) {
      if (this.search === '') {
        this.$router.push({ path: '/' });
      }
      if (this.search.match(/[+]/) !== null) {
        this.search = this.search.replace('+', ' ');
      }
      if (this.timeOut != null) {
        clearTimeout(this.timeOut);
      }
      this.timeOut = setTimeout(() => {
        this.query = this.search.replace(' ', '+');
      }, 1000);
    },
    query() {
      const self = this;
      this.endpoint = 'search';
      self.$router.push({ path: 'search', query: { q: this.query } });
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
    theme() {
      this.clearGifs = true;
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
    Nav,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../global.scss";

  #page {
    padding-bottom: 60px;
  }

  .scroll-to-top {
    position: fixed;
    bottom: 60px;
    right: 15px;
    z-index: 100;
  }

  footer.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem 1.5rem;
  }
</style>
