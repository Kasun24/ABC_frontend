import HttpService from "@/app/http/httpService";
import eventBus from "@/components/layouts/topBar/eventBus";
import { onMounted, ref } from "vue";

export const currency = ref(localStorage.getItem("currency") || "€");
const currencyPosition = ref(
  localStorage.getItem("currencyPosition") || "before"
);
export const cartDetails = ref<any>([]);
const http = new HttpService();
export const basketData = ref<any>();
export const selectedDish = ref<any>(null);
export const errors = ref<any>([]);
export const selected_toppings = ref<any>([]);
export const orderingMethod = ref<string>("dine_in");
export let selected_size = ref<any>(null);
export let selected_size_id = ref<number>(Number(null));
export const selectedScenarios = ref<any>(null);
export let dishTotalAmount = 0;
export let toping_total = 0;
export const currentOrderDetails = ref<any>(null);
export const userType = ref<string>("");
export const loggedUserName = ref<string>("");
export const genaralSettings = ref<any>(null);
export const hasDineIn = ref<boolean>(true);
export const hasDelivery = ref<boolean>(true);
export const hasPickup = ref<boolean>(true);
// export userdata array
export const currentUserData = ref<any>({
  userName: localStorage.getItem("user_name"),
  userDeviceId: localStorage.getItem("device_id"),
});

onMounted(() => {});

export const components = ref([
  { id: 1, title: "Today Order - Component 1", showCard: false, label: "Table management", content: null, icon: "mdi mdi-table-chair", color: "primary", link: '/table-management' },
  { id: 2, title: "Today Order - Component 2", showCard: false, label: "Orders", content: null, icon: "mdi mdi-cart", color: "secondary", link: '/order' },
  { id: 3, title: "Today Order - Component 3", showCard: false, label: "POS", content: null, icon: "mdi mdi-cash-register", color: "success", link: '/pos/dine-in' },
  { id: 4, title: "Today Order - Component 4", showCard: false, label: "Kitchen", content: null, icon: "mdi mdi-countertop", color: "error", link: '/kitchen' },
  { id: 5, title: "Today Order Summary", showCard: false, label: "Order Complete", content: null, icon: "mdi mdi-check", color: "success" },
  { id: 6, title: "Order Complete", showCard: false, label: "Order Complete", content: null, icon: "mdi mdi-check", color: "success" },
  { id: 7, title: "Monthly Sales Summary", showCard: false, label: "Order Complete", content: null, icon: "mdi mdi-check", color: "success" },
  { id: 8, title: "Active Tables", showCard: false, label: "Order Complete", content: null, icon: "mdi mdi-check", color: "success" },
]);

// Update currency and currency position when currencyChanged event is emitted
eventBus.on("currencyChanged", (payload) => {
  if (payload) {
    currency.value = payload.currency;
    currencyPosition.value = payload.currencyPosition;
  }
});

export const onItemClick = (item: any) => {
  let dish = { ...item };
  dish.count = 1;
  selectedDish.value = dish;
  if (selectedDish.value !== null) {
    // Reset selected_toppings when opening the dialog for a new item
    selected_toppings.value = [];

    selected_size.value =
      selectedDish.value?.is_size === "true"
        ? selectedDish.value?.sizes[0]
        : null;
    selectedScenarios.value =
      selectedDish.value?.is_customise === "true"
        ? selectedDish.value?.scenarios
        : null;
    selected_size_id.value =
      selectedDish.value?.is_size === "true"
        ? selectedDish.value?.sizes[0]?.id
        : null;
  }
  if (item.is_customise == "true" || item.is_size == "true") {
    selected_toppings.value = [];
    uncheckselected_toppings();
    // get the base price of customizable dishes
    if (item.is_customise === "true") {
      dish.dishAmount = dish[orderingMethod.value];
      dish.totalAmount = dish[orderingMethod.value];
    }
    // this.openToppings(); /////////////////////////////////////////////////???????????????????>>>>>>>>>>>>>>>>>>>>>
  } else {
    // check the item is already exisits in the cart, if exists only increase the count
    // since this is fixed price item
    let itemFound = cartDetails.value.find(
      (dishI: any) => dishI.id === dish.id
    );
    if (itemFound) {
      itemFound.count++;
    } else {
      dish.dishAmount = dish[orderingMethod.value];
      dish.totalAmount = dish[orderingMethod.value];
      cartDetails.value.push(dish);
    }
    // this.presentDefaultToast('Dish added to the cart!', 'success');
    calculateSelectedDishTotalAmount();
  }
};

