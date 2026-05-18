// Importa a função do Cypress usada para criar a configuração.
import { defineConfig } from 'cypress';

// Exporta a configuração principal do Cypress.
export default defineConfig({
  // Configura os testes end-to-end.
  e2e: {
    // Define a URL base onde seu Angular estará rodando.
    baseUrl: 'http://localhost:4200',

    // Define o arquivo de suporte global dos testes.
    supportFile: 'cypress/support/e2e.ts',

    // Define a largura da janela do navegador nos testes.
    viewportWidth: 1366,

    // Define a altura da janela do navegador nos testes.
    viewportHeight: 768,
  },
});