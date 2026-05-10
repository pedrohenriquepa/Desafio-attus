import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, Inject, inject, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, map, switchMap, tap } from 'rxjs';

import { Address, PhoneType, User, ViaCepService } from '@desafio-attus/data-access-users';
import { cepValidator, cpfValidator, emailValidator, phoneValidator } from './user-form.validators';

export interface UserDialogData {
  user?: User;
}

export interface UserDialogResult {
  mode: 'create' | 'edit';
  user: User;
}

type PersonalForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  cpf: FormControl<string>;
  status: FormControl<User['status']>;
};

type ContactForm = {
  phone: FormControl<string>;
  phoneType: FormControl<PhoneType>;
};

type AddressForm = {
  cep: FormControl<string>;
  street: FormControl<string>;
  number: FormControl<string>;
  neighborhood: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  complement: FormControl<string>;
};

type UserForm = {
  personal: FormGroup<PersonalForm>;
  contact: FormGroup<ContactForm>;
  address: FormGroup<AddressForm>;
};

@Component({
  selector: 'feature-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatIconModule,
    NgFor,
    NgIf
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly viaCepService = inject(ViaCepService);

  readonly form: FormGroup<UserForm>;
  readonly isEditMode: boolean;
  readonly isCepLoading = signal(false);
  readonly cepFeedback = signal<string | null>(null);

  readonly phoneTypes: PhoneType[] = ['Celular', 'Residencial', 'Comercial'];
  readonly statusOptions: User['status'][] = ['Ativo', 'Inativo'];

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly dialogRef: MatDialogRef<UserDialogComponent, UserDialogResult>,
    @Inject(MAT_DIALOG_DATA) private readonly data: UserDialogData
  ) {
    this.isEditMode = !!data?.user;

    this.form = this.fb.group({
      personal: this.fb.group({
        name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
        email: this.fb.control('', [Validators.required, emailValidator]),
        cpf: this.fb.control('', [Validators.required, cpfValidator]),
        status: this.fb.control('Ativo' as User['status'])
      }),
      contact: this.fb.group({
        phone: this.fb.control('', [Validators.required, phoneValidator]),
        phoneType: this.fb.control('Celular' as PhoneType, Validators.required)
      }),
      address: this.fb.group({
        cep: this.fb.control('', [Validators.required, cepValidator]),
        street: this.fb.control('', [Validators.required, Validators.minLength(3)]),
        number: this.fb.control('', [Validators.required]),
        neighborhood: this.fb.control('', [Validators.required, Validators.minLength(2)]),
        city: this.fb.control('', [Validators.required, Validators.minLength(2)]),
        state: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
        complement: this.fb.control('')
      })
    });

    if (data?.user) {
      this.form.patchValue({
        personal: {
          name: data.user.name,
          email: data.user.email,
          cpf: data.user.cpf,
          status: data.user.status
        },
        contact: {
          phone: data.user.phone,
          phoneType: data.user.phoneType
        },
        address: {
          cep: data.user.address.cep,
          street: data.user.address.street,
          number: data.user.address.number,
          neighborhood: data.user.address.neighborhood,
          city: data.user.address.city,
          state: data.user.address.state,
          complement: data.user.address.complement
        }
      });
      this.form.markAsPristine();
    }

    this.setupCepLookup();

    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryClose());

    this.dialogRef.keydownEvents()
      .pipe(
        filter((event) => event.key === 'Escape'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.tryClose());
  }

  get personalGroup(): FormGroup<PersonalForm> {
    return this.form.get('personal') as FormGroup<PersonalForm>;
  }

  get contactGroup(): FormGroup<ContactForm> {
    return this.form.get('contact') as FormGroup<ContactForm>;
  }

  get addressGroup(): FormGroup<AddressForm> {
    return this.form.get('address') as FormGroup<AddressForm>;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: UserDialogResult = {
      mode: this.isEditMode ? 'edit' : 'create',
      user: this.buildUser()
    };

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.tryClose();
  }

  onCpfInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.personalGroup.get('cpf')?.setValue(this.formatCpf(value), { emitEvent: false });
  }

  onPhoneInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.contactGroup.get('phone')?.setValue(this.formatPhone(value), { emitEvent: false });
  }

  onCepInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.addressGroup.controls.cep.setValue(this.formatCep(value), { emitEvent: true });
  }

  private tryClose(): void {
    if (this.form.dirty) {
      const confirmed = window.confirm('Ha alteracoes nao salvas. Deseja sair?');
      if (!confirmed) {
        return;
      }
    }

    this.dialogRef.close();
  }

  private buildUser(): User {
    const personal = this.personalGroup.getRawValue();
    const contact = this.contactGroup.getRawValue();
    const address = this.addressGroup.getRawValue();

    return {
      id: this.data?.user?.id ?? this.createId(),
      name: personal.name.trim(),
      email: personal.email.trim(),
      cpf: personal.cpf,
      status: personal.status,
      phone: contact.phone,
      phoneType: contact.phoneType,
      address: {
        cep: address.cep,
        street: address.street.trim(),
        number: address.number.trim(),
        neighborhood: address.neighborhood.trim(),
        city: address.city.trim(),
        state: address.state.trim().toUpperCase(),
        complement: address.complement.trim()
      }
    };
  }

  private setupCepLookup(): void {
    const cepControl = this.addressGroup.controls.cep;

    cepControl.valueChanges
      .pipe(
        map((value) => value.replace(/\D/g, '')),
        distinctUntilChanged(),
        debounceTime(300),
        tap((digits) => {
          if (digits.length < 8) {
            this.isCepLoading.set(false);
            this.cepFeedback.set(null);
            this.clearControlError(cepControl, 'cepNotFound');
            this.clearAutofillAddress();
          }
        }),
        filter((digits) => digits.length === 8),
        filter(() => !cepControl.hasError('cep')),
        tap(() => {
          this.isCepLoading.set(true);
          this.cepFeedback.set('Consultando CEP...');
          this.clearControlError(cepControl, 'cepNotFound');
        }),
        switchMap((digits) =>
          this.viaCepService.lookupCep(digits).pipe(
            tap((address) => this.applyCepAddress(address)),
            catchError(() => {
              this.clearAutofillAddress();
              this.setControlError(cepControl, 'cepNotFound');
              this.cepFeedback.set('CEP nao encontrado. Confira os 8 digitos informados.');
              return EMPTY;
            }),
            finalize(() => this.isCepLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private applyCepAddress(address: Omit<Address, 'number'>): void {
    this.addressGroup.patchValue(
      {
        cep: address.cep,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        complement: address.complement
      },
      { emitEvent: false }
    );
    this.clearControlError(this.addressGroup.controls.cep, 'cepNotFound');
    this.cepFeedback.set('Endereco preenchido automaticamente pelo ViaCEP.');
  }

  private clearAutofillAddress(): void {
    this.addressGroup.patchValue(
      {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: ''
      },
      { emitEvent: false }
    );
  }

  private setControlError(control: FormControl<string>, errorKey: string): void {
    control.setErrors({ ...(control.errors ?? {}), [errorKey]: true });
  }

  private clearControlError(control: FormControl<string>, errorKey: string): void {
    const errors = { ...(control.errors ?? {}) };
    delete errors[errorKey];
    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  private createId(): string {
    return `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);

    if (digits.length <= 3) {
      return part1;
    }

    if (digits.length <= 6) {
      return `${part1}.${part2}`;
    }

    if (digits.length <= 9) {
      return `${part1}.${part2}.${part3}`;
    }

    return `${part1}.${part2}.${part3}-${part4}`;
  }

  private formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const ddd = digits.slice(0, 2);
    const middle = digits.slice(2, 7);
    const last = digits.slice(7, 11);

    if (digits.length <= 2) {
      return ddd ? `(${ddd}` : '';
    }

    if (digits.length <= 7) {
      return `(${ddd}) ${middle}`;
    }

    return `(${ddd}) ${middle}-${last}`;
  }

  private formatCep(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const prefix = digits.slice(0, 5);
    const suffix = digits.slice(5, 8);

    if (digits.length <= 5) {
      return prefix;
    }

    return `${prefix}-${suffix}`;
  }
}
