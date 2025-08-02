const bcrypt = require('bcryptjs');

(async () => {
  const password = '123';
  const hash = '$2b$10$41879WG2U4rCzpY3BkeDk.3O3pNwK8zgXguU6azLU9uBlQB1wbzp.'; // hash que tienes guardado

  const match = await bcrypt.compare(password, hash);
  console.log('¿Coincide la contraseña?', match);
})();