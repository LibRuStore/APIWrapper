import { App, search } from "./index.js";
import express from "express";

const app = express();

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
    let searchResults;
    try {
        searchResults = await search(query);
    } catch(_) {
        return res.status(500).send(makeError("server error"));
    }
    const out = searchResults.map(app => ({ "name": app.name, "pkg": app.pkg, "icon": app.icon }));
    res.status(200).send(makeSuccess(out));
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
})

app.listen(12700);