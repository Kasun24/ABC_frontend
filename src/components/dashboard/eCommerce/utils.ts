import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from "@/assets/images/companies/utils";
export const OverviewList = [
  {
    title: "Table management",
    countTo: 750.36,
    prefix: "$",
    suffix: "M",
    progress: "+19.07 %",
    isSuccess: true,
    icon: "mdi mdi-cash-register",
    avatarColor: "primary",
    decimals: 2,
    link: '/table-management'
  },
  {
    title: "Orders",
    countTo: 684,
    progress: "+8.13 %",
    isSuccess: true,
    icon: "mdi mdi-cart",
    avatarColor: "primary",
    link: '/order'
  },
  {
    title: "POS",
    countTo: 113870,
    progress: "+2.01 %",
    isSuccess: false,
    icon: "mdi mdi-progress-check",
    avatarColor: "primary",
    link: '/pos'
  },
  {
    title: "Customers",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "mdi mdi-face-man",
    avatarColor: "info",
    link: '/customer'
  },
  {
    title: "Toping",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "mdi mdi-merge",
    avatarColor: "info",
    link: '/toping'
  },
  {
    title: "Toping Scenario",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "mdi mdi-atom",
    avatarColor: "info",
    link: '/toping-scenario'
  },
  {
    title: "Product",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "mdi mdi-cube",
    avatarColor: "info",
    link: '/product'

  },
  {
    title: "Category",
    countTo: 2500,
    suffix: "k",
    progress: "+10.42 %",
    isSuccess: true,
    icon: "mdi mdi-food ",
    avatarColor: "info",
    link: '/category'
  },
  // {
  //   title: "Tax",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-alpha-u",
  //   avatarColor: "info",
  //   link: '/system/tax'
  // },
];

// export const getCharts = (getChartColorsArray: Function) => {
//   const revenueChart = {
//     redrawOnWindowResize: true,
//     series: [
//       {
//         name: "Earning",
//         data: [
//           26, 24.65, 18.24, 29.02, 23.65, 27, 21.18, 24.65, 27.32, 25, 24.65,
//           29.32,
//         ],
//       },
//       {
//         name: "Expense",
//         data: [
//           -10, -17.32, -15.45, -12.3, -19.15, -15.45, -11, -14.32, -15.67, -10,
//           -17.32, -19.2,
//         ],
//       },
//     ],
//     chartOptions: {
//       chart: {
//         redrawOnWindowResize: true,
//         type: "bar",
//         height: 328,
//         stacked: true,
//         toolbar: {
//           show: false,
//         },
//       },
//       stroke: {
//         width: 5,
//         colors: "#000",
//         lineCap: "round",
//       },
//       grid: {
//         show: true,
//         borderColor: "#000",

//         xaxis: {
//           lines: {
//             show: false,
//           },
//         },
//         yaxis: {
//           lines: {
//             show: false,
//           },
//         },
//       },
//       plotOptions: {
//         bar: {
//           columnWidth: "30%",
//           borderRadius: 5,
//           lineCap: "round",
//           borderRadiusOnAllStackedSeries: true,
//         },
//       },
//       colors: getChartColorsArray('["--tb-primary", "--tb-secondary"]'),
//       fill: {
//         opacity: 1,
//       },
//       dataLabels: {
//         enabled: false,
//         textAnchor: "top",
//       },
//       yaxis: {
//         labels: {
//           show: true,
//           formatter: function (y: any) {
//             return y.toFixed(0) + "k";
//           },
//         },
//       },
//       legend: {
//         show: false,
//         position: "top",
//         horizontalAlign: "right",
//       },
//       xaxis: {
//         categories: [
//           "Jan",
//           "Feb",
//           "Mar",
//           "Apr",
//           "May",
//           "Jun",
//           "Jul",
//           "Aug",
//           "Sep",
//           "Oct",
//           "Nov",
//           "Dec",
//         ],
//         labels: {
//           rotate: -90,
//         },
//         axisTicks: {
//           show: true,
//         },
//         axisBorder: {
//           show: true,
//           stroke: {
//             width: 1,
//           },
//         },
//       },
//     },
//   };

