// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [],
  templateUrl: './plantillas.html',
  styleUrl: './plantillas.css',
})
export class Plantillas implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg, kind='info'){ 
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    const grid = document.getElementById('co-sgrid');
    const btnNuevo = document.getElementById('co-nuevo');
    const txtBuscar = document.getElementById('co-buscar');
    const filTipo = document.getElementById('co-fil-tipo');
    const filPrio = document.getElementById('co-fil-prio');
    const filEstado = document.getElementById('co-fil-estado');
    const filClear = document.getElementById('co-fil-clear');

    const modal = document.getElementById('co-modal');
    const modalClose = document.getElementById('co-close');
    const form = document.getElementById('co-form');
    const fldId = document.getElementById('co-id');
    const fldTitulo = document.getElementById('co-titulo');
    const fldTipo = document.getElementById('co-tipo');
    const fldPrioridad = document.getElementById('co-prioridad');
    const fldEstado = document.getElementById('co-estado');
    const fldFecha = document.getElementById('co-fecha');
    const fldDesc = document.getElementById('co-desc');
    const selTraza = document.getElementById('co-traza');
    const tl = document.getElementById('co-tl');
    const customWrap = document.getElementById('co-custom');
    const stepName = document.getElementById('co-step-name');
    const stepRole = document.getElementById('co-step-role');
    const stepAdd = document.getElementById('co-step-add');
    const stepList = document.getElementById('co-steps');
    const btnCancel = document.getElementById('co-cancelar');

    let rows = [
      { id: 'T-1001', titulo: 'Homologación de materias', tipo:'Homologación', prioridad:'Alta', estado:'Publicado', fecha:'2025-09-25', traza:'homologacion', custom:[] },
      { id: 'T-1002', titulo: 'Certificados académicos', tipo:'Certificados académicos', prioridad:'Media', estado:'En revisión', fecha:'2025-09-20', traza:'basico', custom:[] },
      { id: 'T-1003', titulo: 'Cambio de carrera', tipo:'Cambio de carrera', prioridad:'Urgente', estado:'Publicado', fecha:'2025-10-05', traza:'validacion', custom:[] },
      { id: 'T-1004', titulo: 'Baja de matrícula parcial', tipo:'Baja de matrícula', prioridad:'Media', estado:'Borrador', fecha:'2025-09-30', traza:'basico', custom:[] },
      { id: 'T-1005', titulo: 'Solicitud de beca institucional', tipo:'Otro', prioridad:'Urgente', estado:'En revisión', fecha:'2025-09-18', traza:'validacion', custom:[] },
      { id: 'T-1006', titulo: 'Actualización de datos personales', tipo:'Otro', prioridad:'Baja', estado:'Publicado', fecha:'2025-10-10', traza:'basico', custom:[] },
      { id: 'T-1007', titulo: 'Certificado de matrícula', tipo:'Certificados académicos', prioridad:'Media', estado:'Publicado', fecha:'2025-09-22', traza:'basico', custom:[] },
      { id: 'T-1008', titulo: 'Convalidación internacional de asignaturas', tipo:'Homologación', prioridad:'Alta', estado:'En revisión', fecha:'2025-10-01', traza:'homologacion', custom:[] }
    ];
    let filter = '';
    let fTipo = '';
    let fPrio = '';
    let fEstado = '';

    function renderCards(){
      if(!grid) return;
      grid.innerHTML = '';
      rows.filter(r => {
          const textOk = !filter || JSON.stringify(r).toLowerCase().includes(filter);
          const tipoOk = !fTipo || r.tipo === fTipo;
          const prioOk = !fPrio || r.prioridad === fPrio;
          const estOk = !fEstado || r.estado === fEstado;
          return textOk && tipoOk && prioOk && estOk;
        })
        .forEach(r => {
          const card = document.createElement('div');
          card.className = 'soli-card';
          card.dataset.id = r.id;
          card.innerHTML = `
            <span class="soli-ico" aria-hidden="true"><i class="bi bi-file-text-fill"></i></span>
            <span class="soli-txt">
              <span class="soli-title">${r.titulo}</span>
              <span class="soli-desc">${r.tipo} · ${r.prioridad} · ${r.estado}${r.fecha? ' · vence '+r.fecha: ''}</span>
              <span class="soli-actions">
                <button class="pill pill--primary js-edit" data-id="${r.id}">Editar</button>
                <button class="pill pill--light js-dup" data-id="${r.id}">Duplicar</button>
              </span>
            </span>`;
          grid.appendChild(card);
        });
    }
    renderCards();

    function setFormFrom(row){
      fldId.value = row?.id || '';
      fldTitulo.value = row?.titulo || '';
      fldTipo.value = row?.tipo || '';
      fldPrioridad.value = row?.prioridad || 'Baja';
      fldEstado.value = row?.estado || 'Borrador';
      fldFecha.value = row?.fecha || '';
      fldDesc.value = row?.desc || '';
      selTraza.value = row?.traza || 'basico';
      stepList.innerHTML = '';
      (row?.custom || []).forEach((s)=> addStep(s.name || s, s.role || 'Coordinador'));
      updateTrazaPreview();
      handleCustomVisibility();
    }

