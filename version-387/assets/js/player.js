function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var startButton = document.getElementById('player-start');
    var prepared = false;
    var hlsInstance = null;

    if (!video || !startButton || !streamUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        prepare();
        startButton.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                startButton.classList.remove('is-hidden');
            });
        }
    }

    startButton.addEventListener('click', function () {
        playVideo();
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        startButton.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            startButton.classList.remove('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
