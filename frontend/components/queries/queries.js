import { gql } from '@apollo/client';

export const ALL_LISTINGS_QUERY = gql`
  query ALL_LISTINGS_QUERY(
    $tipo_de_alquiler: [String]
    $moneda: [String]
    $tipo_de_propiedad: [String]
    $precio_min: Float
    $precio_max: Float
    $antiguedad_max: Int
    $superficie_total_min: Int
    $superficie_total_max: Int
    $skip: Int = 0
    $first: Int
    $sortBy: SortOrder
    $createdAt_min: String
    $createdAt_max: String
    $tipo_de_ambientes: [String]
    $ammenities: [String]
  ) {
    getListings(
      tipo_de_alquiler: $tipo_de_alquiler
      moneda: $moneda
      tipo_de_propiedad: $tipo_de_propiedad
      precio_min: $precio_min
      precio_max: $precio_max
      antiguedad_max: $antiguedad_max
      superficie_total_min: $superficie_total_min
      superficie_total_max: $superficie_total_max
      skip: $skip
      first: $first
      sortBy: $sortBy
      createdAt_min: $createdAt_min
      createdAt_max: $createdAt_max
      tipo_de_ambientes: $tipo_de_ambientes
      ammenities: $ammenities
    ) {
      count
      listings {
        id
        titulo
        tipo_de_alquiler
        moneda
        tipo_de_propiedad
        direccion
        localidad
        barrio
        descripcion
        estado
        precio
        expensas
        ambientes
        dormitorios
        banos
        superficie_cubierta
        superficie_total
        antiguedad_max
        fotos {
          id
          image {
            publicUrlTransformed
          }
        }
      }
    }
  }
`;

export const SINGLE_LISTING_QUERY = gql`
  query SINGLE_LISTING_QUERY($id: ID!) {
    getListingById(id: $id) {
      id
      titulo
      tipo_de_alquiler
      tipo_de_propiedad
      direccion
      localidad
      barrio
      descripcion
      estado
      precio
      expensas
      ambientes
      dormitorios
      banos
      superficie_cubierta
      superficie_total
      antiguedad_max
      fotos {
        id
        image {
          publicUrlTransformed
        }
      }
    }
  }
`;

export const SEARCH_LISTINGS_QUERY = gql`
  query SEARCH_LISTINGS_QUERY($searchTerm: String!) {
    getListings(searchTerm: $searchTerm) {
      listings {
        id
        titulo
        tipo_de_alquiler
        moneda
        tipo_de_propiedad
        direccion
        localidad
        barrio
        descripcion
        estado
        precio
        expensas
        ambientes
        dormitorios
        banos
        superficie_cubierta
        superficie_total
        antiguedad_max
        fotos {
          id
          image {
            publicUrlTransformed
          }
        }
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $password: String!
    $usuario: String!
    $tipo_de_cuenta: String!
    $nombre: String!
    $apellido: String!
    $condicion_fiscal: String!
    $dni: Int!
    $telefono: Int
    $celular: Int
  ) {
    register(
      email: $email
      password: $password
      usuario: $usuario
      tipo_de_cuenta: $tipo_de_cuenta
      nombre: $nombre
      apellido: $apellido
      condicion_fiscal: $condicion_fiscal
      dni: $dni
      telefono: $telefono
      celular: $celular
    ) {
      id
      email
      token
      usuario
      tipo_de_cuenta
      nombre
      apellido
      condicion_fiscal
      dni
      telefono
      celular
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      id
      email
    }
  }
`;

export const GET_USER = gql`
  query {
    user {
      id
      email
      nombre
      apellido
      usuario
      tipo_de_cuenta
      condicion_fiscal
      dni
      telefono
      celular
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const CHECK_EXISTING_USER_OR_DNI = gql`
  query CHECK_EXISTING_USER_OR_DNI($dni: Int, $usuario: String) {
    checkExistingUserOrDNI(dni: $dni, usuario: $usuario) {
      exists
      field
    }
  }
`;

export const CHECK_USER_EXISTENCE = gql`
  query CheckUserExists($email: String!) {
    checkUserExists(email: $email) {
      exists
    }
  }
`;
