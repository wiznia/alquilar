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

    if (!form.terms)
      errors.terms = 'Tenés que aceptar los términos y condiciones.';
  }

  if (formType === 'createListing') {
    if (!form.tipo_de_alquiler) {
      errors.tipo_de_alquiler = 'Tenés que seleccionar un tipo de operación.';
    }
    if (!form.moneda) {
      errors.moneda = 'Tenés que seleccionar una moneda.';
    }
    if (!form.precio) {
      errors.precio = 'El precio no puede estar vacío.';
    }
    if (!form.expensas) {
      errors.expensas = 'Las expensas no pueden estar vacías.';
    }
    if (!form.tipo_de_propiedad) {
      errors.tipo_de_propiedad = 'Tenés que seleccionar un tipo de propiedad.';
    }
    if (form.antiguedad_max === null) {
      errors.antiguedad_max = 'Tenés que seleccionar una antiguedad.';
    }
    if (!form.superficie_cubierta) {
      errors.superficie_cubierta =
        'La superficie cubierta no puede estar vacía.';
    }
    if (!form.superficie_total) {
      errors.superficie_total = 'La superficie total no puede estar vacía.';
    }
    if (!form.provincia) {
      errors.provincia = 'Tenés que seleccionar una provincia.';
    }
    if (!form.barrio) {
      errors.barrio = 'Tenés que seleccionar un barrio.';
    }
    if (!form.direccion) {
      errors.direccion = 'La dirección no puede estar vacía.';
    }
    if (!form.titulo) {
      errors.titulo = 'Ingresá un título.';
    }
    if (!form.descripcion) {
      errors.descripcion = 'Ingresá una descripción.';
    }
  }

  if (formType === 'sendMessage') {
    if (!form.asunto) {
      errors.asunto = 'Tenés que completar el asunto.';
    }
  }

  if (formType === 'sendSena') {
    if (!form.sena) {
      errors.sena =
        'Tenés que ingresar un valor en pesos argentinos mayor a cero.';
    }
  }

  if (formType === 'setEvent') {
    if (!form.titulo) {
      errors.titulo = 'Tenés que completar un título.';
    }

    if (!form.asunto) {
      errors.asunto = 'Tenés que completar el asunto.';
    }

    if (!form.time) {
      errors.time = 'Tenés que completar la hora.';
    }

    if (!form.invite) {
      errors.invite = 'Tenés que invitar al menos a una persona a tu evento.';
    }

    if (!form.inquilino) {
      errors.inquilino = 'Tenés que seleccionar un inmueble.';
    }
  }

  if (formType === 'uploadDocuments') {
  }

  return errors;
};
