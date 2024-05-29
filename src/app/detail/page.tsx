import { currentUser } from "@clerk/nextjs/server";
import prisma from "../db/init";
import DetailTable from "./detail-table";
import MainCard from "@/components/main-card";

export default async function Page() {
  const user = await currentUser();

  const transaksiUser = await prisma.transaksi.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
    include: {
      sumber: true,
      tujuan: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });

  const daftarSumber = await prisma.sumber.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  const daftarTujuan = await prisma.tujuan.findMany({
    where: {
      email: user?.emailAddresses[0].emailAddress,
    },
  });

  const dataForTable = transaksiUser.map((transaksi, index) => ({
    id: transaksi.id,
    no: index + 1,
    tanggal: transaksi.tanggal,
    keterangan: transaksi.keterangan,
    jenis: transaksi.jenis,
    sumber: transaksi.sumber?.nama || "-",
    tujuan: transaksi.tujuan?.nama || "-",
    nominal: transaksi.nominal,
    bank: transaksi.bank,
  }));

  return (
    <MainCard>
      <DetailTable
        data={dataForTable}
        daftarSumber={daftarSumber}
        daftarTujuan={daftarTujuan}
      />
    </MainCard>
  );
}
