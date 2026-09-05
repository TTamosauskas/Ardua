/* Ardua — graph-aware campaign/editor access layer. Loaded before the engine. */
(()=>{
'use strict';
const G=window.ARDUA_CAMPAIGN_GRAPH;
const SAVE_KEY='stellarForgeV1013';
const MAP_KEY='arduaCampaignGraphV1';
const EDITOR_MODE=window.location.hash.slice(1).toLowerCase()==='editor';
const nativeGet=Storage.prototype.getItem;
const nativeSet=Storage.prototype.setItem;
function parse(raw){try{return raw?JSON.parse(raw):null}catch(e){return null}}
function uniq(xs){return [...new Set(xs.filter(Boolean))]}
function defaults(){return{version:2,introduced:false,activeId:'bigbang',completed:[]}}
function legacyMigration(){
 const raw=nativeGet.call(localStorage,MAP_KEY);if(raw){const x=parse(raw)||defaults();return{...defaults(),...x,version:2,completed:uniq(x.completed||[])}}
 const legacy=parse(nativeGet.call(localStorage,SAVE_KEY));if(!legacy)return defaults();
 const max=Number.isInteger(legacy.maxUnlockedPhaseIndex)?legacy.maxUnlockedPhaseIndex:(Number.isInteger(legacy.campaignPhaseIndex)?legacy.campaignPhaseIndex:(legacy.phaseIndex||0));
 const completed=G?G.runtimeOrder.slice(0,Math.max(0,max)).filter(id=>G.baseIndex[id]!==undefined):[];
 const active=(G&&G.runtimeOrder[Math.max(0,Math.min(G.runtimeOrder.length-1,max))])||'bigbang';
 const next={...defaults(),introduced:max>0,activeId:active,completed:uniq(completed)};
 if(!EDITOR_MODE)nativeSet.call(localStorage,MAP_KEY,JSON.stringify(next));return next;
}
let graphState=legacyMigration();
function saveGraph(){if(!EDITOR_MODE)nativeSet.call(localStorage,MAP_KEY,JSON.stringify(graphState))}
function state(){return{...graphState,completed:[...graphState.completed]}}
function completedSet(){return new Set(graphState.completed)}
function isUnlocked(id){
 if(EDITOR_MODE)return true;if(id==='bigbang')return true;
 const done=completedSet(),rule=G?.prerequisites?.[id];if(!rule)return false;
 if(rule.allOf&&rule.allOf.some(x=>!done.has(x)))return false;
 if(rule.anyOf&&rule.anyOf.length&&!rule.anyOf.some(group=>group.every(x=>done.has(x))))return false;
 return true;
}
function markCompleted(id){if(!id)return;graphState.completed=uniq([...graphState.completed,id]);if(id==='bigbang')graphState.introduced=true;saveGraph();window.dispatchEvent(new CustomEvent('ardua:campaign-progress',{detail:{id,state:state()}}))}
function setActive(id){if(!id)return;graphState.activeId=id;saveGraph()}
function setIntroduced(v=true){graphState.introduced=!!v;saveGraph()}
window.ARDUA_CAMPAIGN={editor:EDITOR_MODE,getState:state,isUnlocked,markCompleted,setActive,setIntroduced,runtimeIndex:id=>G?.runtimeIndex?.[id]??-1};

Storage.prototype.getItem=function(key){
 const raw=nativeGet.call(this,key);if(this!==localStorage||key!==SAVE_KEY||!raw)return raw;const data=parse(raw);if(!data)return raw;
 const idx=G?.runtimeIndex?.[graphState.activeId];return JSON.stringify({...data,phaseIndex:Number.isInteger(idx)?idx:(data.phaseIndex||0)});
};
Storage.prototype.setItem=function(key,value){
 if(this!==localStorage||key!==SAVE_KEY)return nativeSet.call(this,key,value);const incoming=parse(value);if(!incoming)return nativeSet.call(this,key,value);if(EDITOR_MODE)return;
 const activeIndex=G?.runtimeIndex?.[graphState.activeId];const previous=parse(nativeGet.call(localStorage,SAVE_KEY))||{};
 nativeSet.call(this,key,JSON.stringify({...incoming,campaignPhaseIndex:Number.isInteger(activeIndex)?activeIndex:(previous.campaignPhaseIndex||0),maxUnlockedPhaseIndex:previous.maxUnlockedPhaseIndex||0}));
};
window.addEventListener('hashchange',()=>window.location.reload());
})();
