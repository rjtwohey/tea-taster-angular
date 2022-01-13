import { Component, OnInit } from '@angular/core';
import { selectAuthErrorMessage } from '@app/store';
import { login } from '@app/store/actions';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;

  errorMessage$: Observable<string>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.errorMessage$ = this.store.select(selectAuthErrorMessage);
  }

  signIn() {
    this.store.dispatch(login({ email: this.email, password: this.password }));
  }
}