export const uncheckselected_toppings = () => {
  selected_toppings.value = [];
  if (selectedDish.value?.is_customise === "true") {
    for (let index = 0; index < selectedScenarios.value.length; index++) {
      const element = selectedScenarios.value[index];
      element.disable_rest = false; // Reset disable_rest property
      for (
        let indexTopping = 0;
        indexTopping < element.topings.length;
        indexTopping++
      ) {
        const topping = element.topings[indexTopping];
        topping.checked = false;
      }
    }
  } else if (selectedDish.value?.is_size === "true") {
    for (let index = 0; index < selectedDish.value.sizes.length; index++) {
      const size = selectedDish.value.sizes[index];
      for (let sizeIndex = 0; sizeIndex < size.scenarios.length; sizeIndex++) {
        const scenario = size.scenarios[sizeIndex];
        scenario.disable_rest = false; // Reset disable_rest property
        for (
          let toppingIndex = 0;
          toppingIndex < scenario.topings.length;
          toppingIndex++
        ) {
          const topping = scenario.topings[toppingIndex];
          topping.checked = false;
        }
      }
    }
  }
};

// Check digit while typing
export const checkDigit = (event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement;

  // Allow navigation keys like backspace, delete, arrow keys
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Prevent any non-digit input, except for the decimal point
  if (event.key.length === 1 && !/^\d$/.test(event.key) && event.key !== ".") {
    event.preventDefault();
  }

  // Allow only one decimal point
  if (event.key === "." && input.value.includes(".")) {
    event.preventDefault();
  }

  // Ensure only two digits after the decimal point
  const decimalIndex = input.value.indexOf(".");
  if (
    decimalIndex !== -1 &&
    input.selectionStart &&
    input.selectionStart > decimalIndex
  ) {
    const decimalPart = input.value.slice(decimalIndex + 1);
    if (decimalPart.length >= 2) {
      event.preventDefault();
    }
  }
};

