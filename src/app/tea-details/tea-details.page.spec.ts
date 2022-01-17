import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { selectTea, selectTeas } from '@app/store';
import { DataState, initialState } from '@app/store/reducers/data.reducer';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createActivatedRouteMock, createNavControllerMock } from '@test/mocks';

import { TeaDetailsPage } from './tea-details.page';

describe('TeaDetailsPage', () => {
  let component: TeaDetailsPage;
  let fixture: ComponentFixture<TeaDetailsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeaDetailsPage],
        imports: [IonicModule.forRoot()],
        providers: [
          provideMockStore<{ data: DataState }>({
            initialState: { data: initialState },
          }),
          { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
          { provide: NavController, useFactory: createNavControllerMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TeaDetailsPage);
      component = fixture.componentInstance;
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    let store: MockStore;
    beforeEach(() => {
      const route = TestBed.inject(ActivatedRoute);
      (route.snapshot.paramMap.get as any).withArgs('id').and.returnValue('7');
      store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectTeas, [
        {
          id: 7,
          name: 'White',
          description: 'Often looks like frosty silver pine needles',
          image: 'imgs/white.png',
        },
        {
          id: 42,
          name: 'Green',
          description: 'Delecate flavor',
          image: 'imgs/green.png',
        },
      ]);
    });

    it('binds the name', () => {
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[data-testid="name"]'));
      expect(el.nativeElement.textContent.trim()).toBe('White');
    });

    it('binds the description', () => {
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[data-testid="description"]'));
      expect(el.nativeElement.textContent.trim()).toBe('Often looks like frosty silver pine needles');
    });
  });
});
