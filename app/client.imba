let page = "home"

global css html
	ff:sans

global css body
	d:flex fld:column jc:center ai:center m:0 bg:#0d001c

tag page-home

	def render

		<self>

			css self
				d:flex fld:column jc:flex-start ai:center w:100% h:100% py:40px

			css svg, img
				h:100px
				transition:transform 250ms
				mb:20px
				bxs:1px 1px 10px -5px blue
				rd:20px

			css svg@hover, img@hover
				transform:scale(1.08)

			<a href="https://www.youtube.com/channel/UCkY9t704HSIvgaP1zE4uklA"> <svg src='./assets/youtube.svg'>
			<a href="https://www.instagram.com/familyfriendlymikey/"> <svg src='./assets/instagram.svg'>
			<a href="https://github.com/familyfriendlymikey"> <svg src='./assets/github.svg'>
			<a href="JILU"> <img src='./assets/jilu.png'>
			<a href="FTO"> <img src='./assets/fto.png'>

tag app-tabs

	def render

		<self>

			css self
				d:flex fld:row jc:space-around ai:center
				w:100% h:40px bg:cyan2

			css .tab
				@hover cursor:pointer
				fl:1
				d:flex fld:row jc:center ai:center
				h:100%
				c:#0d001c

			<.tab@click=(page = "home")> "HOME"
			<.tab@click=(page = "lists")> "LISTS"

tag app-table

	def render

		<self>

			css self
				w:100%

			css .header
				bg:white2 h:30px w:100%
				d:flex jac:center
				rd:5px
				mb:5px

			css .body
				d:flex fld:column jc:flex-start ai:center
				gap:5px

			css .row
				bg:white5
				d:flex jac:center
				h:25px w:100% fs:16px
				rd:5px
				cursor:pointer

			<.header>
				"Favorites List"

			<.body>
				for text in data
					<.row> text

tag page-lists

	def render

		<self>

			css self
				w:100% h:100%
				box-sizing:border-box
				p:50px

			<app-table
				data=[
					"Harry Potter"
					"Polaris"
					"Ali G"
					"Mandelbrot Set"
					"Tatsuro Yamashita"
					"Trader Joe's Ice Cream Sandwich"
					"Butternut Squash Triangoli"
					"Fresh Bread And Butter"
					"The Ocean"
					"The Wind"
					"Mob Psycho"
					"One Piece"
					"Kinder Chocolate"
					"鱼香茄子煲"
					"Borat"
					"Sakanaction"
					"Joe Hisaishi"
					"Spirited Away"
					"Only Yesterday"
					"Rush Hour"
					"Sopranos"
				]
			>

tag app

	def render

		<self>

			css self
				d:flex fld:column jc:flex-start ai:center h:100% w:100%

			<app-tabs>

			if page == "lists"
				<page-lists>
			else
				<page-home>


imba.mount <app>