export const MonthlyOrderSummary = [
  {
    title: "Monthly Order Summary",
    countTo: 750.36,
    prefix: "$",
    suffix: "M",
    progress: "+19.07 %",
    isSuccess: true,
    icon: "mdi mdi-cash-register",
    avatarColor: "primary",
    decimals: 2,
    // link: '/table-management'
  },
  {
    title: "Orders",
    countTo: 684,
    progress: "+8.13 %",
    isSuccess: true,
    icon: "mdi mdi-cart",
    avatarColor: "primary",
    // link: '/order'
  },
  // {
  //   title: "POS",
  //   countTo: 113870,
  //   progress: "+2.01 %",
  //   isSuccess: false,
  //   icon: "mdi mdi-progress-check",
  //   avatarColor: "primary",
  //   // link: '/pos'
  // },
  // {
  //   title: "Customers",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-face-man",
  //   avatarColor: "info",
  //   // link: '/customer'
  // },
  // {
  //   title: "Toping",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-merge",
  //   avatarColor: "info",
  //   // link: '/toping'
  // },
  // {
  //   title: "Toping Scenario",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-atom",
  //   avatarColor: "info",
  //   // link: '/toping-scenario'
  // },
  // {
  //   title: "Product",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-cube",
  //   avatarColor: "info",
  //   // link: '/product'

  // },
  // {
  //   title: "Category",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-food ",
  //   avatarColor: "info",
  //   // link: '/category'
  // },
  // {
  //   title: "Tax",
  //   countTo: 2500,
  //   suffix: "k",
  //   progress: "+10.42 %",
  //   isSuccess: true,
  //   icon: "mdi mdi-alpha-u",
  //   avatarColor: "info",
  //   link: '/system/tax'
  // },
];


  export const getCharts = (getChartColorsArray: Function) => {
   return {
    dailyProgressChart: {
      series: [
        {
          name: "Total Students",
          data: [33, 56, 37, 51, 42, 83, 71],
        },
      ],
      chartOptions: {
        chart: {
          height: 95,
          type: "radialBar",
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            distributed: true,
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          show: false,
          padding: {
            top: -15,
            right: 0,
            left: 0,
            bottom: -10,
          },
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
        stroke: {
          width: 2,
          curve: "smooth",
        },
        colors: getChartColorsArray(
          '["--tb-light", "--tb-secondary", "--tb-light", "--tb-light", "--tb-light", "--tb-light","--tb-light"]'
        ),
        xaxis: {
          categories: ["S", "M", "T", "W", "T", "F", "S"],
          labels: {
            show: false,
          },
        },
        yaxis: {
          show: false,
        },
      },
    }
  };


  const budgetChart = {
    series: [
      {
        data: [50, 15, 35, 62, 23, 56, 44, 12],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 45,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-primary"]'),
      stroke: {
        curve: "smooth",
        width: 1,
      },
      tooltip: {
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function () {
              return "";
            },
          },
        },
        marker: {
          show: false,
        },
      },
    },
  };

  const payoutsChart = {
    series: [
      {
        data: [50, 15, 20, 34, 23, 56, 65, 41],
      },
    ],
    chartOptions: {
      chart: {
        type: "line",
        height: 45,
        sparkline: {
          enabled: true,
        },
      },
      colors: getChartColorsArray('["--tb-info"]'),
      stroke: {
        curve: "smooth",
        width: 1,
      },
      tooltip: {
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function () {
              return "";
            },
          },
        },
        marker: {
          show: false,
        },
      },
    },
  };

  const trafficSourceChart = {
    series: [
      {
        name: "Search Engine Traffic",
        data: [74, 83, 102, 97],
      },
      {
        name: "Direct Traffic",
        data: [46, 57, 59, 54],
      },
    ],
    chartOptions: {
      chart: {
        height: 360,
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["transparent"],
      },
      legend: {
        show: true,
        position: "top",
      },
      colors: getChartColorsArray('["--tb-primary", "--tb-light"]'),
      xaxis: {
        categories: ["Feb", "Mar", "Apr", "May"],
      },
      yaxis: {
        show: false,
      },
      grid: {
        borderColor: "#f1f1f1",
      },
    },
  };

  return {
    // revenueChart,
    budgetChart,
    payoutsChart,
    trafficSourceChart,
  };
};

