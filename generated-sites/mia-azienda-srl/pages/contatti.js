
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import ContattiPage from '../../components/pages/ContattiPage';

export default function ContattiPage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <ContattiPage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('contatti', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'contatti' } }],
    fallback: false
  };
}
