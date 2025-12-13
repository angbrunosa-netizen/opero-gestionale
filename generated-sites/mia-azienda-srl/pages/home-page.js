
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import Home-pagePage from '../../components/pages/Home-pagePage';

export default function Home-pagePage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <Home-pagePage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('home-page', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'home-page' } }],
    fallback: false
  };
}
