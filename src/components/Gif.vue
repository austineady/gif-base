<template>
  <div @click="playAnimation()" :id="gif.id" class="gif" :data-clipboard-text="gif.images.downsized.url" :class="{ playing: playing, copying: copying }">
    <img :src="imageSrc" alt="" />
  </div>
</template>

<script>
export default {
  name: 'gif',
  props: ['gif', 'offset', 'history'],
  data() {
    return {
      imageSrc: '',
      image: new Image(),
      playing: false,
      copying: false,
    };
  },
  watch: {
    offset(offset) {
      const isShown = this.$el.offsetTop + this.$el.clientHeight > offset;
      const isVisible = this.$el.offsetTop - 15 < offset + window.innerHeight;
      if (isVisible && isShown) {
        this.imageSrc = this.image.src;
        this.playing = true;
      } else if (!isShown || !isVisible) {
        this.imageSrc = this.gif.images.fixed_width_still.url;
        this.playing = false;
      }
    },
  },
  methods: {
    copyUrl(gif) {
      const el = document.querySelectorAll('[data-id="' + this.$el.id + '"]')[0];
      el.select();
      const res = document.execCommand('copy');
      if (res === true) {
        this.copying = true;
        this.history.push(gif);
        window.localStorage.gifshistory = this.history;
        window.setTimeout(() => {
          this.copying = false;
        }, 2000);
      }
    },
    playAnimation() {
      this.copying = true;
      window.setTimeout(() => {
        this.copying = false;
      }, 2000);
    },
  },
  created() {
    this.imageSrc = this.gif.images.fixed_width_still.url;
    this.image.onload = () => {
      this.imageSrc = this.image.src;
      this.playing = true;
    };
    this.image.src = this.gif.images.fixed_width.url;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '../global.scss';

.gif {
  cursor: pointer;
  margin: 2.5px;
  position: relative;
  width: 300px;
  z-index: 3;
  //box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);

  img {
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
    content: '';
    display: block;
    height: 100px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 80px;
    border-radius: 5px;
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
}
</style>
