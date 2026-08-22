/* =========================================================
   PULSE MUSIC
   SUPABASE AUTHENTICATION
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://yxkxdoorhagqexjqotpy.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_gaaezxjzPmXbLZskqBzWLA_AJmcp6zV";


const GITHUB_PAGES_URL =
    "https://perezjuan2097.github.io/Web_RepMusic/";


/*
 * Comprobamos que la librería de Supabase haya cargado.
 */

let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

} else {

    console.error(
        "No se pudo cargar la librería de Supabase."
    );

}


/* =========================================================
   DOM - AUTHENTICATION
========================================================= */

const authOverlay =
    document.getElementById("authOverlay");

const authCloseButton =
    document.getElementById("authCloseButton");

const authUserButton =
    document.getElementById("authUserButton");

const authForm =
    document.getElementById("authForm");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const authSubmit =
    document.getElementById("authSubmit");

const authMessage =
    document.getElementById("authMessage");

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const nameField =
    document.getElementById("nameField");

const authName =
    document.getElementById("authName");

const authEmail =
    document.getElementById("authEmail");

const authPassword =
    document.getElementById("authPassword");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");


let authMode = "login";


/* =========================================================
   AUTH MODAL
========================================================= */

function openAuthModal(mode = "login") {

    setAuthMode(mode);

    authOverlay.classList.add("open");

    authOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "auth-open"
    );

    setTimeout(() => {

        authEmail.focus();

    }, 100);

}


function closeAuthModal() {

    authOverlay.classList.remove(
        "open"
    );

    authOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "auth-open"
    );

    clearAuthMessage();

}


function setAuthMode(mode) {

    authMode = mode;

    const isRegister =
        mode === "register";


    loginTab.classList.toggle(
        "active",
        !isRegister
    );

    registerTab.classList.toggle(
        "active",
        isRegister
    );


    nameField.hidden =
        !isRegister;

    authName.required =
        isRegister;


    authTitle.textContent =
        isRegister
            ? "Crea tu cuenta"
            : "Bienvenido a Pulse";


    authSubtitle.textContent =
        isRegister
            ? "Regístrate para comenzar a usar Pulse."
            : "Inicia sesión para continuar.";


    authSubmit.textContent =
        isRegister
            ? "Crear cuenta"
            : "Iniciar sesión";


    authPassword.autocomplete =
        isRegister
            ? "new-password"
            : "current-password";


    clearAuthMessage();

}


function clearAuthMessage() {

    authMessage.textContent =
        "";

    authMessage.className =
        "auth-message";

}


function showAuthMessage(
    message,
    type = ""
) {

    authMessage.textContent =
        message;

    authMessage.className =
        `auth-message ${type}`.trim();

}


/* =========================================================
   USER INTERFACE
========================================================= */

function getUserDisplayName(user) {

    if (!user) {
        return "Iniciar sesión";
    }


    return (
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Usuario"
    );

}


function updateUserInterface(user) {

    if (!user) {

        userName.textContent =
            "Iniciar sesión";

        userAvatar.textContent =
            "?";

        authUserButton.title =
            "Iniciar sesión";

        return;

    }


    const displayName =
        getUserDisplayName(user);


    const initial =
        displayName
            .charAt(0)
            .toUpperCase();


    userName.textContent =
        displayName;

    userAvatar.textContent =
        initial;

    authUserButton.title =
        "Cerrar sesión";

}


/* =========================================================
   OPEN LOGIN / LOGOUT
========================================================= */

async function handleAuthButton() {

    /*
     * Si Supabase todavía no cargó,
     * el modal igualmente puede abrirse.
     */

    if (!supabaseClient) {

        openAuthModal("login");

        showAuthMessage(
            "No se pudo conectar con el servicio de autenticación.",
            "error"
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {

            console.warn(
                "No se pudo obtener el usuario:",
                error
            );

            openAuthModal("login");

            return;

        }


        if (!data.user) {

            openAuthModal("login");

            return;

        }


        /*
         * Usuario autenticado:
         * el botón funciona como logout.
         */

        const confirmLogout =
            window.confirm(
                `¿Quieres cerrar sesión de ${getUserDisplayName(data.user)}?`
            );


        if (!confirmLogout) {
            return;
        }


        const {
            error: logoutError
        } =
            await supabaseClient.auth.signOut();


        if (logoutError) {

            showAuthMessage(
                logoutError.message,
                "error"
            );

            return;

        }


        updateUserInterface(
            null
        );

        window.alert(
            "Sesión cerrada correctamente."
        );

    } catch (error) {

        console.error(
            "Error de autenticación:",
            error
        );

        openAuthModal("login");

    }

}


/* =========================================================
   AUTH BUTTON EVENTS
========================================================= */

authUserButton.addEventListener(
    "click",
    handleAuthButton
);


authCloseButton.addEventListener(
    "click",
    closeAuthModal
);


loginTab.addEventListener(
    "click",
    () => {

        setAuthMode("login");

    }
);


registerTab.addEventListener(
    "click",
    () => {

        setAuthMode("register");

    }
);


authOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target === authOverlay
        ) {

            closeAuthModal();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            authOverlay.classList.contains(
                "open"
            )
        ) {

            closeAuthModal();

        }

    }
);


