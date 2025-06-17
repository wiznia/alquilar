const typeDefs = `
  type Query {
    user(
      apellido: String
      barrio: String
      direccion: String
      email: String
      id: ID
      localidad: String
      nombre: String
      provincia: String
      token: String
      tipo_de_cuenta: String
      usuario: String
      potential_tenant: [ID]
    ): User
    getListings(
      ambientes: Int
      ammenities: [String]
      antiguedad_max: Int
      banos: Int
      barrio: String
      descripcion: String
      direccion: String
      dormitorios: Int
      estado: [String]
      expensas: Float
      likes: [String]
      moneda: [String]
      owner: ID
      potential_tenant: [ID]
      precio_max: Float
      precio_min: Float
      provincia: String
      sena: Float
      sortBy: SortOrder
      superficie_total_max: Int
      superficie_total_min: Int
      tipo_de_alquiler: [String]
      tipo_de_ambientes: [String]
      tipo_de_propiedad: [String]
      titulo: String
      toilettes: Int
      createdAt_max: String
      createdAt_min: String
      first: Int
      searchTerm: String 
      skip: Int = 0
    ): ListingsResult
    getListingById(id: ID!): Listing
    count: Int
    getUser(id: ID!): User
    getMessages(userId: ID!): [Message]
    getNotifications(userId: ID!): [Notification]
    getPotentialTenantsByListing(ids: [ID!]!): [User]
    getTenantUser(nombre: String!, apellido: String!, tipo_de_cuenta: String!, potential_tenant: [String!], invite: [String]): [User]
    getUserListingNotifications(userId: ID!, listingId: ID!): [Notification]
    getCalendarEvents(senderId: ID!, createdAt_min: String!, createdAt_max: String!): [Event!]!
    getCalendarEventsByInvitee(receiverId: ID!, createdAt_min: String!, createdAt_max: String!): [Event!]!
  }

  type ListingsResult {
    count: Int
    listings: [Listing]
  }

  type MercadoPagoData {
    userId: String
    accessToken: String
  }

  input MercadoPagoInput {
    userId: String
    accessToken: String
  }

  type ContractData {
    id: ID
    nombre: String
    apellido: String
    documents: [File]
    potentialTenantAgreed: Boolean
  }

  input ContractDataInput {
    id: ID
    nombre: String
    apellido: String
    documents: [FileInput]
    potentialTenantAgreed: Boolean
  }

  input MercadoPagoInput {
    userId: String
    accessToken: String
  }

  type Listing {
    ambientes: Int
    ammenities: [String]
    antiguedad_max: Int
    banos: Int
    barrio: String
    contract: ContractData
    descripcion: String
    direccion: String!
    documentation: [DocumentationData]
    dormitorios: Int
    estado: [String]
    expensas: Float
    fotos: [File]
    id: ID!
    likes: [User]
    mercadoPago: MercadoPagoData
    moneda: String!
    mpPaymentLink: String
    owner: User!
    payment: PaymentData
    potential_tenant: [ID]
    precio: Float!
    provincia: String!
    sena: Float
    signature: Boolean
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String!
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String!
    titulo: String!
    toilettes: Int
    createdAt: String
    viewCount: Int
  }

  type DocumentationData {
    id: ID
    nombre: String
    apellido: String
    documents: [File]
  }

  type PaymentData {
    cbu: String
    alias: String
    mpPaymentId: Int
    status: String
    paymentDone: Boolean
  }

  type User {
    apellido: String!
    barrio: String
    celular: Int
    condicion_fiscal: String!
    direccion: String
    dni: Int!
    email: String!
    id: ID!
    localidad: String
    nombre: String!
    provincia: String
    ratings: [Rating]
    telefono: Int
    tipo_de_cuenta: String!
    token: String
    usuario: String!
    documentation: Documentation
  }
  
  type Message {
    sender: User
    receiver: User
    conversationId: String!
    messages: [SingleMessage!]!
  }

  type SingleMessage {
    asunto: String!
    createdAt: String!
    readBy: [String]
    messageId: ID!
    senderId: ID!
    conversationId: String!
  }

  type Notification {
    content: String!
    createdAt: String!
    id: ID!
    _id: ID!
    listingId: [Listing!]
    read: Boolean!
    receiver: User
    sender: User
    type: String!
  }

  type Event {
    titulo: String!
    asunto: String!
    date: String!
    time: String!
    senderId: User
    receiverId: User
    id: String
    listingId: Listing
  }

  type Rating {
    user: User
    rating: Int!
    message: String
    createdAt: String!
  }

  type Documentation {
    documentsAreGlobal: Boolean
    documents: [File]
  }

  type MPPayment {
    id: String
    status: String
  }

  scalar Upload

  input CreateListingInput {
    ambientes: Int!
    ammenities: [String]
    antiguedad_max: Int
    banos: Int!
    barrio: String!
    descripcion: String
    direccion: String!
    dormitorios: Int
    estado: String!
    expensas: Float
    fotos: [FileInput!]
    moneda: String!
    municipio: String
    precio: Float!
    provincia: String!
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String!
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String!
    titulo: String!
    toilettes: Int
    viewCount: Int
  }

  input UpdateListingInput {
    id: ID
    ambientes: Int
    ammenities: [String]
    antiguedad_max: Int
    banos: Int
    barrio: String
    contract: ContractDataInput
    descripcion: String
    direccion: String
    documentation: [DocumentationDataInput]
    dormitorios: Int
    estado: [String!]
    expensas: Float
    fotos: [FileInput!]
    likes: [ID]
    mercadoPago: MercadoPagoInput
    moneda: String
    mpPaymentLink: String
    municipio: String
    owner: UpdateUserInput
    payment: PaymentInput
    potential_tenant: [ID]
    precio: Float
    provincia: String
    sena: Float
    signature: Boolean
    superficie_cubierta: Int
    superficie_total: Int
    tipo_de_alquiler: String
    tipo_de_ambientes: [String]
    tipo_de_propiedad: String
    titulo: String
    toilettes: Int
    viewCount: Int
  }

  input UpdateUserInput {
    nombre: String
    apellido: String
    email: String
    provincia: String
    barrio: String
    localidad: String
    telefono: Int
    documentation: [DocumentsDataInput]
  }

  input ContractInput {
    adjustmentMethod: String
    adjustmentType: String
    apellido: String
    apellidoTenant: String
    bankAccount: String
    bankName: String
    cbu: String
    contractSignDate: String
    contractStartDate: String
    cuit: String
    direccion: String
    direccionTenant: String
    dni: Int
    DNITenant: Int
    duracion: String
    guaranteeType: String
    inventory: String
    listingAddress: String
    listingCity: String
    listingMoneda: String
    listingPrice: Int
    nombre: String
    nombreTenant: String
    provincia: String
    provinciaTenant: String
  }

  type File {
    id: ID!
    name: String
    url: String
    extension: String
  }

  input FileInput {
    id: String
    name: String
    url: String
    extension: String
  }

  input DocumentationDataInput {
    id: ID
    nombre: String
    apellido: String
    documents: [FileInput]
  }

  input DocumentsDataInput {
    documentsAreGlobal: Boolean
    documents: [FileInput]
  }

  input PaymentInput {
    cbu: String,
    alias: String
    paymentDone: Boolean
  }

  input SortListingsBy {
    order: SortOrder!
  }

  enum SortOrder {
    id_ASC
    precio_ASC
    precio_DESC
    createdAt_DESC
    viewCount_DESC
  }

  type Mutation {
    register(
      apellido: String!
      barrio: String!
      celular: Int
      condicion_fiscal: String!
      direccion: String
      dni: Int!
      email: String!
      localidad: String
      nombre: String!
      password: String!
      provincia: String!
      telefono: Int
      tipo_de_cuenta: String!
      usuario: String!
    ): User
    createListing(input: CreateListingInput!): Listing
    updateListing(id: ID!, input: UpdateListingInput!, senderId: ID): Listing
    updateUser(id: ID!, input: UpdateUserInput!): Boolean
    deleteListing(id: ID!): Boolean
    login(email: String!, password: String!): User
    logout: Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
    requestPasswordReset(email: String!): Boolean
    uploadImage(files: [Upload]!, userId: ID!, listingId: ID!): [File]!
    uploadDocuments(files: [Upload]!, userId: ID!): [File]!
    likeListing(listingId: ID!): Listing
    rateOwner(ownerId: ID!, rating: Int!, message: String): User
    sendMessage(senderId: ID, receiverId: ID!, asunto: String!, conversationId: String): Message
    sendEmail(nombre: String!, apellido: String!, email: String!, asunto: String!, receiverEmail: String!, listingId: String!): Boolean
    markMessagesAsRead(messageIds: [ID!]!): [SingleMessage!]!
    markNotificationsAsRead(notifications: [ID!]!): Boolean
    connectMercadoPago(listingId: ID!): String
    disconnectMercadoPago(listingId: ID!): String
    createPaymentLink(userId: ID!, value: Float!, listingId: ID!): String
    addPotentialTenant(tenantId: ID!, listingId: ID!, senderId: ID!, receiverId: ID!, type: String!): Boolean
    removePotentialTenant(listingId: ID!, senderId: ID!, receiverId: ID!, type: String!): Boolean
    setCalendarEvent(titulo: String!, asunto: String!, time: String!, date: String!, senderId: ID!, receiverId: [ID!]!, listingId: ID): Event!
    deleteCalendarEvent(eventId: String!): Boolean
    generateContract(input: ContractInput!): String!
  },
  type Subscription {
    notificationReceived(userId: ID!): Notification
  }
  type Subscription {
    newMessage: SingleMessage
  }
  type Subscription {
    newPayment: MPPayment
  }
`;

export default typeDefs;
