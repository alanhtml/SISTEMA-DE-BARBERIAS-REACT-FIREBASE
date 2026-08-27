import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Notification = ({ notification }) => {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed top-8 right-8 z-[500] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-[#c5a059] shadow-[0_10px_40px_rgba(197,160,89,0.3)] border border-white/20 flex items-center gap-3 backdrop-blur-xl"
        >
          <span className="material-symbols-outlined text-sm">verified_user</span>
          {notification.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
