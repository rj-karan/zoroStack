// The licensed recording stays on Spotify. Nothing is fetched until requested.
const dialog=document.querySelector('#soundtrack'),slot=document.querySelector('#music-player');
document.querySelector('#music').addEventListener('click',()=>{
 if(!slot.firstChild){
  const player=document.createElement('iframe');
  player.title='Overtaken — ONE PIECE soundtrack on Spotify';
  player.src='https://open.spotify.com/embed/track/5Gt3KAUrjFBjVNgMngjCXZ?utm_source=generator';
  player.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  player.referrerPolicy='strict-origin-when-cross-origin';
  player.height='152';player.width='100%';slot.append(player);
 }
 dialog.showModal();
});
document.querySelector('#close-soundtrack').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>slot.replaceChildren());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
