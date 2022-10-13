# Easier Dev Servers With PM2

I wrote a little [markdown watcher](https://github.com/familyfriendlymikey/wash-md) in Imba a while back, but the annoying thing was you'd have to start it up every time you wanted to view rendered markdown.

So I was like what if I just start the markdown watcher in my home directory with PM2 and just leave it on forever. Now whenever I edit *any* markdown file on my computer it just shows up at localhost:8087.

That worked, and so far it doesn't cause any buggy behavior on my computer and only uses like 70MB of RAM, but then I thought why don't I just leave dev servers for all my apps on too, turning those on and off all the time is super annoying, and they also take up a terminal window. Imba.io needs both `npm run watch` and `npm run dev` which is double annoying.

So I just made an ecosystem file for PM2

```json
module.exports = {
  apps: [
    {
        name: "imba.io watch",
        cwd: "/Users/user/Desktop/repo/imba.io/",
        script : "npm run watch"
    },
    {
        name: "imba.io dev",
        cwd: "/Users/user/Desktop/repo/imba.io/",
        script : "npm run dev",
        env: {
            "PORT": "3035"
        }
    },
    {
        name: "markdown watch",
        cwd: "/Users/user/Desktop/",
        script : "md",
        env: {
            "PORT": "8087"
        }
    },
]
}
```

and put it in my user home.

Then I made some aliases to start and stop it:

```sh
# ~/.zshrc
alias psa='pm2 start ~/pm2.json'
alias pso='pm2 stop ~/pm2.json'
alias pli='pm2 list'
alias plo='clear && pm2 logs'
alias pse='pm2 start pm2.json'
alias pde='pm2 delete'
```

And since `pm2 start` also restarts, I can manage the whole thing with `psa` and `pso`.

Then I just added the links to [fuzzyhome](https://fuzzyho.me) :).

I'm sure there's a slightly better way to do this,
but until I figure that out, this is pretty good.
