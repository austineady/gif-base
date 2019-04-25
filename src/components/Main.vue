<template>
  <main class="main texture-background">
    <TopNav
      @search="handleUserSearch"
      @trending-click="trendingClick"
      @stickers-click="category = 'stickers'"
      @gifs-click="category = 'gifs'"
      @menu-toggle="bool => menuActive = bool"
    />
    <div id="page" class="main__page">
      <div id="scrollbox" class="grid-container">
        <Grid
          v-if="gifs && gifs.length > 0"
          :gif-list="gifs"
          :clear="clearGifs"
        />
      </div>
    </div>

    <div class="main__bottom">
      <div class="container h-center">
        <a class="button" :disabled="offset < limit" @click="getPreviousPage">Previous Page</a>
        <a class="button" @click="getNextPage">Next Page</a>
      </div>

      <transition name="slide-up">
        <div class="scroll-to-top" v-if="showScrollToTop" @click="scrollToTop()">
          <i class="fa fa-arrow-up scroll-to-top__icon"></i>
          <p class="scroll-to-top__text">TOP</p>
        </div>
      </transition>

      <a href="https://giphy.com" target="_blank" class="giphy-plug" style="display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: #212121">Powered by</span>
        <svg class="Q6bcqX28de_6uGB2vxNet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164 35" itemProp="logo" height="10" width="60" style="display: inline-flex;"><g fill-rule="evenodd" clip-rule="evenodd"><path class="_1NjgLNAGRa5rkn1hnY3jaz" d="M0 3h4v29H0z"></path><path class="_3U0fTPBhLsMiqFEe7wW4v8" d="M24 11h4v21h-4z"></path><path class="_1VCV9y-QV_DlF6YbX2K4vF" d="M0 31h28v4H0z"></path><path class="-mUBWSQfFixrL6L-52_pX" d="M0 0h16v4H0z"></path><path class="_13rR6z0aM7uU_NUHkYCn2Z" d="M24 8V4h-4V0h-4v12h12V8"></path><path class="I2SO2gQ7GffSGjCGpB0Cm" d="M24 16v-4h4M16 0v4h-4"></path></g><g class="_1cYHvYDogljEI3cxFCGtGs"><path d="M59.1 12c-2-1.9-4.4-2.4-6.2-2.4-4.4 0-7.3 2.6-7.3 8 0 3.5 1.8 7.8 7.3 7.8 1.4 0 3.7-.3 5.2-1.4v-3.5h-6.9v-6h13.3v12.1c-1.7 3.5-6.4 5.3-11.7 5.3-10.7 0-14.8-7.2-14.8-14.3 0-7.1 4.7-14.4 14.9-14.4 3.8 0 7.1.8 10.7 4.4L59.1 12zM68.2 31.2V4h7.6v27.2h-7.6zM88.3 23.8v7.3h-7.7V4h13.2c7.3 0 10.9 4.6 10.9 9.9 0 5.6-3.6 9.9-10.9 9.9h-5.5zm0-6.5h5.5c2.1 0 3.2-1.6 3.2-3.3 0-1.8-1.1-3.4-3.2-3.4h-5.5v6.7zM125 31.2V20.9h-9.8v10.3h-7.7V4h7.7v10.3h9.8V4h7.6v27.2H125zM149.2 13.3l5.9-9.3h8.7v.3l-10.8 16v10.8h-7.7V20.3L135 4.3V4h8.7l5.5 9.3z"></path></g></svg>
      </a>
    </div>
  </main>
</template>

<script>
import TopNav from './TopNav';
import Grid from './Grid';
import ajax from '../ajax';
import config from '../config';

