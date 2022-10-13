import list_data from './list_data.imba'
import posts from './parse_posts.imba'

global css @root ff:sans c:blue1 bg:#0d1117 scroll-behavior:smooth
global css body d:flex fld:column jc:center ai:center m:0
global css a td:none c:blue1 td@hover:underline outline:none

tag app-404
	<self[d:box]>
		"This doesn't exist :("

tag app-home
	<self>
		css d:flex fld:row jc:space-around ai:start w:100% h:100% py:40px

		css .side d:flex fld:column jc:start ai:center
		css h2 c:blue1
		css .link-container d:flex ja:center w:150px h:150px
		css .link transition:transform 250ms rd:20px
			@hover transform:scale(1.08)
		css img, svg w:100px
		css .emoji fs:100px td:none
		css a c:#0d1117
		<.side>
			<h2> "SOCIAL"
			<.link-container> <a href="https://youtube.com/c/familyfriendlymikey"> <svg.link src='./assets/youtube.svg'>
			<.link-container> <a href="https://instagram.com/familyfriendlymikey/"> <svg.link src='./assets/instagram.svg'>
			<.link-container> <a href="https://github.com/familyfriendlymikey"> <svg.link src='./assets/github.svg'>
		<.side>
			<h2> "APPS"
			<.link-container> <a href="https://fuzzyho.me"> <.emoji.link> "🏠"
			<.link-container> <a href="https://jilu.pages.dev"> <img.link src='./assets/jilu.png'>
			<.link-container> <a href="https://fto.pages.dev"> <img.link src='./assets/fto.png'>

tag app-nav
	<self>
		css d:flex fld:row jc:space-around ai:center w:100% h:20

		css .tab h:100% d:flex ja:center
			@hover cursor:pointer
		<a.tab route-to="/"> "HOME"
		<a.tab route-to="/blog"> "BLOG"
		<a.tab route-to="/lists"> "LISTS"

tag app-post
	<self>
		css w:100%

		let title = global.decodeURIComponent(route.params.title)
		let post = posts.find do $1.title is title

		unless post
			<app-404>
		else
			<.markdown-body>

				# using outerHTML will cause the title to be the same even when
				# navigating to different posts
				<div innerHTML=post.html_title>

				if post.toc.length
					<.toc>
						for { fragment, text, level } in post.toc
							<a href="#{fragment}" innerHTML=text>
								css d:block c:cool5 pl:{(level - 1)*3}

				<div innerHTML=post.content>

tag app-blog
	<self>
		css gap:10 d:flex fld:column mt:40px
		for post in posts
			<a route-to="/blog/{global.encodeURIComponent(post.title)}">
				css fs:40 p:10 rd:5 bg:#161b22 cursor:pointer
					transition:transform 250ms
					@hover transform:scale(1.025)
				post.title

tag app-table
	<self>
		css w:100%
		<.header>
			css bg:white2 h:30px w:100% d:flex jac:center rd:5px mb:5px
			"Favorites List"
		<.body>
			css d:flex fld:column jc:flex-start ai:center gap:5px
			for text in data
				<.row> text
					css bg:white5 d:flex jac:center h:25px w:100% fs:16px rd:5px
						cursor:pointer

let list_types = new Set!
list_types.add(item.type) for item in list_data when item.type is "Music"
tag app-lists
	<self>
		css gap:40px d:flex fld:row mt:40px flex-wrap:wrap p:10
		for type of list_types
			<a route-to="/lists/{type}"> type
				css fs:40 p:10 rd:5 bg:#161b22 cursor:pointer
					transition:transform 250ms
					@hover transform:scale(1.025)

tag app-list
	<self>
		css w:80% mt:10
		css .row d:flex fld:row bg:#161b22 jc:space-between
			@last rdb:2
		css .item fl:1 p:3 5
		<.row[mb:1 rdt:2]>
			<.item> "Name"
			<.item> "Incorrect"
		for item in list_data
			if item.type is route.params.type
				<.row>
					if item.url
						<a.item[c:blue4] href=item.url> item.name
					else
						<.item> item.name
					<.item> item.idiot ? "yes" : "no"

tag app
	<self>
		css d:flex fld:column jc:flex-start ai:center h:100% w:100%
			max-width:700px

		<app-nav>
		<app-post route="/blog/:title">
		<app-blog route="/blog">
		<app-list route="/lists/:type">
		<app-lists route="/lists">
		<app-home route="/">
		<app-404 route="*">

imba.mount <app>
