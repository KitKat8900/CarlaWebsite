// Plays the songs in "lucas playlist" and keeps the "now listening to" line in sync.
(function () {
	// small notes shown after the title and artist, like in the mockup; set to '' to hide
	const LABELS = { title: ' (title of song)', artist: ' (artist)' };

	// file   = folder + song name + .mp3, exactly as it is on disk
	// title  = what shows on the page (optional: left out, the song name is used)
	// artist = fill this in for each song (left empty, the artist line stays blank)
	const PLAYLIST = [
		{ file: 'lucas playlist/Bodyfeeling.mp3', artist: 'underscores' },
		{ file: 'lucas playlist/How to Teleport (leroy Remix).mp3', artist: '' },
		{ file: 'lucas playlist/Music.mp3', artist: '' },
		{ file: 'lucas playlist/That Boy_s Not Nice.mp3', title: 'That Boy\u2019s Not Nice', artist: '' },
		{ file: 'lucas playlist/IT_S NOT LIKE THAT ANYMORE.mp3', title: 'IT\u2019S NOT LIKE THAT ANYMORE', artist: '' },
		{ file: 'lucas playlist/Music Baby.mp3', artist: '' },
		{ file: 'lucas playlist/only the best.mp3', artist: '' },
		{ file: 'lucas playlist/Seventh heaven.mp3', artist: '' },
		{ file: 'lucas playlist/Creep.mp3', artist: '' },
		{ file: 'lucas playlist/Lovefield.mp3', artist: '' },
		{ file: 'lucas playlist/P\u00FCr Love.mp3', artist: '' },
		{ file: 'lucas playlist/Tell Me (U Want It).mp3', artist: '' },
		{ file: 'lucas playlist/All Or Nothing.mp3', artist: '' },
		{ file: 'lucas playlist/Do It.mp3', artist: '' },

		{ file: 'lucas playlist/Sister.mp3', artist: '' },
		{ file: 'lucas playlist/So What_.mp3', title: 'So What?', artist: '' },
		{ file: 'lucas playlist/FIANCHI.mp3', artist: '' },
		{ file: 'lucas playlist/PQC.mp3', artist: '' },
		{ file: 'lucas playlist/WannaCry.mp3', artist: '' },
		{ file: 'lucas playlist/Fuck My Computer.mp3', artist: '' },
		{ file: 'lucas playlist/iPod Touch.mp3', artist: '' },
		{ file: 'lucas playlist/Wayside.mp3', artist: '' },
		{ file: 'lucas playlist/Ice u out.mp3', artist: '' },
		{ file: 'lucas playlist/Light Leak.mp3', artist: '' },
		{ file: 'lucas playlist/Love Love (Love Love).mp3', artist: '' },
		{ file: 'lucas playlist/Ninacamina.mp3', artist: '' },
		{ file: 'lucas playlist/Dream Sequence.mp3', artist: '' },
		{ file: 'lucas playlist/girl EDM.mp3', artist: '' },

		{ file: 'lucas playlist/Hand on my heart.mp3', artist: '' },
		{ file: 'lucas playlist/1x1.mp3', artist: '' },
		{ file: 'lucas playlist/Stupid (Can\u2019t run from the urge).mp3', artist: '' },
		{ file: 'lucas playlist/Delete.mp3', artist: '' },
		{ file: 'lucas playlist/Flash in the Pan.mp3', artist: '' },
		{ file: 'lucas playlist/Unlimited Love.mp3', artist: '' },
		{ file: 'lucas playlist/Angel Music.mp3', artist: '' },
		{ file: 'lucas playlist/DOIT4ME.mp3', artist: '' },
		{ file: 'lucas playlist/Kota on the plane.mp3', artist: '' },
		{ file: 'lucas playlist/PRETTY4U.mp3', artist: '' },
		{ file: 'lucas playlist/The Peace.mp3', artist: '' },
		{ file: 'lucas playlist/Afterlife.mp3', artist: '' },
		{ file: 'lucas playlist/COPYCAT.mp3', artist: '' },
		{ file: 'lucas playlist/Deadtome.mp3', artist: '' },

		{ file: 'lucas playlist/Heels broke = died.mp3', artist: '' },
		{ file: 'lucas playlist/MAKE IT RIGHT.mp3', artist: '' },
		{ file: 'lucas playlist/Undo U.mp3', artist: '' },
		{ file: 'lucas playlist/CSIRAC.mp3', artist: '' },
		{ file: 'lucas playlist/I RUN MY HANDS THRU IT.mp3', artist: '' },
		{ file: 'lucas playlist/London Song.mp3', artist: '' },
		{ file: 'lucas playlist/Until 4EVER.mp3', artist: '' }
		// add more songs here, same format
	];

	function init() {
		const titleEl = document.querySelector('.listen-song');
		const artistEl = document.querySelector('.listen-artist');
		const playBtn = document.getElementById('play-btn');

		// if the page is missing something, say so in the console instead of crashing
		if (!titleEl || !playBtn) {
			console.error('player.js: could not find ' + (!titleEl ? '.listen-song' : '#play-btn') + ' in the page');
			return;
		}

		const PLAY = 'PLAY';
		const PAUSE = 'PAUSE';

		const audio = new Audio();
		audio.preload = 'metadata';     // only fetch a song when it is about to play

		let i = 0;                      // index of the current song
		let wantPlay = false;           // true while the visitor wants music
		let fails = 0;                  // songs in a row that failed to load

		function setUI(playing) {
			playBtn.textContent = playing ? PAUSE : PLAY;
			playBtn.classList.toggle('playing', playing);
		}

		function startPlayback() {
			audio.play().catch((err) => {
				if (err && err.name === 'AbortError') return;      // just switched songs
				if (err && err.name === 'NotAllowedError') {       // browser wants a click first
					wantPlay = false;
					setUI(false);
				} else {
					console.warn('player.js: play() failed', err);
				}
			});
		}

		function load(n) {
			i = (n + PLAYLIST.length) % PLAYLIST.length;
			const t = PLAYLIST[i];
			audio.src = encodeURI(t.file);
			titleEl.textContent = (t.title || t.file.split('/').pop().replace(/\.mp3$/i, '')) + LABELS.title;
			if (artistEl) artistEl.textContent = t.artist ? '\u21B3 ' + t.artist + LABELS.artist : '';
			if (wantPlay) startPlayback();
		}

		playBtn.addEventListener('click', () => {
			if (wantPlay) {
				wantPlay = false;
				audio.pause();
				setUI(false);
			} else {
				wantPlay = true;
				setUI(true);                // switch the button right away
				startPlayback();
			}
		});

		audio.addEventListener('ended', () => load(i + 1));
		audio.addEventListener('playing', () => { fails = 0; });

		// a wrong file name: say which one in the console, and skip to the next song
		audio.addEventListener('error', () => {
			console.warn('player.js: could not load', decodeURI(audio.src));
			if (wantPlay && ++fails < PLAYLIST.length) load(i + 1);
		});

		// keep the song and position when the visitor leaves for another page and comes back
		const KEY = 'carla-player';
		function save() {
			try {
				sessionStorage.setItem(KEY, JSON.stringify({ i: i, time: audio.currentTime, playing: wantPlay }));
			} catch (e) {}
		}
		setInterval(save, 1000);
		window.addEventListener('pagehide', save);

		let start = 0, startTime = 0, resume = false;
		try {
			const s = JSON.parse(sessionStorage.getItem(KEY));
			if (s && PLAYLIST[s.i]) { start = s.i; startTime = s.time || 0; resume = !!s.playing; }
		} catch (e) {}

		if (startTime) {
			audio.addEventListener('loadedmetadata', () => { audio.currentTime = startTime; }, { once: true });
		}
		wantPlay = resume;              // browsers may still block this until the first click
		setUI(resume);
		load(start);
		console.log('player.js: ready, ' + PLAYLIST.length + ' songs');
	}

	// works wherever the script tag is placed
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();