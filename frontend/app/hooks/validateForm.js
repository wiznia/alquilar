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

  if (formType === 'createListing') {
    if (!form.tipo_de_alquiler) {
      errors.tipo_de_alquiler = 'Debés seleccionar un tipo de operación.';
    }
    if (!form.moneda) {
      errors.moneda = 'Debés seleccionar una moneda.';
    }
    if (!form.precio) {
      errors.precio = 'Debés seleccionar un precio.';
    }
    if (!form.expensas) {
      errors.expensas = 'Las expensas no pueden estar vacías.';
    }
    if (!form.tipo_de_propiedad) {
      errors.tipo_de_propiedad = 'Debés seleccionar un tipo de propiedad.';
    }
    if (form.antiguedad_max === null) {
      errors.antiguedad_max = 'Debés seleccionar una antiguedad.';
    }
    if (!form.superficie_cubierta) {
      errors.superficie_cubierta = 'Debés seleccionar una superficie cubierta.';
    }
    if (!form.superficie_total) {
      errors.superficie_total = 'Debés seleccionar una superficie total.';
    }
    if (!form.provincia) {
      errors.provincia = 'Debés seleccionar una provincia.';
    }
    if (!form.barrio) {
      errors.barrio = 'Debés seleccionar un barrio.';
    }
    if (!form.direccion) {
      errors.direccion = 'Debés seleccionar una direccion.';
    }
    if (!form.titulo) {
      errors.titulo = 'Debés seleccionar un título.';
    }
  }

  if (formType === 'sendMessage') {
    if (!form.asunto) {
      errors.asunto = 'Debés completar el asunto.';
    }
  }

  if (formType === 'sendSena') {
    if (!form.sena) {
      errors.sena = 'Debés ingresar un valor en pesos argentinos mayor a cero.';
    }
  }

  if (formType === 'setEvent') {
    if (!form.titulo) {
      errors.titulo = 'Debés completar un título.';
    }

    if (!form.asunto) {
      errors.titulo = 'Debés completar el asunto.';
    }

    if (!form.time) {
      errors.time = 'Debés completar la hora.';
    }

    if (!form.invite) {
      errors.invite = 'Tenés que invitar al menos a una persona a tu evento.';
    }
  }

  return errors;
};
