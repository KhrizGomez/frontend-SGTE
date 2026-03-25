// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg, kind='info'){ 
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    const segQ = document.getElementById('seg-q');
    const segList = document.getElementById('seg-list');
    const segEmpty = document.getElementById('seg-empty');
    const segDetail = document.getElementById('seg-detail');
    const segDetId = document.getElementById('seg-det-id');
    const segTitle = document.getElementById('seg-title');
    const segEst = document.getElementById('seg-est');
    const segTipo = document.getElementById('seg-tipo');
    const segPrio = document.getElementById('seg-prio');
    const segEstado = document.getElementById('seg-estado');
    const segCreado = document.getElementById('seg-creado');
    const segActual = document.getElementById('seg-actual');
    const segFiles = document.getElementById('seg-files');
    const segTl = document.getElementById('seg-tl');
    const segNext = document.getElementById('seg-next');
    const segResol = document.getElementById('seg-resol');

    const flowMap = {
      basico: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Revisión', role:'Coordinador'},
        {name:'Aprobación', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      validacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Validación documental', role:'Coordinador'},
        {name:'Revisión coordinación', role:'Coordinador'},
        {name:'Aprobación decanato', role:'Decano'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      homologacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Evaluación de homologación', role:'Coordinador'},
        {name:'Resolución', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
    };

    let casos = [
      { id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En proceso', creado:'2025-09-02', actualizado:'2025-09-04', traza:'validacion', files:[ {name:'Solicitud.pdf', size:'120 KB'}, {name:'HistorialAcademico.pdf', size:'340 KB'} ], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-02': null, done: idx<1? '2025-09-03': null })), current: 1 },
      { id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'En proceso', creado:'2025-09-01', actualizado:'2025-09-05', traza:'homologacion', files:[ {name:'Programas.pdf', size:'1.2 MB'} ], steps: flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-01': null, done: idx<2? (idx===0? '2025-09-02':'2025-09-04') : null })), current: 2 },
      { id:'C-2103', titulo:'Certificado de matrícula - Carlos Ruiz', estudiante:'Carlos Ruiz', tipo:'Certificados académicos', prioridad:'Media', estado:'En proceso', creado:'2025-09-03', actualizado:'2025-09-03', traza:'basico', files:[ {name:'Comprobante.pdf', size:'85 KB'} ], steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03': null, done: idx<1? '2025-09-03' : null })), current: 1 }
    ];

    try{
      const extRaw = localStorage.getItem('externalRequests');
      if(extRaw){
        const extList = JSON.parse(extRaw);
        extList.forEach(req => {
          if(!casos.find(c => c.id === req.id)){
            const map = flowMap[req.traza] || flowMap.validacion;
            const steps = map.map((s,idx)=>({ ...s, started: idx===0? req.creado : null, done: null }));
            casos.unshift({
              id: req.id, titulo: req.titulo, estudiante: req.estudiante, tipo: req.tipo || 'Otro', prioridad: req.prioridad || 'Media', estado: req.estado || 'En proceso', creado: req.creado, actualizado: req.actualizado || req.creado, traza: req.traza || 'validacion', files: (req.files||[]).map(f => ({name:f.name, size: (f.size? (Math.round(f.size/1024)+' KB') : '—')})), steps, current: req.current || 0
            });
          }
        });
      }
    }catch(err){ console.warn(err); }

    function fmtDate(d){ return d || '—'; }
    function daysBetween(d1, d2){
      if(!d1 || !d2) return null;
      const a = new Date(d1+'T00:00:00');
      const b = new Date(d2+'T00:00:00');
      return Math.round((b - a) / (1000*60*60*24));
    }

    function renderSegList(){
      if(!segList) return;
      const q = (segQ?.value || '').trim().toLowerCase();
      segList.innerHTML = '';
      casos.filter(c => !q || JSON.stringify(c).toLowerCase().includes(q))
        .forEach(c => {
          const li = document.createElement('li');
          li.className = 'seg-item';
          li.dataset.id = c.id;
          li.innerHTML = `
            <div class="seg-it-row"><span class="seg-it-id">${c.id}</span> <span class="seg-it-title">${c.titulo}</span></div>
            <div class="seg-it-sub">${c.estudiante} · ${c.tipo} · ${c.prioridad} · Etapa ${c.current+1}/${c.steps.length}</div>
          `;
          li.addEventListener('click', ()=> selectCaso(c.id));
          segList.appendChild(li);
        });
    }

    function selectCaso(id){
      const c = casos.find(x => x.id === id);
      if(!c) return;
      segList?.querySelectorAll('.seg-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
      if(segEmpty) segEmpty.hidden = true;
      if(segDetail) segDetail.hidden = false;
      if(segDetId) segDetId.textContent = id;
      if(segTitle) segTitle.textContent = c.titulo;
      if(segEst) segEst.textContent = c.estudiante;
      if(segTipo) segTipo.textContent = c.tipo;
      if(segPrio) segPrio.textContent = c.prioridad;
      if(segEstado) segEstado.textContent = c.estado;
      if(segCreado) segCreado.textContent = fmtDate(c.creado);
      if(segActual) segActual.textContent = fmtDate(c.actualizado);
      
      if(segFiles){
        segFiles.innerHTML = '';
        c.files.forEach(f => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="file-ico"><i class="bi bi-paperclip"></i></span><span class="file-name">${f.name}</span><span class="file-size">${f.size}</span><span class="file-actions"><button class="btn-ghost btn-small js-view" type="button">Ver</button><button class="btn-primary btn-small js-dl" type="button">Descargar</button></span>`;
          li.querySelector('.js-view')?.addEventListener('click', ()=> openFileModal(c.id, f));
          li.querySelector('.js-dl')?.addEventListener('click', ()=> downloadFile(c.id, f));
          segFiles.appendChild(li);
        });
      }
      
      if(segTl){
        segTl.innerHTML = '';
        c.steps.forEach((s, idx) => {
          const li = document.createElement('li');
          const isPending = idx > c.current;
          li.className = `tl-item ${isPending? 'pending':''}`;
          const roleClass = `role--${(s.role||'Coordinador').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
          let meta = `Paso ${idx+1}`;
          if(s.started && s.done){
            const d = daysBetween(s.started, s.done);
            if (d !== null) meta += ` · ${d} día${d===1?'':'s'}`;
          } else if(idx === c.current && s.started){
            const d = daysBetween(s.started, c.actualizado || new Date().toISOString().slice(0,10));
            if (d !== null) meta += ` · en curso · ${d} día${d===1?'':'s'}`;
          }
          li.innerHTML = `
            <div class="tl-dot">${idx <= c.current && s.done ? '<i class="bi bi-check-lg"></i>' : '•'}</div>
            <div class="tl-body">
              <div class="tl-title">${s.name}</div>
              <div class="tl-meta">${meta}</div>
              <div class="role role-badge ${roleClass}"><span class="dot"></span>${s.role || 'Coordinador'}</div>
            </div>`;
          segTl.appendChild(li);
        });
      }

      if(segNext && segResol){
        const isLast = c.current >= c.steps.length-1;
        segNext.hidden = isLast;
        segResol.hidden = !isLast;
        segNext.onclick = () => avanzarCaso(c.id);
        segResol.onclick = () => resolverCaso(c.id);
      }
      
      const rej = document.getElementById('seg-reject');
      if(rej){
        if(c.estado === 'Rechazado'){
          rej.hidden = false;
          rej.textContent = `Rechazado el ${fmtDate(c.rechazadoFecha)}. Motivo: ${c.rechazo || '—'}`;
        } else {
          rej.hidden = true;
          rej.textContent = '';
        }
      }
    }

    function avanzarCaso(id){
      const c = casos.find(x => x.id === id);
      if(!c) return;
      const now = new Date().toISOString().slice(0,10);
      const idx = c.current;
      if(c.steps[idx] && !c.steps[idx].done){
        if(!c.steps[idx].started) c.steps[idx].started = now;
        c.steps[idx].done = now;
      }
      if(c.current < c.steps.length-1){
        c.current += 1;
        if(!c.steps[c.current].started) c.steps[c.current].started = now;
        c.estado = c.current >= c.steps.length-1 ? 'En resolución' : 'En proceso';
      }
      c.actualizado = now;
      renderSegList();
      selectCaso(id);
    }

    function resolverCaso(id){
      const c = casos.find(x => x.id === id);
      if(!c) return;
      const now = new Date().toISOString().slice(0,10);
      const last = c.steps.length-1;
      if(!c.steps[last].started) c.steps[last].started = now;
      c.steps[last].done = now;
      c.current = last;
      c.estado = 'Finalizado';
      c.actualizado = now;
      c.files.push({name:`Resolucion_${c.id}.pdf`, size:'64 KB'});
      renderSegList();
      selectCaso(id);
    }

    const rejModal = document.getElementById('rej-modal');
    const rejClose = document.getElementById('rej-close');
    const rejCancel = document.getElementById('rej-cancel');
    const rejConfirm = document.getElementById('rej-confirm');
    const rejReason = document.getElementById('rej-reason');
    let rejTargetId = null;

    function openRejModal(id){ rejTargetId = id; if(rejModal) rejModal.hidden = false; }
    function closeRejModal(){ rejTargetId = null; if(rejModal) rejModal.hidden = true; }

    const btnRechazar = document.getElementById('seg-rechazar');
    if(btnRechazar){ btnRechazar.addEventListener('click', ()=>{
      const active = segDetId?.textContent?.trim();
      if(active) openRejModal(active);
    }); }
    if(rejClose) rejClose.addEventListener('click', closeRejModal);
    if(rejCancel) rejCancel.addEventListener('click', closeRejModal);
    if(rejModal) rejModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeRejModal(); });
    if(rejConfirm){ rejConfirm.addEventListener('click', ()=>{
      const reason = rejReason?.value?.trim();
      if(!reason){ showStatus('Por favor, indica el motivo del rechazo.', 'warn'); return; }
      const c = casos.find(x => x.id === rejTargetId);
      if(!c) { closeRejModal(); return; }
      const now = new Date().toISOString().slice(0,10);
      c.estado = 'Rechazado';
      c.rechazo = reason;
      c.rechazadoFecha = now;
      c.actualizado = now;
      closeRejModal();
      renderSegList();
      selectCaso(c.id);
    }); }

    const fileModal = document.getElementById('file-modal');
    const fileClose = document.getElementById('file-close');
    const fileMeta = document.getElementById('file-meta');
    const filePreview = document.getElementById('file-preview');
    const fileDl = document.getElementById('file-dl');
    let fileCtx = { id:null, file:null };
    function openFileModal(id, file){
      fileCtx = { id, file };
      if(fileMeta) fileMeta.textContent = `${file.name} · ${file.size}`;
      if(filePreview) filePreview.textContent = 'No hay vista previa disponible para este archivo.';
      if(fileModal) fileModal.hidden = false;
    }
    function closeFileModal(){ fileCtx = { id:null, file:null }; if(fileModal) fileModal.hidden = true; }
    function downloadFile(id, file){
      const blob = new Blob([`Contenido simulado para ${file.name} del caso ${id}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }
    if(fileClose) fileClose.addEventListener('click', closeFileModal);
    if(fileModal) fileModal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeFileModal(); });
    if(fileDl) fileDl.addEventListener('click', ()=>{ if(fileCtx.file) downloadFile(fileCtx.id, fileCtx.file); });

    if(segQ) segQ.addEventListener('input', renderSegList);
    renderSegList();
  }
}
