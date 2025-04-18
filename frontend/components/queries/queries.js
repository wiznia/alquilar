import { gql } from '@apollo/client';

export const ALL_LISTINGS_QUERY = gql`
  query ALL_LISTINGS_QUERY(
    $ambientes: Int
    $ammenities: [String]
    $antiguedad_max: Int
    $banos: Int
    $barrio: String
    $descripcion: String
    $direccion: String
    $dormitorios: Int
    $estado: [String]
    $expensas: Float
    $moneda: [String]
    $precio_max: Float
    $precio_min: Float
    $provincia: String
    $sortBy: SortOrder
    $superficie_total_min: Int
    $superficie_total_max: Int
    $tipo_de_alquiler: [String]
    $tipo_de_ambientes: [String]
    $tipo_de_propiedad: [String]
    $titulo: String
    $toilettes: Int
    $createdAt_max: String
    $createdAt_min: String
    $first: Int
    $skip: Int = 0
  ) {
    getListings(
      ambientes: $ambientes
      ammenities: $ammenities
      antiguedad_max: $antiguedad_max
      banos: $banos
      barrio: $barrio
      descripcion: $descripcion
      direccion: $direccion
      dormitorios: $dormitorios
      estado: $estado
      expensas: $expensas
      moneda: $moneda
      precio_max: $precio_max
      precio_min: $precio_min
      provincia: $provincia
      sortBy: $sortBy
      superficie_total_max: $superficie_total_max
      superficie_total_min: $superficie_total_min
      tipo_de_alquiler: $tipo_de_alquiler
      tipo_de_ambientes: $tipo_de_ambientes
      tipo_de_propiedad: $tipo_de_propiedad
      titulo: $titulo
      toilettes: $toilettes
      createdAt_max: $createdAt_max
      createdAt_min: $createdAt_min
      first: $first
      skip: $skip
    ) {
      count
      listings {
        ambientes
        ammenities
        antiguedad_max
        banos
        barrio
        descripcion
        direccion
        dormitorios
        estado
        expensas
        fotos {
          id
          name
          url
        }
        id
        likes {
          id
        }
        moneda
        precio
        provincia
        superficie_cubierta
        superficie_total
        tipo_de_alquiler
        tipo_de_propiedad
        titulo
        toilettes
      }
    }
  }
`;

export const SINGLE_LISTING_QUERY = gql`
  query SINGLE_LISTING_QUERY($id: ID!) {
    getListingById(id: $id) {
      ambientes
      ammenities
      antiguedad_max
      banos
      barrio
      descripcion
      direccion
      dormitorios
      estado
      expensas
      fotos {
        id
        name
        url
      }
      id
      moneda
      owner {
        id
        nombre
        apellido
        telefono
        celular
        tipo_de_cuenta
      }
      precio
      provincia
      superficie_cubierta
      superficie_total
      tipo_de_alquiler
      tipo_de_ambientes
      tipo_de_propiedad
      titulo
      toilettes
    }
  }
`;

export const SEARCH_LISTINGS_QUERY = gql`
  query SEARCH_LISTINGS_QUERY($searchTerm: String!) {
    getListings(searchTerm: $searchTerm) {
      listings {
        ambientes
        antiguedad_max
        banos
        barrio
        descripcion
        direccion
        dormitorios
        estado
        expensas
        fotos {
          id
          name
          url
        }
        id
        moneda
        precio
        provincia
        superficie_cubierta
        superficie_total
        tipo_de_alquiler
        tipo_de_propiedad
        titulo
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $apellido: String!
    $celular: Int
    $condicion_fiscal: String!
    $dni: Int!
    $email: String!
    $nombre: String!
    $password: String!
    $telefono: Int
    $tipo_de_cuenta: String!
    $usuario: String!
  ) {
    register(
      apellido: $apellido
      celular: $celular
      condicion_fiscal: $condicion_fiscal
      dni: $dni
      email: $email
      nombre: $nombre
      password: $password
      telefono: $telefono
      tipo_de_cuenta: $tipo_de_cuenta
      usuario: $usuario
    ) {
      apellido
      celular
      condicion_fiscal
      dni
      email
      id
      nombre
      telefono
      tipo_de_cuenta
      token
      usuario
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
      token
    }
  }
`;

export const GET_USER = gql`
  query {
    user {
      apellido
      celular
      condicion_fiscal
      dni
      email
      id
      nombre
      ratings {
        user
        rating
        message
        createdAt
      }
      telefono
      tipo_de_cuenta
      usuario
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GET_USER_BY_ID($id: ID!) {
    getUser(id: $id) {
      apellido
      celular
      condicion_fiscal
      dni
      email
      id
      nombre
      ratings {
        user
        rating
        message
        createdAt
      }
      telefono
      tipo_de_cuenta
      usuario
    }
  }
`;

export const GET_LISTINGS_BY_OWNER = gql`
  query GET_LISTINGS_BY_OWNER($id: ID!, $estado: [String]) {
    getListings(owner: $id, estado: $estado) {
      count
      listings {
        id
        titulo
        tipo_de_alquiler
        tipo_de_propiedad
        direccion
        provincia
        barrio
        descripcion
        estado
        precio
        moneda
        owner {
          nombre
          apellido
        }
        expensas
        ambientes
        dormitorios
        banos
        superficie_cubierta
        superficie_total
        ammenities
        antiguedad_max
        fotos {
          id
          name
          url
        }
        viewCount
      }
    }
  }
`;

export const GET_MESSAGES_BY_USER = gql`
  query getMessages($receiverId: ID!) {
    getMessages(receiverId: $receiverId) {
      nombre
      apellido
      email
      sender {
        nombre
        apellido
        email
        id
      }
      conversationId
      messages {
        asunto
        createdAt
        isUnread
        messageId
      }
    }
  }
`;

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($messageIds: [ID!]!) {
    markMessagesAsRead(messageIds: $messageIds) {
      isUnread
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

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      ambientes
      antiguedad_max
      ammenities
      banos
      barrio
      descripcion
      direccion
      dormitorios
      estado
      expensas
      fotos {
        id
        name
        url
      }
      id
      moneda
      precio
      provincia
      superficie_cubierta
      superficie_total
      tipo_de_alquiler
      tipo_de_propiedad
      titulo
      toilettes
    }
  }
`;

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
      ambientes
      antiguedad_max
      ammenities
      banos
      barrio
      descripcion
      direccion
      dormitorios
      estado
      expensas
      fotos {
        id
        name
        url
      }
      id
      moneda
      precio
      provincia
      superficie_cubierta
      superficie_total
      tipo_de_alquiler
      tipo_de_propiedad
      titulo
      toilettes
    }
  }
`;

export const UPLOAD_IMAGES = gql`
  mutation uploadImage($files: [Upload!]!, $userId: ID!, $listingId: ID!) {
    uploadImage(files: $files, userId: $userId, listingId: $listingId) {
      id
      name
      url
    }
  }
`;

export const LIKE_LISTING_MUTATION = gql`
  mutation LikeListing($listingId: ID!) {
    likeListing(listingId: $listingId) {
      id
      likes {
        id
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation sendMessage(
    $senderId: ID
    $receiverId: ID!
    $asunto: String!
    $nombre: String
    $apellido: String
    $email: String
  ) {
    sendMessage(
      senderId: $senderId
      receiverId: $receiverId
      asunto: $asunto
      nombre: $nombre
      apellido: $apellido
      email: $email
    ) {
      sender {
        nombre
        apellido
        email
      }
      nombre
      apellido
      email
      conversationId
      messages {
        messageId
        asunto
        createdAt
        isUnread
      }
    }
  }
`;
