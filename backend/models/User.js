const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Función para calcular signo zodiacal
function obtenerSignoZodiacal(fecha) {
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;

  if ((mes == 1 && dia >= 20) || (mes == 2 && dia <= 18)) return 'Acuario';
  if ((mes == 2 && dia >= 19) || (mes == 3 && dia <= 20)) return 'Piscis';
  if ((mes == 3 && dia >= 21) || (mes == 4 && dia <= 19)) return 'Aries';
  if ((mes == 4 && dia >= 20) || (mes == 5 && dia <= 20)) return 'Tauro';
  if ((mes == 5 && dia >= 21) || (mes == 6 && dia <= 20)) return 'Géminis';
  if ((mes == 6 && dia >= 21) || (mes == 7 && dia <= 22)) return 'Cáncer';
  if ((mes == 7 && dia >= 23) || (mes == 8 && dia <= 22)) return 'Leo';
  if ((mes == 8 && dia >= 23) || (mes == 9 && dia <= 22)) return 'Virgo';
  if ((mes == 9 && dia >= 23) || (mes == 10 && dia <= 22)) return 'Libra';
  if ((mes == 10 && dia >= 23) || (mes == 11 && dia <= 21)) return 'Escorpio';
  if ((mes == 11 && dia >= 22) || (mes == 12 && dia <= 21)) return 'Sagitario';
  return 'Capricornio';
}

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  zodiacSign: { type: String },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  dniPath: { type: String, default: '' },          // Para guardar el archivo del DNI
  photoPath: { type: String, default: '' }         // Para la foto de perfil
});

// Middleware para calcular signo y hashear contraseña
userSchema.pre('save', async function (next) {
  if (this.dob) {
    this.zodiacSign = obtenerSignoZodiacal(this.dob);
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Método para comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);