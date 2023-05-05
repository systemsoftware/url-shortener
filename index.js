const express = require('express')
const db = new (require('dubnium'))('./data', 'json')
const { port, add_url_endpoint } = require('./config.json')

const app = express()

app.get('/*', (req, res) => {
const path = req.path.split('/').join('')
if(db.has(path)){
const c = db.get(path).content
const { max_visits, visits, url } = c
c.visits++
db.get(path).overwrite(c)
res.redirect(url)
if(max_visits == 0) return
if(max_visits && visits >= max_visits) db.get(path).delete()
}else{
const file = require('fs').readFileSync('./index.html', 'utf8')
file.split('$ENDPOINT$').join(add_url_endpoint)
res.send(file)
}
})

app.post(add_url_endpoint, (req, res) => {
const { url, max_visits, slug } = req.headers
if(!url || !slug) return res.status(400).send({ error:"Missing parameters" })
if(db.has(slug)) return res.status(400).send({ error:"Slug already exists" })
if(!new RegExp(/^(http|https):\/\/[^ "]+$/).test(url)) return res.status(400).send({ error:"Invalid URL" })
db.create(slug, { url, max_visits:parseInt(max_visits), visits:0 })
res.status(200).send({ error:"Success" })
})

app.listen(port, () => console.log(`Listening on port ${port}`))