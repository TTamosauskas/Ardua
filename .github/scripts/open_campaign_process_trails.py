from pathlib import Path

js_path = Path('assets/js/campaign-map.js')
css_path = Path('assets/css/campaign-map.css')

js = js_path.read_text(encoding='utf-8')
old = "function portal(title,ids,open=false,key=''){return `<details class=\"portal\" ${open?'open':''} ${key?`data-portal=\"${key}\"`:''}><summary>${title}</summary><div class=\"portal-body\">${flow(ids)}</div></details>`}"
new = "function portal(title,ids,open=false,key=''){return `<section class=\"portal open-trail\" ${key?`data-portal=\"${key}\"`:''}><div class=\"portal-heading\">${title}</div><div class=\"portal-body\">${flow(ids)}</div></section>`}"
count = js.count(old)
if count != 1:
    raise SystemExit(f'portal helper: expected 1 match, found {count}')
js = js.replace(old, new, 1)
js_path.write_text(js, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
marker = '/* Open process trails: former collapsible portals become continuous campaign segments. */'
if marker not in css:
    css += '''\n\n/* Open process trails: former collapsible portals become continuous campaign segments. */\n.portal.open-trail{width:min(500px,100%);margin:20px auto 26px;border:0;border-radius:0;background:transparent;overflow:visible}\n.portal.open-trail .portal-heading{position:relative;z-index:4;width:max-content;max-width:92%;margin:0 auto 8px;padding:7px 13px;border:1px solid rgba(162,203,235,.22);border-radius:999px;background:rgba(5,16,30,.62);color:#e8f4ff;font-size:9px;font-weight:760;letter-spacing:.11em;text-transform:uppercase;text-align:center}\n.portal.open-trail .portal-heading::before{content:"◎";margin-right:7px;color:var(--map-violet);font-size:13px;filter:drop-shadow(0 0 6px currentColor)}\n.portal.open-trail .portal-body{padding:0}\n.portal.open-trail .cosmos-flow{gap:12px;padding-top:10px;padding-bottom:10px}\n.portal.open-trail .phase-node{width:min(260px,calc(100vw - 44px));padding-top:7px;padding-bottom:7px}\n.portal.open-trail .phase-node strong{font-size:10px}\n@media(max-width:640px){.portal.open-trail{width:100%;margin:16px auto 22px}.portal.open-trail .phase-node{width:min(250px,calc(100vw - 34px))}}\n'''
css_path.write_text(css, encoding='utf-8')
print('campaign process trails opened')
