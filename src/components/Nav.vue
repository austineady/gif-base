<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <div class="navbar-item">
          <input class="input navbar-search" id="search" type="text" @input="handleSearch($event.target.value)" name="search" placeholder="Type in keywords to search">
        </div>

        <div class="navbar-burger burger" data-target="navMenubd-example" @click="menuActive = !menuActive">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navMenubd-example" class="navbar-menu" :class="{ 'is-active': menuActive }">
        <div class="navbar-start">
          
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <a class="navbar-item" v-show="category === 'stickers'" @click="gifsClick">Gifs</a>
          </div>
          <div class="navbar-item">
            <a class="navbar-item" v-show="category === 'gifs'" @click="stickersClick">Stickers</a>
          </div>
          <div class="navbar-item">
            <a class="navbar-item" v-show="search !== ''" @click="trendingClick">Trending</a>
          </div>
          <div class="navbar-item">
            <a class="navbar-item" v-if="isOnMobile" @click="settingsActive = !settingsActive">
              <span class="icon">
                <i class="fa fa-cog"></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Nav',
  data() {
    return {
      category: 'gifs',
      settingsActive: false,
      isOnMobile: false,
      menuActive: false,
    };
  },
  computed: {
    isMobile() {
      return window.innerWidth < 780;
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
.navbar-menu {
  justify-content: center;
  align-items: center;
}
.navbar-search {
  max-width: 600px;
  min-width: 320px;
  width: 80vw;
}
</style>
