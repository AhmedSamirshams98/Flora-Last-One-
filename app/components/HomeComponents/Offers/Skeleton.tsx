export const Skeleton = () => {
  return (
    <section id="offers" className=" py-6">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4 animate-pulse"></div>
        </div>
        <div className="relative w-full min-h-[65vh] md:min-h-[500px]] rounded-lg overflow-hidden bg-gray-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400/60 via-gray-400/40 to-transparent flex items-center">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
              <div className="max-w-full sm:max-w-md md:max-w-lg bg-gray-400/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8">
                {/* Skeleton للعنوان الفرعي */}
                <div className="h-4 bg-gray-300 rounded w-32 mb-3 animate-pulse"></div>
                {/* Skeleton للعنوان الرئيسي */}
                <div className="h-8 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
                {/* Skeleton للأسعار */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
                {/* Skeleton للزر */}
                <div className="h-12 bg-gray-300 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Skeleton للنقاط */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-6 bg-gray-300/10 px-5 py-1 rounded-full">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex gap-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
