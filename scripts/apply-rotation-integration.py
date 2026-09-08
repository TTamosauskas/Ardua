from pathlib import Path

INDEX=Path('index.html')
ENGINE=Path('assets/js/ardua.js')

index=INDEX.read_text(encoding='utf-8')
engine=ENGINE.read_text(encoding='utf-8')

old='<script src="assets/js/campaign-mode.js"></script>\n<script src="assets/js/ardua.js"></script>'
new='<script src="assets/js/campaign-mode.js"></script>\n<script src="assets/js/rotation-polish.js"></script>\n<script src="assets/js/ardua.js"></script>'
if 'assets/js/rotation-polish.js' not in index:
    if old not in index:
        raise SystemExit('index rotation insertion anchor not found')
    index=index.replace(old,new,1)

old_engine='g.x+=g.vx*dt;g.y+=g.vy*dt;g.angle+=g.omega*dt;'
new_engine="g.x+=g.vx*dt;g.y+=g.vy*dt;if(window.ARDUA_ROTATION?.enabled?.()!==false)g.angle+=g.omega*dt;"
if new_engine not in engine:
    if old_engine not in engine:
        raise SystemExit('stellar formation rotation anchor not found')
    engine=engine.replace(old_engine,new_engine,1)

INDEX.write_text(index,encoding='utf-8')
ENGINE.write_text(engine,encoding='utf-8')
print('Rotation option integrated into index and stellar-formation renderer')