export const getMonthlyCharts = (getChartColorsArray: Function) => {
  const realizedRateChart = {
    series: [
      {
        name: "Read",
        data: [80, 50, 30, 40, 100, 20],
      },
      {
        name: "Delivery",
        data: [20, 30, 40, 80, 20, 80],
      },
      {
        name: "Failed",
        data: [44, 76, 78, 13, 43, 10],
      },
    ],
    chartOptions: {
      chart: {
        height: 403,
        type: "radar",
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: 1,
      },
      fill: {
        opacity: 0.2,
      },
      markers: {
        size: 3,
        hover: {
          size: 4,
        },
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-secondary", "--tb-danger"]'
      ),
      xaxis: {
        categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
      },
    },
  }
  const syncStatusBreakdownChart = {
    series: [
      {
        name: "Synced",
        data: [44, 55, 41, 37, 22, 43, 21],
      },
      {
        name: "Sync Needed",
        data: [53, 32, 33, 52, 13, 43, 32],
      },
      {
        name: "Never Synced",
        data: [12, 17, 11, 9, 15, 11, 20],
      },
      {
        name: "Review Needed",
        data: [9, 7, 5, 8, 6, 9, 4],
      },
    ],
    chartOptions: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnHight: "40%",
        },
      },
      grid: {
        show: true,
        padding: {
          top: -20,
          right: 0,
          bottom: -10,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        show: false,
      },
      colors: getChartColorsArray(
        '["--tb-primary", "--tb-primary, 0.85", "--tb-primary, 0.60", "--tb-primary, 0.50"]'
      ),
    },
  };
  return {
    realizedRateChart,
    syncStatusBreakdownChart,
  };
};



export const headerItems = [
  { title: "Order Date" , align: "center" },
  { title: "Order ID" , align: "center" },
  { title: "Shop", align: "center" },
  { title: "Customers" , align: "center" },
  { title: "Products" , align: "center" },
  { title: "Amount" , align: "center" },
  { title: "Status" , align: "center" },
  { title: "Rating" , align: "center" },
];

export const orderList = [
  {
    id: 1,
    orderDate: "30 Jan, 2023",
    orderId: "#TBS250009",
    shopSrc: Img1,
    customer: "Ayaan Bowen",
    products: "Bike Accessories",
    amount: "$215.00",
    status: "ood",
    rating: 4.9,
  },
  {
    id: 2,
    orderDate: "19 Jan, 2023",
    orderId: "#TBS250007",
    shopSrc: Img2,
    customer: "Vihan Hudda",
    products: "Bags and Wallets",
    amount: "$330.00",
    status: "delivered",
    rating: 4.7,
  },
  {
    id: 3,
    orderDate: "16 Jan, 2023",
    orderId: "#TBS250006",
    shopSrc: Img3,
    customer: "Vihan Hudda",
    products: "Bags and Wallets",
    amount: "$754.11",
    status: "pending",
    rating: 4.6,
  },
  {
    id: 4,
    orderDate: "14 Feb, 2023",
    orderId: "#TBS250010",
    shopSrc: Img4,
    customer: "Jansh Brown",
    products: "Kitchen Storage",
    amount: "$149.00",
    status: "pending",
    rating: 4.5,
  },
  {
    id: 5,
    orderDate: "25 Jan, 2023",
    orderId: "#TBS250008",
    shopSrc: Img5,
    customer: "Prezy Mark",
    products: "Furniture",
    amount: "$199.00",
    status: "shipping",
    rating: 4.3,
  },
  {
    id: 6,
    orderDate: "15 Feb, 2023",
    orderId: "#TBS250011",
    shopSrc: Img6,
    customer: "Alex Smith",
    products: "Clothes",
    amount: "$109.00",
    status: "new",
    rating: null,
  },
];

export const cities = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "New York City",
      },
      geometry: {
        type: "Point",
        coordinates: [-73.778137, 40.641312],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "London",
      },
      geometry: {
        type: "Point",
        coordinates: [-0.454296, 51.47002],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Beijing",
      },
      geometry: {
        type: "Point",
        coordinates: [116.597504, 40.072498],
      },
    },
  ],
};

export const countries = [
  {
    name: "United States",
    sales: "15,364",
    color: "primary",
  },
  {
    name: "Greenland",
    sales: "12,387",
    color: "secondary",
  },
  {
    name: "Serbia",
    sales: "9,123",
    color: "info",
  },
  {
    name: "Russia",
    sales: "7,108",
    color: "success",
  },
  {
    name: "Brazil",
    sales: "6,731",
    color: "danger",
  },
  {
    name: "Sydney",
    sales: "3,023",
    color: "warning",
  },
];
