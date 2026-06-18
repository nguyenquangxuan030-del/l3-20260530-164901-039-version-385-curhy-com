document.addEventListener("DOMContentLoaded", function () {
    const frame = document.querySelector(".player-frame");

    if (!frame) {
        return;
    }

    const video = frame.querySelector("video");
    const button = frame.querySelector(".player-cover");
    const streamUrl = frame.getAttribute("data-stream-url");
    let attached = false;
    let hls = null;

    function attachStream() {
        if (attached || !video || !streamUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        attached = true;
    }

    function startPlayback() {
        attachStream();
        frame.classList.add("is-playing");
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                frame.classList.remove("is-playing");
            });
        }
    }

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
        frame.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            frame.classList.remove("is-playing");
        }
    });

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
});
