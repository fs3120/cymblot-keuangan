import { IBanks, ITransaksi } from "@/types/db";
import { getBalanceBank } from "./get-balance";

interface IBanksWithSaldo extends IBanks {
  saldo: number;
}

function addBankWithSaldo({
  bank,
  transaksiUser,
}: {
  bank: IBanks;
  transaksiUser: ITransaksi[];
}) {
  const bankTransaksi = transaksiUser.filter(
    (transaksi) => transaksi.bankNameId === bank.id
  );
  const saldo = getBalanceBank(bankTransaksi);
  return { ...bank, saldo };
}

function calculateTotalSaldo(banks: IBanksWithSaldo[]) {
  return banks.reduce((acc, bank) => acc + bank.saldo, 0);
}

function groupByEmail(userBanks: IBanksWithSaldo[]) {
  const grouped = userBanks.reduce((acc, currentUserBank) => {
    if (!acc[currentUserBank.email]) {
      acc[currentUserBank.email] = {
        email: currentUserBank.email,
        banks: [],
        total_saldo: 0,
      };
    }
    acc[currentUserBank.email].banks.push(currentUserBank);
    acc[currentUserBank.email].total_saldo = calculateTotalSaldo(userBanks);
    return acc;
  }, {} as { [key: string]: { email: string; banks: IBanksWithSaldo[]; total_saldo: number } });

  return Object.values(grouped);
}

export async function getBalanceBankDetailAdmin({
  daftarBank,
  transaksiUser,
}: {
  daftarBank: IBanks[];
  transaksiUser: ITransaksi[];
}) {
  const userBanksWithSaldo = daftarBank.map((bank) =>
    addBankWithSaldo({ bank, transaksiUser })
  );
  const userBanksWithEmail = groupByEmail(userBanksWithSaldo);
  return userBanksWithEmail;
}
