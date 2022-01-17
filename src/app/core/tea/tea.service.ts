import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tea } from '@app/models';
import { environment } from '@env/environment';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TeaService {
  private images: Array<string> = ['green', 'black', 'herbal', 'oolong', 'dark', 'puer', 'white', 'yellow'];

  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<Tea>> {
    return this.http
      .get(`${environment.dataService}/tea-categories`)
      .pipe(map((teas: Array<any>) => teas.map((t) => this.convert(t))));
  }

  private convert(t: any): Tea {
    return {
      ...t,
      image: `assets/img/${this.images[t.id - 1]}.jpg`,
    };
  }
}
