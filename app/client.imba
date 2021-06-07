global css html
	ff:sans

global css body d:flex fld:column jc:center ai:center m:0 bg:#0d001c

tag app
	<self[d:flex fld:column jc:flex-start ai:center h:100% w:100% ]>
		css svg, img
			h:100px
			transition:transform 250ms
			mb:20px
			bxs:1px 1px 10px -5px blue
			rd:20px
		css svg@hover, img@hover
			transform:scale(1.08)
		<div[d:flex fld:column jc:flex-start ai:center w:100% py:40px]>
			<a href="https://www.youtube.com/channel/UCkY9t704HSIvgaP1zE4uklA"> <svg src='./assets/youtube.svg'>
			<a href="https://www.instagram.com/familyfriendlymikey/"> <svg src='./assets/instagram.svg'>
			<a href="https://github.com/familyfriendlymikey"> <svg src='./assets/github.svg'>
			<a href="JILU"> <img src='./assets/jilu.png'>
			<a href="SUAN"> <img src='./assets/suan.png'>
			<a href="FTO"> <img src='./assets/fto.png'>

imba.mount <app>
