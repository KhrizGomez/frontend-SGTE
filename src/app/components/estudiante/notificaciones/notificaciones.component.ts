import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-estudiante-notificaciones',
  standalone: true,
  imports: [],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css',
})
export class EstudianteNotificaciones implements AfterViewInit {

  ngAfterViewInit() {
    const notifList = document.getElementById('notif-list');
    const stNotifModal = document.getElementById('st-notif-modal');
    const stNotifClose = document.getElementById('st-notif-close');
    const stNotifIco = document.getElementById('st-notif-ico');
    const stNotifHead = document.getElementById('st-notif-head');
    const stNotifDesc = document.getElementById('st-notif-desc');
    const stNotifTime = document.getElementById('st-notif-time');
    const stNotifGoto = document.getElementById('st-notif-goto');
    const stNotifMark = document.getElementById('st-notif-mark');
    let stNotifCtx: {li: HTMLElement | null, caseId: string | null} = { li:null, caseId:null };

    function stOpenNotifModal(fromLi: HTMLElement){
      stNotifCtx.li = fromLi;
      const icon = fromLi.querySelector('.notif-card__icon')?.textContent?.trim() || '🔔';
      const title = fromLi.querySelector('.notif-card__title')?.textContent?.trim() || 'Notificación';
      const desc = fromLi.querySelector('.notif-card__desc')?.textContent?.trim() || '';
      const time = fromLi.querySelector('.notif-card__time')?.textContent?.trim() || '';
      stNotifCtx.caseId = (desc.match(/(C-\d{4})/)||[])[1] || null;
      if(stNotifIco) stNotifIco.textContent = icon;
      if(stNotifHead) stNotifHead.textContent = title;
      if(stNotifDesc) stNotifDesc.textContent = desc;
      if(stNotifTime) stNotifTime.textContent = time;
      if(stNotifModal) stNotifModal.hidden = false;
    }
    function stCloseNotifModal(){ if(stNotifModal) stNotifModal.hidden = true; }
    stNotifClose?.addEventListener('click', stCloseNotifModal);
    stNotifModal?.addEventListener('click', (e)=>{ if((e.target as HTMLElement)?.dataset?.['close']) stCloseNotifModal(); });

    // Delegate clicks in notif list
    if(notifList){
      notifList.addEventListener('click', (e)=>{
        const t = e.target as HTMLElement;
        const li = t.closest('.notif-card') as HTMLElement | null;
        if(!li) return;
        if(t.classList.contains('js-read')){
          li.style.opacity = '0.55';
          t.setAttribute('disabled','');
          t.textContent = 'Leído';
          alert('Notificación marcada como leída');
          return;
        }
        // Open details
        if(t.classList.contains('pill--primary') || t.classList.contains('notif-card__body') || t.closest('.notif-card__body')){
          stOpenNotifModal(li);
        }
      });
    }

    stNotifMark?.addEventListener('click', ()=>{
      const btn = stNotifCtx.li?.querySelector('.js-read') as HTMLButtonElement | null;
      if(btn){ btn.click(); }
      stCloseNotifModal();
    });

    stNotifGoto?.addEventListener('click', ()=>{
      window.location.href = '/estudiante/seguimiento';
      stCloseNotifModal();
    });

    // Preferencias de canales (localStorage demo)
    const storageKey = 'sgte_notif_prefs';
    const inputs = ['cfg-wa','cfg-mail','cfg-app','cfg-sms']
      .map(id => document.getElementById(id) as HTMLInputElement | null)
      .filter(Boolean) as HTMLInputElement[];
    const btnSave = document.getElementById('cfg-save');
    const btnReset = document.getElementById('cfg-reset');

    // Cargar
    try{
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      inputs.forEach(inp => { if(saved[inp.id] !== undefined) inp.checked = !!saved[inp.id]; });
    }catch{}

    // Guardar
    if(btnSave){
      btnSave.addEventListener('click', ()=>{
        const prefs: {[key: string]: boolean} = {};
        inputs.forEach(inp => prefs[inp.id] = inp.checked);
        localStorage.setItem(storageKey, JSON.stringify(prefs));
        alert('Preferencias guardadas');
      });
    }

    // Restablecer
    if(btnReset){
      btnReset.addEventListener('click', ()=>{
        inputs.forEach(inp => inp.checked = (inp.id==='cfg-mail' || inp.id==='cfg-app'));
        localStorage.removeItem(storageKey);
      });
    }
  }
}
