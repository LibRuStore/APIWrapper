/** @typedef {{ fullName: string, company: string, shortDescription: string, fullDescription: string, age: string }} AppMeta */
/** @typedef {{ url: string, orientation: string }} AppScreenshot */
/** @typedef {{ appID: number, meta: AppMeta, latest: number, screenshots: AppScreenshot[], downloads: number }} AppInfo */
/** @typedef {{ pkg: string, latest: number }} AppVersion */

/** @typedef { "armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64" } ABI */

function checkOK(j) {
    if(j.code != "OK") throw new Error("Request failed: " + j.message ?? j.code);
}


/**
 * Makes a request to RuStore's API.
 * 
 * @param {string} path The request path
 * @param {object | null} body The request body
 * @returns {object} The data
 */
async function ruStoreAPI(path, body = null) {
    const res = await fetch(new URL(path, "https://backapi.rustore.ru").href, body ? {
        "method": "POST",
        "body": JSON.stringify(body),
        "headers": {
            "Content-Type": "application/json"
        }
    } : {});
    const json = await res.json();
    checkOK(json);
    return json.body;
}


export class App {
    /**
     * Constructs a new App from JSON.
     * 
     * @param {{ text?: string, appName?: string, packageName: string, iconUrl: string, appId: number }?} json The app JSON (as in /search)
     */
    constructor(json) {
        this.name = json?.text ?? json?.appName;
        this.pkg = json?.packageName;
        this.icon = json?.iconUrl;
        this.appID = json?.appId ?? -1;
    }

    /**
     * Gets basic app info.
     * 
     * @param {string} pkg The package name
     * @returns {AppInfo} The app info
     */
    static async getInfo(pkg) {
        const json = await ruStoreAPI(`/applicationData/overallInfo/${pkg}`);
        return {
            "appID": json.appId,
            "meta": {
                "fullName": json.appName,
                "shortDescription": json.shortDescription,
                "fullDescription": json.fullDescription,
                "company": json.companyName,
                "age": json.ageLegal
            },
            "latest": json.versionCode,
            "latestName": json.versionName,
            "downloads": json.downloads,
            "screenshots": json.fileUrls
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
        const json = await ruStoreAPI("/applicationData/v2/download-link", {
            "appId": appID,
            "supportedAbis": Array.isArray(abi) ? abi : [abi]
        });
        return json.downloadUrls.map(x => x.url);
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


/**
 * Searches apps in RuStore.
 * Supports pagination and returns all results.
 * 
 * @param {string} query The search query
 * @param {number} page Page number
 * @param {number} perPage Results per page
 * @returns {App[]} The found apps
 */
export async function search(query, page, perPage) {
    return (await searchWithPage(query, page, perPage)).apps;
}

/**
 * Searches apps in RuStore.
 * Supports pagination and returns all results.
 * Also returns the total results number.
 * 
 * @param {string} query The search query
 * @param {number} page Page number
 * @param {number} perPage Results per page
 * @returns {{ apps: App[], total: number }} The found apps with the total count
 */
export async function searchWithPage(query, page, perPage) {
    const json = await ruStoreAPI(`/applicationData/apps?query=${encodeURIComponent(query)}&pageNumber=${page}&pageSize=${perPage}`);
    return {
        "apps": json.content.map(x => new App(x)),
        "total": json.totalElements
    };
}

/**
 * Searches apps in RuStore.
 * Only returns the most relevant and popular apps.
 * It's not recommended to use this for searching.
 * 
 * @param {string} query The search query
 * @returns {App[]} The found apps
 */
export async function preciseSearch(query) {
    const json = await ruStoreAPI(`/search/suggest?query=${encodeURIComponent(query)}`);
    return json.suggests.filter(x => x.packageName !== null).map(x => new App(x));
}

/**
 * Checks for app updates.
 * 
 * @param {string[]} apps The app bundle IDs
 * @returns {AppVersion[]} The apps' bundle IDs with versions included
 */
export async function checkUpdates(apps) {
    const json = await ruStoreAPI("/applicationData/newApps", {
        "content": apps.map(x => ({ "packageName": x, "versionCode": 0 }))
    });
    return json.content.map(x => ({ "latest": x.versionCode, "pkg": x.packageName }));
}