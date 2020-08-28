const staticCacheName = 'site-static-v1';
const assets = [
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap',
    'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
    '/assets/images/clock_face.png',
    '/assets/audio/lasalah.mp3',
    '/assets/audio/takbeer.mp3'
]
//
// install event
self.addEventListener('install', evt => {
    (<any>evt).waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching assets');
            cache.addAll(assets);
        })
    );
});

// activate event
self.addEventListener('activate', evt => {
    (<any>evt).waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== staticCacheName)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// fetch event
self.addEventListener('fetch', evt => {
    (<any>evt).respondWith(
        caches.match((<any>evt).request).then(cacheRes => {
            return cacheRes || fetch((<any>evt).request);
        })
    );
});