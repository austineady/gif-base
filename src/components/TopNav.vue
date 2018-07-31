<template>
  <section class="container main__nav">
    <nav class="navbar main__navbar texture-background" :class="{ 'is-active': menuActive }">
      <div class="navbar-brand is-hidden-touch">
        <div class="navbar-item">
          <span class="font-secondary">GifBase</span>
        </div>
      </div>

      <div id="main-menu" class="navbar-menu" :class="{ 'is-active': menuActive }">
        <div class="navbar-start"></div>
        <div class="navbar-end">
          <a v-if="$route.path.includes('stickers')" @click="handleCategoryChange('')" class="navbar-item">
            Gifs
          </a>
          <a v-if="!$route.path.includes('stickers')" @click="handleCategoryChange('/stickers')" class="navbar-item">
            Stickers
          </a>
          <a v-show="isSearching" @click="$router.push({ path: '/' })" class="navbar-item">
            Trending
          </a>
        </div>
      </div>
    </nav>
    <div class="level main__search">
      <div class="level-item is-flex">
        <input class="input main__search-input" id="search" type="text" @input="handleSearch($event.target.value)" name="search" :placeholder="isOnMobile ? 'Search gifs' : 'Type in keywords to search'" autofocus>
        <div class="navbar-burger burger main__search-menu-toggle is-hidden-desktop" :class="{ 'is-active': menuActive }" data-target="main-menu" @click="handleMenuToggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TopNav',
  data() {
    return {
      category: 'gifs',
      settingsActive: false,
      menuActive: false,
    };
  },
  computed: {
    isOnMobile() {
      return window.innerWidth < 400;
    },
    isSearching() {
      return window.location.href.match('search?') !== null;
    }
  },
  methods: {
    handleSearch(val) {
      this.$emit('search', val);
    },
    trendingClick() {
      this.$emit('trending-click');
    },
    handleCategoryChange(category) {
      if (this.$route.query.q !== undefined && this.$route.query.q.length > 0) {
        this.$router.push({ path: `${category}/search`, query: { q: this.$route.query.q } });
      } else {
        this.$router.push({ path: `${category}` });
      }
    },
    handleMenuToggle() {
      this.menuActive = !this.menuActive;
      this.$emit('menu-toggle', this.menuActive);
    }
  },
};
</script>

<style lang="scss" scoped>
.font-secondary {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  color: #22d0b2;
  font-weight: 700;
}

.main {
  &__nav {
    padding-bottom: 15px;
    position: relative;
    z-index: 10;
  }

  &__navbar {
    @media screen and (max-width: 1023px) {
      min-height: 0;

      &.is-active {
        min-height: 3.25rem;
      }
    }
  }
  &__search {
    padding: 0 15px;
    padding-right: 0;

    @media screen and (max-width: 1007px) {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
    }
  }
  &__search-input {
    flex: 1;
    margin-right: 10px;

    @media screen and (max-width: 1007px) {
      flex: .9;
    }
  }
  &__search-menu-toggle {
    min-width: 50px;
    flex: .1;
  }
}

.navbar-brand {
  padding: 0 15px;
}

.navbar-menu {
  justify-content: center;
  align-items: center;

  @media screen and (max-width: 1007px) {
    &.is-active {
      position: relative;
      top: 52px;
    }
  }
}
</style>
