<template>
  <main role="main">
    <NavMenu
      @search="val => search = val"
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
            <i class="fa fa-list" :class="theme === 'list' ? 'active' : ''" @click="theme = 'list'"></i> <i class="fa fa-th" :class="theme === 'grid' ? 'active' : ''" @click="theme = 'grid'"></i>
          </div>

          <div class="h-right">
            <input type="checkbox" id="nsfw-input" value="!nsfw" v-model="nsfw" @click="buildUrl">
            <label for="nsfw-input">NSFW</label>
          </div>
        </div>
      </section>

      <Grid
        v-if="gifs && gifs.length > 0"
        :gif-list="gifs"
        :theme="theme"
        :clear="clearGifs"
        @next-page="getNextPage"
      ></Grid>

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
import NavMenu from './Nav';
import Grid from './Grid';
import cache from '../cache';
import emotions from '../../static/emotions';
import ajax from '../ajax';

export default {
  name: 'Main',
  components: {
    Grid,
    NavMenu,
  },
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
      emotions,
      settingsActive: false,
      isOnMobile: true,
      isBelowNav: false,
      theme: 'grid',
      clearGifs: false,
      timeout: null,
      $grid: null,
      loadingNextPage: false
    };
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
    offset() {
      if (this.search !== '') {
        this.endpoint = 'search';
      } else {
        this.endpoint = 'trending';
      }
      // const pageCalc = Math.round(this.gifs.length + this.limit);
      // if (pageCalc > 0 && this.query !== '') {
      //   this.$router.push({ path: this.endpoint, query: { q: this.query, total: pageCalc } });
      // } else if (pageCalc > 0 && this.query === '') {
      //   this.$router.push({ path: this.endpoint, query: { total: pageCalc } });
      // } else if (pageCalc <= 0 && this.query !== '') {
      //   this.$router.push({ path: this.endpoint, query: { q: this.query } });
      // } else {
      //   this.$router.push({ path: this.endpoint });
      // }
    },
    category() {
      this.buildUrl();
      this.resetPage();
    },
    $route: 'handlePage',
  },
  methods: {
    buildUrl() {
      if (this.search !== '') {
        this.url = `https://api.giphy.com/v1/${this.category}/search?q=${this.search}&limit=${this.limit}&offset=${this.offset}${this.nsfw ? '' : '&rating=pg'}&api_key=dc6zaTOxFJmzC`;
      } else {
        this.search = '';
        this.query = '';
        this.url = `https://api.giphy.com/v1/${this.category}/trending?limit=${this.limit}&offset=${this.offset}${this.nsfw ? '' : '&rating=pg'}&api_key=dc6zaTOxFJmzC`;
      }
    },
    async fetchData(url) {
      const res = await ajax.get(url);
      res.data.forEach((gif) => {
        if (!document.getElementById(gif.id)) {
          this.gifs.push(gif);
        }
      });
    },
    async getNextPage() {
      this.offset += this.limit;
      this.buildUrl();
      await this.fetchData(this.url);
      this.loadingNextPage = false;
    },
    resetSearch() {
      this.offset = 0;
      this.limit = 25;
    },
    handlePage() {
      console.log('handle page');
      if (this.$route.query !== undefined) {
        if (this.$route.query.q !== undefined) {
          this.search = this.$route.query.q !== undefined ? this.$route.query.q : '';
        }
      } else {
        this.$router.push({ path: '/' });
      }
      this.buildUrl();
    },
    trendingClick() {
      this.search = '';
      this.query = '';
      this.$router.push({ path: '/trending' });
    },
    stickersClick() {
      this.category = 'stickers';
    },
    gifsClick() {
      this.category = 'gifs';
    },
    resetPage() {
      this.pageNum = 1;
      this.offset = 0;
    },
    scrollToTop() {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    },
    startInfiniteScroll() {
      if (!this.$grid && document.getElementById('grid') !== null) {
        this.$grid = document.getElementById('grid');
      }
      const scrollArea = document.body.parentElement;
      document.body.onscroll = () => {
        if (
          !this.loadingNextPage &&
          scrollArea.scrollTop + window.innerHeight + 200 > this.$grid.clientHeight
        ) {
          this.loadingNextPage = true;
          // gif list is shorter than page height, get next page automatically
          this.getNextPage();
        }
      };
    }
  },
  created() {
    this.buildUrl();
    this.fetchData(this.url);
  },
  mounted() {
    if (!this.$grid) this.startInfiniteScroll();
    document.getElementById('search').select();
    this.handlePage();
    if (this.$route.query !== undefined) {
      this.search = this.$route.query.q !== undefined ? this.$route.query.q : '';
    }
  },
  updated() {
    if (!this.$grid) this.startInfiniteScroll();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../global.scss";

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
    padding: 0.3rem 1rem;
  }
</style>
