"use client";

import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, useMemo } from "react";
import sortBy from "lodash/sortBy";
import { Badge, Button, Flex, Input, Text } from "@mantine/core";
import stringToRupiah from "@/utils/string-to-rupiah";
import { IconList, IconRestore } from "@tabler/icons-react";
import "dayjs/locale/id";
import type { tableDataArray, filterDetailTable } from "../types";
import { BUTTON_BASE_COLOR, TEXT_COLOR } from "@/config";
import { useDebouncedState, useMediaQuery } from "@mantine/hooks";
import MainCard from "@/components/main-card";
import generateDetailTableColumns from "./c-table-columns";
import Link from "next/link";
import {
  matchBalance,
  matchBank,
  matchDate,
  matchGeneralSearch,
  matchInformation,
  matchKind,
  matchPurpose,
  matchSource,
} from "./filter";

const PAGE_SIZES = [10, 15, 25, 50, 75, 100];

export default function TableSection({
  data,
  daftarSumber,
  daftarTujuan,
  oldestDate,
}: {
  data: tableDataArray;
  daftarSumber: any[];
  daftarTujuan: any[];
  oldestDate: Date;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [generalSearch, setGeneralSearch] = useDebouncedState("", 200);
  const [filter, setFilter] = useState<filterDetailTable>({
    tanggal_sesudah: oldestDate,
    tanggal_sebelum: new Date(),
    keterangan: "",
    jenis: "SEMUA",
    sumber: [],
    tujuan: [],
    nominal_di_bawah: 0,
    nominal_di_atas: 0,
    nominal_sama_dengan: 0,
    bank: "SEMUA",
  });
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "no",
    direction: "asc",
  });

  const handleChangeFilter = (newObj: Partial<filterDetailTable>) =>
    setFilter((old) => ({ ...old, ...newObj }));

  // Memoize filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          matchGeneralSearch({ generalSearch, item }) &&
          matchDate({ item, filter }) &&
          matchInformation({ item, filter }) &&
          matchKind({ item, filter }) &&
          matchSource({ item, filter }) &&
          matchPurpose({ item, filter }) &&
          matchBalance({ item, filter }) &&
          matchBank({ item, filter })
      ),
    [data, filter, generalSearch]
  );

  // Memoize sorted data based on filtered data
  const sortedData = useMemo(() => {
    const sorted = sortBy(filteredData, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [filteredData, sortStatus]);

  // Memoize paginated records based on sorted data
  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return sortedData.slice(from, to);
  }, [sortedData, page, pageSize]);

  const totalSaldo = filteredData.reduce(
    (acc, cur) =>
      acc + (cur.jenis === "PEMASUKAN" ? cur.nominal : -cur.nominal),
    0
  );

  // Reset to first page when page size or sort status changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, sortStatus]);

  return (
    <Flex direction="column" gap="sm">
      <MainCard transparent noPadding row>
        <Flex
          direction={isMobile ? "column" : "row"}
          justify={isMobile ? "center" : "flex-start"}
          align={isMobile ? "center" : "flex-end"}
          gap="sm"
          w="100%"
        >
          <Flex direction="column">
            <Text>Total saldo:</Text>
            <Badge color={totalSaldo > 0 ? "teal" : "red"}>
              {stringToRupiah(totalSaldo.toString())}
            </Badge>
          </Flex>
          <Button
            leftSection={<IconRestore />}
            style={{ backgroundColor: BUTTON_BASE_COLOR }}
            onClick={() =>
              handleChangeFilter({
                tanggal_sesudah: oldestDate,
                tanggal_sebelum: new Date(),
                keterangan: "",
                jenis: "SEMUA",
                sumber: [],
                tujuan: [],
                nominal_di_bawah: 0,
                nominal_di_atas: 0,
                nominal_sama_dengan: 0,
                bank: "SEMUA",
              })
            }
          >
            Reset Filter
          </Button>
        </Flex>
        <Flex
          align="flex-end"
          justify={isMobile ? "center" : "flex-end"}
          gap="sm"
          w="100%"
        >
          <Button
            leftSection={<IconList />}
            style={{ backgroundColor: BUTTON_BASE_COLOR }}
            component={Link}
            href="/detail/sumber-tujuan"
          >
            Daftar sumber & tujuan
          </Button>
        </Flex>
      </MainCard>
      <Input
        placeholder="Cari seluruh data keuangan"
        defaultValue={generalSearch}
        onChange={(e) => setGeneralSearch(e.currentTarget.value)}
      />
      <DataTable
        minHeight={filteredData.length === 0 ? 200 : 0}
        withTableBorder
        records={paginatedRecords}
        style={{ color: TEXT_COLOR }}
        columns={generateDetailTableColumns({
          filter,
          handleChangeFilter,
          daftarSumber,
          daftarTujuan,
          oldestDate,
        })}
        totalRecords={filteredData.length}
        borderRadius="md"
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        noRecordsText="Tidak ada data yang ditemukan"
      />
    </Flex>
  );
}
