import AnalysisSection from "../components/AnalysisSection";

const AnalysisPage = () => {
  return (
    <div className="min-h-screen mt-12 bg-gray-50 dark:bg-[#0d0d0d] px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Your Transaction Analysis
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Get insights about your payments and receipts over time.
        </p>

        <AnalysisSection />
      </div>
    </div>
  );
};

export default AnalysisPage;
