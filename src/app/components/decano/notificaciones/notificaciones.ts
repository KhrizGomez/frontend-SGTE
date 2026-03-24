// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg, kind='info'){ 
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    const coNotifList = document.getElementById('co-notif-list');
    const statUnread = document.getElementById('co-stat-unread');
    const statWeek = document.getElementById('co-stat-week');
    const statImportant = document.getElementById('co-stat-important');
    const statTotal = document.getElementById('co-stat-total');
    const statSched = document.getElementById('co-stat-sched');

    const cfg = {
      wa: document.getElementById('co-cfg-wa'),
      mail: document.getElementById('co-cfg-mail'),
      app: document.getElementById('co-cfg-app'),
      sms: document.getElementById('co-cfg-sms'),
      available: document.getElementById('co-cfg-available'),
      start: document.getElementById('co-cfg-start'),
      end: document.getElementById('co-cfg-end'),
      dndStart: document.getElementById('co-dnd-start'),
      dndEnd: document.getElementById('co-dnd-end'),
      days: {
        mon: document.getElementById('co-day-mon'), tue: document.getElementById('co-day-tue'),
        wed: document.getElementById('co-day-wed'), thu: document.getElementById('co-day-thu'),
        fri: document.getElementById('co-day-fri'), sat: document.getElementById('co-day-sat'),
        sun: document.getElementById('co-day-sun'),
      },
      saveBtn: document.getElementById('co-cfg-save'),
      resetBtn: document.getElementById('co-cfg-reset'),
    };

    let coNotifs = [
      { id:'N-3001', icon:'âš ï¸', title:'Falta documento en trÃ¡mite C-2102', desc:'Sube el sustentante de convalidaciÃ³n.', time:'Hace 6 minutos', important:true, read:false },
      { id:'N-3002', icon:'ðŸ”', title:'Recordatorio de etapa pendiente', desc:'Caso C-2101 lleva 2 dÃ­as en la misma etapa.', time:'Hace 1 hora', important:false, read:false },
      { id:'N-3003', icon:'ðŸ“¥', title:'Nueva solicitud recibida', desc:'Caso C-2110 creado por SecretarÃ­a.', time:'Hoy 09:10', important:false, read:false },
      { id:'N-3004', icon:'ðŸ—“', title:'Vence plazo de revisiÃ³n', desc:'Caso C-2105 vence maÃ±ana.', time:'Ayer 18:30', important:true, read:true }
    ];

    function loadCoPrefs(){
      try{
        const raw = localStorage.getItem('coNotifPrefs');
        if(!raw) return;
        const p = JSON.parse(raw);
        if(cfg.wa) cfg.wa.checked = !!p.wa;
        if(cfg.mail) cfg.mail.checked = !!p.mail;
        if(cfg.app) cfg.app.checked = !!p.app;
        if(cfg.sms) cfg.sms.checked = !!p.sms;
        if(cfg.available) cfg.available.checked = p.available !== false;
        if(cfg.start && p.start) cfg.start.value = p.start;
        if(cfg.end && p.end) cfg.end.value = p.end;
        if(cfg.dndStart && p.dndStart) cfg.dndStart.value = p.dndStart;
        if(cfg.dndEnd && p.dndEnd) cfg.dndEnd.value = p.dndEnd;
        if(cfg.days){
          Object.keys(cfg.days).forEach(k => { if(p.days && k in p.days) cfg.days[k].checked = !!p.days[k]; });
        }
      }catch{}
    }
    function saveCoPrefs(){
      const p = {
        wa: !!cfg.wa?.checked, mail: !!cfg.mail?.checked, app: !!cfg.app?.checked, sms: !!cfg.sms?.checked,
        available: !!cfg.available?.checked, start: cfg.start?.value || '08:00', end: cfg.end?.value || '18:00',
        dndStart: cfg.dndStart?.value || '22:00', dndEnd: cfg.dndEnd?.value || '07:00',
        days: {
          mon: !!cfg.days?.mon?.checked, tue: !!cfg.days?.tue?.checked, wed: !!cfg.days?.wed?.checked,
          thu: !!cfg.days?.thu?.checked, fri: !!cfg.days?.fri?.checked, sat: !!cfg.days?.sat?.checked, sun: !!cfg.days?.sun?.checked,
        },
      };
      localStorage.setItem('coNotifPrefs', JSON.stringify(p));
      updateCoStats();
      showStatus('Preferencias guardadas', 'success');
    }
    function resetCoPrefs(){
      localStorage.removeItem('coNotifPrefs');
      loadCoPrefs();
      updateCoStats();
    }

    function renderCoNotifs(){
      if(!coNotifList) return;
      coNotifList.innerHTML = '';
      coNotifs.forEach(n => {
        const li = document.createElement('li');
        li.className = 'notif-card';
        li.innerHTML = `
          <div class="notif-card__icon">${n.icon}</div>
          <div class="notif-card__body">
            <div class="notif-card__title">${n.title}${n.important? ' <span style="color:#dc2626">â€¢</span>':''}</div>
            <div class="notif-card__desc">${n.desc}</div>
            <div class="notif-card__actions">
              <button class="pill pill--primary js-detail">Ver detalle</button>
              <button class="pill pill--light js-read">${n.read? 'LeÃ­do':'Marcar leÃ­do'}</button>
            </div>
          </div>
          <div class="notif-card__time">${n.time}</div>
        `;
        li.querySelector('.js-read')?.addEventListener('click', ()=>{ n.read = true; renderCoNotifs(); updateCoStats(); try{ showStatus('NotificaciÃ³n marcada como leÃ­da','success'); }catch{} });
        li.querySelector('.js-detail')?.addEventListener('click', ()=> openNotifModal(n));
        coNotifList.appendChild(li);
      });
      updateCoStats();
    }

    const notifModal = document.getElementById('notif-modal');
    const notifClose = document.getElementById('notif-close');
    const notifIco = document.getElementById('notif-ico');
    const notifTitle = document.getElementById('notif-title');
    const notifDesc = document.getElementById('notif-desc');
    const notifTime = document.getElementById('notif-time');
    const notifGoto = document.getElementById('notif-goto');
    const notifMark = document.getElementById('notif-mark');
    let notifCtx = { id:null };

    function openNotifModal(n){
      notifCtx = { id: n.id, caseId: (n.desc.match(/(C-\d{4})/)||[])[1] };
      if(notifIco) notifIco.textContent = n.icon || 'ðŸ””';
      if(notifTitle) notifTitle.textContent = n.title || 'NotificaciÃ³n';
      if(notifDesc) notifDesc.textContent = n.desc || '';
      if(notifTime) notifTime.textContent = n.time || '';
      if(notifModal) notifModal.hidden = false;
    }
    function closeNotifModal(){ if(notifModal) notifModal.hidden = true; }
    notifClose?.addEventListener('click', closeNotifModal);
    notifModal?.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeNotifModal(); });
    notifMark?.addEventListener('click', ()=>{ const n = coNotifs.find(x=>x.id===notifCtx.id); if(n){ n.read = true; renderCoNotifs(); try{ showStatus('NotificaciÃ³n marcada como leÃ­da','success'); }catch{} } closeNotifModal(); });
    notifGoto?.addEventListener('click', ()=>{
      window.location.href = '/decanato/seguimiento';
      closeNotifModal();
    });

    function updateCoStats(){
      const unread = coNotifs.filter(n => !n.read).length;
      const important = coNotifs.filter(n => n.important).length;
      const total = coNotifs.length;
      if(statUnread) statUnread.textContent = String(unread);
      if(statImportant) statImportant.textContent = String(important);
      if(statTotal) statTotal.textContent = String(total);
      if(statWeek) statWeek.textContent = String(Math.max(5, Math.ceil(total*0.6)));
      const pRaw = localStorage.getItem('coNotifPrefs');
      if(pRaw){
        try{
          const p = JSON.parse(pRaw);
          if(statSched) statSched.textContent = p.available === false ? 'Pausado' : `${p.start||'08:00'}-${p.end||'18:00'}`;
        }catch{}
      }
    }

    cfg.saveBtn?.addEventListener('click', saveCoPrefs);
    cfg.resetBtn?.addEventListener('click', resetCoPrefs);
    loadCoPrefs();
    renderCoNotifs();
  }
}


