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
### `search`
Searches apps by search term. Returns `App[]`.
```js
import { search } from "librustore-apiwrapper";

(async () => {
    const apps = await search("Дзен");
    console.log(apps); // Outputs a package with ID ru.zen.android
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