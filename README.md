## Descrição

Este aplicativo é uma solução web full-stack que integra um frontend Vue.js com um backend Django ou Express. Ele foi projetado para demonstrar uma variedade de recursos, incluindo upload de arquivos, processamento de dados e visualização de informações com gráficos.

## Recursos

- Funcionalidade de upload de arquivo.
- Processamento de arquivos Excel no backend.
- Cálculo de várias métricas de negócios.
- Visualização de dados por meio de gráficos de barras.

## Instalação

### Pré-requisitos

- Node.js
- Python 3
- Docker (opcional)

### Configuração do Backend em Django

1. Navegue até a pasta do servidor:

   ``
   cd python-server
  ``

3. Rode o container:
   
   ``
   docker build -t django-app .
   docker run -p 8000:8000 django-app
   ``

### Configuração do Backend em Node

1. Navegue até a pasta do servidor:
   ``
   cd server
   ``
2. Rode o container:
   
   ``
   docker build -t node-app .
   docker run -p 3000:3000 node-app
   ``

### Configuração do Frontend

1. Navegue até a pasta do frontend:


   ``
   cd client
   ``
3. Instale as dependências:

   
   ``
   npm install
   ``
4. Inicie a aplicação:

   
   ``
   npm run dev
   ``
   
