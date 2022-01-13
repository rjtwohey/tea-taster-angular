import { AuthState, reducer as authReducer } from './auth.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '@env/environment';

export interface State {
  auth: AuthState;
}

export const reducers: ActionReducerMap<State> = {
  auth: authReducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
