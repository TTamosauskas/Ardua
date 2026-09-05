/* Ardua — campaign/editor access layer. Loaded before the game engine. */
(()=>{
'use strict';

const SAVE_KEY='stellarForgeV1013';
const EDITOR_MODE=window.location.hash.slice(1).toLowerCase()==='editor';
const nativeGet=Storage.prototype.getItem;
const nativeSet=Storage.prototype.setItem;
let revisitMode=false;

function int(value,fallback=0){
 const n=Number(value);
 return Number.isInteger(n)&&n>=0?n:fallback;
}
function parse(raw){
 try{return raw?JSON.parse(raw):null}catch(e){return null}
}
function normalized(data={}){
 const current=int(data.phaseIndex,0);
 const campaign=int(data.campaignPhaseIndex,current);
 const max=Math.max(campaign,int(data.maxUnlockedPhaseIndex,current));
 return {...data,campaignPhaseIndex:campaign,maxUnlockedPhaseIndex:max};
}
function storedCampaign(){
 return normalized(parse(nativeGet.call(localStorage,SAVE_KEY))||{});
}
function persistMigration(){
 const raw=nativeGet.call(localStorage,SAVE_KEY),data=parse(raw);
 if(!data)return;
 const next=normalized(data);
 if(data.campaignPhaseIndex!==next.campaignPhaseIndex||data.maxUnlockedPhaseIndex!==next.maxUnlockedPhaseIndex){
   nativeSet.call(localStorage,SAVE_KEY,JSON.stringify(next));
 }
}

persistMigration();

Storage.prototype.getItem=function(key){
 const raw=nativeGet.call(this,key);
 if(this!==localStorage||key!==SAVE_KEY||!raw)return raw;
 const data=parse(raw);
 if(!data)return raw;
 const next=normalized(data);
 // The engine always resumes the real campaign checkpoint. Editor jumps and
 // historical revisits therefore never become the next boot position.
 return JSON.stringify({...next,phaseIndex:next.campaignPhaseIndex});
};

Storage.prototype.setItem=function(key,value){
 if(this!==localStorage||key!==SAVE_KEY)return nativeSet.call(this,key,value);
 const incoming=parse(value);
 if(!incoming)return nativeSet.call(this,key,value);

 // Editor sessions are intentionally ephemeral: they can mutate in-memory state,
 // while every campaign save remains byte-for-byte untouched on disk.
 if(EDITOR_MODE)return;

 const previous=storedCampaign();
 const current=int(incoming.phaseIndex,previous.campaignPhaseIndex);
 let campaign=previous.campaignPhaseIndex;
 let maxUnlocked=previous.maxUnlockedPhaseIndex;

 if(revisitMode&&current<campaign){
   // Replaying an older unlocked phase keeps the campaign resume point intact.
   maxUnlocked=Math.max(maxUnlocked,current);
 }else{
   // Natural progression, or catching back up to the campaign frontier.
   campaign=current;
   maxUnlocked=Math.max(maxUnlocked,current);
   revisitMode=false;
 }

 nativeSet.call(this,key,JSON.stringify({
   ...incoming,
   campaignPhaseIndex:campaign,
   maxUnlockedPhaseIndex:maxUnlocked
 }));
};

function menuCopy(){
 const eyebrow=document.getElementById('phaseMenuMode');
 const hint=document.getElementById('phaseMenuHint');
 if(eyebrow)eyebrow.textContent=EDITOR_MODE?'Modo editor':'Campanha';
 if(hint)hint.textContent=EDITOR_MODE
   ?'Todas as fases estão liberadas para teste e balanceamento. O progresso da campanha fica preservado.'
   :'As fases são liberadas conforme o avanço da campanha. Fases já alcançadas podem ser revisitadas.';
}

function decoratePhaseMenu(){
 const host=document.getElementById('phaseMenu');
 if(!host)return;
 const buttons=[...host.querySelectorAll('.phase-jump')];
 if(!buttons.length)return;
 const progress=storedCampaign();
 const unlocked=Math.min(buttons.length-1,progress.maxUnlockedPhaseIndex);

 buttons.forEach((button,index)=>{
   button.dataset.phaseIndex=String(index);
   const locked=!EDITOR_MODE&&index>unlocked;
   button.disabled=locked;
   button.classList.toggle('locked',locked);
   button.setAttribute('aria-disabled',locked?'true':'false');
   if(locked){
     const badge=button.querySelector('.new');
     if(badge)badge.textContent='BLOQUEADA';
   }
 });
}

function installMenuGuards(){
 const host=document.getElementById('phaseMenu');
 const open=document.getElementById('menuOpenBtn');
 if(host){
   // Capture runs before the engine's per-button listener.
   host.addEventListener('click',event=>{
     const button=event.target.closest('.phase-jump');
     if(!button)return;
     const index=int(button.dataset.phaseIndex,-1);
     const progress=storedCampaign();
     if(!EDITOR_MODE&&index>progress.maxUnlockedPhaseIndex){
       event.preventDefault();
       event.stopImmediatePropagation();
       return;
     }
     if(!EDITOR_MODE)revisitMode=index!==progress.campaignPhaseIndex;
   },true);
 }
 if(open)open.addEventListener('click',()=>{menuCopy();decoratePhaseMenu()});
}

const style=document.createElement('style');
style.textContent=`
.phase-jump.locked{opacity:.42;filter:saturate(.35);cursor:default}
.phase-jump.locked .new{font-size:8px;letter-spacing:.05em;color:#7f8ba6}
.phase-jump.locked:hover{transform:none}
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded',()=>{
 menuCopy();
 installMenuGuards();
});

window.addEventListener('hashchange',()=>window.location.reload());
})();
