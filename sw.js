importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js')

const CACHE_STATIC_NAME = 'static-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_NOTAS_NAME = 'notas-v1';

let db = new PouchDB('notas')

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
    const promeStatic = caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            return cache.addAll([
                '/PWA-FRONT/',
                '/PWA-FRONT/index.html',
                '/PWA-FRONT/manifest.json',
                '/PWA-FRONT/css/page.css',
                '/PWA-FRONT/js/camera.js',
                '/PWA-FRONT/js/note.js',
                '/PWA-FRONT/js/ranking.js',
                '/PWA-FRONT/js/categorie.js',
                '/PWA-FRONT/views/newNote.html',
                '/PWA-FRONT/views/ranking.html',
                '/PWA-FRONT/views/categorie.html',
                '/PWA-FRONT/images/noimage.png',
                '/PWA-FRONT/images/icons/android-launchericon-72-72.png',
                '/PWA-FRONT/images/icons/android-launchericon-96-96.png',
                '/PWA-FRONT/images/icons/android-launchericon-144-144.png',
                '/PWA-FRONT/images/icons/android-launchericon-192-192.png',
                '/PWA-FRONT/images/icons/android-launchericon-512-512.png',
            ]);
            /*return cache.addAll([
                './',
                './index.html',
                './manifest.json',
                './css/page.css',
                './js/camera.js',
                './js/note.js',
                './js/ranking.js',
                './js/categorie.js',
                './views/newNote.html',
                './views/rankings.html',
                './views/categories.html',
                './images/noimage.png',
                './images/icons/android-launchericon-72-72.png',
                './images/icons/android-launchericon-96-96.png',
                './images/icons/android-launchericon-144-144.png',
                './images/icons/android-launchericon-192-192.png',
                './images/icons/android-launchericon-512-512.png',
            ]);*/
        });
    const promeInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css',
                'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/fonts/bootstrap-icons.woff2?a97b3594ad416896e15824f6787370e0',
                'https://code.jquery.com/jquery-3.5.1.min.js',
                'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
                '//cdn.jsdelivr.net/npm/sweetalert2@11',
                'https://cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js',
                'http://localhost:8080/pwa/nota/getAll',
                'http://localhost:8080/pwa/categoria/getAll',
                'http://localhost:8080/pwa/clasificacion/getAll'
                
            ]);
        });
    
    const promeNotas= caches.open(CACHE_NOTAS_NAME);

    event.waitUntil(Promise.all([promeStatic, promeInmutable, promeNotas]));
});

self.addEventListener('fetch', event => {
    let cacheResponse;
    if (event.request.url.includes('127.0.0.1:8080') || event.request.url.includes('localhost:8080')) {
        console.log('API Notice');
        cacheResponse = manejoNotas(event.request);
    } else {
        cacheResponse = caches.match(event.request)
        .then(resp => {
            if (resp) {
                return resp;
            }
            return fetch(event.request)
                .then(resNet => {
                    caches.open(CACHE_DYNAMIC_NAME)
                        .then(cache => {
                            cache.put(event.request, resNet).then(() => {
                                cleanCache(CACHE_DYNAMIC_NAME, 20)
                            });

                        });
                    return resNet.clone();
                }).catch(() => {
                    console.log('Error al solicitar el recurso');
                });
        })
    }
    
    event.respondWith(cacheResponse);
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'post-note') {
        const respPostNotes = postNotesFromPouch();
        event.waitUntil(respPostNotes);
    }
})

//Funciones
const postNotesFromPouch = () => {
    const notes = [];
    db.allDocs({ include_docs: true} ).then(docs => {
        docs.rows.forEach(row => {
            const doc = row.doc;
            console.log('Vamos a postear a ', doc);
            const res2 = fetch('http://localhost:8080/pwa/nota/save', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doc),
            }).then((res) => {
                return db.remove(doc)
            })
            notes.push(res2)
        });
    });
    
    return Promise.all(notes)
}

const saveNotaPouch = (c) => {
    const data = {}
    c._id = new Date().toISOString();
    return db.put(c)
        .then(r => {
            self.registration.sync.register('post-note')
            data.result = c;
            data.type = "success"
            data.text = "Nota registrada en PouchDB"
            const res = new Response(
                JSON.stringify(data),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return res;
        })
}

const updateNotaCache = (req, res) => {
    if(res.ok){
        return caches.open(CACHE_NOTAS_NAME)
        .then(cache => {
            cache.put(req, res.clone());
            return res.clone();
        });
    }else{
        return res;
    }
}

const manejoNotas = (req) => {
    console.log('Manejo notas');
    if(req.clone().url.includes('nota/save')){
        if (self.registration.sync) {
            return req.clone().json()
                .then(json => {
                    return saveNotaPouch(json);
                })
        } else {
            return fetch(req)
        }
    } else {
        return fetch(req.clone()).then((res) => {
            if(res.ok){
                return updateNotaCache(req, res.clone());
            }else{
                return caches.match(req);
            }
        }).catch(err => {
            return caches.match(req);
        });
    }
}