    function getForm(){
      return {
        id: fldId.value || `T-${Math.floor(Math.random()*9000)+1000}`,
        titulo: fldTitulo.value.trim(),
        tipo: fldTipo.value,
        prioridad: fldPrioridad.value,
        estado: fldEstado.value,
        responsable: 'Coordinador/a',
        responsableRol: 'Coordinador',
        fecha: fldFecha.value,
        desc: fldDesc.value.trim(),
        traza: selTraza.value,
        custom: Array.from(stepList.querySelectorAll('li')).map(li => ({
          name: li.querySelector('.txt')?.textContent.trim() || '',
          role: li.dataset.role || 'Coordinador',
        })),
      };
    }

    function updateTrazaPreview(){
      if(!tl) return;
      tl.innerHTML = '';
      let steps = [];
      const map = {
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
      if (selTraza.value === 'personalizada'){
        steps = Array.from(stepList.querySelectorAll('li')).map(li => ({
          name: li.querySelector('.txt')?.textContent.trim() || '',
          role: li.dataset.role || 'Coordinador',
        }));
      } else {
        steps = map[selTraza.value] || map.basico;
      }
      const doneCount = Math.max(1, Math.min(steps.length, 2));
      steps.forEach((step,idx)=>{
        const li = document.createElement('li');
        const isDone = idx < doneCount;
        const isPending = idx >= doneCount;
        li.className = `tl-item ${isPending?'pending':''}`;
        const roleClass = `role--${(step.role||'Coordinador').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
        li.innerHTML = `
          <div class="tl-dot">${isDone?'<i class="bi bi-check-lg"></i>':'•'}</div>
          <div class="tl-body">
            <div class="tl-title">${step.name}</div>
            <div class="tl-meta">Paso ${idx+1}</div>
            <div class="role role-badge ${roleClass}"><span class="dot"></span>${step.role || 'Coordinador'}</div>
          </div>`;
        tl.appendChild(li);
        if (tl.classList.contains('timeline--h') && idx < steps.length-1){
          const conn = document.createElement('div');
          conn.className = 'tl-connector';
          tl.appendChild(conn);
        }
      });
    }

    function handleCustomVisibility(){
      if(!customWrap) return;
      customWrap.hidden = selTraza.value !== 'personalizada';
    }

    function addStep(name, role='Coordinador'){
      const li = document.createElement('li');
      li.dataset.role = role;
      const roleClass = `role--${role.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g,'')}`;
      li.innerHTML = `
        <span class="txt">${name}</span>
        <span class="role"><span class="role-badge ${roleClass}"><span class="dot"></span>${role}</span></span>
        <button class="rm" type="button">Quitar</button>`;
      li.querySelector('.rm').addEventListener('click', ()=>{ li.remove(); updateTrazaPreview(); });
      stepList.appendChild(li);
    }

    function openModal(){ if(modal) modal.hidden = false; }
    function closeModal(){ if(modal) modal.hidden = true; }
    if (btnNuevo){
      btnNuevo.addEventListener('click', ()=>{
        setFormFrom({ estado:'Borrador', prioridad:'Baja', traza:'basico', custom:[] });
        openModal();
        fldTitulo?.focus();
      });
    }
    if (grid){
      grid.addEventListener('click', (e)=>{
        const edit = e.target.closest('.js-edit');
        const dup = e.target.closest('.js-dup');
        const id = (edit||dup)?.getAttribute('data-id');
        if(!id) return;
        const row = rows.find(r => r.id === id);
        if(!row) return;
        if (edit){
          setFormFrom(row); openModal(); fldTitulo?.focus();
        } else if (dup){
          const copy = { ...row, id: `T-${Math.floor(Math.random()*9000)+1000}`, titulo: row.titulo + ' (Copia)' };
          rows.unshift(copy); renderCards();
        }
      });
    }
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e)=>{ if(e.target?.dataset?.close) closeModal(); });

    if (txtBuscar) txtBuscar.addEventListener('input', ()=>{ filter = txtBuscar.value.trim().toLowerCase(); renderCards(); });
    if (filTipo) filTipo.addEventListener('change', ()=>{ fTipo = filTipo.value; renderCards(); });
    if (filPrio) filPrio.addEventListener('change', ()=>{ fPrio = filPrio.value; renderCards(); });
    if (filEstado) filEstado.addEventListener('change', ()=>{ fEstado = filEstado.value; renderCards(); });
    if (filClear){
      filClear.addEventListener('click', ()=>{
        fTipo = fPrio = fEstado = filter = '';
        if (filTipo) filTipo.value = '';
        if (filPrio) filPrio.value = '';
        if (filEstado) filEstado.value = '';
        if (txtBuscar) txtBuscar.value = '';
        renderCards();
      });
    }

    if (selTraza) selTraza.addEventListener('change', ()=>{ handleCustomVisibility(); updateTrazaPreview(); });
    if (stepAdd){
      stepAdd.addEventListener('click', ()=>{
        const name = stepName.value.trim();
        const role = stepRole?.value || 'Coordinador';
        if(!name) return;
        addStep(name, role);
        stepName.value = '';
        updateTrazaPreview();
      });
    }
    if (form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = getForm();
        if(!data.titulo){ showStatus('El título es obligatorio', 'warn'); fldTitulo.focus(); return; }
        const idx = rows.findIndex(r => r.id === data.id);
        if(idx >= 0){ rows[idx] = data; } else { rows.unshift(data); }
        renderCards();
        closeModal();
      });
    }
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
  }
}
