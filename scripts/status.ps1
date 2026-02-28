git status -sb
""
"Últimos commits:"
git --no-pager log --oneline -n 10
""
"Checkpoints (tags):"
git tag --sort=-creatordate | Select-Object -First 20