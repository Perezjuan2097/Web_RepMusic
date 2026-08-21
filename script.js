/* =========================
   MUSIC DATABASE
========================= */

const songs = [
    {
        title: "Midnight Dreams",
        artist: "Neon Waves",
        album: "Midnight Dreams",
        cover: "image-one",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },

    {
        title: "After Hours",
        artist: "Night Drive",
        album: "After Hours",
        cover: "image-two",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },

    {
        title: "Ocean Eyes",
        artist: "Blue Horizon",
        album: "Ocean Eyes",
        cover: "image-three",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },

    {
        title: "City Lights",
        artist: "Urban Echo",
        album: "City Lights",
        cover: "image-four",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },

    {
        title: "Digital Love",
        artist: "Future State",
        album: "Digital Love",
        cover: "image-five",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },

    {
        title: "Electric Soul",
        artist: "Voltage",
        album: "Electric Soul",
        cover: "image-six",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    },

    {
        title: "Neon Sky",
        artist: "Solaris",
        album: "Neon Sky",
        cover: "image-seven",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
    },

    {
        title: "Future Nights",
        artist: "Digital Dreams",
        album: "Future Nights",
        cover: "image-eight",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    }
];


/* =========================
   DOM ELEMENTS
========================= */

const audio = document.getElementById("audioPlayer");

const playButton =
    document.getElementById("playButton");

const playIcon =
    playButton.querySelector("i");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const shuffleButton =
    document.getElementById("shuffleButton");

const repeatButton =
    document.getElementById("repeatButton");

const progressBar =
    document.getElementById("progressBar");

const volumeBar =
    document.getElementById("volumeBar");

const volumeButton =
    document.getElementById("volumeButton");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerCover =
    document.getElementById("playerCover");

const likeButton =
    document.getElementById("likeButton");

const searchInput =
    document.getElementById("searchInput");

const heroPlayButton =
    document.getElementById("heroPlayButton");


/* =========================
   STATE
========================= */

let currentSongIndex = 0;

let isPlaying = false;

let isShuffle = false;

let isRepeat = false;

let previousVolume = 0.8;


/* =========================
   LOAD SONG
========================= */

function loadSong(index) {

    currentSongIndex = index;

    const song = songs[currentSongIndex];

    playerTitle.textContent =
        song.title;

    playerArtist.textContent =
        song.artist;

    playerCover.className =
        `player-cover ${song.cover}`;

    audio.src = song.audio;

    audio.load();

    currentTimeElement.textContent =
        "0:00";

    durationElement.textContent =
        "0:00";

    progressBar.value = 0;

    updateActiveSong();
}


/* =========================
   PLAY SONG
========================= */

function playSong() {

    audio.play()
        .then(() => {

            isPlaying = true;

            updatePlayButton();

            document.body.classList.add(
                "playing"
            );

        })
        .catch(error => {

            console.log(
                "No se pudo reproducir el audio:",
                error
            );

        });
}


/* =========================
   PAUSE SONG
========================= */

function pauseSong() {

    audio.pause();

    isPlaying = false;

    updatePlayButton();

    document.body.classList.remove(
        "playing"
    );
}


/* =========================
   PLAY / PAUSE
========================= */

function togglePlay() {

    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }
}


/* =========================
   UPDATE PLAY BUTTON
========================= */

function updatePlayButton() {

    if (isPlaying) {

        playIcon.className =
            "fa-solid fa-pause";

    } else {

        playIcon.className =
            "fa-solid fa-play";

    }
}


/* =========================
   NEXT SONG
========================= */

function nextSong() {

    let nextIndex;

    if (isShuffle) {

        do {

            nextIndex =
                Math.floor(
                    Math.random() * songs.length
                );

        } while (
            nextIndex === currentSongIndex &&
            songs.length > 1
        );

    } else {

        nextIndex =
            (currentSongIndex + 1)
            % songs.length;

    }

    loadSong(nextIndex);

    playSong();
}


