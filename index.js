/** @typedef {{ fullName: string, company: string, shortDescription: string, fullDescription: string, age: string }} AppMeta */
/** @typedef {{ url: string, orientation: string }} AppScreenshot */
/** @typedef {{ appID: number, meta: AppMeta, latest: number, screenshots: AppScreenshot[], downloads: number }} AppInfo */

/** @typedef { "armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64" } ABI */

function checkOK(j) {
    if(j.code != "OK") throw new Error("Request failed: " + j.code);
}


export class App {
    /**
     * Constructs a new App from JSON.
     * 
     * @param {{ text: string, packageName: string, iconUrl: string }?} json The app JSON (as in /search)
     */
    constructor(json) {
        this.name = json?.text;
        this.pkg = json?.packageName;
        this.icon = json?.iconUrl;
        this.appID = -1;
    }

    /**
     * Gets basic app info.
     * 
     * @param {string} pkg The package name
     * @returns {AppInfo} The app info
     */
    static async getInfo(pkg) {
        const f = await fetch(`https://backapi.rustore.ru/applicationData/overallInfo/${pkg}`);
        const j = await f.json();
        checkOK(j);
        return {
            "appID": j.body.appId,
            "meta": {
                "fullName": j.body.appName,
                "shortDescription": j.body.shortDescription,
                "fullDescription": j.body.fullDescription,
                "company": j.body.companyName,
                "age": j.body.ageLegal
            },
            "latest": j.body.versionCode,
            "downloads": j.body.downloads,
            "screenshots": j.body.fileUrls
        };
    }

    /**
     * Same as the static method App.getInfo.
     * Also stores the App ID for downloading.
     * 
     * @returns {AppInfo} The app info
     */
    async getInfo() {
        const res = await App.getInfo(this.pkg);
        this.appID = res.appID;
        return res;
    }

    /**
     * Gets the download links for the app by ABI
     * 
     * @param {number} appID The app ID
     * @param {ABI | ABI[]} abi The ABI
     * @returns {string[]} The download links
     */
    static async getDownloadLinks(appID, abi) {
        const f = await fetch("https://backapi.rustore.ru/applicationData/v2/download-link", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "appId": appID,
                "supportedAbis": abi instanceof Array ? abi : [abi]
            })
        });
        const j = await f.json();
        checkOK(j);
        return j.body.downloadUrls.map(x => x.url);
    }

    /**
     * Same as the static method App.getDownloadLinks.
     * 
     * @param {ABI | ABI[]} abi The ABI
     * @returns {string[]} The download links
     */
    async getDownloadLinks(abi) {
        return await App.getDownloadLinks(this.appID, abi);
    }
}


// FIXME: Not even nearly as many results are shown
/**
 * Searches apps in RuStore.
 * 
 * @param {string} query The search query
 * @returns {App[]} The found apps
 */
export async function search(query) {
    const f = await fetch(`https://backapi.rustore.ru/search/suggest?query=${encodeURIComponent(query)}`);
    const j = await f.json();
    checkOK(j);
    return j.body.suggests.filter(x => x.packageName !== null).map(x => new App(x));
}