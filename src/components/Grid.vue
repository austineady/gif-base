<template>
  <div id="grid"></div>
</template>

<script>
import Clipboard from 'clipboard';
import Masonry from 'masonry-layout';

export default {
  name: 'grid',
  props: ['gifs', 'short', 'theme', 'clear'],
  data() {
    return {
      offset: 0,
      backToTop: false,
      int: null,
    };
  },
  computed: {
    width() {
      return 250;
    }
  },
  watch: {
    clear() {
      if (this.clear) {
        this.gifs = this.gifs.slice(0);
      }
    },
    gifs(val) {
      if (val) {
        document.getElementById('grid').innerHTML = '';
        this.layout();
        this.startGifs();
      }
    }
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
    bindEvents() {
      window.addEventListener('scroll', () => {
        this.offset = window.pageYOffset;
      });
      window.addEventListener('resize', () => {
        this.offset = window.pageYOffset;
      });
      this.int = setInterval(() => {
        const $grid = document.getElementById('grid');
        if (this.gifs.length === $grid.children.length) {
          const $wrapH = document.getElementById('wrap').clientHeight - 52 - 33;
          clearInterval(this.int);
          if ($grid.clientHeight < $wrapH) {
            // gif list is shorter than page height, get next page automatically
            
          }
        }
      }, 1000);
    },
    startMasonry() {
      this.masonry = new Masonry('#grid', {
        itemSelector: '.gif',
        columnWidth: this.width,
        gutter: 5,
      });
      this.startGifs();
    },
    startGifs() {
      this.gifs.forEach(this.loadGif);
      const clipboard = new Clipboard('.gif');
      this.bindEvents();
    },
    loadGif(gif) {
      const parent = document.createElement('div');
      parent.classList.add('gif');
      parent.id = gif.id;
      parent.style.maxWidth = `${this.width}px`;
      parent.dataset.clipboardText = gif.images.downsized.url;
      parent.addEventListener('click', (evt) => {
        parent.classList.add('copying');
        setTimeout(() => {
          parent.classList.remove('copying');
        }, 2000);
      });
      const img = document.createElement('img');
      parent.appendChild(img);
      img.onload = () => {
        this.renderGif(parent);
      };
      img.src = gif.images.downsized.url;
    },
    renderGif(parent) {
      document.getElementById('grid').appendChild(parent);
      this.masonry.appended([parent]);
    }
  },
  mounted() {
    if (document.getElementById('grid') && !this.masonry) {
      this.startMasonry();
    }
  },
  updated() {
    if (this.$el && !this.masonry) this.startMasonry();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.gif {
  cursor: pointer;
  position: relative;
  z-index: 3;

  img {
    cursor: pointer;
    width: 100%;
  }

  input[type="text"] {
    font-size: 1px;
    height: 1px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%) scale(0.1);
    width: 1px;
    z-index: 0;
  }

  &::before,
  &::after {
    @keyframes copy {
      from {
        background: linear-gradient(to right, rgba(69, 178, 157, 0), rgba(69, 178, 157, 0.8));
        color: rgba(255, 255, 255, 0);
        opacity: 1;
        transform: translateX(-50%) translateY(-50%);
      }
      40% {
        background: linear-gradient(to right, rgba(69, 178, 157, .8), rgba(69, 178, 157, .8));
        color: rgba(255, 255, 255, 1);
        opacity: 1;
        transform: translateX(10%) translateY(-50%);
      }
      to {
        background: linear-gradient(to right, rgba(69, 178, 157, 0), rgba(69, 178, 157, 0.8));
        color: rgba(255, 255, 255, 0);
        opacity: 0;
        transform: translateX(10%) translateY(-50%) translateZ(0);
      }
    }
    @keyframes original {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(-50%);
      }
      40% {
        opacity: 1;
        transform: translateX(-110%) translateY(-50%);
      }
      to {
        opacity: 0;
        transform: translateX(-110%) translateY(-50%) translateZ(0);
      }
    }

    animation-duration: 1.5s;
    animation-fill-mode: both;
    animation-timing-function: ease-out;
    border-radius: 5px;
    content: '';
    display: block;
    height: 100px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 80px;
    z-index: 0;
  }

  &.copying {
    &::before {
      animation-name: original;
      background: rgba(69, 178, 157, .8);
      z-index: 2;
    }

    &::after {
      animation-name: copy;
      content: '✓';
      font-size: 50px;
      line-height: 100px;
      text-align: center;
      transition: color .3s;
      z-index: 1;
    }
  }

  &.condense {
    &::before,
    &::after {
      height: 70px;
      width: 60px;
    }
  }
}

.container {
  margin: 0 auto;

  @media screen and (max-width: 350px) {
    margin: 0;
  }
}
</style>
