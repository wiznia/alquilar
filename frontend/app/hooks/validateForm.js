export const validateForm = (form, formType) => {
  let errors = {};

  if (formType === 'register' || formType === 'login') {
    if (!form.email) errors.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = 'Ingresá un email válido.';

    if (!form.password) errors.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
  }

  if (formType === 'register') {
    if (!form.tipo_de_cuenta)
      errors.tipo_de_cuenta = 'Seleccioná un tipo de cuenta.';
    if (!form.usuario) errors.usuario = 'El usuario es obligatorio.';
    if (!form.nombre) errors.nombre = 'El nombre es obligatorio.';
    if (!form.apellido) errors.apellido = 'El apellido es obligatorio.';
    if (!form.condicion_fiscal)
      errors.condicion_fiscal = 'Seleccioná una condición fiscal.';

    if (!form.dni) errors.dni = 'El DNI es obligatorio.';
    else if (!/^\d{7,8}$/.test(form.dni))
      errors.dni = 'El DNI debe tener 7 u 8 números.';

    if (!form.terms) errors.terms = 'Debés aceptar los términos y condiciones.';
  }

  return errors;
};
