from pathlib import Path

path = Path('assets/js/ardua.js')
text = path.read_text(encoding='utf-8')
old = "$('stellarStartBtn').addEventListener('click',closeStellarPopup);"
new = "bindReliableTap($('stellarStartBtn'),closeStellarPopup);"
count = text.count(old)
if count != 1:
    raise SystemExit(f'stellar start binding: expected 1 match, found {count}')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
print('stellar start reliable tap applied')
