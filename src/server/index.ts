import express from "express"
import path from "path"
import { api } from "./api"

const app = express()
app.use(api)

app.listen(3002, () => console.log("Server started"))

app.use(express.static(path.join(__dirname, "../")))
app.get("/*", (_, res) => {
    res.sendFile(path.join(__dirname, "../", "index.html"))
})

app.listen(process.env["PORT"] || 3003, () => console.log("Server started"))