/* =========================================================
   LOGIN / REGISTER
========================================================= */

authForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            authEmail.value.trim();

        const password =
            authPassword.value;

        const name =
            authName.value.trim();


        if (!email) {

            showAuthMessage(
                "Introduce tu correo electrónico.",
                "error"
            );

            authEmail.focus();

            return;

        }


        if (!password) {

            showAuthMessage(
                "Introduce tu contraseña.",
                "error"
            );

            authPassword.focus();

            return;

        }


        if (
            authMode === "register" &&
            password.length < 6
        ) {

            showAuthMessage(
                "La contraseña debe tener al menos 6 caracteres.",
                "error"
            );

            authPassword.focus();

            return;

        }


        if (
            authMode === "register" &&
            !name
        ) {

            showAuthMessage(
                "Introduce tu nombre.",
                "error"
            );

            authName.focus();

            return;

        }


        if (!supabaseClient) {

            showAuthMessage(
                "Supabase no está disponible. Recarga la página e inténtalo nuevamente.",
                "error"
            );

            return;

        }


        authSubmit.disabled =
            true;


        showAuthMessage(
            "Procesando..."
        );


        try {


            /* =================================================
               REGISTRO
            ================================================= */

            if (
                authMode === "register"
            ) {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signUp({

                        email: email,

                        password: password,

                        options: {

                            /*
                             * IMPORTANTE:
                             * después de confirmar el correo,
                             * Supabase vuelve a GitHub Pages.
                             */

                            emailRedirectTo:
                                GITHUB_PAGES_URL,


                            data: {

                                full_name:
                                    name

                            }

                        }

                    });


                if (error) {

                    throw error;

                }


                /*
                 * Si Supabase devuelve una sesión,
                 * significa que no requiere confirmación.
                 */

                if (data.session) {

                    updateUserInterface(
                        data.user
                    );


                    showAuthMessage(
                        "Cuenta creada correctamente.",
                        "success"
                    );


                    authForm.reset();


                    setTimeout(
                        closeAuthModal,
                        1000
                    );


                } else {

                    /*
                     * Confirmación por correo activada.
                     */

                    showAuthMessage(
                        "Cuenta creada. Revisa tu correo y confirma tu cuenta para continuar.",
                        "success"
                    );


                    authForm.reset();

                }


                return;

            }


            /* =================================================
               LOGIN
            ================================================= */

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                throw error;

            }


            updateUserInterface(
                data.user
            );


            showAuthMessage(
                "Inicio de sesión correcto.",
                "success"
            );


            authForm.reset();


            setTimeout(
                closeAuthModal,
                700
            );


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );


            let message =
                error?.message ||
                "Ocurrió un error inesperado.";


            /*
             * Mensajes más amigables.
             */

            if (
                message
                    .toLowerCase()
                    .includes(
                        "invalid login credentials"
                    )
            ) {

                message =
                    "El correo o la contraseña son incorrectos.";

            }


            if (
                message
                    .toLowerCase()
                    .includes(
                        "user already registered"
                    )
            ) {

                message =
                    "Este correo ya tiene una cuenta registrada.";

            }


            showAuthMessage(
                message,
                "error"
            );


        } finally {

            authSubmit.disabled =
                false;

        }

    }
);


/* =========================================================
   INITIALIZE AUTH
========================================================= */