// Format amount
function formatAmount(amount: number | null | undefined): string {
  if (amount == null) {
    return "0.00";
  }
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format currency and currency position
export const formatCurrency = (value: number): string => {
  return currencyPosition.value === "before"
    ? `${currency.value}${formatAmount(value)}`
    : `${formatAmount(value)}${currency.value}`;
};

eventBus.on("currencyChanged", () => {
  formatCurrency(0);
});

export const formatString = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return "";
  }
  const words = value.split("_");
  const formattedWords = words.map((word) => {
    if (typeof word !== "string" || word.length === 0) {
      return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return formattedWords.join(" ");
};

export const calculateCartAmountsLive = () => {
  return new Promise(async (resolve, reject) => {
    let cartItemsToKitchen = [];
    for (let index = 0; index < cartDetails.value.length; index++) {
      const cartItem = cartDetails.value[index];
      cartItemsToKitchen.push({
        id: cartItem.id,
        delivery: cartItem.delivery,
        dine_in: cartItem.dine_in,
        pickup: cartItem.pickup,
        dish_number: cartItem.dish_number,
        is_combo: cartItem.is_combo,
        is_customise: cartItem.is_customise,
        is_size: cartItem.is_size,
        name: cartItem.name,
        position: cartItem.position,
        status: cartItem.status,
        tax: cartItem.tax,
        type: cartItem.type,
        count: cartItem.count ? cartItem.count : 1,
        branch_id: cartItem.branch_id,
        selected_size_id:
          cartItem.is_size === "true" ? cartItem.selected_size_id : null,
        selected_toppings:
          cartItem.is_customise === "true" || cartItem.is_size === "true"
            ? cartItem.selected_toppings
            : [],
      });
    }
    let device_id = localStorage.getItem("device_id");
    let sendToKitchenObject = {
      device_id: device_id,
      cart_items: cartItemsToKitchen,
    };
    try {
      const response = await http.post(
        "get-cart-summary", //>>//>> order-app
        sendToKitchenObject
      );
      if (response.data.cart) {
        basketData.value = response.data.cart;
        return resolve(response);
      }
    } catch (error: any) {
      return reject(error);
    }
  });
};

export const selectTopingAddon = (
  topping: any,
  scenario: any,
  toppingIndex: number
) => {
  let activeToppings = getActiveToppings(scenario.topings);
  if (
    (selectedDish.value?.is_size == "true" &&
      (typeof activeToppings[toppingIndex].checked === "undefined" ||
        activeToppings[toppingIndex].checked)) ||
    (selectedDish.value?.is_customise == "true" &&
      (typeof activeToppings[toppingIndex].checked === "undefined" ||
        activeToppings[toppingIndex].checked))
  ) {
    console.log("ADD TOP : ");
    //add toping
    let found = false;
    for (let index = 0; index < selected_toppings.value.length; index++) {
      if (topping.id == selected_toppings.value[index].topping_id) {
        found = true;
      }
    }
    if (!found) {
      let top: any = {};
      top["topping_id"] = topping.id;
      top["count"] = 1;
      top["price"] = topping[orderingMethod.value];
      //for future use
      top["delivery"] = topping["delivery"];
      top["pickup"] = topping["pickup"];
      top["dine_in"] = topping["dine_in"];
      top["name"] = topping["name"];
      //end for future use
      top["total"] = top["count"] * top["price"];
      if (selectedDish.value?.is_size == "true") {
        activeToppings[toppingIndex].checked = true;
      } else {
        activeToppings[toppingIndex].checked = true;
      }
      topping.count_selected = 1;
      selected_toppings.value.push({
        topping_id: top["topping_id"],
        count: top["count"],
        price: top["price"],
        delivery: top["delivery"],
        pickup: top["pickup"],
        dine_in: top["dine_in"],
        total: top["total"],
        name: top["name"],
        senario_position: scenario.position,
        topping_position: topping.position,
        topping_tax: scenario.toppingTax,
      });
      selected_toppings.value.sort((a: any, b: any) => {
        return (
          +(a["senario_position"] + "" + a["topping_position"]) -
          +(b["senario_position"] + "" + b["topping_position"])
        );
      });
    }
  } else {
    //remove toping
    console.log("REMOVE TOP : ");
    for (let index = 0; index < selected_toppings.value.length; index++) {
      if (topping.id == selected_toppings.value[index].topping_id) {
        selected_toppings.value.splice(index, 1);
        if (selectedDish.value?.is_size == "true") {
          activeToppings[toppingIndex].checked = false;
        } else {
          activeToppings[toppingIndex].checked = false;
        }
      }
    }
  }
  validateDishSenarioToppingConfigsRealTime();
  calculateSelectedDishTotalAmount();
};

export const getActiveToppings = (toppingList: any[]) => {
  if (toppingList && toppingList.length) {
    return toppingList.filter((topping) => {
      return topping.status === "true";
    });
  } else {
    return [];
  }
};

export const validateDishSenarioToppingConfigsRealTime = () => {
  let error_on_dish = false;
  let selected_size_or_scenario = [];
  if (selectedDish.value?.is_size == "true") {
    if (selected_size.value === null) {
      return;
    }
    selected_size_or_scenario = selected_size.value.scenarios;
  } else {
    selected_size_or_scenario = selectedScenarios.value;
  }
  if (selected_size_or_scenario) {
    try {
      //scenario
      selected_size_or_scenario.forEach((element: any) => {
        element.disable_rest = false;
        let this_scenario_selected_count = 0;
        //toping
        element["topings"].forEach((elementt: any) => {
          let selected_count = check_is_selected(
            elementt.id,
            elementt.is_mandatory,
            element.btn_type
          );
          this_scenario_selected_count += selected_count;
        });
        if (element.is_mandatory == "true") {
          errors.value["error_in_scenario_" + element.id] = false;
          if (element.btn_type == "optional") {
            if (this_scenario_selected_count === element.max_toping_count) {
              element.disable_rest = true;
            }
          }
        }
      });
    } catch (error) {
      console.log("error occoured while realtime topping cal : ", error);
    }
  }
};

export const calculateSelectedDishTotalAmount = () => {
  if (selectedDish.value?.is_size == "true") {
    if (!selected_size) {
      dishTotalAmount = selected_size.value["dine_in"];
    }
  } else {
    dishTotalAmount = selectedDish.value["dine_in"];
  }
  toping_total = 0;
  if (selected_toppings.value && selected_toppings.value.length > 0) {
    var topingTotal = 0;
    var dIshTotal = 0;
    dIshTotal += dishTotalAmount;
    for (let index = 0; index < selected_toppings.value.length; index++) {
      // to avoid expression change exception
      dIshTotal += selected_toppings.value[index].total;
      topingTotal += selected_toppings.value[index].total;
    }
    setTimeout(() => {
      toping_total = topingTotal;
      dishTotalAmount = dIshTotal;
    }, 0.1);
  }
};

export const check_is_selected = (
  t_id: number,
  is_mand: "true" | "false",
  type: string
) => {
  let available = 0;
  selected_toppings.value.forEach((element: any) => {
    if (t_id == element.topping_id) {
      available = element.count;
    }
  });
  if (available == 0 && is_mand == "true" && type == "add-on") {
    errors.value["shoud_select_toping_" + t_id] = true;
    errors.value["mandatory_toping_should_be_selected"] = true;
  }
  return available;
};

export const onDropdownToppingSelect = (scenario: any, topping: any) => {
  let toping = [];
  let found = false;
  let tt_each = scenario.topings;
  let type = "checkbox";
  if (
    scenario.is_mandatory == "false" ||
    (scenario.is_mandatory == "true" &&
      scenario.min_toping_count == 1 &&
      scenario.max_toping_count == 1)
  ) {
    type = "dropdown";
  }
  for (let findex = 0; findex < tt_each.length; findex++) {
    if (type == "dropdown") {
      let top_id = tt_each[findex].id;
      for (let index = 0; index < selected_toppings.value.length; index++) {
        if (top_id == selected_toppings.value[index].topping_id) {
          //exist and remove
          selected_toppings.value.splice(index, 1);
          found = true;
        }
      }
    }
    if (tt_each[findex].id == topping.id) {
      if (selectedDish.value?.is_size == "true") {
        toping = scenario.topings[findex];
      } else {
        toping = scenario.topings[findex];
      }
    }
  }
  if (!topping.checked) {
    //remove toping
    for (let index = 0; index < selected_toppings.value.length; index++) {
      if (topping.id == selected_toppings.value[index].topping_id) {
        //exist and remove
        selected_toppings.value.splice(index, 1);
        found = true;
      }
    }
  }
  if (topping.checked || type == "dropdown") {
    let top: any = {};
    top["topping_id"] = toping["id"];
    top["count"] = 1;
    top["price"] = toping[orderingMethod.value];
    //for future use
    top["delivery"] = toping["delivery"];
    top["pickup"] = toping["pickup"];
    top["dine_in"] = toping["dine_in"];
    top["name"] = toping["name"];
    //end for future use
    top["total"] =
      top["count"] > 0 && top["price"] > 0 ? top["count"] * top["price"] : 0;
    let toppingOb = {
      topping_id: top["topping_id"],
      count: top["count"],
      price: top["price"],
      delivery: top["delivery"],
      pickup: top["pickup"],
      dine_in: top["dine_in"],
      total: top["total"],
      name: top["name"],
      senario_position: scenario.position,
      topping_position: toping["position"],
      topping_tax: scenario.toppingTax,
    };
    selected_toppings.value.push(toppingOb);
    selected_toppings.value.sort((a: any, b: any) => {
      return (
        +(a["senario_position"] + "" + a["topping_position"]) -
        +(b["senario_position"] + "" + b["topping_position"])
      );
    });
  }
  calculateSelectedDishTotalAmount();
};

export const toppingQtyChange = (toping: any, action: "+" | "-") => {
  for (let index = 0; index < selected_toppings.value.length; index++) {
    if (selected_toppings.value[index].topping_id == toping.id) {
      if (action === "+") {
        selected_toppings.value[index].count += 1;
        selected_toppings.value[index].total =
          selected_toppings.value[index].price *
          selected_toppings.value[index].count;
        toping.count_selected++;
      } else {
        if (selected_toppings.value[index].count > 1) {
          selected_toppings.value[index].count -= 1;
          selected_toppings.value[index].total =
            selected_toppings.value[index].price *
            selected_toppings.value[index].count;
          toping.count_selected--;
        }
      }
    }
  }
  validateDishSenarioToppingConfigsRealTime();
  calculateSelectedDishTotalAmount();
};

// Removes selected item from the cart items array
export const removeCartItem = (item: any, index: number) => {
  cartDetails.value.splice(index, 1);
  calculateCartAmountsLive();
};

// Change item quantity
export const onItemCountChange = async (
  actionType: "+" | "-",
  item: any,
  index: number
) => {
  if (actionType === "+") {
    item.count++;
  } else {
    if (item.count > 0) item.count--;
    if (item.count === 0) {
      cartDetails.value.splice(index, 1);
    }
  }
  calculateCartAmountsLive();
  await new Promise((resolve) => setTimeout(resolve, 350));
};

export const completeOrderByCashier = (
  paymentOption: "cod" | "paypal" | "ecCard" | "mollie" | "points",
  orderId: number,
  cashierId: number | string
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await http.post(
        "complete-order/" + orderId, // Include order_id in the URL or as part of the payload
        {
          paymentMethod: paymentOption,
          order_id: orderId,
          cashier_id: cashierId,
        }
      );
      // Resolve the promise with the response, regardless of the data structure
      resolve(response);
    } catch (error: any) {
      console.error("Error in completeOrderByCashier:", error);
      reject(error);
    }
  });
};

