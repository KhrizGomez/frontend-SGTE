import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-estudiante-asistente',
  standalone: true,
  imports: [],
  templateUrl: './asistente.component.html',
  styleUrl: './asistente.component.css',
})
export class EstudianteAsistente implements AfterViewInit {

  ngAfterViewInit() {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatClear = document.getElementById('chat-clear');

    function appendUser(text: string){
      if(!chatWindow) return;
      const wrap = document.createElement('div');
      wrap.className = 'msg msg--user';
      wrap.innerHTML = `<div class="msg__avatar">Tú</div><div class="msg__bubble">${text}<div class="msg__meta">Ahora</div></div>`;
      chatWindow.appendChild(wrap);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function appendIA(text: string){
      if(!chatWindow) return;
      const wrap = document.createElement('div');
      wrap.className = 'msg msg--ia';
      wrap.innerHTML = `<div class="msg__avatar">IA</div><div class="msg__bubble">${text}<div class="msg__meta">Ahora</div></div>`;
      chatWindow.appendChild(wrap);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Autosize textarea
    function autosize(){
      if(!chatInput) return;
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
    }
    if(chatInput){ chatInput.addEventListener('input', autosize); setTimeout(autosize,0); }

    function send(){
      const text = (chatInput as HTMLTextAreaElement | null)?.value?.trim();
      if(!text) return;
      appendUser(text);
      if(chatInput) (chatInput as HTMLTextAreaElement).value='';
      autosize();

      // Indicador escribiendo…
      if(!chatWindow) return;
      const typing = document.createElement('div');
      typing.className = 'msg msg--ia';
      typing.innerHTML = '<div class="msg__avatar">IA</div><div class="msg__bubble">Escribiendo…</div>';
      chatWindow.appendChild(typing);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      // Respuesta demo
      setTimeout(() => {
        typing.remove();
        const lower = text.toLowerCase();
        let resp = 'Gracias por tu consulta. En breve agregaremos conexión con el backend.';
        if(lower.includes('certificado')){
          resp = 'Para solicitar un certificado académico: ingresa a Solicitudes > Certificados académicos, selecciona el tipo (notas, récord, constancia), adjunta requerimientos y envía. Tiempo estimado: 1-3 días hábiles.';
        } else if(lower.includes('homolog')){
          resp = 'Requisitos para homologación: sílabo de la asignatura, certificado de calificaciones, y solicitud firmada. Evaluación por coordinación ~ 7-15 días.';
        } else if(lower.includes('cuánto') || lower.includes('tiempo')){
          resp = 'El tiempo de procesamiento varía por trámite: certificados (1-3 días), homologación (7-15 días), validación de sílabos (3-5 días).';
        }
        appendIA(resp);
      }, 600);
    }

    if(chatSend){ chatSend.addEventListener('click', send); }
    if(chatInput){
      chatInput.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
      });
    }
    if(chatClear && chatWindow){ chatClear.addEventListener('click', ()=>{ chatWindow.innerHTML=''; }); }

    // Sugerencias
    document.querySelectorAll('.sugg').forEach(a => a.addEventListener('click', (e)=>{
      e.preventDefault();
      const q = a.getAttribute('data-q');
      if(q && chatInput){ (chatInput as HTMLTextAreaElement).value = q; send(); }
    }));
  }
}
