import { Injectable } from '@angular/core';
import { Observable, forkJoin, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  /**
   * Garantiza que el observable no resuelva antes de `minMs` ms.
   * Úsalo para evitar el flash brusco cuando la petición es muy rápida.
   */
  withMinDuration<T>(source$: Observable<T>, minMs = 1000): Observable<T> {
    return forkJoin([source$, timer(minMs)]).pipe(map(([result]) => result));
  }
}
