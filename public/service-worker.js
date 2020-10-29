const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/style.css",
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("You successfully pre-cached your files");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key!== DATA_CACHE_NAME) {
                        console.log("Old cache data removed", key);
                        return caches.delete(key);
                    }
                    return undefined;
                })
            )
        )
    );
    self.ClientRectList.claim();
});

self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) =>
                    fetch(evt.request)
                        .then((response) => {
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(() => cache.match(evt.request))
                )
                .catch((err) => console.log(err))
        );
    } else {
        evt.respondWith(
            caches
                .match(evt.request)
                .then((response) => response || fetch(evt.request))
        );
    }
});