"use client";


export default function ProductsHeader() {

  return (
    <div className="flex flex-col md:flex-row  justify-between items-center w-full gap-4">
      <h2 className="text-4xl md:hidden text-center md:text-right  text-primary font-gess">
        كل المنتجات
      </h2>
      <p className="text-muted-foreground md:hidden  text-center max-w-2xl mx-auto  font-gess">
        اكتشف مجموعتنا المختارة بعناية من الحقائب والأحذية الفاخرة
      </p>
      <div>
        <h2 className="text-4xl  hidden md:block text-center md:text-right  text-primary font-gess">
          كل المنتجات
        </h2>
        <p className="text-muted-foreground   hidden md:block text-center max-w-2xl mx-auto  font-gess">
          اكتشف مجموعتنا المختارة بعناية من الحقائب والأحذية الفاخرة
        </p>
      </div>
   
    </div>
  );
}
