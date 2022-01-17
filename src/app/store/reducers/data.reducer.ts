import { createReducer, on } from '@ngrx/store';

import { Tea } from '@app/models';
import * as Actions from '@app/store/actions';

export interface DataState {
  teas: Array<Tea>;
  loading: boolean;
  errorMessage: string;
}

export const initialState: DataState = {
  teas: [],
  loading: false,
  errorMessage: '',
};

export const reducer = createReducer(
  initialState,
  on(
    Actions.loginSuccess,
    (state): DataState => ({
      ...state,
      errorMessage: '',
      loading: true,
    })
  ),
  on(
    Actions.sessionRestored,
    (state): DataState => ({
      ...state,
      errorMessage: '',
      loading: true,
    })
  ),
  on(
    Actions.initialLoadSuccess,
    (state, { teas }): DataState => ({
      ...state,
      loading: false,
      teas: [...teas],
    })
  ),
  on(
    Actions.initialLoadFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(
    Actions.logoutSuccess,
    (state): DataState => ({
      ...state,
      teas: [],
    })
  )
);
