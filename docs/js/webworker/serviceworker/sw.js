var CACHE_KEY = 'service-worker-playground-v1';

self.addEventListener('install', function (e) {

  console.log('ServiceWorker.oninstall: ', e);

  e.waitUntil(
    caches.open(CACHE_KEY).then(function (cache) {

      // cacheさせたいリクエストのキーを追加
      return cache.addAll([
        'index.html',
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg'
      ]);
    })
  );
});

self.addEventListener('fetch', function (e) {

  console.log('ServiceWorker.onfetch: ', e);

  e.respondWith(
    caches.open(CACHE_KEY).then(function (cache) {
      return cache.match(e.request).then(function (response) {
        if (response) {

          // e.requestに対するキャッシュが見つかったのでそれを返却
          return response;
        } else {

          // キャッシュが見つからなかったので取得
          fetch(e.request.clone()).then(function (response) {

            // 取得したリソースをキャッシュに登録
            cache.put(e.request, response.clone());

            // 取得したリソースを返却
            return response;
          });
        }
      });
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('ServiceWorker.onactivate: ', e);
});
