
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import Chi-siamoPage from '../../components/pages/Chi-siamoPage';

export default function Chi-siamoPage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <Chi-siamoPage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(16);
  const pageData = await getPageData('chi-siamo', 16);

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'chi-siamo' } }],
    fallback: false
  };
}
