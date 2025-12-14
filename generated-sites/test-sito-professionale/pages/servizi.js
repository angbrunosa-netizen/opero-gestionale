
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import ServiziPage from '../../components/pages/ServiziPage';

export default function ServiziPage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <ServiziPage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(21);
  const pageData = await getPageData('servizi', 21);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'servizi' } }],
    fallback: false
  };
}
