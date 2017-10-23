<template>
  <div id="grid" class="container is-fluid grid" v-if="gifs" :class="history.length > 0 ? 'short' : ''">
    <gif :key="gif.id" v-for="gif in gifs" :gif="gif" :offset="offset" :history="history" :store="store" :theme="theme" v-on:reload="reload"></gif>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import Masonry from 'masonry-layout';
import Gif from './Gif';

export default {
  name: 'grid',
  components: {
    gif: Gif,
  },
  props: ['gifs', 'short', 'history', 'store', 'theme', 'clear'],
  data() {
    return {
      offset: 0,
      backToTop: false,
      int: null,
    };
  },
  watch: {
    clear() {
      if (this.clear) {
        this.gifs = this.gifs.slice(0);
      }
    },
  },
  methods: {
    layout() {
      if (this.masonry) {
        this.masonry.layout();
      }
    },
    reload() {
      this.masonry.reloadItems();
      this.masonry.layout();
    },
    gifClick(gif) {
      this.$emit('gifClicked', gif);
    },
    bindEvents() {
      window.addEventListener('scroll', () => {
        this.offset = window.pageYOffset;
      });
      window.addEventListener('resize', () => {
        this.offset = window.pageYOffset;
      });
    },
    startMasonry() {
      this.masonry = new Masonry(this.$el, {
        itemSelector: '.gif',
        columnWidth: 250,
        gutter: 5,
        fitWidth: true,
      });
      this.int = window.setInterval(this.layout, 1000);
      setTimeout(() => {
        window.clearInterval(this.int);
      }, 20000);
    },
  },
  mounted() {
    this.startMasonry();
    const clipboard = new Clipboard('.gif');
    this.bindEvents();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.grid {
  padding: 1rem;
}

.container {
  margin: 0 auto;

  @media screen and (max-width: 350px) {
    margin: 0;
  }
}
</style>