/* =========================
   PREVIOUS SONG
========================= */

function previousSong() {

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;
    }

    let previousIndex =
        currentSongIndex - 1;

    if (previousIndex < 0) {

        previousIndex =
            songs.length - 1;

    }

    loadSong(previousIndex);

    playSong();
}


/* =========================
   TIME FORMAT
========================= */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds) ||
        seconds < 0
    ) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}


/* =========================
   UPDATE PROGRESS
========================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }

        const percentage =
            (audio.currentTime /
                audio.duration) * 100;

        progressBar.value =
            percentage;

        currentTimeElement.textContent =
            formatTime(
                audio.currentTime
            );

        durationElement.textContent =
            formatTime(
                audio.duration
            );

    }
);


/* =========================
   SEEK
========================= */

progressBar.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }

        audio.currentTime =
            (progressBar.value / 100)
            * audio.duration;

    }
);


/* =========================
   VOLUME
========================= */

audio.volume =
    volumeBar.value;

volumeBar.addEventListener(
    "input",
    () => {

        audio.volume =
            volumeBar.value;

        previousVolume =
            audio.volume;

        updateVolumeIcon();

    }
);


/* =========================
   VOLUME BUTTON
========================= */

volumeButton.addEventListener(
    "click",
    () => {

        if (audio.volume > 0) {

            previousVolume =
                audio.volume;

            audio.volume = 0;

            volumeBar.value = 0;

        } else {

            audio.volume =
                previousVolume || 0.8;

            volumeBar.value =
                audio.volume;

        }

        updateVolumeIcon();

    }
);


/* =========================
   VOLUME ICON
========================= */

function updateVolumeIcon() {

    const icon =
        volumeButton.querySelector("i");

    if (audio.volume === 0) {

        icon.className =
            "fa-solid fa-volume-xmark";

    } else if (audio.volume < 0.5) {

        icon.className =
            "fa-solid fa-volume-low";

    } else {

        icon.className =
            "fa-solid fa-volume-high";

    }
}


/* =========================
   SHUFFLE
========================= */

shuffleButton.addEventListener(
    "click",
    () => {

        isShuffle =
            !isShuffle;

        shuffleButton.classList.toggle(
            "active",
            isShuffle
        );

    }
);


/* =========================
   REPEAT
========================= */

repeatButton.addEventListener(
    "click",
    () => {

        isRepeat =
            !isRepeat;

        repeatButton.classList.toggle(
            "active",
            isRepeat
        );

    }
);


/* =========================
   SONG ENDED
========================= */

audio.addEventListener(
    "ended",
    () => {

        if (isRepeat) {

            audio.currentTime = 0;

            playSong();

        } else {

            nextSong();

        }

    }
);


/* =========================
   PLAY BUTTON
========================= */

playButton.addEventListener(
    "click",
    togglePlay
);


/* =========================
   NEXT / PREVIOUS
========================= */

nextButton.addEventListener(
    "click",
    nextSong
);

previousButton.addEventListener(
    "click",
    previousSong
);


/* =========================
   HERO BUTTON
========================= */

heroPlayButton.addEventListener(
    "click",
    () => {

        if (
            currentSongIndex === 0 &&
            isPlaying
        ) {

            pauseSong();

            heroPlayButton.innerHTML =
                '<i class="fa-solid fa-play"></i> Reproducir';

        } else {

            loadSong(0);

            playSong();

            heroPlayButton.innerHTML =
                '<i class="fa-solid fa-pause"></i> Pausar';

        }

    }
);


/* =========================
   ALBUM CARDS
========================= */

const albumCards =
    document.querySelectorAll(
        ".album-card"
    );

albumCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const index =
                Number(
                    card.dataset.song
                );

            if (
                Number.isInteger(index) &&
                songs[index]
            ) {

                loadSong(index);

                playSong();

            }

        }
    );

});


/* =========================
   SONG ROWS
========================= */

const songRows =
    document.querySelectorAll(
        ".song-row"
    );

