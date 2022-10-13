# Git

## Useful!

Here are some different things I've done with git that I find useful.

## Excluding generated files from `git diff`

Make a file `~/.config/git/attributes` and add:

```git
package-lock.json -diff
```
