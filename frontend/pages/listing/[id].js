import SingleListing from '../../components/SingleListing';

export default function SingleListingPage({ id }) {
  return <SingleListing id={id} />;
}

export async function getServerSideProps(context) {
  const { id } = context.query;

  return {
    props: {
      id,
    },
  };
}
