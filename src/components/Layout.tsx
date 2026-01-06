import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { GlobalProductComparator } from "./shop/ProductComparator";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <GlobalProductComparator />
    </div>
  );
};

export default Layout;
