let path = '/PWA-KeepUTEZ/';

const CACHE_STATIC_NAME = 'static-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_NOTICES_NAME = 'notices-v1';

function cleanCache(cacheName, sizeItems) {
    caches.open(cacheName)
        .then(cache => {
            cache.keys().then(keys => {
                if (keys.length > sizeItems) {
                    cache.delete(keys[0]).then(() => {
                        cleanCache(cacheName, sizeItems)
                    });
                }
            });
        });
}

self.addEventListener('install', (event) => {
    let location = self.location.href;
    if (location.includes('localhost')) {
        path = '/';
        urlAPI = 'localhost'
    }
    const promeStatic = caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            return cache.addAll([
                path + '',
                path + 'index.html',
                path + 'js/app.js',
                path + 'images/icons/android-launchericon-72-72.png',
                path + 'images/icons/android-launchericon-96-96.png',
                path + 'images/icons/android-launchericon-144-144.png',
                path + 'images/icons/android-launchericon-192-192.png',
                path + 'images/icons/android-launchericon-512-512.png',
            ]);
        });
    const promeInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://code.jquery.com/jquery-3.5.1.min.js',
                'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js',
                'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css'
            ]);
        });
    
    const promeCacheNotice = caches.open(CACHE_NOTICES_NAME);

    event.waitUntil(Promise.all([promeInmutable, promeStatic, promeCacheNotice]));
});

self.addEventListener('fetch', (event) => {
    let respuestaCache;
    if (event.request.url.includes('192.168.20.127')) {
        console.log('API Notice');
        //Network
        respuestaCache = manejoNotices(event.request);
    } else {
        respuestaCache = caches.match(event.request)
            .then(resp => {
                // Si mi request existe en cache
                if (resp) {
                    // respondemos con cache
                    return resp;
                }
                // voy a la red
                return fetch(event.request)
                    .then(respNet => {
                        // abro mi cache
                        caches.open(CACHE_DYNAMIC_NAME)
                            .then(cache => {
                                // guardo la respuesta de la red en cache
                                cache.put(event.request, respNet).then(() => {
                                    cleanCache(CACHE_DYNAMIC_NAME, 5)
                                });

                            });
                        //Respondo con el response de la red
                        return respNet.clone();
                    }).catch(() => {
                        console.log('Error al solicitar el recurso');
                    });
            });

        event.respondWith(respuestaCache);
    }

});

const manejoNotices = (req) =>  {
    if (req.clone().method === 'POST') {
        console.log('POST COMMENT');
        return null;
    } else {
        return fetch(req.clone()).then((res) => {
            if (res.ok) {
                //perticion exitosa
                return updateNoticeCache(req, res.clone());
            } else {
                //Busco en caches
                return caches.match(req)
            }
        }).catch(err => {
            return caches.match(req)
        })
    }
}

const updateNoticeCache = (req, res) => {
    if (res.ok) {
        return caches.open(CACHE_NOTICES_NAME)
            .then(cache => {
                cache.put(req, res.clone());
                return res.clone();
            })
    } else {
        return res;
    }
}