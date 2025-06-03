import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/account')) {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Only landlords can access /account/listings URLS and only owners of that listing can access the configuration
  if (pathname.startsWith('/account/listings/configListing')) {
    const token = request.cookies.get('authToken')?.value;

    let userId;

    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId;

      const graphqlEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL;
      const userQuery = `
        query GET_USER_BY_ID($id: ID!) {
          getUser(id: $id) {
            id
            tipo_de_cuenta
          }
        }
      `;
      const userRes = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, variables: { id: userId } }),
      });
      const { data: userData } = await userRes.json();
      const user = userData?.getUser;

      if (!user || user.tipo_de_cuenta !== 'Dueño') {
        return NextResponse.redirect(new URL('/not-authorized', request.url));
      }

      const listingId = url.searchParams.get('id');
      if (listingId) {
        const listingQuery = `
          query SINGLE_LISTING_QUERY($id: ID!) {
            getListingById(id: $id) {
              id
              owner {
                id
              }
            }
          }
        `;
        const listingRes = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: listingQuery,
            variables: { id: listingId },
          }),
        });
        const { data: listingData } = await listingRes.json();
        const listing = listingData?.getListingById;

        if (!listing || listing.owner.id !== userId) {
          return NextResponse.redirect(new URL('/not-authorized', request.url));
        }
      }
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/account/alquileres/configListing')) {
    const token = request.cookies.get('authToken')?.value;

    let userId;

    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId;

      const graphqlEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL;
      const userQuery = `
        query GET_USER_BY_ID($id: ID!) {
          getUser(id: $id) {
            id
            tipo_de_cuenta
          }
        }
      `;
      const userRes = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, variables: { id: userId } }),
      });
      const { data: userData } = await userRes.json();
      const user = userData?.getUser;

      if (!user || user.tipo_de_cuenta === 'Dueño') {
        return NextResponse.redirect(new URL('/not-authorized', request.url));
      }

      const listingId = url.searchParams.get('id');
      if (listingId) {
        const listingQuery = `
          query SINGLE_LISTING_QUERY($id: ID!) {
            getListingById(id: $id) {
              potential_tenant
            }
          }
        `;
        const listingRes = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: listingQuery,
            variables: { id: listingId },
          }),
        });
        const { data: listingData } = await listingRes.json();
        const listing = listingData?.getListingById;

        if (!listing || !listing.potential_tenant?.includes(userId)) {
          return NextResponse.redirect(new URL('/not-authorized', request.url));
        }
      }
      return NextResponse.next();
    } catch (err) {
      console.log(err);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
