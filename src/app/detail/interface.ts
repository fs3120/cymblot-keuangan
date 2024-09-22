interface ITableFilter {
  generalSearch: string;
  date: {
    start: Date;
    end: Date;
  };
  information: '',
  type: string[];
  value: {
    min: number | string;
    max: number | string;
    equal: number | string;
  };
  category: string[];
  pocket: string[];
}

export type { ITableFilter };
