import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EMPTY } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { User } from '@desafio-attus/data-access-users';

import { UserDialogComponent, UserDialogData, UserDialogResult } from './user-dialog.component';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Rafael Mendes',
  email: 'rafael.mendes@email.com',
  cpf: '111.444.777-35',
  phone: '(51) 90000-1111',
  phoneType: 'Residencial',
  status: 'Inativo',
  address: {
    cep: '90010-150',
    street: 'Rua dos Andradas',
    number: '990',
    neighborhood: 'Centro Historico',
    city: 'Porto Alegre',
    state: 'RS',
    complement: 'fundos'
  },
  ...overrides
});

describe('UserDialogComponent', () => {
  let fixture: ComponentFixture<UserDialogComponent>;
  let component: UserDialogComponent;
  let dialogRefMock: {
    close: ReturnType<typeof vi.fn>;
    backdropClick: () => typeof EMPTY;
    keydownEvents: () => typeof EMPTY;
    disableClose: boolean;
  };
  let httpMock: HttpTestingController;

  const setup = (data: UserDialogData = {}): void => {
    TestBed.resetTestingModule();

    dialogRefMock = {
      close: vi.fn(),
      backdropClick: () => EMPTY,
      keydownEvents: () => EMPTY,
      disableClose: false
    };

    TestBed.configureTestingModule({
      imports: [UserDialogComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock as Partial<MatDialogRef<UserDialogComponent, UserDialogResult>>
        }
      ]
    });

    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  };

  afterEach(() => {
    httpMock?.verify();
  });

  it('should populate the form when editing a user', () => {
    setup({ user: buildUser() });

    expect(component.personalGroup.controls.name.value).toBe('Rafael Mendes');
    expect(component.contactGroup.controls.phoneType.value).toBe('Residencial');
    expect(component.addressGroup.controls.city.value).toBe('Porto Alegre');
    expect(dialogRefMock.disableClose).toBe(true);
  });

  it('should close with a new user payload when the form is valid', () => {
    setup();

    component.personalGroup.setValue({
      name: 'Marina Costa',
      email: 'marina@email.com',
      cpf: '529.982.247-25',
      status: 'Ativo'
    });
    component.contactGroup.setValue({
      phone: '(11) 91234-5678',
      phoneType: 'Celular'
    });
    component.addressGroup.setValue({
      cep: '01001-000',
      street: 'Praca da Se',
      number: '100',
      neighborhood: 'Se',
      city: 'Sao Paulo',
      state: 'sp',
      complement: 'lado impar'
    });

    component.save();

    expect(dialogRefMock.close).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'create',
        user: expect.objectContaining({
          name: 'Marina Costa',
          address: expect.objectContaining({
            state: 'SP'
          })
        })
      })
    );
  });

  it('should ask for confirmation before closing dirty changes', () => {
    setup({ user: buildUser() });
    component.personalGroup.controls.name.setValue('Rafael Alterado');
    component.form.markAsDirty();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.cancel();

    expect(confirmSpy).toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should format cpf, phone and cep inputs', () => {
    setup();

    component.onCpfInput({ target: { value: '11144477735' } } as unknown as Event);
    component.onPhoneInput({ target: { value: '51900001111' } } as unknown as Event);
    component.onCepInput({ target: { value: '01001000' } } as unknown as Event);

    expect(component.personalGroup.controls.cpf.value).toBe('111.444.777-35');
    expect(component.contactGroup.controls.phone.value).toBe('(51) 90000-1111');
    expect(component.addressGroup.controls.cep.value).toBe('01001-000');
  });

  it('should auto-fill address fields from ViaCEP', () => {
    setup();
    vi.useFakeTimers();

    component.addressGroup.controls.cep.setValue('01001-000');
    vi.advanceTimersByTime(300);

    const request = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
    request.flush({
      cep: '01001-000',
      logradouro: 'Praca da Se',
      complemento: 'lado impar',
      bairro: 'Se',
      localidade: 'Sao Paulo',
      uf: 'SP'
    });

    expect(component.addressGroup.controls.street.value).toBe('Praca da Se');
    expect(component.addressGroup.controls.city.value).toBe('Sao Paulo');
    expect(component.cepFeedback()).toContain('Endereco preenchido automaticamente');
    vi.useRealTimers();
  });

  it('should flag an error when ViaCEP returns an unknown cep', () => {
    setup();
    vi.useFakeTimers();

    component.addressGroup.controls.cep.setValue('99999-999');
    vi.advanceTimersByTime(300);

    const request = httpMock.expectOne('https://viacep.com.br/ws/99999999/json/');
    request.flush({ erro: true });

    expect(component.addressGroup.controls.cep.hasError('cepNotFound')).toBe(true);
    expect(component.addressGroup.controls.street.value).toBe('');
    vi.useRealTimers();
  });
});
