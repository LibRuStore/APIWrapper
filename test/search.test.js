import { search, App } from "../index.js";

const res = await search("Дзен", 0, 20);
const app = res.find(x => x.pkg === "ru.zen.android");

test("finds Dzen", () => {
    console.log("App info:", app);

    expect(app).toBeDefined();
});

test("gets info about Dzen (no matching)", async () => {
    const info = await app.getInfo();
    console.log(info);
});

test("gets the download link for arm64-v8a (no matching)", async () => {
    const links = await app.getDownloadLinks("arm64-v8a");
    console.log(links);
});

test("works with static methods for getting info (no matching)", async () => {
    const info = await App.getInfo("com.uchi.app");
    console.log(info);
});

test("works with static methods for getting download links (no matching)", async () => {
    const links = await App.getDownloadLinks(1076671, "arm64-v8a");
    console.log(links);
});