from pathlib import Path

p=Path('assets/js/campaign-discoveries-phenomena.js')
text=p.read_text()
anchor="""const PHENOMENON_LABEL_OVERRIDES=Object.freeze({
 'Jatos Coronais':'Ejeção de Massa Coronal'
});
"""
addition=anchor+"""const PHENOMENON_FAST_SOURCE_OVERRIDES=Object.freeze({
 'Quarks':Object.freeze({wikiTitle:'Quark',wikiUrl:'https://pt.wikipedia.org/wiki/Quark',imagePath:'assets/images/phenomena/proton.png'}),
 'Força Nuclear Forte':Object.freeze({wikiTitle:'Interação forte',wikiUrl:'https://pt.wikipedia.org/wiki/Intera%C3%A7%C3%A3o_forte',imagePath:'assets/images/phenomena/proton.png'}),
 'Força Eletromagnética':Object.freeze({wikiTitle:'Eletromagnetismo',wikiUrl:'https://pt.wikipedia.org/wiki/Eletromagnetismo',imagePath:'assets/images/phenomena/electron.png'}),
 'Força Gravitacional':Object.freeze({wikiTitle:'Gravidade',wikiUrl:'https://pt.wikipedia.org/wiki/Gravidade',imagePath:'assets/images/phenomena/gravitational-collapse.png'}),
 'Força Nuclear Fraca':Object.freeze({wikiTitle:'Interação fraca',wikiUrl:'https://pt.wikipedia.org/wiki/Intera%C3%A7%C3%A3o_fraca',imagePath:'assets/images/phenomena/electron-capture.png'})
});
"""
if 'PHENOMENON_FAST_SOURCE_OVERRIDES' not in text:
    if anchor not in text: raise SystemExit('fast source insertion anchor missing')
    text=text.replace(anchor,addition,1)
anchor2="function phenomenonImage(cfg){return cfg?.imagePath?new URL(cfg.imagePath,document.baseURI).href:''}\n"
addition2=anchor2+"function phenomenonConfig(title){return{...(PHENOMENON_FAST_SOURCE_OVERRIDES[title]||{}),...(phenomenonSourcesResolved?.[title]||{})}}\n"
if 'function phenomenonConfig(title)' not in text:
    if anchor2 not in text: raise SystemExit('phenomenon config anchor missing')
    text=text.replace(anchor2,addition2,1)
text=text.replace("src=phenomenonImage(sources[title]||{})","src=phenomenonImage(phenomenonConfig(title))")
text=text.replace("const initialCfg=phenomenonSourcesResolved?.[title]||{};","const initialCfg=phenomenonConfig(title);")
text=text.replace("const cfg=sources?.[title]||{};body.innerHTML=phenomenonDetailMarkup(title,glyph,text,cfg);","const cfg=phenomenonConfig(title);body.innerHTML=phenomenonDetailMarkup(title,glyph,text,cfg);")
text=text.replace("src=phenomenonImage(phenomenonSourcesResolved?.[title]||{})","src=phenomenonImage(phenomenonConfig(title))")
p.write_text(text)

p=Path('scripts/validate-instant-discovery-details.js')
text=p.read_text()
needle="assert(!phenomena.includes('function loadingMarkup(glyph)'),'Placeholder bloqueante de Fenômenos voltou');\n"
extra=needle+"for(const title of ['Quarks','Força Nuclear Forte','Força Eletromagnética','Força Gravitacional','Força Nuclear Fraca'])assert(phenomena.includes(`'${title}':Object.freeze({`),`${title} sem imagem local rápida`);\n"
if 'sem imagem local rápida' not in text:
    if needle not in text: raise SystemExit('validator anchor missing')
    text=text.replace(needle,extra,1)
p.write_text(text)
