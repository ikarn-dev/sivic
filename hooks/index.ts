/**
 * Hooks Index
 * 
 * Central export for all custom hooks
 */

export { useNetworkHealth, type NetworkHealth } from './useNetworkHealth';
export { useEcosystem, type EcosystemData, type CategoryData, type ProtocolTVL } from './useEcosystem';
export { useDexVolumes, type DexData, type DexVolume } from './useDexVolumes';
export { useProtocolsTreemap, type ProtocolsTreemapData } from './useProtocolsTreemap';
export { usePrefetch } from './usePrefetch';
