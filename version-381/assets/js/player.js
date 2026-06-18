const Hls = window.Hls;
const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const cover = player.querySelector('.player-cover');
  const stream = video ? video.getAttribute('data-stream') : '';
  let started = false;
  let hls = null;

  function attachStream() {
    if (!video || !stream) {
      return;
    }

    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function playVideo() {
    attachStream();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && cover) {
        cover.classList.remove('is-hidden');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
