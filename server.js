import { App, searchWithPage, checkUpdates } from "./index.js";
import express from "express";

const app = express();
app.use(express.json());

const makeError = text => {
    return {
        "status": "error",
        "error": text
    };
};

const makeSuccess = data => {
    return {
        "status": "ok",
        "data": data
    };
};

app.get("/search", async (req, res) => {
    const query = req.query.query;
    if(!query) return res.status(400).send(makeError("no query given"));
    const page = req.query.page, perPage = req.query.per_page;
    if(!page || !perPage) return res.status(400).send(makeError("no pagination set"));
    let searchResults;
    try {
        searchResults = await searchWithPage(query, parseInt(page), parseInt(perPage));
    } catch(_) {
        return res.status(500).send(makeError("server error"));
    }
    searchResults.apps = searchResults.apps.map(app => ({ "name": app.name, "pkg": app.pkg, "icon": app.icon }));
    res.status(200).send(makeSuccess(searchResults));
});

app.get("/info", async (req, res) => {
    const pkg = req.query.pkg;
    if(!pkg) return res.status(400).send(makeError("no package name given"));
    let info;
    try {
        info = await App.getInfo(pkg);
    } catch(_) {
        return res.status(500).send(makeError("server error"));
    }
    res.status(200).send(makeSuccess(info));
});

app.get("/apk", async (req, res) => {
    const id = req.query.id;
    if(!id) return res.status(400).send(makeError("no package id given"));
    const abis = req.query.abis;
    if(!abis) return res.status(400).send(makeError("no abis given"));
    let urls;
    try {
        urls = await App.getDownloadLinks(parseInt(id), abis.split(","));
    } catch(_) {
        return res.status(500).send(makeError("server error"));
    }
    res.status(200).send(makeSuccess(urls));
});

const reqUpdates = async (apps, res) => {
    let updates;
    try {
        updates = await checkUpdates(apps);
    } catch(_) {
        return res.status(500).send(makeError("server error"));
    }
    res.status(200).send(makeSuccess(updates));
}

app.post("/updates", async (req, res) => {
    const apps = req.body;
    if(!Array.isArray(apps)) return res.status(400).send(makeError("apps are not an array"));
    return await reqUpdates(apps, res);
});

app.get("/updates", async (req, res) => {
    const apps = req.query.apps;
    if(!apps) return res.status(400).send(makeError("no apps provided"));
    return await reqUpdates(apps.split(","), res);
});

app.listen(12700);