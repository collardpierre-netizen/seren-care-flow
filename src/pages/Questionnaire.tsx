import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import UnifiedQuestionnaire from "@/components/questionnaire/UnifiedQuestionnaire";

const Questionnaire = () => {
  return (
    <>
      <Helmet>
        <title>Questionnaire - Trouvez la bonne protection | SerenCare</title>
        <meta name="description" content="Répondez à quelques questions simples pour trouver la protection contre l'incontinence adaptée à vos besoins." />
      </Helmet>
      <Layout>
        <section className="section-padding min-h-[80vh] flex items-center">
          <div className="container-main">
            <UnifiedQuestionnaire variant="page" />
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Questionnaire;
