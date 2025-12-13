
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import CitroviPage from '../../components/pages/CitroviPage';

export default function CitroviPage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <CitroviPage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('citrovi', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'citrovi' } }],
    fallback: false
  };
}
