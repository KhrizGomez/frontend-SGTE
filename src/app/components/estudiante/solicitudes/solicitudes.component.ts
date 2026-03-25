import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-estudiante-solicitudes',
  standalone: true,
  imports: [],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css',
})
export class EstudianteSolicitudes implements AfterViewInit {

  ngAfterViewInit() {
    // Get form elements
    const sgrid = document.getElementById('st-sgrid');
    const stBuscar = document.getElementById('st-buscar') as HTMLInputElement | null;
    const stFilTipo = document.getElementById('st-fil-tipo') as HTMLSelectElement | null;
    const stFilPrio = document.getElementById('st-fil-prio') as HTMLSelectElement | null;
    const stFilEstado = document.getElementById('st-fil-estado') as HTMLSelectElement | null;
    const stFilClear = document.getElementById('st-fil-clear') as HTMLButtonElement | null;

    const stModal = document.getElementById('st-modal');
    const stClose = document.getElementById('st-close');
    const stForm = document.getElementById('st-form') as HTMLFormElement | null;
    const stId = document.getElementById('st-id') as HTMLInputElement | null;
    const stTramite = document.getElementById('st-tramite') as HTMLInputElement | null;
    const stCertWrap = document.getElementById('st-cert-wrap');
    const stCertTipo = document.getElementById('st-cert-tipo') as HTMLSelectElement | null;
    const stEta = document.getElementById('st-eta') as HTMLInputElement | null;
    const stReqs = document.getElementById('st-reqs');
    const stExtra = document.getElementById('st-extra');
    const stObsWrap = document.getElementById('st-obs-wrap');
    const stObs = document.getElementById('st-obs') as HTMLTextAreaElement | null;
    const stDropzone = document.getElementById('st-dropzone');
    const stFileInput = document.getElementById('st-file-input') as HTMLInputElement | null;
    const stDzList = document.getElementById('st-dz-list');
    const stCancel = document.getElementById('st-cancel');

    let stFilter = '';
    let stTipo = '';
    let stPrio = '';
    let stEstado = '';

    // Catálogo de trámites (demo)
    const catalogo = [
      { id:'S-2001', icon:'✈️', titulo:'Certificados académicos', desc:'Notas, récord y constancias', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Cédula o pasaporte','Matrícula vigente','Comprobante de pago'] },
      { id:'S-2002', icon:'📜', titulo:'Homologación de materias', desc:'Evalúa asignaturas cursadas', tipo:'Homologación', prioridad:'Alta', estado:'Requiere revisión', eta:'7-15 días hábiles', reqs:['Solicitud de homologación firmada','Sílabo de asignatura','Certificado de calificaciones'] },
      { id:'S-2003', icon:'🔄', titulo:'Cambio de carrera', desc:'Traslado a otra carrera', tipo:'Cambio de carrera', prioridad:'Alta', estado:'Disponible', eta:'10-20 días hábiles', reqs:['Carta de solicitud','Motivación del cambio','Historial académico'] },
      { id:'S-2004', icon:'🔁', titulo:'Cambio de paralelo', desc:'Cambia tu horario o grupo', tipo:'Otro', prioridad:'Baja', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Carta de solicitud','Justificación del cambio'] },
      { id:'S-2005', icon:'🪪', titulo:'Carné estudiantil', desc:'Genera o renueva tu carné', tipo:'Otro', prioridad:'Baja', estado:'Disponible', eta:'1-5 días hábiles', reqs:['Foto actualizada','Documento de identidad'] },
      { id:'S-2006', icon:'👷‍🎓', titulo:'Aval de prácticas', desc:'Aprobación de prácticas', tipo:'Otro', prioridad:'Media', estado:'Disponible', eta:'5-10 días hábiles', reqs:['Carta de la empresa','Plan de prácticas'] },
      { id:'S-2007', icon:'📨', titulo:'Reactivación de matrícula', desc:'Reingreso tras suspensión', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión', eta:'3-7 días hábiles', reqs:['Solicitud de reactivación','Justificación'] },
      { id:'S-2008', icon:'🧮', titulo:'Corrección de notas', desc:'Rectifica calificaciones', tipo:'Otro', prioridad:'Urgente', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Evidencia de evaluación','Formulario de corrección'] },
      { id:'S-2009', icon:'🎓', titulo:'Solicitud de titulación', desc:'Proceso de titulación', tipo:'Otro', prioridad:'Alta', estado:'Disponible', eta:'15-30 días hábiles', reqs:['Solicitud de titulación','Cumplimiento de requisitos previos'] },
      { id:'S-2010', icon:'👨‍🏫', titulo:'Validación de sílabo', desc:'Verifica contenidos', tipo:'Otro', prioridad:'Media', estado:'Requiere revisión', eta:'3-5 días hábiles', reqs:['Sílabo','Solicitud de validación'] },
      { id:'S-2011', icon:'💳', titulo:'Solicitud de beca', desc:'Aplica a becas y ayudas', tipo:'Otro', prioridad:'Alta', estado:'Disponible', eta:'10-20 días hábiles', reqs:['Formulario de beca','Soporte socioeconómico'] },
      { id:'S-2012', icon:'📝', titulo:'Certificado de conducta', desc:'Emisión de conducta', tipo:'Certificados académicos', prioridad:'Media', estado:'Disponible', eta:'1-3 días hábiles', reqs:['Documento de identidad'] },
    ];

    function renderStudentCards(){
      if(!sgrid) return;
      sgrid.innerHTML = '';
      catalogo
        .filter(r => {
          const tOk = !stTipo || r.tipo === stTipo;
          const pOk = !stPrio || r.prioridad === stPrio;
          const eOk = !stEstado || r.estado === stEstado;
          const sOk = !stFilter || `${r.titulo} ${r.tipo} ${r.desc}`.toLowerCase().includes(stFilter);
          return tOk && pOk && eOk && sOk;
        })
        .forEach(r => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'soli-card';
          card.dataset['id'] = r.id;
          card.innerHTML = `
            <span class="soli-ico" aria-hidden="true">${r.icon}</span>
            <span class="soli-txt">
              <span class="soli-title">${r.titulo}</span>
              <span class="soli-desc">${r.desc}</span>
            </span>`;
          sgrid.appendChild(card);
        });
    }
    renderStudentCards();

    // Form schemas
    const formSchemas: {[key: string]: any} = {
      'Certificados académicos': {
        showCert: true,
        showObs: false,
        showAttach: true,
        extra: [],
        cert: { showTipo: true }
      },
      'Homologación': {
        showCert: false,
        showObs: true,
        showAttach: true,
        extra: [
          { kind:'text', id:'st-helasanig', label:'Asignatura a homologar', placeholder:'Nombre de la asignatura' },
          { kind:'text', id:'st-helasanig-univ', label:'Institución de procedencia', placeholder:'Universidad/Instituto' }
        ]
      },
      'Cambio de carrera': {
        showCert: false,
        showObs: true,
        showAttach: true,
        extra: [
          { kind:'select', id:'st-carr-nueva', label:'Carrera destino', options:['Ingeniería de Software','Ingeniería Industrial','Administración','Contabilidad'] },
          { kind:'select', id:'st-carr-motivo', label:'Motivo', options:['Interés vocacional','Cambio de horario','Desempeño académico','Otros'] }
        ]
      },
      'Otro': {
        showCert: false,
        showObs: true,
        showAttach: true,
        extra: []
      }
    };

    const idOverrides: {[key: string]: any} = {
      'S-2004': { showObs:false },
      'S-2005': { showObs:false },
      'S-2007': { showObs:false },
      'S-2008': { showObs:false },
      'S-2009': { showObs:false },
      'S-2010': { showObs:false },
      'S-2011': { showObs:false },
      'S-2012': { showObs:false },
    };

    function getSchemaFor(item: any){
      const base = formSchemas[item?.tipo] || formSchemas['Otro'];
      const ov = idOverrides[item?.id] || {};
      const hasReqs = Array.isArray(item?.reqs) && item.reqs.length > 0;
      return {
        ...base,
        ...ov,
        showAttach: ov.showAttach ?? base.showAttach ?? hasReqs,
        cert: { ...(base.cert||{}), ...(ov.cert||{}) }
      };
    }

    function renderExtraFields(schema: any){
      if(!stExtra) return;
      stExtra.innerHTML = '';
      (schema.extra||[]).forEach((f: any) => {
        const wrap = document.createElement('div');
        wrap.className = 'field';
        if(f.kind === 'text'){
          wrap.innerHTML = `<span class="label">${f.label}</span><input id="${f.id}" class="select" placeholder="${f.placeholder||''}" />`;
        } else if (f.kind === 'select'){
          const opts = (f.options||[]).map((o: string) => `<option>${o}</option>`).join('');
          wrap.innerHTML = `<span class="label">${f.label}</span><select id="${f.id}" class="select">${opts}</select>`;
        } else if (f.kind === 'textarea'){
          wrap.innerHTML = `<span class="label">${f.label}</span><textarea id="${f.id}" class="textarea" placeholder="${f.placeholder||''}"></textarea>`;
        }
        stExtra.appendChild(wrap);
      });
      stExtra.hidden = (schema.extra||[]).length === 0;
    }

    // Filters
    if (stBuscar){ stBuscar.addEventListener('input', ()=>{ stFilter = stBuscar.value.trim().toLowerCase(); renderStudentCards(); }); }
    if (stFilTipo){ stFilTipo.addEventListener('change', ()=>{ stTipo = stFilTipo.value; renderStudentCards(); }); }
    if (stFilPrio){ stFilPrio.addEventListener('change', ()=>{ stPrio = stFilPrio.value; renderStudentCards(); }); }
    if (stFilEstado){ stFilEstado.addEventListener('change', ()=>{ stEstado = stFilEstado.value; renderStudentCards(); }); }
    if (stFilClear){ stFilClear.addEventListener('click', ()=>{
      stFilter = stTipo = stPrio = stEstado = '';
      if (stBuscar) stBuscar.value = '';
      if (stFilTipo) stFilTipo.value = '';
      if (stFilPrio) stFilPrio.value = '';
      if (stFilEstado) stFilEstado.value = '';
      renderStudentCards();
    }); }

    // Open modal on card click
    function openStModal(){ if(stModal) stModal.hidden = false; }
    function closeStModal(){ if(stModal) stModal.hidden = true; }

    if (sgrid){
      sgrid.addEventListener('click', (e)=>{
        const btn = (e.target as HTMLElement)?.closest('.soli-card') as HTMLElement | null;
        if(!btn) return;
        const id = btn.dataset['id'];
        const item = catalogo.find(x => x.id === id);
        if(!item) return;
        stId!.value = item.id;
        stTramite!.value = item.titulo;
        stObs!.value = '';
        stEta!.value = item.eta || '—';

        // Requisitos
        if(stReqs){
          stReqs.innerHTML = '';
          (item.reqs||[]).forEach(r => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="file-ico">📌</span><span class="file-name">${r}</span>`;
            stReqs.appendChild(li);
          });
        }

        // Schema-based fields
        const schema = getSchemaFor(item);
        const isCert = !!schema.showCert && item.tipo === 'Certificados académicos';
        stCertWrap!.hidden = !isCert;
        if(isCert){ stCertTipo!.value = 'Seleccione una opción'; }

        renderExtraFields(schema);

        // Observaciones / Adjuntos
        if(stObsWrap){ stObsWrap.hidden = schema.showObs === false; }
        if(stDzList) stDzList.innerHTML = '';

        openStModal();
      });
    }

    if (stClose){ stClose.addEventListener('click', closeStModal); }
    if (stModal){ stModal.addEventListener('click', (e)=>{ if((e.target as HTMLElement)?.dataset?.['close']) closeStModal(); }); }
    if (stCancel){ stCancel.addEventListener('click', closeStModal); }

    // Dropzone
    if (stDropzone && stFileInput && stDzList){
      stDropzone.addEventListener('click', () => stFileInput.click());
      stDropzone.addEventListener('dragover', (e) => { e.preventDefault(); stDropzone.classList.add('is-over'); });
      stDropzone.addEventListener('dragleave', () => stDropzone.classList.remove('is-over'));
      stDropzone.addEventListener('drop', (e) => {
        e.preventDefault(); stDropzone.classList.remove('is-over');
        stHandleFiles((e.dataTransfer as DataTransfer).files);
      });
      stFileInput.addEventListener('change', () => {
        if (stFileInput.files) stHandleFiles(stFileInput.files);
      });

      function stHandleFiles(files: FileList){
        Array.from(files).forEach(f => {
          const item = document.createElement('div');
          item.className = 'dz-item';
          item.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
          stDzList!.appendChild(item);
        });
        stFileInput!.value = '';
      }
    }

    if (stForm){
      stForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const id = stId!.value;
        const tramite = stTramite!.value;
        alert(`Solicitud enviada: ${tramite} (Ref: ${id})`);
        closeStModal();
      });
    }
  }
}
