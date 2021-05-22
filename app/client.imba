global css html
	ff:sans

global css body d:flex fld:column jc:center ai:center

tag app
	<self[d:flex fld:column jc:flex-start ai:center h:100% max-width:500px w:100%]>
		css a
			bg:blue2
			h:75px
			w:100%
			d:flex
			flx:row
			jc:center
			ai:center
			my:5px
			rd:10px
			td:none
			c:blue5
			fs:25px
		<a href="https://www.youtube.com/channel/UCkY9t704HSIvgaP1zE4uklA"> "YOUTUBE"
		<a href="https://www.instagram.com/familyfriendlymikey/"> "INSTAGRAM"
		<a href="https://github.com/familyfriendlymikey"> "GITHUB"
		<hr[ h:1px w:100% bg:gray5 border:0 ]>
		<a href="schedule"> "SCHEDULE"
		<a href="fto"> "FTO"

imba.mount <app>
