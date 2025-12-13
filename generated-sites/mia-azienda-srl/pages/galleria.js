
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import GalleriaPage from '../../components/pages/GalleriaPage';

export default function GalleriaPage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <GalleriaPage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('galleria', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'galleria' } }],
    fallback: false
  };
}
