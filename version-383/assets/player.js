(function () {
  function setupPlayer(box) {
    var video = box.querySelector("video");
    var source = box.getAttribute("data-stream");
    var buttons = box.querySelectorAll("[data-play]");
    var mute = box.querySelector("[data-mute]");
    var fullscreen = box.querySelector("[data-fullscreen]");
    var error = box.querySelector("[data-player-error]");
    var prepared = false;
    var hls = null;

    function showError() {
      if (error) {
        error.textContent = "视频暂时无法播放，请稍后再试";
        error.classList.add("is-visible");
      }
    }

    function prepare() {
      if (prepared || !video || !source) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        video.src = source;
      }
    }

    function togglePlay() {
      prepare();
      if (!video) {
        return;
      }
      if (video.paused) {
        video.play().then(function () {
          box.classList.add("is-playing");
        }).catch(showError);
      } else {
        video.pause();
        box.classList.remove("is-playing");
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });

    if (video) {
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        box.classList.remove("is-playing");
      });
      video.addEventListener("error", showError);
    }

    if (mute && video) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (box.requestFullscreen) {
          box.requestFullscreen();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".movie-player").forEach(setupPlayer);
  });
})();
