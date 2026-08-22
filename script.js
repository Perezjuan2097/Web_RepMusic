
/* =========================
   SUPABASE AUTHENTICATION
========================= */

/*
 * IMPORTANTE:
 * Reemplaza estos dos valores con los datos de tu proyecto Supabase.
 *
 * Supabase Dashboard:
 * Project Settings -> API
 *
 * Usa:
 * - Project URL
 * - Publishable key (o anon key si tu proyecto todavía la muestra con ese nombre)
 *
 * NUNCA pongas aquí una service_role/secret key.
 */

const SUPABASE_URL = "https://yxkxdoorhagqexjqotpy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gaaezxjzPmXbLZskqBzWLA_AJmcp6zV";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const authOverlay = document.getElementById("authOverlay");
const authCloseButton = document.getElementById("authCloseButton");
const authUserButton = document.getElementById("authUserButton");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const nameField = document.getElementById("nameField");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

let authMode = "login";

function openAuthModal(mode = "login") {
    setAuthMode(mode);

    authOverlay.classList.add("open");
    authOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-open");

    setTimeout(() => authEmail.focus(), 50);
}

function closeAuthModal() {
    authOverlay.classList.remove("open");
    authOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-open");

    authMessage.textContent = "";
    authMessage.className = "auth-message";
}

function setAuthMode(mode) {
    authMode = mode;

    const isRegister = mode === "register";

    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);

    nameField.hidden = !isRegister;
    authName.required = isRegister;

    authTitle.textContent = isRegister
        ? "Crea tu cuenta"
        : "Bienvenido a Pulse";

    authSubtitle.textContent = isRegister
        ? "Regístrate para guardar tu cuenta en Pulse."
        : "Inicia sesión para continuar.";

    authSubmit.textContent = isRegister
        ? "Crear cuenta"
        : "Iniciar sesión";

    authPassword.autocomplete =
        isRegister ? "new-password" : "current-password";

    authMessage.textContent = "";
    authMessage.className = "auth-message";
}

function showAuthMessage(message, type = "") {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`.trim();
}

function getUserDisplayName(user) {
    return (
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Usuario"
    );
}

function updateUserInterface(user) {
    if (user) {
        const displayName = getUserDisplayName(user);
        const initial = displayName.charAt(0).toUpperCase();

        userName.textContent = displayName;
        userAvatar.textContent = initial;
        authUserButton.title = "Cerrar sesión";
    } else {
        userName.textContent = "Iniciar sesión";
        userAvatar.textContent = "?";
        authUserButton.title = "Iniciar sesión";
    }
}

async function handleAuthUserButton() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("No se pudo consultar la sesión:", error);
        openAuthModal("login");
        return;
    }

    if (data.user) {
        const shouldLogout = confirm(
            `¿Quieres cerrar sesión de ${getUserDisplayName(data.user)}?`
        );

        if (!shouldLogout) {
            return;
        }

        const { error: logoutError } =
            await supabaseClient.auth.signOut();

        if (logoutError) {
            alert("No se pudo cerrar sesión: " + logoutError.message);
            return;
        }

        updateUserInterface(null);
        alert("Sesión cerrada correctamente.");
    } else {
        openAuthModal("login");
    }
}

authUserButton.addEventListener(
    "click",
    handleAuthUserButton
);

authCloseButton.addEventListener(
    "click",
    closeAuthModal
);

loginTab.addEventListener(
    "click",
    () => setAuthMode("login")
);

registerTab.addEventListener(
    "click",
    () => setAuthMode("register")
);

authOverlay.addEventListener(
    "click",
    event => {
        if (event.target === authOverlay) {
            closeAuthModal();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            authOverlay.classList.contains("open")
        ) {
            closeAuthModal();
        }
    }
);

authForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const email = authEmail.value.trim();
        const password = authPassword.value;
        const name = authName.value.trim();

        if (!email || !password) {
            showAuthMessage(
                "Completa el correo y la contraseña.",
                "error"
            );
            return;
        }

        authSubmit.disabled = true;
        showAuthMessage("Procesando...");

        try {
            if (authMode === "register") {
                const { data, error } =
                    await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: name
                            }
                        }
                    });

                if (error) {
                    throw error;
                }

                /*
                 * Si Supabase tiene activada la confirmación por correo,
                 * el usuario recibirá un correo antes de poder iniciar sesión.
                 */
                if (data.session) {
                    showAuthMessage(
                        "Cuenta creada. Ya puedes usar Pulse.",
                        "success"
                    );

                    authForm.reset();

                    setTimeout(() => {
                        closeAuthModal();
                    }, 1200);
                } else {
                    showAuthMessage(
                        "Cuenta creada. Revisa tu correo para confirmar la cuenta.",
                        "success"
                    );

                    authForm.reset();
                }
            } else {
                const { error } =
                    await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                showAuthMessage(
                    "Inicio de sesión correcto.",
                    "success"
                );

                authForm.reset();

                setTimeout(() => {
                    closeAuthModal();
                }, 600);
            }
        } catch (error) {
            console.error("Error de autenticación:", error);

            showAuthMessage(
                error.message || "Ocurrió un error.",
                "error"
            );
        } finally {
            authSubmit.disabled = false;
        }
    }
);

async function initializeAuth() {
    /*
     * getSession() recupera la sesión guardada por Supabase
     * cuando el usuario vuelve a abrir la página.
     */
    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(
            "No se pudo recuperar la sesión:",
            error
        );
    }

    updateUserInterface(data?.session?.user || null);

    supabaseClient.auth.onAuthStateChange(
        (_event, session) => {
            updateUserInterface(session?.user || null);
        }
    );
}

initializeAuth();


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
