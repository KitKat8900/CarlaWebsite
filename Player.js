// Plays the songs in "lucas playlist" and keeps the "now listening to" line in sync.
(function () {
	const FOLDER = 'lucas playlist/';   // folder with the mp3 files (next to index.html)
	const EXT = '.mp3';

	// file   = the file name WITHOUT .mp3, exactly as it is in the folder
	// title  = what shows on the page (optional: left out, the file name is used)
	// artist = fill this in for each song (left empty, the artist line stays blank)
	const PLAYLIST = [
		{ file: 'Bodyfeeling', artist: 'underscores' },
		{ file: 'How to Teleport (leroy Remix)', artist: 'underscores' },
		{ file: 'Music', artist: '' },
		{ file: 'That Boy_s Not Nice', title: 'That Boy\u2019s Not Nice', artist: '' },
		{ file: 'IT_S NOT LIKE THAT ANYMORE', title: 'IT\u2019S NOT LIKE THAT ANYMORE', artist: '' },
		{ file: 'Music Baby', artist: '' },
		{ file: 'only the best', artist: '' },
		{ file: 'Seventh heaven', artist: '' },
		{ file: 'Creep', artist: '' },
		{ file: 'Lovefield', artist: '' },
		{ file: 'P\u00FCr Love', artist: '' },
		{ file: 'Tell Me (U Want It)', artist: '' },
		{ file: 'All Or Nothing', artist: '' },
		{ file: 'Do It', artist: '' },

		{ file: 'Sister', artist: '' },
		{ file: 'So What_', title: 'So What?', artist: '' },
		{ file: 'FIANCHI', artist: '' },
		{ file: 'PQC', artist: '' },
		{ file: 'WannaCry', artist: '' },
		{ file: 'Fuck My Computer', artist: '' },
		{ file: 'iPod Touch', artist: '' },
		{ file: 'Wayside', artist: '' },
		{ file: 'Ice u out', artist: '' },
		{ file: 'Light Leak', artist: '' },
		{ file: 'Love Love (Love Love)', artist: '' },
		{ file: 'Ninacamina', artist: '' },
		{ file: 'Dream Sequence', artist: '' },
		{ file: 'girl EDM', artist: '' },

		{ file: 'Hand on my heart', artist: '' },
		{ file: '1x1', artist: '' },
		{ file: 'Stupid (Can\u2019t run from the urge)', artist: '' },
		{ file: 'Delete', artist: '' },
		{ file: 'Flash in the Pan', artist: '' },
		{ file: 'Unlimited Love', artist: '' },
		{ file: 'Angel Music', artist: '' },
		{ file: 'DOIT4ME', artist: '' },
		{ file: 'Kota on the plane', artist: '' },
		{ file: 'PRETTY4U', artist: '' },
		{ file: 'The Peace', artist: '' },
		{ file: 'Afterlife', artist: '' },
		{ file: 'COPYCAT', artist: '' },
		{ file: 'Deadtome', artist: '' },

		{ file: 'Heels broke = died', artist: '' },
		{ file: 'MAKE IT RIGHT', artist: '' },
		{ file: 'Undo U', artist: '' },
		{ file: 'CSIRAC', artist: '' },
		{ file: 'I RUN MY HANDS THRU IT', artist: '' },
		{ file: 'London Song', artist: '' },
		{ file: 'Until 4EVER', artist: '' }
		// add more songs here, same format
	];

	const titleEl = document.querySelector('.listen-song');
	const artistEl = document.querySelector('.listen-artist');
	const playBtn = document.getElementById('play-btn');
	const prevBtn = document.getElementById('prev-btn');
	const nextBtn = document.getElementById('next-btn');

	const PLAY = '\u25B6\uFE0E';    // play triangle
	const PAUSE = '\u275A\u275A';   // pause bars

	const audio = new Audio();
	audio.preload = 'metadata';     // only fetch a song when it is about to play

	let i = 0;                      // index of the current song
	let wantPlay = false;           // true once the visitor has asked for music
	let fails = 0;                  // songs in a row that failed to load

	function load(n) {
		i = (n + PLAYLIST.length) % PLAYLIST.length;
		const t = PLAYLIST[i];
		audio.src = encodeURI(FOLDER + t.file + EXT);
		titleEl.textContent = t.title || t.file;
		artistEl.textContent = t.artist ? '\u21B3 ' + t.artist : '';
		if (wantPlay) audio.play().catch(() => {});
	}

	function toggle() {
		if (audio.paused) {
			wantPlay = true;
			audio.play().catch(() => {});
		} else {
			wantPlay = false;
			audio.pause();
		}
	}

	playBtn.addEventListener('click', toggle);
	nextBtn.addEventListener('click', () => { wantPlay = true; load(i + 1); });
	prevBtn.addEventListener('click', () => {
		// past the first 3 seconds, "prev" restarts the song; otherwise it goes back one
		if (audio.currentTime > 3) audio.currentTime = 0;
		else { wantPlay = true; load(i - 1); }
	});

	audio.addEventListener('play', () => { playBtn.innerHTML = PAUSE; });
	audio.addEventListener('pause', () => { playBtn.innerHTML = PLAY; });
	audio.addEventListener('ended', () => load(i + 1));
	audio.addEventListener('playing', () => { fails = 0; });

	// a wrong file name: say which one in the console, and skip to the next song
	audio.addEventListener('error', () => {
		console.warn('Could not load:', decodeURI(audio.src));
		if (wantPlay && ++fails < PLAYLIST.length) load(i + 1);
	});

	// keep the song and position when the visitor leaves for another page and comes back
	const KEY = 'carla-player';
	function save() {
		try {
			sessionStorage.setItem(KEY, JSON.stringify({ i: i, time: audio.currentTime, playing: !audio.paused }));
		} catch (e) {}
	}
	setInterval(save, 1000);
	window.addEventListener('pagehide', save);

	let start = 0, startTime = 0, resume = false;
	try {
		const s = JSON.parse(sessionStorage.getItem(KEY));
		if (s && PLAYLIST[s.i]) { start = s.i; startTime = s.time || 0; resume = !!s.playing; }
	} catch (e) {}

	playBtn.innerHTML = PLAY;
	if (startTime) {
		audio.addEventListener('loadedmetadata', () => { audio.currentTime = startTime; }, { once: true });
	}
	wantPlay = resume;              // browsers may still block this until the first click
	load(start);
})();