export const cashierDevice = () => {
  console.log("cashierDevice");
  let userName = localStorage.getItem("user_name");

  if (!userName || !userName.trim()) return;

  loggedUserName.value = userName;
  userType.value = "cashier";

  // update customer device table data
  let deviceId = localStorage.getItem("device_id");
  if (deviceId) {
    updateCashierDevice({
      device_id: deviceId,
      customer_name: loggedUserName.value,
      user_type: userType.value,
    });
  } else {
    deviceId = generateUUID();
    localStorage.setItem("device_id", deviceId);
    registerCashierDevice({
      device_id: deviceId,
      customer_name: loggedUserName.value,
      user_type: userType.value,
    });
  }
};

const updateCashierDevice = (customerDevice: any) => {
  console.log("customerDevice : ", customerDevice);
  return new Promise(async (resolve, reject) => {
    try {
      const response = await http.post(
        "customer-devices/update", //>>//>> order-app
        customerDevice
      );
      if (response.data.cart) {
        return resolve(response);
      }
    } catch (error: any) {
      return reject(error);
    }
  });
};

const registerCashierDevice = (customerDevice: any) => {
  console.log("registerCashierDevice : ", customerDevice);
  return new Promise(async (resolve, reject) => {
    try {
      const response = await http.post(
        "customer-devices/register", //>>//>> order-app
        customerDevice
      );
      if (response.data.cart) {
        return resolve(response);
      }
    } catch (error: any) {
      return reject(error);
    }
  });
};

