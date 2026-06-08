migrate(
  (app) => {
    // Admin criado manualmente via painel do PocketBase ou via variável de ambiente.
    // Não adicionar credenciais em código-fonte.
  },
  (app) => {
    // Revert não é necessário pois nada é criado no up
  },
)
