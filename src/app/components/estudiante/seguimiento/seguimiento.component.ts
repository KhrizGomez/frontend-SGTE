import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-estudiante-seguimiento',
  standalone: true,
  imports: [],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css',
})
export class EstudianteSeguimiento implements AfterViewInit {

  ngAfterViewInit() {
    const stSegGrid = document.getElementById('seg-list');
    const stSegQ = document.getElementById('seg-q') as HTMLInputElement | null;
    const stSegEmpty = document.getElementById('seg-empty');
    const stSegDetail = document.getElementById('seg-detail');
    const stSegId = document.getElementById('seg-det-id');
    const stSegTitle = document.getElementById('seg-title');
    const stSegTipo = document.getElementById('seg-tipo');
    const stSegPrio = document.getElementById('seg-prio');
    const stSegEstado = document.getElementById('seg-estado');
    const stSegCreado = document.getElementById('seg-creado');
    const stSegActual = document.getElementById('seg-actual');
    const stSegFiles = document.getElementById('seg-files');
    const stSegTl = document.getElementById('seg-tl');

    // File preview modal
    const stFileModal = document.getElementById('st-file-modal');
    const stFileClose = document.getElementById('st-file-close');
    const stFileMeta = document.getElementById('st-file-meta');
    const stFilePreview = document.getElementById('st-file-preview');
    const stFileDl = document.getElementById('st-file-dl');
    let stFileCtx: {id: string | null, file: any} = { id:null, file:null };

    function stOpenFileModal(id: string, file: any){
      stFileCtx = { id, file };
      if(stFileMeta) stFileMeta.textContent = `${file.name}${file.size? ' · '+file.size:''}`;
      if(stFilePreview) stFilePreview.textContent = 'No hay vista previa disponible para este archivo.';
      if(stFileModal) stFileModal.hidden = false;
    }
    function stCloseFileModal(){ stFileCtx = { id:null, file:null }; if(stFileModal) stFileModal.hidden = true; }
    function stDownloadFile(id: string, file: any){
      const blob = new Blob([`Contenido simulado para ${file.name} del caso ${id}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
    }
    if(stFileClose){ stFileClose.addEventListener('click', stCloseFileModal); }
    if(stFileModal){ stFileModal.addEventListener('click', (e)=>{ if((e.target as HTMLElement)?.dataset?.['close']) stCloseFileModal(); }); }
    if(stFileDl){ stFileDl.addEventListener('click', ()=>{ if(stFileCtx.file) stDownloadFile(stFileCtx.id!, stFileCtx.file); }); }

    let stSegRows = [
      { id: 'C-2101', titulo: 'Cambio de carrera - Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'Etapa 2/5', fecha:'2025-09-25', creado:'2025-09-10', actual:'2025-09-18', files:[{name:'carta.pdf', size:'120KB'}], tl:[
        {name:'Solicitud recibida', meta:'2025-09-10 · 09:44', desc:'Tu solicitud fue registrada en el sistema.', state:'done'},
        {name:'Revisión de documentos', meta:'2025-09-12 · 13:02', desc:'Se revisó la documentación.', state:'done'},
        {name:'Enviado a coordinación', meta:'2025-09-17 · 10:21', desc:'En evaluación por coordinación.', state:'current'},
        {name:'Resolución final', meta:'Pendiente', desc:'A la espera de resolución.', state:'pending'}
      ]},
      { id: 'C-2102', titulo: 'Homologación de materias - María López', tipo:'Homologación', prioridad:'Urgente', estado:'Etapa 3/5', fecha:'2025-09-27', creado:'2025-09-08', actual:'2025-09-19', files:[], tl:[
        {name:'Solicitud recibida', meta:'2025-09-08 · 10:00', state:'done'},
        {name:'Revisión de documentos', meta:'2025-09-09 · 15:10', state:'done'},
        {name:'Enviado a coordinación', meta:'2025-09-12 · 12:20', state:'current'},
        {name:'Resolución final', meta:'Pendiente', state:'pending'}
      ]},
      { id: 'C-2103', titulo: 'Certificado de matrícula - Carlos Ruiz', tipo:'Certificados académicos', prioridad:'Media', estado:'Etapa 2/5', fecha:'2025-09-22', creado:'2025-09-05', actual:'2025-09-15', files:[{name:'solicitud.pdf', size:'90KB'}], tl:[
        {name:'Solicitud recibida', meta:'2025-09-05 · 09:44', state:'done'},
        {name:'Revisión de documentos', meta:'2025-09-06 · 13:02', state:'current'},
        {name:'Emisión de certificado', meta:'Pendiente', state:'pending'}
      ]}
    ];

    let stSegFilter = '';
    function stRenderSegList(){
      if(!stSegGrid) return;
      stSegGrid.innerHTML = '';
      stSegRows
        .filter(r => !stSegFilter || JSON.stringify(r).toLowerCase().includes(stSegFilter))
        .forEach(r => {
          const li = document.createElement('li');
          li.className = 'seg-item';
          li.dataset['id'] = r.id;
          li.innerHTML = `
            <div class="seg-it-row"><span class="seg-it-id">${r.id}</span> <span class="seg-it-title">${r.titulo}</span></div>
            <div class="seg-it-sub">${r.tipo} · ${r.prioridad} · ${r.estado}${r.fecha? ' · vence '+r.fecha: ''}</div>
          `;
          stSegGrid.appendChild(li);
        });
      const first = stSegGrid.querySelector('.seg-item') as HTMLElement | null;
      if(first){ first.click(); }
    }

    function stRenderSegDetail(row: any){
      if(!row || !stSegDetail || !stSegEmpty) return;
      stSegEmpty.hidden = true; stSegDetail.hidden = false;
      if (stSegId) stSegId.textContent = row.id;
      if (stSegTitle) stSegTitle.textContent = row.titulo;
      if (stSegTipo) stSegTipo.textContent = row.tipo;
      if (stSegPrio) stSegPrio.textContent = row.prioridad;
      if (stSegEstado) stSegEstado.textContent = row.estado;
      if (stSegCreado) stSegCreado.textContent = row.creado || '—';
      if (stSegActual) stSegActual.textContent = row.actual || '—';
      // archivos
      if (stSegFiles) {
        stSegFiles.innerHTML = '';
        (row.files||[]).forEach((f: any)=>{
          const li = document.createElement('li');
          li.innerHTML = `<span class="file-ico">📎</span><span class="file-name">${f.name}</span><span class="file-size">${f.size||''}</span><span class="file-actions"><button class="btn-ghost btn-small js-view" type="button">Ver</button><button class="btn-primary btn-small js-dl" type="button">Descargar</button></span>`;
          li.addEventListener('click', (ev)=>{
            const t = ev.target as HTMLElement;
            if(t.classList.contains('js-view')){ stOpenFileModal(row.id, f); }
            else if(t.classList.contains('js-dl')){ stDownloadFile(row.id, f); }
          });
          stSegFiles!.appendChild(li);
        });
      }
      // trazabilidad
      if (stSegTl) {
        stSegTl.innerHTML = '';
        (row.tl||[]).forEach((step: any)=>{
          const li = document.createElement('li');
          li.className = `tl-item ${step.state||''}`;
          li.innerHTML = `
            <div class="tl-dot">${step.state==='done'?'✔':step.state==='current'?'⌛':'•'}</div>
            <div class="tl-body">
              <div class="tl-title">${step.name||'—'}</div>
              <div class="tl-meta">${step.meta||''}</div>
              ${step.desc? `<div class="tl-desc">${step.desc}</div>`:''}
            </div>`;
          stSegTl!.appendChild(li);
        });
      }
    }

    if(stSegGrid){
      stRenderSegList();
      stSegGrid.addEventListener('click', (e)=>{
        const it = (e.target as HTMLElement)?.closest('.seg-item') as HTMLElement | null;
        if(!it) return;
        stSegGrid.querySelectorAll('.seg-item').forEach(x=>x.classList.remove('active'));
        it.classList.add('active');
        const row = stSegRows.find(r => r.id === it.dataset['id']);
        stRenderSegDetail(row!);
      });
    }

    if(stSegQ){
      stSegQ.addEventListener('input', () => {
        stSegFilter = (stSegQ.value||'').toLowerCase().trim();
        stRenderSegList();
      });
    }
  }
}