// Will generate a device id and return Genarated Device ID String
export const generateUUID = () => {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = (performance && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const setGeneralSettings = async () => {
  try {
    const response = await http.get("/settings");
    const { data } = response.data;
    console.log("Settings:", data);
    // Emit the event with currency and currency position
    localStorage.setItem("currency", data.currency);
    localStorage.setItem("currencyPosition", data.currency_position);
    localStorage.setItem(
      "is_maintenance_mode",
      data.is_maintenance_mode ? "1" : "0"
    );
    eventBus.emit("currencyChanged", {
      currency: data.currency,
      currencyPosition: data.currency_position,
    });
    hasDineIn.value = data.has_dinein == 1 ? true : false;
    hasDelivery.value = data.has_delivery == 1 ? true : false;
    hasPickup.value = data.has_pickup == 1 ? true : false;
  } catch (error: any) {
    console.error("Failed to fetch settings:", error?.message);
    throw error;
  }
};

//fetch roles
export const fetchRoles = async () => {
  try {
    const role_id = parseInt(localStorage.getItem('role_id') || '0');
    console.log("Role ID", role_id);

    const response = await http.get('dashboard/list');
    const data = response.data.data.data;
    console.log("Data", data);

    //getting dashboard id for the role id
    const roleDashboard = await http.get(`role/${role_id}`);
    console.log("Role", roleDashboard);

    const dashboard_id = roleDashboard.data.data.dashboard_id;  

    // Check if dashboardRelevant is found and componentModel exists
    const dashboardRelevant = data.find((dashboard: any) => dashboard.id === dashboard_id);
    console.log("Dashboard Relevant", dashboardRelevant); 

    let componentsArray = dashboardRelevant?.components;
    console.log('componentsArray', componentsArray);

    if (componentsArray) {
      components.value.forEach(component => {
        component.showCard = componentsArray.includes(component.id);
      });
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};

//fetch roles for dashboard when hard refreshed
export const fetchRolesDashboard = async () => {
  try {
    const role_id = parseInt(localStorage.getItem('role_id') || '0');

    const response = await http.get('dashboard/list');
    const data = response.data.data.data;
    console.log("dashboard data:", data);

    // Getting dashboard id for the role id
    const roleDashboard = await http.get(`role/${role_id}`);
    const dashboard_id = roleDashboard.data.data.dashboard_id;

    // Find the relevant dashboard and get its components
    const dashboardRelevant = data.find((dashboard: any) => dashboard.id === dashboard_id);

    let componentsArray = dashboardRelevant?.components;

    // Directly update the componentsArray ref
    if (componentsArray) {
      components.value.forEach(component => {
        component.showCard = componentsArray.includes(component.id);
      });
    }
    
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};
