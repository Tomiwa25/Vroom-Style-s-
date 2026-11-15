import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const cleanId = id.replace(/\\/g, '/')
          if (cleanId.includes('/node_modules/react/') || cleanId.includes('/node_modules/react-dom/')) {
            return 'react-vendor'
          }
          if (cleanId.includes('/node_modules/@tanstack/')) {
            return 'query-vendor'
          }
          if (cleanId.includes('/node_modules/axios/')) {
            return 'network-vendor'
          }
          if (cleanId.includes('/src/data/categories/') || cleanId.includes('/src/data/products')) {
            return 'catalog-data'
          }
          if (
            cleanId.includes('/src/components/VendorPortalModal') ||
            cleanId.includes('/src/components/AdminModal') ||
            cleanId.includes('/src/components/VroomDeliveryModal') ||
            cleanId.includes('/src/components/ComplianceModal')
          ) {
            return 'management-portals'
          }
          if (cleanId.includes('/src/components/CircleLookbook') || cleanId.includes('/src/data/circleLooks')) {
            return 'circle-lookbook'
          }
        },
      },
    },
  },
})
