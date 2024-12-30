declare function getTransactionHistory(address: string, settings: any, page?: number, limit?: number): Promise<Promise<any>[] | undefined>;
export default getTransactionHistory;
