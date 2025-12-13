
import { getSiteData, getPageData } from '../lib/data';
import Layout from '../components/Layout';
import HomePage from '../components/pages/HomePage';

export default function HomePage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <HomePage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('home', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}
