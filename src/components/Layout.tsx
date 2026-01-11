import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { GlobalProductComparator } from "./shop/ProductComparator";
import ScrollToTopButton from "./ScrollToTopButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Spacer for fixed header - 72px height */}
      <div className="h-[72px] flex-shrink-0" />
      <main className="flex-1">{children}</main>
      <Footer />
      <GlobalProductComparator />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
