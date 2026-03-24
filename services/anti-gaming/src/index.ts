export { detectWashTrading } from "./detectors/wash-trade.js";
export type { TradeRecord, WashTradeResult } from "./detectors/wash-trade.js";

export { detectSybilClusters } from "./detectors/sybil.js";
export type { WalletProfile, SybilCluster, SybilResult } from "./detectors/sybil.js";

export { detectCollusion } from "./detectors/collusion.js";
export type { AccountPnlSeries, CollusionResult } from "./detectors/collusion.js";