songRows.forEach(row => {

    row.addEventListener(
        "click",
        () => {

            const index =
                Number(
                    row.dataset.song
                );

            if (
                Number.isInteger(index) &&
                songs[index]
            ) {

                loadSong(index);

                playSong();

            }

        }
    );

});


/* =========================
   ACTIVE SONG
========================= */

function updateActiveSong() {

    songRows.forEach(row => {

        row.classList.remove(
            "current"
        );

        const index =
            Number(row.dataset.song);

        if (
            index === currentSongIndex
        ) {

            row.classList.add(
                "current"
            );

        }

    });

}


/* =========================
   LIKE BUTTON
========================= */

likeButton.addEventListener(
    "click",
    () => {

        likeButton.classList.toggle(
            "liked"
        );

        const icon =
            likeButton.querySelector("i");

        if (
            likeButton.classList.contains(
                "liked"
            )
        ) {

            icon.className =
                "fa-solid fa-heart";

        } else {

            icon.className =
                "fa-regular fa-heart";

        }

    }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();

        songRows.forEach(row => {

            const title =
                row.querySelector(
                    ".song-info strong"
                )
                    .textContent
                    .toLowerCase();

            const artist =
                row.querySelector(
                    ".song-info span"
                )
                    .textContent
                    .toLowerCase();

            if (
                title.includes(query) ||
                artist.includes(query)
            ) {

                row.style.display =
                    "grid";

            } else {

                row.style.display =
                    "none";

            }

        });

        albumCards.forEach(card => {

            const title =
                card.querySelector(
                    "h3"
                )
                    .textContent
                    .toLowerCase();

            const artist =
                card.querySelector(
                    "p"
                )
                    .textContent
                    .toLowerCase();

            if (
                title.includes(query) ||
                artist.includes(query)
            ) {

                card.style.display =
                    "block";

            } else {

                card.style.display =
                    "none";

            }

        });

    }
);


/* =========================
   ADD PLAYLIST
========================= */

const addPlaylist =
    document.getElementById(
        "addPlaylist"
    );

addPlaylist.addEventListener(
    "click",
    () => {

        const name =
            prompt(
                "Nombre de la nueva playlist:"
            );

        if (
            name &&
            name.trim()
        ) {

            alert(
                `Playlist "${name.trim()}" creada.`
            );

        }

    }
);


/* =========================
   QUEUE
========================= */

const queueButton =
    document.getElementById(
        "queueButton"
    );

queueButton.addEventListener(
    "click",
    () => {

        alert(
            "Cola de reproducción próximamente."
        );

    }
);


/* =========================
   DEVICE
========================= */

const deviceButton =
    document.getElementById(
        "deviceButton"
    );

deviceButton.addEventListener(
    "click",
    () => {

        alert(
            "No hay otros dispositivos disponibles."
        );

    }
);


/* =========================
   FULLSCREEN
========================= */

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );

fullscreenButton.addEventListener(
    "click",
    () => {

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(() => { });

        } else {

            document.exitFullscreen();

        }

    }
);


/* =========================
   BROWSER NAVIGATION
========================= */

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    () => {

        history.back();

    }
);

document.getElementById(
    "forwardButton"
).addEventListener(
    "click",
    () => {

        history.forward();

    }
);


/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName ===
            "INPUT"
        ) {
            return;
        }

        switch (event.code) {

            case "Space":

                event.preventDefault();

                togglePlay();

                break;

            case "ArrowRight":

                if (audio.duration) {

                    audio.currentTime =
                        Math.min(
                            audio.currentTime + 5,
                            audio.duration
                        );

                }

                break;

            case "ArrowLeft":

                if (audio.duration) {

                    audio.currentTime =
                        Math.max(
                            audio.currentTime - 5,
                            0
                        );

                }

                break;

        }

    }
);


/* =========================
   INITIALIZATION
========================= */

loadSong(0);

audio.volume = 0.8;

volumeBar.value = 0.8;

updateVolumeIcon();