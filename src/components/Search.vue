<template>
  <main class="main">
    <TopNav
      @search="handleUserSearch"
      @trending-click="trendingClick"
      @stickers-click="stickersClick"
      @gifs-click="gifsClick"
    />
    <div id="page" class="main__page">
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
            <i class="fa fa-list" :class="theme === 'list' ? 'active' : ''" @click="theme = 'list'"></i>&nbsp;
            <i class="fa fa-th" :class="theme === 'grid' ? 'active' : ''" @click="theme = 'grid'"></i>
          </div>

          <div class="h-right">
            <input type="checkbox" id="nsfw-input" v-model="nsfw" @click="buildUrl">
            <label for="nsfw-input">NSFW</label>
          </div>
        </div>
      </section>

      <Grid
        v-if="gifs && gifs.length > 0"
        :gif-list="gifs"
        :theme="theme"
        :clear="clearGifs"
      />
      <div class="container h-center">
        <a class="button" :disabled="offset < limit" @click="getPreviousPage">Previous Page</a>
        <a class="button" @click="getNextPage">Next Page</a>
      </div>

      <transition name="slide-up">
        <div class="scroll-to-top" v-if="isOnMobile && isBelowNav" @click="scrollToTop()">
          <i class="fa fa-arrow-up scroll-to-top__icon"></i>
          <p class="scroll-to-top__text">TOP</p>
        </div>
      </transition>
    </div>

    <footer class="footer">
      <div class="container has-text-right">
        Powered by <a href="https://giphy.com">Giphy</a>
      </div>
    </footer>
  </main>
</template>

<script>
import TopNav from './TopNav';
import Grid from './Grid';
import ajax from '../ajax';

export default {
  name: 'Main',
  components: {
    TopNav,
    Grid
  },
  data() {
    return {
      search: '',
      gifs: [],
      url: '',
      hash: '',
      category: 'gifs',
      endpoint: 'trending',
      limit: 25,
      offset: 0,
      nsfw: false,
      settingsActive: false,
      isOnMobile: true,
      isBelowNav: false,
      theme: 'grid',
      clearGifs: false,
      timeOut: null,
      $grid: null
    };
  },
  computed: {
    query() {
      return this.search.length > 0 ? this.search.replace(' ', '+') : '';
    },
    page() {
      return Math.round(this.offset / this.limit);
    }
  },
  methods: {
    buildUrl() {
      if (this.query !== '') {
        this.url = `https://api.giphy.com/v1/${this.category}/search?q=${this.query}&limit=${this.limit}&offset=${this.offset}${this.nsfw ? '' : '&rating=pg'}&api_key=dc6zaTOxFJmzC`;
      } else {
        this.search = '';
        this.url = `https://api.giphy.com/v1/${this.category}/trending?limit=${this.limit}&offset=${this.offset}${this.nsfw ? '' : '&rating=pg'}&api_key=dc6zaTOxFJmzC`;
      }
    },
    handleUserSearch(val) {
      if (val.length > 0) {
        if (val.match(/[+]/) !== null) {
          this.search = val.replace('+', ' ');
        } else {
          this.search = val;
        }
      }
      this.delayedSearch();
    },
    async fetchData(url) {
      try {
        const res = await ajax.get(url);
        this.gifs = res.data.filter(gif => !document.getElementById(gif.id));
      } catch (e) {
        console.error(e);
      }
    },
    getPreviousPage() {
      this.offset -= this.limit;
      this.formatRoute();
    },
    getNextPage() {
      this.offset += this.limit;
      this.formatRoute();
    },
    delayedSearch() {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
      }
      this.timeOut = setTimeout(() => {
        if (this.search === '') {
          this.$router.push({ path: '/' });
        } else {
          if (this.search && this.search.length > 0) {
            window.ga('send', {
              hitType: 'event',
              eventCategory: 'searchKeyWords',
              eventAction: 'userSearch',
              eventLabel: this.search
            });
          }
          if (this.endpoint !== 'search') this.endpoint = 'search';
          this.$router.push({ path: 'search', query: { q: this.query } });
        }
        this.handlePage();
      }, 1500);
    },
    resetSearch() {
      this.offset = 0;
      this.limit = 25;
    },
    handlePage() {
      if (this.$route.query !== undefined) {
        if (this.$route.query.q !== undefined) {
          this.search = this.$route.query.q;
        }

        if (this.$route.query.page !== undefined) {
          this.offset = this.$route.query.page * this.limit;
        } else {
          this.offset = 0;
        }
      }
      this.buildUrl();
      this.fetchData(this.url);
    },
    formatRoute() {
      if (this.search !== '') {
        this.endpoint = 'search';
      } else {
        this.endpoint = 'trending';
      }
      if (this.page > 0 && this.query !== '') {
        this.$router.push({ path: this.endpoint, query: { q: this.query, page: this.page } });
      } else if (this.page > 0 && this.query === '') {
        this.$router.push({ path: this.endpoint, query: { page: this.page } });
      } else if (this.page <= 0 && this.query !== '') {
        this.$router.push({ path: this.endpoint, query: { q: this.query } });
      } else {
        this.$router.push({ path: this.endpoint });
      }
      this.handlePage();
    },
    trendingClick() {
      this.offset = 0;
      this.search = '';
      this.endpoint = 'trending';
      this.$router.push({ path: 'trending' });
    },
    stickersClick() {
      this.offset = 0;
      this.category = 'stickers';
      this.handlePage();
    },
    gifsClick() {
      this.offset = 0;
      this.category = 'gifs';
      this.handlePage();
    },
    resetPage() {
      this.offset = 0;
    },
    buildAndReset() {
      this.buildUrl();
      this.resetPage();
    },
    scrollToTop() {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    }
  },
  created() {
    this.handlePage();
  },
  mounted() {
    document.getElementById('search').select();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../global.scss";

  .main {
    height: 100vh;
    padding-bottom: 40px; // footer padding
    position: relative;
  }

  .main__page {
    padding: 20px;
    
    .section {
      padding-top: 15px;
    }
  }

  .section {
    position: relative;
  }

  .scroll-to-top {
    background: #22d0b2;
    border-radius: 100%;
    bottom: 70px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, .1), 0 0 0 1px rgba(10, 10, 10, .1);
    color: white;
    cursor: pointer;
    height: 70px;
    padding: 10px;
    position: fixed;
    right: 30px;
    width: 70px;
    z-index: 100;

    &__icon {
      display: block;
    }

    &__text {
      display: block;
      margin-top: 5px;
    }
  }

  footer.footer {
    bottom: 0;
    left: 0;
    padding: 0.3rem 1rem;
    position: absolute;
    right: 0;
  }
</style>
