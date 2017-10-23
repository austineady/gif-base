<template>
  <section class="container main__nav">
    <nav class="navbar main__navbar">
      <div class="navbar-brand is-hidden-touch">
        <div class="navbar-item">
          <span class="font-secondary">GifBase</span>
        </div>
      </div>

      <div id="main-menu" class="navbar-menu" :class="{ 'is-active': menuActive }">
        <div class="navbar-start"></div>
        <div class="navbar-end">
          <div class="navbar-item">
            <a class="navbar-item" v-show="category === 'stickers'" @click="gifsClick">Gifs</a>
          </div>
          <div class="navbar-item">
            <a class="navbar-item" v-show="category === 'gifs'" @click="stickersClick">Stickers</a>
          </div>
          <div class="navbar-item">
            <a class="navbar-item" v-show="isSearching" @click="trendingClick">Trending</a>
          </div>
          <!-- <div class="navbar-item">
            <a class="navbar-item" v-if="isOnMobile" @click="settingsActive = !settingsActive">
              <span class="icon">
                <i class="fa fa-cog"></i>
              </span>
            </a>
          </div> -->
        </div>
      </div>
    </nav>
    <div class="level main__search">
      <div class="level-item is-flex">
        <input class="input main__search-input" id="search" type="text" @input="handleSearch($event.target.value)" name="search" :placeholder="isOnMobile ? 'Search gifs' : 'Type in keywords to search'" autofocus>
        <div class="navbar-burger burger main__search-menu-toggle is-hidden-desktop" :class="{ 'is-active': menuActive }" data-target="main-menu" @click="menuActive = !menuActive">
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
  name: 'Nav',
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
    gifsClick() {
      this.$emit('gif-click');
    },
    stickersClick() {
      this.$emit('stickers-click');
    },
    trendingClick() {
      this.$emit('trending-click');
    },
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
    background-color: white;
    box-shadow: 0 3px 2px rgba(10, 10, 10, .1), 0 0 0 1px rgba(10, 10, 10, .1);
    display: block;
    left: 0;
    min-height: 52px;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 10;
  }

  &__navbar {
    @media screen and (max-width: 1007px) {
      padding-top: 52px;
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
}
</style>
