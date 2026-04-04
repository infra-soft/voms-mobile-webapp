import { Outlet, useLocation } from "react-router-dom";
import { AuthBackground } from "./auth_background";
import { motion, AnimatePresence } from "framer-motion";

const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="relative w-full h-screen md:overflow-hidden">
      {/* Skip-to-content link — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-sage-700 focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Background behind everything */}
      <div className="absolute inset-0">
        <AuthBackground />
      </div>

      {/* Animated child routes */}
      <main
        id="main-content"
        className="relative flex items-center justify-center h-full focus:outline-none"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="p-4">
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export { AuthLayout };
