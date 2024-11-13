import { search } from "../index.js";

const res = await search("Дзен");
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