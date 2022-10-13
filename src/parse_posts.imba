import { marked } from 'marked'
import './markdown.css'

import prism from 'prismjs'
import './assets/code-dark.css'

# add any languages you want highlighted here
# if you don't know the correct name, just look in
# node_modules/prismjs/components/
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-git'

let toc = []

let renderer = {}
renderer.heading = do(text, level)
	# assumes that the first line is the title of the post
	# and is an `h1` and that no `h1`s are used thereafter.
	let fragment = level is 1 ? '' : new DOMParser!
		.parseFromString(text,'text/html') .documentElement
		.textContent.toLowerCase!.replace(/[^\w]+/g, '-')
	toc.push { text, fragment, level } unless level is 1
	let el =
		<h{level} [mt:0]=(level is 1)>
			<a href="#{fragment}" id=fragment [c:inherit] innerHTML=text>
	el.outerHTML
marked.use({ renderer })

let options = {}
options.highlight = do(code, lang)
	return code unless let lang_data = prism.languages[lang]
	prism.highlight(code,lang_data,lang)
marked.setOptions(options)

let post_objects = import.meta.glob('./posts/*.md',{eager:yes,as:'raw'})
let posts = []
for own path, content of post_objects
	toc = []
	let first_line = content.split('\n',1)[0]
	let html_title = marked.parse(first_line)
	let title = first_line.replace(/^#*/,'').trim!
	content = marked.parse(content.slice(content.indexOf("\n")))
	posts.push { title, html_title, content, toc, path }

def parse_date path, sep=" - "
	let s = path.split("/")[-1]
	new Date s.slice(0,s.indexOf(sep))

posts.sort do parse_date($1.path) < parse_date($2.path)

export default posts