async function initializeAuth() {

    /*
     * Primero dejamos la interfaz disponible.
     */

    updateUserInterface(
        null
    );


    /*
     * Si Supabase no cargó,
     * no detenemos el resto de la página.
     */

    if (!supabaseClient) {

        console.error(
            "Supabase no está disponible."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Error recuperando sesión:",
                error
            );

            return;

        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            updateUserInterface(
                data.session.user
            );

        }


    } catch (error) {

        console.error(
            "Error inicializando autenticación:",
            error
        );

    }


    /*
     * Escuchar cambios de sesión.
     */

    supabaseClient.auth.onAuthStateChange(
        (_event, session) => {

            updateUserInterface(
                session?.user || null
            );

        }
    );

}


/* =========================================================
   START AUTH
========================================================= */

initializeAuth();



/* =========================================================
   MUSIC DATABASE
========================================================= */

const songs = [

    {
        title: "Midnight Dreams",
        artist: "Neon Waves",
        album: "Midnight Dreams",
        cover: "image-one",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },

    {
        title: "After Hours",
        artist: "Night Drive",
        album: "After Hours",
        cover: "image-two",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },

    {
        title: "Ocean Eyes",
        artist: "Blue Horizon",
        album: "Ocean Eyes",
        cover: "image-three",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },

    {
        title: "City Lights",
        artist: "Urban Echo",
        album: "City Lights",
        cover: "image-four",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },

    {
        title: "Digital Love",
        artist: "Future State",
        album: "Digital Love",
        cover: "image-five",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },

    {
        title: "Electric Soul",
        artist: "Voltage",
        album: "Electric Soul",
        cover: "image-six",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    },

    {
        title: "Neon Sky",
        artist: "Solaris",
        album: "Neon Sky",
        cover: "image-seven",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
    },

    {
        title: "Future Nights",
        artist: "Digital Dreams",
        album: "Future Nights",
        cover: "image-eight",
        audio:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    }

];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const audio =
    document.getElementById(
        "audioPlayer"
    );

const playButton =
    document.getElementById(
        "playButton"
    );

const playIcon =
    playButton.querySelector(
        "i"
    );

const previousButton =
    document.getElementById(
        "previousButton"
    );

const nextButton =
    document.getElementById(
        "nextButton"
    );

const shuffleButton =
    document.getElementById(
        "shuffleButton"
    );

const repeatButton =
    document.getElementById(
        "repeatButton"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );

const volumeBar =
    document.getElementById(
        "volumeBar"
    );

const volumeButton =
    document.getElementById(
        "volumeButton"
    );

const currentTimeElement =
    document.getElementById(
        "currentTime"
    );

const durationElement =
    document.getElementById(
        "duration"
    );

const playerTitle =
    document.getElementById(
        "playerTitle"
    );

const playerArtist =
    document.getElementById(
        "playerArtist"
    );

const playerCover =
    document.getElementById(
        "playerCover"
    );

const likeButton =
    document.getElementById(
        "likeButton"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const heroPlayButton =
    document.getElementById(
        "heroPlayButton"
    );


/* =========================================================
   PLAYER STATE
========================================================= */

let currentSongIndex = 0;

let isPlaying = false;

let isShuffle = false;

let isRepeat = false;

let previousVolume = 0.8;


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index) {

    currentSongIndex =
        index;

    const song =
        songs[currentSongIndex];


    playerTitle.textContent =
        song.title;

    playerArtist.textContent =
        song.artist;


    playerCover.className =
        `player-cover ${song.cover}`;


    audio.src =
        song.audio;


    audio.load();


    updateActiveSong();

}


/* =========================================================
   PLAY
========================================================= */

function playSong() {

    audio.play()
        .then(() => {

            isPlaying =
                true;

            playIcon.className =
                "fa-solid fa-pause";

        })
        .catch(error => {

            console.error(
                "No se pudo reproducir:",
                error
            );

        });

}


/* =========================================================
   PAUSE
========================================================= */

function pauseSong() {

    audio.pause();

    isPlaying =
        false;

    playIcon.className =
        "fa-solid fa-play";

}


/* =========================================================
   TOGGLE PLAY
========================================================= */

function togglePlay() {

    if (isPlaying) {

        pauseSong();

    } else {

        playSong();

    }

}


/* =========================================================
   NEXT
========================================================= */

function nextSong() {

    let nextIndex;


    if (isShuffle) {

        nextIndex =
            Math.floor(
                Math.random() *
                songs.length
            );

    } else {

        nextIndex =
            currentSongIndex + 1;

        if (
            nextIndex >=
            songs.length
        ) {

            nextIndex = 0;

        }

    }


    loadSong(
        nextIndex
    );

    playSong();

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousSong() {

    let previousIndex =
        currentSongIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            songs.length - 1;

    }


    loadSong(
        previousIndex
    );

    playSong();

}


