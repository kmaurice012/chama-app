export { connectDB } from './connection';
export { default as User } from './models/User';
export { default as Chama } from './models/Chama';
export { default as Contribution } from './models/Contribution';
export { default as Loan } from './models/Loan';

export type { IUser } from './models/User';
export type { IChama } from './models/Chama';
export type { IContribution } from './models/Contribution';
export type { ILoan, ILoanRepayment } from './models/Loan';