export default {
  name: 'Main',
  components: {
    TopNav,
    Grid
  },
  data() {
    return {
      apiKey: config.apiKey,
      search: '',
      gifs: [],
      category: 'gifs',
      endpoint: 'trending',
      limit: 25,
      offset: 0,
      showScrollToTop: false,
      clearGifs: false,
      timeOut: null,
      $scrollEl: null,
      $grid: null
    };
  },
  computed: {
    query() {
      return this.search.length > 0 ? this.search.replace(' ', '-') : '';
    },
    page() {
      return Math.round(this.offset / this.limit);
    },
    urlEndpoint() {
      return this.query === '' ? 'trending?' : `search?q=${this.query}&`;
    },
    url() {
      return `https://api.giphy.com/v1/${this.category}/${this.urlEndpoint}limit=${this.limit}&offset=${this.offset}${this.nsfw ? '' : '&rating=pg'}&api_key=${this.apiKey}`;
    }
  },
  watch: {
    category(val) {
      // user has switched to stickers/gifs, reset offsets
      if (val) {
        this.offset = 0;
        if (this.query !== '') {
          this.$router.push({ path: `/${val}/search`, query: { q: this.query } });
        } else {
          this.$router.push({ path: `/${val}` });
        }
        this.handlePage();
      }
    },
    '$route': 'checkCategoryChange' // eslint-disable-line
  },
  methods: {
    checkCategoryChange() {
      // it is either locally stickers or gifs.
      // we only need to re-fetch data if categories no longer match
      if (this.$route.path.includes('stickers') && this.category === 'gifs') {
        this.category = 'stickers';
        this.handlePage();
      } else if (!this.$route.path.includes('stickers') && this.category === 'stickers') {
        this.category = 'gifs';
        this.handlePage();
      }
    },
    handleUserSearch(val) {
      if (val.length > 0) {
        if (val.match(/[-]/) !== null) {
          this.search = val.replace('-', ' ');
        } else {
          this.search = val;
        }
      }
      this.delayedSearch();
    },
    async fetchData() {
      try {
        const res = await ajax.get(this.url);
        if (document.getElementById('grid')) document.getElementById('grid').innerHTML = '';
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
          this.fetchData();
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
        this.fetchData();
      }, 1500);
    },
    handlePage() {
      if (this.$route.query !== undefined) {
        if (this.$route.query.q !== undefined) {
          this.search = this.$route.query.q.replace('+', ' ');
        }

        if (this.$route.query.page !== undefined) {
          this.offset = this.$route.query.page * this.limit;
        } else {
          this.offset = 0;
        }
      }
      this.fetchData();
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
      } else if (this.page === 0 && this.query !== '') {
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
      this.$router.push('/');
    },
    scrollToTop() {
      document.getElementById('scrollbox').scroll({ top: 0, left: 0, behavior: 'smooth' });
    },
    attemptScrollInit() {
      if (
        window.innerWidth < 650 &&
        !this.$scrollEl &&
        document.getElementById('scrollbox')
      ) {
        this.$scrollEl = document.getElementById('scrollbox');
        this.$scrollEl.onscroll = () => {
          if (!this.showScrollToTop && this.$scrollEl.scrollTop > 200) {
            this.showScrollToTop = true;
          } else if (this.showScrollToTop && this.$scrollEl.scrollTop < 200) {
            this.showScrollToTop = false;
          }
        };
      }
    }
  },
  created() {
    if (this.$route.path.includes('stickers') && this.category !== 'stickers') {
      this.category = 'stickers';
    }
    this.handlePage();
  },
  mounted() {
    document.getElementById('search').select();
    this.attemptScrollInit();
  },
  updated() {
    this.attemptScrollInit();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .main {
    height: 100vh;
    padding-bottom: 40px; // footer padding
    position: relative;
  }

  .main__page {
    @media screen and (max-width: 1007px) {
      margin-top: 50px;
    }
  }

  .grid-container {
    height: calc(100vh - 190px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 20px;

    @media screen and (max-width: 1023px) {
      height: calc(100vh - 145px);
      padding-top: 0;
    }
  }

  .section {
    position: relative;
  }

  .slide-up-enter-active, .slide-up-leave-active {
    transition: transform .3s;
  }
  .slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
    transform: translateY(200%);
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

  .main__bottom {
    padding-top: 10px;
  }

  .giphy-plug {
    bottom: 0;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    padding: 0.6rem 1rem;
    position: absolute;
    right: 0;
  }
</style>
