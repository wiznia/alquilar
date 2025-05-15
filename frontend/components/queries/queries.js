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
    $likes: [String]
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
      likes: $likes
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
      documentation {
        id
        documents {
          id
          name
          url
        }
      }
      dormitorios
      estado
      expensas
      fotos {
        id
        name
        url
      }
      id
      mercadoPago {
        userId
      }
      moneda
      owner {
        id
        nombre
        apellido
        email
        telefono
        celular
        tipo_de_cuenta
      }
      potential_tenant
      precio
      provincia
      sena
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
        user {
          nombre
          apellido
          id
        }
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

export const GET_POTENTIAL_TENANTS_BY_LISTING = gql`
  query GET_POTENTIAL_TENANTS_BY_LISTING($ids: [ID!]!) {
    getPotentialTenantsByListing(ids: $ids) {
      nombre
      apellido
      id
    }
  }
`;

export const GET_LISTINGS_BY_OWNER = gql`
  query GET_LISTINGS_BY_OWNER($id: ID!, $estado: [String]) {
    getListings(owner: $id, estado: $estado) {
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
        owner {
          nombre
          apellido
          id
        }
        precio
        provincia
        tipo_de_alquiler
        tipo_de_propiedad
        titulo
        superficie_cubierta
        superficie_total
        viewCount
      }
    }
  }
`;

export const GET_LISTINGS_BY_TENANT = gql`
  query GET_LISTINGS_BY_TENANT($id: [ID!]!) {
    getListings(potential_tenant: $id) {
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
        owner {
          nombre
          apellido
          id
        }
        precio
        provincia
        tipo_de_alquiler
        tipo_de_propiedad
        titulo
        superficie_cubierta
        superficie_total
        viewCount
      }
    }
  }
`;

export const GET_MESSAGES_BY_USER = gql`
  query getMessages($userId: ID!) {
    getMessages(userId: $userId) {
      sender {
        nombre
        apellido
        email
        id
      }
      receiver {
        nombre
        apellido
        email
        id
      }
      conversationId
      messages {
        asunto
        createdAt
        readBy
        messageId
        senderId
      }
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GET_NOTIFICATIONS($userId: ID!) {
    getNotifications(userId: $userId) {
      content
      createdAt
      read
      id
    }
  }
`;

export const GET_USER_LISTING_NOTIFICATIONS = gql`
  query GET_USER_LISTING_NOTIFICATIONS($userId: ID!, $listingId: ID!) {
    getUserListingNotifications(userId: $userId, listingId: $listingId) {
      content
      createdAt
      read
    }
  }
`;

export const GET_TENANT_USER = gql`
  query GET_TENANT_USER(
    $nombre: String!
    $apellido: String!
    $tipo_de_cuenta: String!
    $potential_tenant: [String!]
    $invite: [String!]
  ) {
    getTenantUser(
      nombre: $nombre
      apellido: $apellido
      tipo_de_cuenta: $tipo_de_cuenta
      potential_tenant: $potential_tenant
      invite: $invite
    ) {
      id
      nombre
      apellido
    }
  }
`;

export const GET_CALENDAR_EVENTS_BY_MONTH = gql`
  query GetCalendarEvents(
    $senderId: ID!
    $createdAt_min: String!
    $createdAt_max: String!
  ) {
    getCalendarEvents(
      senderId: $senderId
      createdAt_min: $createdAt_min
      createdAt_max: $createdAt_max
    ) {
      titulo
      asunto
      time
      date
      id
      senderId {
        nombre
        apellido
        id
      }
      receiverId {
        nombre
        apellido
        id
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

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($messageIds: [ID!]!) {
    markMessagesAsRead(messageIds: $messageIds) {
      messageId
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

export const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id)
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

export const LIKE_LISTING = gql`
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
    $conversationId: String
    $asunto: String!
  ) {
    sendMessage(
      senderId: $senderId
      receiverId: $receiverId
      conversationId: $conversationId
      asunto: $asunto
    ) {
      sender {
        nombre
        apellido
        email
        id
      }
      receiver {
        nombre
        apellido
        email
        id
      }
      conversationId
      messages {
        messageId
        asunto
        createdAt
        senderId
      }
    }
  }
`;

export const SEND_EMAIL = gql`
  mutation sendEmail(
    $nombre: String!
    $apellido: String!
    $email: String!
    $asunto: String!
    $receiverEmail: String!
    $listingId: String!
  ) {
    sendEmail(
      nombre: $nombre
      apellido: $apellido
      email: $email
      asunto: $asunto
      receiverEmail: $receiverEmail
      listingId: $listingId
    )
  }
`;

export const CONNECT_MERCADO_PAGO = gql`
  mutation ConnectMercadoPago($listingId: ID!) {
    connectMercadoPago(listingId: $listingId)
  }
`;

export const DISCONNECT_MERCADO_PAGO = gql`
  mutation DisconnectMercadoPago($listingId: ID!) {
    disconnectMercadoPago(listingId: $listingId)
  }
`;

export const CREATE_PAYMENT_LINK = gql`
  mutation CreatePaymentLink($userId: ID!, $value: Float!, $listingId: ID!) {
    createPaymentLink(userId: $userId, value: $value, listingId: $listingId)
  }
`;

export const ADD_POTENTIAL_TENANT = gql`
  mutation ADD_POTENTIAL_TENANT(
    $tenantId: ID!
    $listingId: ID!
    $senderId: ID!
    $receiverId: ID!
    $type: String!
  ) {
    addPotentialTenant(
      tenantId: $tenantId
      listingId: $listingId
      senderId: $senderId
      receiverId: $receiverId
      type: $type
    )
  }
`;

export const REMOVE_POTENTIAL_TENANT = gql`
  mutation REMOVE_POTENTIAL_TENANT(
    $listingId: ID!
    $senderId: ID!
    $receiverId: ID!
    $type: String!
  ) {
    removePotentialTenant(
      listingId: $listingId
      senderId: $senderId
      receiverId: $receiverId
      type: $type
    )
  }
`;

export const MARK_NOTIFICATIONS_AS_READ = gql`
  mutation MarkNotificationsAsRead($notifications: [ID!]!) {
    markNotificationsAsRead(notifications: $notifications)
  }
`;

export const SET_CALENDAR_EVENT = gql`
  mutation SetCalendarEvent(
    $titulo: String!
    $asunto: String!
    $time: String!
    $date: String!
    $senderId: ID!
    $receiverId: [ID!]!
  ) {
    setCalendarEvent(
      titulo: $titulo
      asunto: $asunto
      time: $time
      date: $date
      senderId: $senderId
      receiverId: $receiverId
    ) {
      titulo
      asunto
      time
      date
      senderId {
        nombre
        apellido
      }
      receiverId {
        nombre
        apellido
      }
    }
  }
`;
