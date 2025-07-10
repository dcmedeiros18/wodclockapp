import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WodService {

  // Dados simulados - depois você vai substituir por chamada ao backend
  private mockWods: { [date: string]: { title: string, description: string } } = {
    '2025-07-04': {
      title: 'AMRAP 12 minutes',
      description: '6 Power Clean <br> 12 Wall Balls <br> 18 Reverse Lunge'
    },
    '2025-07-05': {
      title: 'For Time',
      description: '21-15-9 Thrusters and Pull-ups'
    }
  };

  constructor() { }

  /**
   * Retorna o WOD para a data informada.
   * 📌 No futuro, substitua pelo HTTP GET ao backend.
   * Exemplo:
   * return this.http.get<{title: string, description: string}>(`/api/wods/${date}`);
   */
  getWod(date: string): Observable<{ title: string, description: string } | null> {
    const wod = this.mockWods[date] || null;
    return of(wod);  // Simulando um retorno como se viesse do backend
  }

  deleteWod(date: string): Observable<boolean> {
    if (this.mockWods[date]) {
      delete this.mockWods[date];
      return of(true); // sucesso
    }
    return of(false); // não havia WOD na data
  }
  
}
