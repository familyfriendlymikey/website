global css html
	ff:sans

global css body d:flex fld:column jc:center ai:center m:0 bg:blue2

tag app
	<self[d:flex fld:column jc:flex-start ai:center h:100% w:100% ]>
		css svg
			h:100px
		css svg@hover
			transform:scale(1.1)
			transition:transform 250ms
		css img
			w:300px
		css .apps a
			margin:20px
			bxs:xl
		css .apps a@hover
			transform:scale(1.1)
			transition:transform 250ms
		css h1
			pos: absolute
			top: 50%
			left: 50%
			transform: translate(-50%, -50%)
			bg:black/50%
			p:10px
		css .apps a
			pos:relative
			ta:center
			c:white
		<div[d:flex fld:row jc:space-around ai:center w:100% bg:blue2 py:40px]>
			<a href="https://www.youtube.com/channel/UCkY9t704HSIvgaP1zE4uklA"> <svg src='./assets/youtube.svg'>
			<a href="https://www.instagram.com/familyfriendlymikey/"> <svg src='./assets/instagram.svg'>
			<a href="https://github.com/familyfriendlymikey"> <svg src='./assets/github.svg'>
		<div.apps[d:flex fld:row jc:space-around ai:center w:100% h:100% flex-wrap:wrap bg:cyan2]>
			<a href="schedule">
				<img src='./assets/schedule.png'>
				<h1> "AUTO JOURNAL"
			<a href="fto">
				<img src='./assets/fto.png'>
				<h1> "FTO"

imba.mount <app>
