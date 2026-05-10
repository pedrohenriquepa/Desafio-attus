# Desafio Attus

Projeto Angular 17+ com Nx monorepo, NgRx e Angular Material. A aplicacao lista usuarios, permite filtro com debounce, paginacao e cadastro/edicao via modal com validacoes completas (CPF, email e telefone).

📄 Respostas das questões teóricas (1, 2 e 3): as respostas estão disponíveis para visualização neste link do Google Drive:
https://drive.google.com/drive/folders/1rx-tlBFIg_r04xljtlR1IHOnCvqGk2sP?usp=drive_link

## Funcionalidades
- Listagem de usuarios com cards, avatar por iniciais e chip de status
- Filtro por nome com debounce de 300ms
- Paginacao com 5, 10 e 20 itens
- Modal de cadastro/edicao com stepper e validacoes
- Estados de loading, erro e empty state
- Feedback visual com snackbar

## Pre-requisitos
- Node.js 18+
- Angular CLI
- Nx CLI

## Instalacao
```bash
npm install
```

## Como rodar
```bash
npx nx serve desafio-attus
```

## Como rodar os testes
```bash
npx nx test feature-users
npx nx test data-access-users
```

## Como rodar todos os testes
```bash
npx nx run-many --target=test
```

## Estrutura do monorepo
```
apps/
  desafio-attus/        # Shell e roteamento
libs/
  feature-users/        # Listagem e modal (smart components)
  data-access-users/    # NgRx store/effects/selectors e UsersService
  ui/                   # Componentes visuais reutilizaveis
```

## Decisoes tecnicas
- NgRx: estado previsivel e escalavel para lista, loading e erro.
- Nx: separacao clara entre feature, data-access e ui, com testes por lib.
- RxJS: uso de debounceTime, switchMap, catchError e forkJoin para fluxo reativo.

## Comandos do zero
```bash
npm install
npx nx serve desafio-attus
npx nx test feature-users
npx nx test data-access-users
npx nx run-many --target=test
```
