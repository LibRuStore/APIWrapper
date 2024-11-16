# APIWrapper
The RuStore API wrapper for LibRuStore

## Installation
As a library:
```sh
npm i librustore-apiwrapper
```
As a server:
```sh
git clone https://github.com/LibRuStore/APIWrapper.git LibRuStoreAPI
cd LibRuStoreAPI
npm i
```

## Usage (Library)
### `preciseSearch`
Searches apps by search term. Returns `App[]` which contains just the most relevant and popular apps.
```js
import { preciseSearch } from "librustore-apiwrapper";

(async () => {
    const apps = await preciseSearch("Дзен");
    console.log(apps); // Outputs a package with ID ru.zen.android
})();
```
### `search`
Searches apps by search term. Supports pagination. Returns `App[]`.
```js
import { search } from "librustore-apiwrapper";

(async () => {
    const apps = await search("Дзен", 0, 20); // where 0 is the page number and 20 is the amount of results per page
    console.log(apps); // Outputs a list with a package with ID ru.zen.android
})();
```

### `App`
Represents a found app.\
Has fields `name` (the short app name), `pkg` (the package ID), `icon` (URL to icon) and `appID` (generated with `getInfo()`).

### `App.getInfo(pkg)`, `App().getInfo()`
Gets info about the app by its package ID.\
In case of the latter, stores `appID` in the object.\
Returns `AppInfo` (see `index.js`).
```js
import { App } from "librustore-apiwrapper";

(async () => {
    const info = await App.getInfo("ru.zen.android");
    console.log(info); // Outputs basic info about the Zen app
})();
```

### `App.getDownloadLinks(appID, abi)`, `App().getDownloadLinks(abi)`
Gets download links for given ABIs.\
`abi` can be `ABI` or `ABI[]`. See [Android developer docs](https://developer.android.com/ndk/guides/abis).\
Returns an `Array` of links.
```js
import { App } from "librustore-apiwrapper";

(async () => {
    const links = await App.getDownloadLinks(3054783, "arm64-v8a");
    console.log(links);
})();
```

## Usage (API)
```sh
npm start
```

### `GET /search?query=QUERY`
Searches apps by search term.
Returns a list of `App`-like objects.
#### Example response
```json
{"status":"ok","data":[{"name":"Авито: квартиры, авто, работа","pkg":"com.avito.android","icon":"https://static.rustore.ru/apk/2688703/content/ICON/459fd1eb-45a3-4866-9112-f2251388c5e8.jpg"}]}
```

### `GET /info?pkg=PACKAGE_ID`
Gets app info by its package ID.
#### Example response
```json
{"status":"ok","data":{"appID":3054783,"meta":{"fullName":"Дзен","shortDescription":"Дзен сам подберёт статьи и видео для вас","fullDescription":"Дзен — приложение для просмотра и создания контента. \nЗдесь сотни тысяч авторов делятся постами, статьями, видео и короткими роликами. А умные алгоритмы подстраивают ленту под ваши интересы. \n\n— Всевозможные темы\nПравило Дзена №1: если это существует, то об этом уже есть публикации. Музыка, гастрономия, путешествия, юмор, искусство, лайфхаки, отношения, наука и кулинария — в Дзене есть всё. Создавайте свою собственную ленту, основанную именно на ваших интересах: смотрите, читайте, комментируйте, получайте рекомендации новых авторов и подписывайтесь. А ещё — создавайте контент сами.\n\n— Разные форматы\nВ Дзене — четыре формата контента. Так вы всегда найдёте то, что вам подходит. Узнавайте за несколько минут новое, листая посты или короткие ролики. Углубитесь в тему, прочитав статью или посмотрев длинное видео. А если захотите завести свой блог — творить можно во всех четырех форматах сразу.\n\n— Миллионы пользователей\nДзен — огромное сообщество людей, увлечённых всем на свете. Вы найдете здесь свою аудиторию, если вам есть что сказать и показать, а умные алгоритмы вам помогут.\n\n— Монетизация для авторов\nВ Дзене можно монетизировать свой контент: достаточно набрать 100 подписчиков и поработать над их активностью. Ещё один источник доходов — интеграции нативной рекламы.\n\nПравила использования и помощь: https://dzen.ru/help/ru/?utm_source=help_rustore","company":"ООО \"Дзен.Платформа\"","age":"12+"},"latest":110054668,"downloads":300000,"screenshots":[{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/977ad82e-eb54-42bf-9434-9d4c09b402b7.png","ordinal":3,"type":"SCREENSHOT","orientation":"PORTRAIT"},{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/6e7d44c7-dafa-4375-a0c3-d86119966e6a.png","ordinal":4,"type":"SCREENSHOT","orientation":"PORTRAIT"},{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/9643c7ac-2996-4964-ba63-6572e45784b2.png","ordinal":2,"type":"SCREENSHOT","orientation":"PORTRAIT"},{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/d2c2cf65-603f-4ccd-8963-5c114395ebdb.png","ordinal":5,"type":"SCREENSHOT","orientation":"PORTRAIT"},{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/ee5ca9bb-f43a-475b-80a8-bd24d03c90fa.png","ordinal":1,"type":"SCREENSHOT","orientation":"PORTRAIT"},{"fileUrl":"https://static.rustore.ru/apk/3054783/content/SCREENSHOT/3b5dc013-abf5-4e6e-a3aa-1994c1640dd2.png","ordinal":0,"type":"SCREENSHOT","orientation":"PORTRAIT"}]}}
```

### `GET /apk?id=APP_ID&abis=ABIS`
Returns download links.\
`abis` is a comma-separated list of ABIs.
#### Example response
```json
{"status":"ok","data":["https://static.rustore.ru/apk/3054783/version/110054668/c7757926-3062-4395-8c58-86e319d65736.apk"]}
```

### `GET /updates?apps=PACKAGE_IDS`
### `POST /updates`
Gets latest app versions by package IDs.
In case of the `GET` request, `PACKAGE_IDS` is a comma-separated list of package IDs.
In case of the `POST` request though, you need to provide a JSON array of package IDs in the request body.
#### Example response
```json
{"status":"ok","data":[{"latest":2865,"pkg":"com.avito.android"}]}
```