export type PhoneType = 'Celular' | 'Residencial' | 'Comercial';

export interface Address {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneType: PhoneType;
  status: 'Ativo' | 'Inativo';
  address: Address;
}
