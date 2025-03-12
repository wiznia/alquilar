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
        owner {
          account
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
      owner {
        account
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
        owner {
          account
        }
      }
    }
  }
`;
