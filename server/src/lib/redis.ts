/**
 * Re-exporting unified Cache API backed by interchangeable drivers (Memory | Redis)
 */
export {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  getActiveCacheDriverName,
  getCacheDriver,
  type ICacheDriver,
} from "./cache.js";