/* =========================================================
   SHUFFLE
========================================================= */

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


/* =========================================================
   REPEAT
========================================================= */

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


/* =========================================================
   SONG ENDED
========================================================= */

audio.addEventListener(
    "ended",
    () => {

        if (isRepeat) {

            audio.currentTime =
                0;

            playSong();

        } else {

            nextSong();

        }

    }
);


/* =========================================================
   PLAY BUTTON
========================================================= */

playButton.addEventListener(
    "click",
    togglePlay
);


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

nextButton.addEventListener(
    "click",
    nextSong
);


previousButton.addEventListener(
    "click",
    previousSong
);


/* =========================================================
   HERO BUTTON
========================================================= */

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


/* =========================================================
   ALBUM CARDS
========================================================= */

const albumCards =
    document.querySelectorAll(
        ".album-card"
    );


albumCards.forEach(
    card => {

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

                    loadSong(
                        index
                    );

                    playSong();

                }

            }
        );

    }
);


/* =========================================================
   SONG ROWS
========================================================= */

const songRows =
    document.querySelectorAll(
        ".song-row"
    );


songRows.forEach(
    row => {

        row.addEventListener(
            "click",
            event => {

                /*
                 * Evitamos reproducir si se pulsa
                 * específicamente el botón de opciones.
                 */

                if (
                    event.target.closest(
                        ".song-more"
                    )
                ) {

                    return;

                }


                const index =
                    Number(
                        row.dataset.song
                    );


                if (
                    Number.isInteger(index) &&
                    songs[index]
                ) {

                    loadSong(
                        index
                    );

                    playSong();

                }

            }
        );

    }
);


/* =========================================================
   ACTIVE SONG
========================================================= */

function updateActiveSong() {

    songRows.forEach(
        row => {

            row.classList.remove(
                "current"
            );


            const index =
                Number(
                    row.dataset.song
                );


            if (
                index ===
                currentSongIndex
            ) {

                row.classList.add(
                    "current"
                );

            }

        }
    );

}


/* =========================================================
   LIKE BUTTON
========================================================= */

likeButton.addEventListener(
    "click",
    () => {

        likeButton.classList.toggle(
            "liked"
        );


        const icon =
            likeButton.querySelector(
                "i"
            );


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


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        songRows.forEach(
            row => {

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


                const matches =
                    title.includes(query) ||
                    artist.includes(query);


                row.style.display =
                    matches
                        ? ""
                        : "none";

            }
        );

    }
);


/* =========================================================
   PROGRESS BAR
========================================================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            Number.isFinite(
                audio.duration
            )
        ) {

            durationElement.textContent =
                formatTime(
                    audio.duration
                );

        }

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !Number.isFinite(
                audio.duration
            )
        ) {

            return;

        }


        const percentage =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        progressBar.value =
            percentage;


        currentTimeElement.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


progressBar.addEventListener(
    "input",
    () => {

        if (
            !Number.isFinite(
                audio.duration
            )
        ) {

            return;

        }


        audio.currentTime =
            (
                Number(
                    progressBar.value
                ) / 100
            ) *
            audio.duration;

    }
);


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

}


/* =========================================================
   VOLUME
========================================================= */

audio.volume =
    0.8;


volumeBar.value =
    0.8;


volumeBar.addEventListener(
    "input",
    () => {

        const volume =
            Number(
                volumeBar.value
            );


        audio.volume =
            volume;


        if (
            volume > 0
        ) {

            previousVolume =
                volume;

        }


        updateVolumeIcon(
            volume
        );

    }
);


volumeButton.addEventListener(
    "click",
    () => {

        if (
            audio.volume > 0
        ) {

            previousVolume =
                audio.volume;

            audio.volume =
                0;

            volumeBar.value =
                0;

        } else {

            audio.volume =
                previousVolume;

            volumeBar.value =
                previousVolume;

        }


        updateVolumeIcon(
            audio.volume
        );

    }
);


function updateVolumeIcon(
    volume
) {

    const icon =
        volumeButton.querySelector(
            "i"
        );


    if (
        volume === 0
    ) {

        icon.className =
            "fa-solid fa-volume-xmark";

    } else if (
        volume < 0.5
    ) {

        icon.className =
            "fa-solid fa-volume-low";

    } else {

        icon.className =
            "fa-solid fa-volume-high";

    }

}


/* =========================================================
   INITIAL SONG
========================================================= */

loadSong(
    0
);
