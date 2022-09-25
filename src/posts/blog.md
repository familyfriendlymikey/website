# Easy Automated Blog With Imba + Vite

### Why this is cool
- You can just add a new markdown file to `./posts/`
and it makes a new blog post.
- Live reloading works with the imported markdown files
so you can type your post with an updating markdown preview.

## Guide

### File Structure
```imba
.
├── main.imba
├── markdown.css
└── posts
    ├── blog.md
    └── pm2.md
```

### Importing Our Posts With Vite's Glob
```imba
let modules = import.meta.glob('./posts/*.md',{eager:yes,as:'raw'})
```
`eager` is so we don't have to use promises.

### Parsing Our Posts
```imba
import { marked } from 'marked'
import './markdown.css'
let posts = Object.values(modules).map do
	content: $1
	title: $1.slice(0,$1.indexOf("\n")).replace(/^#*/,'').trim!
```

### Routing Setup
We're just using `title` as the identifier for our posts.
```imba
tag app
	<self>
		<app-nav>
		<app-post route="/blog/:title">
		<app-blog route="/blog">
```
Notice also the order, `/blog/:title` with the more nested url goes
before `/blog`.

### Blog Tag
Now we make a tag for the blog which will list all of our globbed posts:
```imba
tag app-blog
	<self>
		for post in posts
			<a route-to="/blog/{post.title}"> post.title
```
Notice that on click, we route to `/blog/{post.title}`.

### Post Tag
Then a tag for individual posts:
```imba
tag app-post
	get active_post
		let title = global.decodeURIComponent(route.params.title)
		posts.find do $1.title is title
	<self>
		<.markdown-body innerHTML=marked.parse(active_post.content)>
```
Notice that here we use the `route.params.title`
from the previous snippet to figure out which post to display.

### Boom
We're done!
