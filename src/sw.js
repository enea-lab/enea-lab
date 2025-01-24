self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('v1').then((cache) => {
			return cache.addAll([
				'/',
				'/index.html',
				'/src/script.js',
				'/src/style.css',
				'/src/manifest.json',
				'/lib/p5.min.js',
				'/assets/sword.ico',
				'/assets/sword.png'
			]);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
			caches.match(event.request).then((response) => {
				return response || fetch(event.request);
			})
	);
});  